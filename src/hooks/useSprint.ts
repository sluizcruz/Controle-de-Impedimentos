import { useState, useEffect, useCallback } from 'react'
import type { Sprint } from '@/types'
import { deriveSprintId, formatSprintId } from '@/utils/dateUtils'
import { startNewSprint, endSprint, subscribeToActiveSprint } from '@/services/firebase'

interface UseSprintReturn {
    sprint: Sprint | null
    sprintId: string
    isStarted: boolean
    loading: boolean
    isOverdue: boolean
    setSprintId: (id: string) => void
    startSprint: (startDate: Date) => Promise<void>
    endSprint: () => void
    getSprintWindow: () => { startDate: Date; endDate: Date; labels: string[]; startDay: number }
}

/**
 * Hook para gerenciamento de Sprint
 */
export function useSprint(): UseSprintReturn {
    const [sprint, setSprint] = useState<Sprint | null>(null)
    const [sprintDocId, setSprintDocId] = useState<string | null>(null)
    const [sprintId, setSprintIdState] = useState<string>(deriveSprintId())
    const [loading, setLoading] = useState(true)
    const [isOverdue, setIsOverdue] = useState(false)

    // Subscreve à sprint ativa do Firestore
    useEffect(() => {
        const unsubscribe = subscribeToActiveSprint((sprintData, docId) => {
            setSprint(sprintData)
            setSprintDocId(docId)

            if (sprintData) {
                setSprintIdState(sprintData.id)

                // Verifica se já expirou
                const now = new Date()
                if (now > sprintData.endDate) {
                    setIsOverdue(true)
                } else {
                    setIsOverdue(false)
                }
            } else {
                setIsOverdue(false)
            }

            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    // Timer para verificar expiração a cada minuto
    useEffect(() => {
        if (!sprint) return

        const interval = setInterval(() => {
            const now = new Date()
            if (now > sprint.endDate && !isOverdue) {
                setIsOverdue(true)
            }
        }, 60000)

        return () => clearInterval(interval)
    }, [sprint, isOverdue])

    // Atualiza o ID da sprint (apenas local antes de iniciar)
    const setSprintId = useCallback((id: string) => {
        const formatted = formatSprintId(id)
        setSprintIdState(formatted)
    }, [])

    // Inicia uma nova sprint no Firestore
    const startSprint = useCallback(async (startDate: Date) => {
        await startNewSprint(sprintId, startDate)
    }, [sprintId])

    // Finaliza a sprint atual
    const endCurrentSprint = useCallback(async () => {
        if (sprintDocId) {
            await endSprint(sprintDocId)
            setIsOverdue(false)
        }
    }, [sprintDocId])

    // Calcula a janela da sprint (labels para gráfico de timeline)
    const getSprintWindow = useCallback(() => {
        if (sprint?.iniciada && sprint.startDate && sprint.endDate) {
            const startDate = sprint.startDate
            const endDate = sprint.endDate
            const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

            const labels = Array.from({ length: days }, (_, i) => {
                const dd = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
                return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(dd)
            })

            return { startDate, endDate, labels, startDay: startDate.getDate() }
        }

        // Fallback: calcula baseado na data atual
        const d = new Date()
        const y = d.getFullYear()
        const m = d.getMonth()
        // ... (lógica de fallback mantida simplificada)
        const startDay = d.getDate() <= 15 ? 1 : 16
        const startDate = new Date(y, m, startDay)
        const endDate = new Date(y, m, startDay + 14)

        const labels = Array.from({ length: 15 }, (_, i) => {
            const dd = new Date(y, m, startDay + i)
            return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(dd)
        })

        return { startDate, endDate, labels, startDay }
    }, [sprint])

    return {
        sprint,
        sprintId,
        isStarted: sprint?.iniciada || false,
        loading,
        isOverdue,
        setSprintId,
        startSprint,
        endSprint: endCurrentSprint,
        getSprintWindow,
    }
}
