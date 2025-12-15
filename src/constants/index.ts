import type { BlockReason } from '@/types'

/**
 * Constantes centralizadas do sistema
 */

/** Motivos de bloqueio com cores associadas */
export const BLOCK_REASONS: Record<BlockReason, { label: string; color: string }> = {
    'Ambiente': { label: 'Ambiente', color: '#10b981' },
    'Dependência Externa': { label: 'Dependência Externa', color: '#f59e0b' },
    'Bug Interno': { label: 'Bug Interno', color: '#ef4444' },
    'Getnet': { label: 'Getnet', color: '#8b5cf6' },
    'OCC': { label: 'OCC', color: '#14b8a6' },
    'Falta de Especificação': { label: 'Falta de Especificação', color: '#3b82f6' },
    'Outro': { label: 'Outro', color: '#9ca3af' },
}

/** Lista ordenada dos motivos (para selects e gráficos) */
export const BLOCK_REASON_OPTIONS: BlockReason[] = [
    'Ambiente',
    'Bug Interno',
    'Dependência Externa',
    'Falta de Especificação',
    'Getnet',
    'OCC',
]

/** Horário útil de trabalho */
export const WORK_HOURS = {
    START: 9,  // 9h
    END: 18,   // 18h
    DAILY_HOURS: 9, // 9 horas por dia
}

/** Duração da sprint em dias */
export const SPRINT_DURATION_DAYS = 15

/** Configuração do Firebase */
export const FIREBASE_CONFIG = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBSKcceleQlEj5fsBnOD6wFGridCFkMUd0',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'controle-de-impedimentos.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'controle-de-impedimentos',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'controle-de-impedimentos.firebasestorage.app',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '327948512776',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:327948512776:web:b0d31b5f5bc069636a6bbd',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-JJEPLWH5L6',
}

/** Domínio permitido para login */
export const ALLOWED_DOMAIN = import.meta.env.VITE_ALLOWED_DOMAIN || 'rethink.dev'

/** Caminho da coleção de impedimentos no Firestore */
export const IMPEDIMENTS_COLLECTION = 'artifacts/demo/public/data/impediments'

/** Intervalo de atualização do dashboard (ms) */
export const DASHBOARD_REFRESH_INTERVAL = 10000 // 10 segundos

/** Intervalo do carrossel (ms) */
export const CAROUSEL_INTERVAL = 5000 // 5 segundos

/** Limite de horas por dia para cálculo */
export const MAX_HOURS_PER_DAY = 8

/** Formato de data brasileiro */
export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
    dateStyle: 'short',
    timeStyle: 'short',
}

/** Formatador de data pt-BR */
export const dateFormatter = new Intl.DateTimeFormat('pt-BR', DATE_FORMAT_OPTIONS)

/** Formatador de data curta */
export const shortDateFormatter = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
})
