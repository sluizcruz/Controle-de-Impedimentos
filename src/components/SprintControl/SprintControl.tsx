import { useState } from 'react'
import type { Sprint } from '@/types'
import { formatDateBR } from '@/utils/dateUtils'

interface SprintControlProps {
    sprintId: string
    sprint: Sprint | null
    isStarted: boolean
    onSprintIdChange: (id: string) => void
    onStartSprint: (startDate: Date) => void
    onExportPdf: () => void
    onSeedDemo?: () => void
}

/**
 * Componente de controle da Sprint
 */
export function SprintControl({
    sprintId,
    sprint,
    isStarted,
    onSprintIdChange,
    onStartSprint,
    onExportPdf,
    onSeedDemo,
}: SprintControlProps) {
    const [startDate, setStartDate] = useState('')
    const today = new Date().toISOString().split('T')[0]

    const handleStartSprint = () => {
        if (!startDate) {
            alert('Por favor, selecione uma data de início')
            return
        }

        if (startDate > today) {
            alert('A data de início não pode ser futura!')
            return
        }

        const parsed = new Date(startDate + 'T00:00:00')
        onStartSprint(parsed)

        const endDate = new Date(parsed.getTime() + 15 * 24 * 60 * 60 * 1000)
        alert(`Sprint "${sprintId}" iniciada!\nInício: ${formatDateBR(parsed)}\nFim: ${formatDateBR(endDate)}`)
    }

    return (
        <section className="bg-white border border-gray-200 rounded-md p-3">
            <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1">
                    <label className="block text-xs text-gray-600">Sprint ID</label>
                    <input
                        value={sprintId}
                        onChange={(e) => onSprintIdChange(e.target.value)}
                        className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                        placeholder="Sprint-000"
                    />
                    <div className="text-[10px] text-gray-500 mt-1">Formato: Sprint-000 (Mantenha o padrão)</div>
                </div>

                <div className="flex-1">
                    <label className="block text-xs text-gray-600">Data de Início</label>
                    <input
                        type="date"
                        value={startDate}
                        max={today}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                    />
                </div>

                <button
                    onClick={handleStartSprint}
                    disabled={!startDate || !sprintId}
                    className="px-2.5 py-1.5 bg-green-600 text-white rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition"
                >
                    Iniciar Sprint
                </button>

                <button
                    onClick={onExportPdf}
                    className="px-2.5 py-1.5 bg-gray-100 text-gray-900 rounded-md text-sm hover:bg-gray-200 transition"
                >
                    Exportar PDF
                </button>

                {onSeedDemo && (
                    <button
                        onClick={onSeedDemo}
                        className="px-2.5 py-1.5 bg-gray-100 text-gray-900 rounded-md text-sm hover:bg-gray-200 transition"
                    >
                        Popular Exemplo
                    </button>
                )}

                {isStarted && sprint && (
                    <span className="px-2.5 py-1.5 text-xs font-medium rounded-md bg-green-100 text-green-800">
                        Sprint iniciada: {formatDateBR(sprint.startDate)} até {formatDateBR(sprint.endDate)}
                    </span>
                )}
            </div>
        </section>
    )
}
