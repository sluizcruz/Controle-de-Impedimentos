import { useState, useEffect, useCallback } from 'react'
import { SPRINT_DURATION_DAYS } from '@/constants'
import type { Sprint, SprintState } from '@/types'
import { deriveSprintId, parseDate, formatSprintId } from '@/utils/dateUtils'

const STORAGE_KEY = 'sprintState'

interface UseSprintReturn {
    sprint: Sprint | null
    sprintId: string
    isStarted: boolean
    loading: boolean
    setSprintId: (id: string) => void
    startSprint: (startDate: Date) => void
    getSprintWindow: () => { startDate: Date; endDate: Date; labels: string[]; startDay: number }
}

/**
 * Hook para gerenciamento de Sprint
 */
export function useSprint(): UseSprintReturn {
    const [sprint, setSprint] = useState<Sprint | null>(null)
    const [sprintId, setSprintIdState] = useState<string>(deriveSprintId())
    const [loading, setLoading] = useState(true)

    // Carrega estado salvo do localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
                const state: SprintState = JSON.parse(saved)
                if (state.iniciada && state.sprintId && state.startDate && state.endDate) {
                    const startDate = parseDate(state.startDate.split('T')[0]) || new Date(state.startDate)
                    const endDate = parseDate(state.endDate.split('T')[0]) || new Date(state.endDate)

                    setSprint({
                        id: state.sprintId,
                        startDate,
                        endDate,
                        iniciada: true,
                    })
                    setSprintIdState(state.sprintId)
                }
            }
        } catch (e) {
            console.error('Erro ao carregar estado da sprint:', e)
        }
        setLoading(false)
    }, [])

    // Atualiza o ID da sprint (com formatação)
    const setSprintId = useCallback((id: string) => {
        const formatted = formatSprintId(id)
        setSprintIdState(formatted)
    }, [])

    // Inicia uma nova sprint
    const startSprint = useCallback((startDate: Date) => {
        const endDate = new Date(startDate.getTime() + SPRINT_DURATION_DAYS * 24 * 60 * 60 * 1000)

        const newSprint: Sprint = {
            id: sprintId,
            startDate,
            endDate,
            iniciada: true,
        }

        setSprint(newSprint)

        // Salva no localStorage
        const state: SprintState = {
            sprintId,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            iniciada: true,
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }, [sprintId])

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
        const dim = new Date(y, m + 1, 0).getDate()
        const startDay = d.getDate() <= 15 ? 1 : 16
        const endDay = Math.min(startDay + 14, dim)
        const startDate = new Date(y, m, startDay, 0, 0, 0)
        const endDate = new Date(y, m, endDay, 23, 59, 59, 999)
        const days = endDay - startDay + 1

        const labels = Array.from({ length: days }, (_, i) => {
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
        setSprintId,
        startSprint,
        getSprintWindow,
    }
}
