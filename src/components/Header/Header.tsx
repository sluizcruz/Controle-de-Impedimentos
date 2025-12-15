import type { AuthUser } from '@/types'

interface HeaderProps {
    user: AuthUser | null
    onSignOut: () => void
    onOpenHistory: () => void
}

/**
 * Componente Header do Dashboard
 */
export function Header({ user, onSignOut, onOpenHistory }: HeaderProps) {
    const now = new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(new Date())

    return (
        <header className="px-4 sm:px-6 py-3 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold">Dashboard de Impedimentos da Sprint</h1>
                    <div className="text-sm text-gray-500">{now}</div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-600">
                        {user?.displayName || user?.email}
                    </div>

                    <button
                        onClick={onOpenHistory}
                        className="px-3 py-2 bg-gray-100 text-gray-900 rounded hover:bg-gray-200 transition"
                    >
                        Histórico
                    </button>

                    <button
                        onClick={onSignOut}
                        className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition"
                    >
                        Sair
                    </button>
                </div>
            </div>
        </header>
    )
}
