import type { Impediment } from '@/types'
import { formatDuration, formatDateTime, calculateWorkingMs } from '@/utils/dateUtils'

interface BlockedTableProps {
    items: Impediment[]
    onEnd: (id: string) => void
    onViewHistory: (usId: string) => void
}

/**
 * Tabela de SHPs bloqueadas
 */
export function BlockedTable({ items, onEnd, onViewHistory }: BlockedTableProps) {
    const rows = items.map(imp => ({
        ...imp,
        durMs: calculateWorkingMs(imp.startTime, null),
    })).sort((a, b) => b.durMs - a.durMs)

    return (
        <section className="bg-white p-4 rounded shadow">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">SHP Bloqueadas</h2>
                <div className="text-sm text-gray-500">Ordenadas por maior tempo bloqueado</div>
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
                            <th className="px-3 py-2 text-left">Tempo Bloqueado</th>
                            <th className="px-3 py-2 text-left">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-3 py-2 text-gray-500 text-center">
                                    Nenhuma SHP bloqueada
                                </td>
                            </tr>
                        ) : (
                            rows.map(row => {
                                const isCritical = row.durMs >= 8 * 3600000
                                return (
                                    <tr key={row.id} className={isCritical ? 'bg-red-50' : ''}>
                                        <td className="px-3 py-2">
                                            <button
                                                onClick={() => onViewHistory(row.usId)}
                                                className="text-indigo-700 hover:underline"
                                            >
                                                {row.usId}
                                            </button>
                                        </td>
                                        <td className="px-3 py-2">{row.usTitle}</td>
                                        <td className="px-3 py-2">{row.reason}</td>
                                        <td className="px-3 py-2">{row.responsavel}</td>
                                        <td className="px-3 py-2">{formatDateTime(row.startTime)}</td>
                                        <td className="px-3 py-2 font-medium">{formatDuration(row.durMs)}</td>
                                        <td className="px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => onEnd(row.id)}
                                                    className="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
                                                >
                                                    Encerrar
                                                </button>
                                                <button
                                                    onClick={() => onViewHistory(row.usId)}
                                                    className="px-3 py-1 bg-gray-100 text-gray-900 rounded hover:bg-gray-200 transition"
                                                >
                                                    Ver histórico
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    )
}
