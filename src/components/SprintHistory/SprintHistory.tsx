import type { Sprint } from '@/types'
import { formatDateBR } from '@/utils/dateUtils'

interface SprintHistoryProps {
    sprints: Sprint[]
    loading: boolean
    error: string | null
    onClose: () => void
}

export function SprintHistory({ sprints, loading, error, onClose }: SprintHistoryProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 overflow-y-auto">
            <div className="bg-white rounded-md shadow-lg max-w-3xl w-full mt-12">
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                    <div>
                        <h2 className="text-lg font-semibold">Histórico de Sprints</h2>
                        <p className="text-xs text-gray-500">Sprints anteriores ordenadas pela data de início</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-3 py-1.5 text-sm rounded-md bg-gray-100 hover:bg-gray-200 text-gray-900 transition"
                    >
                        Fechar
                    </button>
                </div>

                <div className="px-4 py-3">
                    {loading && (
                        <div className="text-sm text-gray-500 py-6 text-center">
                            Carregando histórico de sprints...
                        </div>
                    )}

                    {!loading && error && (
                        <div className="text-sm text-red-600 py-6 text-center">
                            {error}
                        </div>
                    )}

                    {!loading && !error && sprints.length === 0 && (
                        <div className="text-sm text-gray-500 py-6 text-center">
                            Nenhuma sprint anterior encontrada.
                        </div>
                    )}

                    {!loading && !error && sprints.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-3 py-2 text-left">Sprint ID</th>
                                        <th className="px-3 py-2 text-left">Início</th>
                                        <th className="px-3 py-2 text-left">Fim</th>
                                        <th className="px-3 py-2 text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sprints.map((sprint) => (
                                        <tr key={`${sprint.id}-${sprint.startDate.toISOString()}`} className="border-b border-gray-50">
                                            <td className="px-3 py-2 font-medium">{sprint.id}</td>
                                            <td className="px-3 py-2">{formatDateBR(sprint.startDate)}</td>
                                            <td className="px-3 py-2">{formatDateBR(sprint.endDate)}</td>
                                            <td className="px-3 py-2">
                                                <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                                                    Concluída
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
