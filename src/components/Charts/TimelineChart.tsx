import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js'
import type { Impediment } from '@/types'
import { BLOCK_REASONS, BLOCK_REASON_OPTIONS, MAX_HOURS_PER_DAY } from '@/constants'
import { canonicalizeReason } from '@/utils/dateUtils'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface TimelineChartProps {
    impediments: Impediment[]
    sprintWindow: {
        startDate: Date
        endDate: Date
        labels: string[]
        startDay: number
    }
    isSprintStarted?: boolean
}

/**
 * Gráfico de barras empilhadas - Timeline da Sprint
 */
export function TimelineChart({
    impediments,
    sprintWindow,
    isSprintStarted = false
}: TimelineChartProps) {
    const { datasets, labels } = useMemo(() => {
        const { startDate, endDate, labels: baseLabels, startDay } = sprintWindow

        // Adiciona marcadores se sprint iniciada
        const modifiedLabels = [...baseLabels]
        if (isSprintStarted && modifiedLabels.length >= 15) {
            modifiedLabels[0] = `${modifiedLabels[0]} (INÍCIO)`
            modifiedLabels[modifiedLabels.length - 1] = `${modifiedLabels[modifiedLabels.length - 1]} (FIM)`
        }

        // Inicializa bins por motivo
        const binsByReason: Record<string, number[]> = {}
        for (const m of BLOCK_REASON_OPTIONS) {
            binsByReason[m] = Array(modifiedLabels.length).fill(0)
        }

        // Adiciona tempo de cada impedimento aos bins
        const addRange = (s: Date, e: Date | null, reason: string) => {
            const start = s < startDate ? startDate : s
            const end = e ? (e > endDate ? endDate : e) : new Date()
            if (end <= start) return

            let cur = new Date(start)
            while (cur <= end) {
                const dayIdx = cur.getDate() - startDay
                if (dayIdx >= 0 && dayIdx < modifiedLabels.length) {
                    const dayEnd = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate(), 23, 59, 59, 999)
                    const sliceEnd = end < dayEnd ? end : dayEnd
                    const ms = Math.max(sliceEnd.getTime() - cur.getTime(), 0)

                    if (binsByReason[reason]) {
                        binsByReason[reason][dayIdx] += ms
                    }

                    cur = new Date(dayEnd.getTime() + 1)
                } else {
                    cur = new Date(cur.getTime() + 86400000)
                }
            }
        }

        for (const imp of impediments) {
            const m = canonicalizeReason(imp.reason)
            if (BLOCK_REASON_OPTIONS.includes(m as never)) {
                addRange(imp.startTime, imp.endTime, m)
            }
        }

        // Converte para horas e aplica cap
        const hoursByReason = BLOCK_REASON_OPTIONS.map(m =>
            binsByReason[m].map(ms => Math.round(ms / 3600000 * 100) / 100)
        )

        // Aplica cap de MAX_HOURS_PER_DAY por dia
        for (let i = 0; i < modifiedLabels.length; i++) {
            const total = hoursByReason.reduce((acc, arr) => acc + (arr[i] || 0), 0)
            if (total > MAX_HOURS_PER_DAY) {
                const factor = MAX_HOURS_PER_DAY / total
                for (const arr of hoursByReason) {
                    arr[i] = Math.round(arr[i] * factor * 100) / 100
                }
            }
        }

        const datasets = BLOCK_REASON_OPTIONS.map((m, idx) => ({
            label: m,
            data: hoursByReason[idx],
            backgroundColor: BLOCK_REASONS[m]?.color || '#9ca3af',
            stack: 'stack1',
            maxBarThickness: 28,
        }))

        return { datasets, labels: modifiedLabels }
    }, [impediments, sprintWindow, isSprintStarted])

    return (
        <section className="bg-white border border-gray-200 rounded-md p-3">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Linha do Tempo da Sprint (15 dias)</h2>
                <div className="text-sm text-gray-500">Horas bloqueadas por dia</div>
            </div>
            <div className="relative h-40 md:h-56">
                <Bar
                    data={{ labels, datasets }}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: { stacked: true },
                            y: {
                                stacked: true,
                                beginAtZero: true,
                                max: 8,
                                title: { display: true, text: 'Horas' },
                                ticks: { stepSize: 1 }
                            },
                        },
                        plugins: {
                            legend: { position: 'bottom' },
                        },
                    }}
                />
            </div>
        </section>
    )
}
