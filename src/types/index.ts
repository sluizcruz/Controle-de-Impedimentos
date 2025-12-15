/**
 * Tipos centralizados para o Controle de Impedimentos
 */

/** Motivos de bloqueio disponíveis */
export type BlockReason =
    | 'Ambiente'
    | 'Bug Interno'
    | 'Dependência Externa'
    | 'Falta de Especificação'
    | 'Getnet'
    | 'OCC'
    | 'Outro'

/** Estrutura de um impedimento */
export interface Impediment {
    id: string
    usId: string
    usTitle: string
    sprintId: string
    startTime: Date
    endTime: Date | null
    reason: BlockReason
    userId: string
    responsavel: string
    externalLink: string
    description: string
    reopenedFrom?: string | null
    reopenedAt?: Date | null
}

/** Dados para criação de novo impedimento */
export interface CreateImpedimentData {
    usId: string
    usTitle: string
    reason: BlockReason
    responsavel: string
    externalLink?: string
    description?: string
}

/** Estrutura de uma Sprint */
export interface Sprint {
    id: string
    startDate: Date
    endDate: Date
    iniciada: boolean
}

/** Estado da Sprint salvo no localStorage */
export interface SprintState {
    sprintId: string
    startDate: string
    endDate: string
    iniciada: boolean
}

/** Usuário autenticado */
export interface AuthUser {
    uid: string
    email: string | null
    displayName: string | null
    photoURL: string | null
}

/** Métricas calculadas */
export interface SprintMetrics {
    totalMs: number
    blockedCount: number
    unblockedCount: number
}

/** Dados de linha da tabela de bloqueados */
export interface BlockedTableRow {
    id: string
    usId: string
    usTitle: string
    reason: BlockReason
    responsavel: string
    start: Date
    durMs: number
    externalLink: string
}

/** Dados de linha da tabela de desbloqueados */
export interface UnblockedTableRow extends BlockedTableRow {
    end: Date
    description: string
}

/** Dados para o gráfico de motivos */
export interface ReasonChartData {
    labels: string[]
    data: number[]
    colors: string[]
    totalHours: number
}

/** Dados para o gráfico de timeline */
export interface TimelineChartData {
    labels: string[]
    datasets: {
        label: string
        data: number[]
        backgroundColor: string
        stack: string
        maxBarThickness: number
    }[]
}

/** Slide do carrossel de bloqueios ativos */
export interface CarouselSlide {
    usId: string
    usTitle: string
    reason: BlockReason
    start: Date
    durMs: number
}
