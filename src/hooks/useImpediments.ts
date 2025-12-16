import { useState, useEffect, useCallback, useMemo } from 'react'
import {
    subscribeToImpediments,
    createImpediment,
    endImpediment,
    reopenImpediment,
    isDemoMode
} from '@/services/firebase'
import type { Impediment, CreateImpedimentData, SprintMetrics, BlockReason } from '@/types'
import { calculateWorkingMs, calculateDailyMetrics } from '@/utils/dateUtils'

// Mock data para modo demo
function generateDemoData(sprintId: string): Impediment[] {
    const now = new Date()
    const mid = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0)

    const samples: Array<{ usId: string; title: string; reason: BlockReason; hoursAgo: number; dur: number; desc: string }> = [
        { usId: 'SHP-A1', title: 'Ambiente QA', reason: 'Ambiente', hoursAgo: 7, dur: 1, desc: 'Instância fora do ar' },
        { usId: 'SHP-D1', title: 'API Externa', reason: 'Dependência Externa', hoursAgo: 6, dur: 5, desc: 'Fornecedor indisponível' },
        { usId: 'SHP-B1', title: 'Erro de Cálculo', reason: 'Bug Interno', hoursAgo: 5, dur: 2.5, desc: 'Null pointer' },
        { usId: 'SHP-G1', title: 'Integração Getnet', reason: 'Getnet', hoursAgo: 4, dur: 0, desc: 'Timeout na adquirente' },
        { usId: 'SHP-O1', title: 'Fluxo OCC', reason: 'OCC', hoursAgo: 3, dur: 4, desc: 'Regra de negócio pendente' },
        { usId: 'SHP-F1', title: 'Especificação', reason: 'Falta de Especificação', hoursAgo: 2, dur: 8, desc: 'Critérios incompletos' },
    ]

    return samples.map((s, i) => {
        const startTime = new Date(mid.getTime() - s.hoursAgo * 3600000)
        const endTime = s.dur > 0
            ? new Date(startTime.getTime() + s.dur * 3600000)
            : null

        return {
            id: String(mid.getTime() + i),
            usId: s.usId,
            usTitle: s.title,
            sprintId,
            startTime,
            endTime,
            reason: s.reason,
            userId: 'demo',
            responsavel: 'Equipe Demo',
            externalLink: '',
            description: s.desc,
            reopenedFrom: null,
            reopenedAt: null,
        }
    })
}

interface UseImpedimentsReturn {
    impediments: Impediment[]
    loading: boolean
    error: string | null
    metrics: SprintMetrics
    blockedItems: Impediment[]
    unblockedItems: Impediment[]
    addImpediment: (data: CreateImpedimentData) => Promise<boolean>
    finishImpediment: (id: string) => Promise<boolean>
    reopen: (impediment: Impediment, newData: Partial<CreateImpedimentData>) => Promise<boolean>
}

/**
 * Hook para gerenciamento de impedimentos
 */
export function useImpediments(sprintId: string, userId: string | null): UseImpedimentsReturn {
    const [impediments, setImpediments] = useState<Impediment[]>([])
    const [demoData, setDemoData] = useState<Impediment[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const isDemo = isDemoMode()

    // Carrega dados
    useEffect(() => {
        if (!sprintId) {
            setLoading(false)
            return
        }

        if (isDemo) {
            // Modo demo: gera dados mock
            if (demoData.length === 0) {
                setDemoData(generateDemoData(sprintId))
            }
            setImpediments(demoData.filter(d => d.sprintId === sprintId))
            setLoading(false)
            return
        }

        // Modo produção: escuta Firestore
        setLoading(true)
        setImpediments(data)
        setLoading(false)
    }, (err) => {
        console.error(err)
        setError(err.message)
        setLoading(false)
    })

    return () => unsubscribe()
}, [sprintId, isDemo, demoData])

// Calcula métricas
const metrics = useMemo((): SprintMetrics => {
    const dayTotals = calculateDailyMetrics(impediments)
    let totalMs = 0
    for (const ms of dayTotals.values()) {
        totalMs += ms
    }

    // Conta SHPs por status
    const byUs = new Map<string, Impediment[]>()
    for (const imp of impediments) {
        const arr = byUs.get(imp.usId) || []
        arr.push(imp)
        byUs.set(imp.usId, arr)
    }

    let blockedCount = 0
    let unblockedCount = 0
    for (const [, arr] of byUs.entries()) {
        const hasActive = arr.some(imp => !imp.endTime)
        if (hasActive) blockedCount++
        else unblockedCount++
    }

    return { totalMs, blockedCount, unblockedCount }
}, [impediments])

// Itens bloqueados (ordenados por tempo)
const blockedItems = useMemo(() => {
    return impediments
        .filter(imp => !imp.endTime)
        .map(imp => ({
            ...imp,
            _durMs: calculateWorkingMs(imp.startTime, null)
        }))
        .sort((a, b) => b._durMs - a._durMs)
        .map(({ _durMs, ...imp }) => imp)
}, [impediments])

// Itens desbloqueados (ordenados por data fim)
const unblockedItems = useMemo(() => {
    return impediments
        .filter(imp => !!imp.endTime)
        .sort((a, b) => (b.endTime?.getTime() || 0) - (a.endTime?.getTime() || 0))
}, [impediments])

// Adiciona impedimento
const addImpediment = useCallback(async (data: CreateImpedimentData): Promise<boolean> => {
    if (!sprintId) return false

    try {
        if (isDemo) {
            const newImp: Impediment = {
                id: String(Date.now()),
                ...data,
                sprintId,
                startTime: new Date(),
                endTime: null,
                userId: 'demo',
                externalLink: data.externalLink || '',
                description: data.description || '',
                reopenedFrom: null,
                reopenedAt: null,
            }
            setDemoData(prev => [...prev, newImp])
            return true
        }

        if (!userId) {
            setError('Usuário não autenticado')
            return false
        }

        await createImpediment(sprintId, data, userId)
        return true
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao criar impedimento')
        return false
    }
}, [sprintId, userId, isDemo])

// Encerra impedimento
const finishImpediment = useCallback(async (id: string): Promise<boolean> => {
    try {
        if (isDemo) {
            setDemoData(prev => prev.map(d =>
                d.id === id ? { ...d, endTime: new Date() } : d
            ))
            return true
        }

        await endImpediment(id)
        return true
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao encerrar impedimento')
        return false
    }
}, [isDemo])

// Reabre impedimento
const reopen = useCallback(async (
    impediment: Impediment,
    newData: Partial<CreateImpedimentData>
): Promise<boolean> => {
    try {
        if (isDemo) {
            const newImp: Impediment = {
                id: String(Date.now()),
                usId: impediment.usId,
                usTitle: newData.usTitle || impediment.usTitle,
                sprintId: impediment.sprintId,
                startTime: new Date(),
                endTime: null,
                reason: newData.reason || impediment.reason,
                userId: 'demo',
                responsavel: newData.responsavel || impediment.responsavel,
                externalLink: newData.externalLink || impediment.externalLink,
                description: newData.description || '',
                reopenedFrom: impediment.id,
                reopenedAt: new Date(),
            }
            setDemoData(prev => [...prev, newImp])
            return true
        }

        if (!userId) {
            setError('Usuário não autenticado')
            return false
        }

        await reopenImpediment(impediment, newData, userId)
        return true
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao reabrir impedimento')
        return false
    }
}, [userId, isDemo])

return {
    impediments,
    loading,
    error,
    metrics,
    blockedItems,
    unblockedItems,
    addImpediment,
    finishImpediment,
    reopen,
}
}
