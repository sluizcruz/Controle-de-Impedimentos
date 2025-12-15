import type { SprintMetrics } from '@/types'
import { formatDuration } from '@/utils/dateUtils'

interface MetricsCardsProps {
    metrics: SprintMetrics
    onClickBlocked?: () => void
    onClickUnblocked?: () => void
}

/**
 * Cards de métricas do dashboard
 */
export function MetricsCards({ metrics, onClickBlocked, onClickUnblocked }: MetricsCardsProps) {
    return (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Card Tempo Total */}
            <div className="bg-white border border-gray-200 rounded-md p-3">
                <div className="text-sm text-gray-500">Tempo Total Bloqueado</div>
                <div className="text-2xl font-semibold">{formatDuration(metrics.totalMs)}</div>
            </div>

            {/* Card Bloqueadas */}
            <div
                onClick={onClickBlocked}
                className="bg-red-50 border border-red-200 rounded-md p-3 cursor-pointer shadow-sm hover:shadow-md active:shadow transition-all duration-150 hover:-translate-y-[1px]"
            >
                <div className="text-sm text-gray-500">SHP Bloqueadas</div>
                <div className="text-2xl font-semibold">{metrics.blockedCount}</div>
            </div>

            {/* Card Desbloqueadas */}
            <div
                onClick={onClickUnblocked}
                className="bg-green-50 border border-green-200 rounded-md p-3 cursor-pointer shadow-sm hover:shadow-md active:shadow transition-all duration-150 hover:-translate-y-[1px]"
            >
                <div className="text-sm text-gray-500">SHP Desbloqueadas</div>
                <div className="text-2xl font-semibold">{metrics.unblockedCount}</div>
            </div>
        </section>
    )
}
