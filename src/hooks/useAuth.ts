import { useState, useEffect, useCallback } from 'react'
import {
    onAuthChange,
    signInWithGoogle,
    signOut,
    isEmailAllowed,
    isDemoMode
} from '@/services/firebase'
import type { AuthUser } from '@/types'
import { ALLOWED_DOMAIN } from '@/constants'

interface UseAuthReturn {
    user: AuthUser | null
    loading: boolean
    error: string | null
    isDemo: boolean
    signIn: () => Promise<void>
    signOutUser: () => Promise<void>
}

/**
 * Hook para gerenciamento de autenticação
 */
export function useAuth(): UseAuthReturn {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const isDemo = isDemoMode()

    useEffect(() => {
        if (isDemo) {
            setLoading(false)
            return
        }

        const unsubscribe = onAuthChange((authUser) => {
            setUser(authUser)
            setLoading(false)

            // Verifica domínio após login
            if (authUser && !isEmailAllowed(authUser.email)) {
                setError(`Acesso permitido apenas para emails do domínio @${ALLOWED_DOMAIN}`)
                signOut()
                setUser(null)
            }
        })

        return () => unsubscribe()
    }, [isDemo])

    const signIn = useCallback(async () => {
        if (isDemo) return

        setError(null)
        setLoading(true)

        try {
            await signInWithGoogle()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao fazer login')
        } finally {
            setLoading(false)
        }
    }, [isDemo])

    const signOutUser = useCallback(async () => {
        if (isDemo) return

        try {
            await signOut()
            setUser(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao sair')
        }
    }, [isDemo])

    return {
        user,
        loading,
        error,
        isDemo,
        signIn,
        signOutUser,
    }
}
