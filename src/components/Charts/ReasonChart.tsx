import { useMemo } from 'react'
import { Pie } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js'
import type { Impediment } from '@/types'
import { BLOCK_REASONS, BLOCK_REASON_OPTIONS } from '@/constants'
import { calculateWorkingMs, calculateTotalMs, canonicalizeReason } from '@/utils/dateUtils'

ChartJS.register(ArcElement, Tooltip, Legend)

interface ReasonChartProps {
    impediments: Impediment[]
    title: string
    subtitle: string
    useWorkingHours?: boolean
    showOnlyBlocked?: boolean
}

/**
 * Gráfico de pizza por motivo de bloqueio
 */
export function ReasonChart({
    impediments,
    title,
    subtitle,
    useWorkingHours = true,
    showOnlyBlocked = false
}: ReasonChartProps) {
    const chartData = useMemo(() => {
        const filtered = showOnlyBlocked
            ? impediments.filter(i => !i.endTime)
            : impediments.filter(i => !!i.endTime)

        if (filtered.length === 0) return null

        const sums = new Map<string, number>()

        for (const imp of filtered) {
            const dur = useWorkingHours
                ? calculateWorkingMs(imp.startTime, imp.endTime)
                : calculateTotalMs(imp.startTime, imp.endTime)

            const key = canonicalizeReason(imp.reason)
            sums.set(key, (sums.get(key) || 0) + dur)
        }

        const reasonsPresent = new Set(
            filtered.map(i => canonicalizeReason(i.reason))
                .filter(r => BLOCK_REASON_OPTIONS.includes(r as never))
        )

        const labels = BLOCK_REASON_OPTIONS.filter(k => reasonsPresent.has(k))
        const data = labels.map(k => Math.round((sums.get(k) || 0) / 3600000 * 100) / 100)
        const colors = labels.map(k => BLOCK_REASONS[k]?.color || '#9ca3af')
        const totalHours = Math.round(data.reduce((a, b) => a + b, 0) * 100) / 100

        return { labels, data, colors, totalHours }
    }, [impediments, useWorkingHours, showOnlyBlocked])

    if (!chartData || chartData.data.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-md p-3">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <div className="text-sm text-gray-500">{subtitle}</div>
                </div>
                <div className="relative h-32 md:h-48 flex items-center justify-center text-sm text-gray-500">
                    {showOnlyBlocked ? 'Sem bloqueios ativos' : 'Sem dados disponíveis'}
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white border border-gray-200 rounded-md p-3">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">{title}</h2>
                <div className="text-sm text-gray-500">{subtitle}</div>
            </div>
            <div className="relative h-32 md:h-48">
                <Pie
                    data={{
                        labels: chartData.labels,
                        datasets: [{
                            data: chartData.data,
                            backgroundColor: chartData.colors,
                        }]
                    }}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                            },
                        },
                    }}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-sm font-bold text-gray-700">{chartData.totalHours}h</span>
                </div>
            </div>
        </div>
    )
}
