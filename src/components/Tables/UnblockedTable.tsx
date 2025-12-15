import type { Impediment } from '@/types'
import { formatDuration, formatDateTime, calculateWorkingMs } from '@/utils/dateUtils'

interface UnblockedTableProps {
    items: Impediment[]
    onReopen: (impediment: Impediment) => void
    onViewHistory: (usId: string) => void
}

/**
 * Tabela de SHPs desbloqueadas
 */
export function UnblockedTable({ items, onReopen, onViewHistory }: UnblockedTableProps) {
    const rows = items
        .filter(imp => !!imp.endTime)
        .map(imp => ({
            ...imp,
            durMs: calculateWorkingMs(imp.startTime, imp.endTime),
        }))
        .sort((a, b) => (b.endTime?.getTime() || 0) - (a.endTime?.getTime() || 0))

    return (
        <section className="bg-white p-4 rounded shadow">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">SHP Desbloqueadas</h2>
                <div className="text-sm text-gray-500">Ordenadas por data de desbloqueio</div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-3 py-2 text-left">ID</th>
                            <th className="px-3 py-2 text-left">Título</th>
                            <th className="px-3 py-2 text-left">Motivo</th>
                            <th className="px-3 py-2 text-left">Responsável</th>
                            <th className="px-3 py-2 text-left">Início</th>
                            <th className="px-3 py-2 text-left">Fim</th>
                            <th className="px-3 py-2 text-left">Tempo</th>
                            <th className="px-3 py-2 text-left">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-3 py-2 text-gray-500 text-center">
                                    Nenhuma SHP desbloqueada nesta sprint
                                </td>
                            </tr>
                        ) : (
                            rows.map(row => (
                                <tr key={row.id}>
                                    <td className="px-3 py-2">{row.usId}</td>
                                    <td className="px-3 py-2">{row.usTitle}</td>
                                    <td className="px-3 py-2">{row.reason}</td>
                                    <td className="px-3 py-2">{row.responsavel}</td>
                                    <td className="px-3 py-2">{formatDateTime(row.startTime)}</td>
                                    <td className="px-3 py-2">{row.endTime ? formatDateTime(row.endTime) : '-'}</td>
                                    <td className="px-3 py-2">{formatDuration(row.durMs)}</td>
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => onReopen(row)}
                                                className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition"
                                            >
                                                Reabrir
                                            </button>
                                            <button
                                                onClick={() => onViewHistory(row.usId)}
                                                className="px-2 py-1 bg-gray-100 text-gray-900 rounded text-xs hover:bg-gray-200 transition"
                                            >
                                                Ver histórico
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    )
}
