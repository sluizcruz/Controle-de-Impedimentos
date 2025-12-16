import { initializeApp, FirebaseApp } from 'firebase/app'
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    type Auth,
    type User
} from 'firebase/auth'
import {
    getFirestore,
    collection,
    doc,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    Timestamp,
    type Firestore,
    type QuerySnapshot,
    type DocumentData,
    serverTimestamp
} from 'firebase/firestore'
import { FIREBASE_CONFIG, IMPEDIMENTS_COLLECTION, SPRINTS_COLLECTION, ALLOWED_DOMAIN, SPRINT_DURATION_DAYS } from '@/constants'
import type { Impediment, CreateImpedimentData, AuthUser, Sprint } from '@/types'

// Inicialização do Firebase
let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null

// Modo demo apenas se não houver API key configurada
const DEMO_MODE = !FIREBASE_CONFIG.apiKey || FIREBASE_CONFIG.apiKey === 'YOUR_API_KEY'

/**
 * Inicializa o Firebase
 */
export function initializeFirebase(): { app: FirebaseApp; auth: Auth; db: Firestore } | null {
    if (DEMO_MODE) {
        console.warn('[Firebase] Rodando em modo DEMO - Firebase desabilitado')
        return null
    }

    if (!app) {
        app = initializeApp(FIREBASE_CONFIG)
        auth = getAuth(app)
        db = getFirestore(app)
    }

    return { app, auth: auth!, db: db! }
}

/**
 * Retorna se está em modo demo
 */
export function isDemoMode(): boolean {
    return DEMO_MODE
}

/**
 * Login com Google
 */
export async function signInWithGoogle(): Promise<User | null> {
    if (DEMO_MODE || !auth) return null

    try {
        const provider = new GoogleAuthProvider()
        const result = await signInWithPopup(auth, provider)
        return result.user
    } catch (error: unknown) {
        const e = error as { code?: string; message?: string }
        // Se popup foi bloqueado, tenta redirect
        if (e?.code === 'auth/popup-blocked' || e?.code === 'auth/popup-closed-by-user') {
            try {
                const provider = new GoogleAuthProvider()
                await signInWithRedirect(auth!, provider)
                return null
            } catch {
                throw new Error('Permita popups para este site e tente novamente.')
            }
        }
        throw new Error(`Erro ao fazer login: ${e?.message || 'Erro desconhecido'}`)
    }
}

/**
 * Logout
 */
export async function signOut(): Promise<void> {
    if (DEMO_MODE || !auth) return
    await firebaseSignOut(auth)
}

/**
 * Verifica se o email do usuário é do domínio permitido
 */
export function isEmailAllowed(email: string | null): boolean {
    if (!email) return false
    return email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`)
}

/**
 * Escuta mudanças no estado de autenticação
 */
export function onAuthChange(callback: (user: AuthUser | null) => void): () => void {
    if (DEMO_MODE || !auth) {
        callback(null)
        return () => { }
    }

    return onAuthStateChanged(auth, async (user) => {
        if (!user) {
            callback(null)
            return
        }

        if (!isEmailAllowed(user.email)) {
            await signOut()
            callback(null)
            return
        }

        callback({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
        })
    })
}

/**
 * Obtém o token de ID do usuário atual
 */
export async function getIdToken(): Promise<string | null> {
    if (DEMO_MODE || !auth?.currentUser) return null
    return auth.currentUser.getIdToken()
}

/**
 * Escuta impedimentos de uma sprint em tempo real
 */
export function subscribeToImpediments(
    sprintId: string,
    callback: (impediments: Impediment[]) => void
): () => void {
    if (DEMO_MODE || !db) {
        callback([])
        return () => { }
    }

    const col = collection(db, IMPEDIMENTS_COLLECTION)
    const q = query(
        col,
        where('sprintId', '==', sprintId),
        orderBy('startTime', 'desc')
    )

    return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
        const impediments: Impediment[] = snapshot.docs.map(doc => {
            const data = doc.data()
            return {
                id: doc.id,
                usId: data.usId || '',
                usTitle: data.usTitle || '',
                sprintId: data.sprintId || '',
                startTime: data.startTime?.toDate?.() || new Date(data.startTime),
                endTime: data.endTime?.toDate?.() || (data.endTime ? new Date(data.endTime) : null),
                reason: data.reason || 'Outro',
                userId: data.userId || '',
                responsavel: data.responsavel || '',
                externalLink: data.externalLink || '',
                description: data.description || '',
                reopenedFrom: data.reopenedFrom || null,
                reopenedAt: data.reopenedAt?.toDate?.() || (data.reopenedAt ? new Date(data.reopenedAt) : null),
            }
        })
        callback(impediments)
    })
}

/**
 * Cria um novo impedimento
 */
export async function createImpediment(
    sprintId: string,
    data: CreateImpedimentData,
    userId: string
): Promise<string | null> {
    if (DEMO_MODE || !db) return null

    const col = collection(db, IMPEDIMENTS_COLLECTION)
    const docRef = await addDoc(col, {
        ...data,
        sprintId,
        userId,
        startTime: Timestamp.fromDate(new Date()),
        endTime: null,
        externalLink: data.externalLink || '',
        description: data.description || '',
    })

    return docRef.id
}

/**
 * Encerra um impedimento
 */
export async function endImpediment(impedimentId: string): Promise<void> {
    if (DEMO_MODE || !db) return

    const docRef = doc(db, IMPEDIMENTS_COLLECTION, impedimentId)
    await updateDoc(docRef, {
        endTime: Timestamp.fromDate(new Date())
    })
}

/**
 * Reabre um impedimento
 */
export async function reopenImpediment(
    originalImpediment: Impediment,
    newData: Partial<CreateImpedimentData>,
    userId: string
): Promise<string | null> {
    if (DEMO_MODE || !db) return null

    const col = collection(db, IMPEDIMENTS_COLLECTION)
    const now = new Date()

    const docRef = await addDoc(col, {
        usId: originalImpediment.usId,
        usTitle: newData.usTitle || originalImpediment.usTitle,
        sprintId: originalImpediment.sprintId,
        startTime: Timestamp.fromDate(now),
        endTime: null,
        reason: newData.reason || originalImpediment.reason,
        userId,
        responsavel: newData.responsavel || originalImpediment.responsavel,
        externalLink: newData.externalLink || originalImpediment.externalLink,
        description: newData.description || '',
        reopenedFrom: originalImpediment.id,
        reopenedAt: Timestamp.fromDate(now),
    })

    return docRef.id
}

/**
 * Inicia uma nova sprint no Firestore
 */
export async function startNewSprint(sprintId: string, startDate: Date): Promise<void> {
    if (DEMO_MODE || !db) return

    const endDate = new Date(startDate.getTime() + SPRINT_DURATION_DAYS * 24 * 60 * 60 * 1000)
    // Seta para 18:00 do dia final
    endDate.setHours(18, 0, 0, 0)

    const col = collection(db, SPRINTS_COLLECTION)

    await addDoc(col, {
        sprintId,
        startDate: Timestamp.fromDate(startDate),
        endDate: Timestamp.fromDate(endDate),
        iniciada: true,
        createdAt: serverTimestamp()
    })
}

/**
 * Encerra a sprint atual
 */
export async function endSprint(sprintDocId: string): Promise<void> {
    if (DEMO_MODE || !db) return

    const docRef = doc(db, SPRINTS_COLLECTION, sprintDocId)
    await updateDoc(docRef, {
        iniciada: false,
        endedAt: serverTimestamp()
    })
}

/**
 * Escuta a sprint ativa mais recente
 */
export function subscribeToActiveSprint(
    callback: (sprint: Sprint | null, docId: string | null) => void
): () => void {
    if (DEMO_MODE || !db) {
        callback(null, null)
        return () => { }
    }

    const col = collection(db, SPRINTS_COLLECTION)
    const q = query(
        col,
        where('iniciada', '==', true)
    )

    return onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
            callback(null, null)
            return
        }

        // Ordena em memória para pegar o mais recente (evita índice composto)
        const docs = snapshot.docs.sort((a, b) => {
            const dateA = a.data().createdAt?.toDate?.() || new Date(0)
            const dateB = b.data().createdAt?.toDate?.() || new Date(0)
            return dateB.getTime() - dateA.getTime()
        })

        const doc = docs[0]
        const data = doc.data()

        const sprint: Sprint = {
            id: data.sprintId,
            startDate: data.startDate.toDate(),
            endDate: data.endDate.toDate(),
            iniciada: true
        }

        callback(sprint, doc.id)
    })
}

// Inicializa automaticamente
initializeFirebase()
