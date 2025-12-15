import { WORK_HOURS, MAX_HOURS_PER_DAY, dateFormatter, shortDateFormatter } from '@/constants'

/**
 * Utilitários de data e formatação
 */

/**
 * Formata duração em milissegundos para string legível
 */
export function formatDuration(ms: number): string {
    const s = Math.floor(ms / 1000)
    const d = Math.floor(s / 86400)
    const h = Math.floor((s % 86400) / 3600)
    const m = Math.floor((s % 3600) / 60)

    if (s < 60) return `${s}s`
    if (d > 0) return `${d} dia${d > 1 ? 's' : ''} e ${h} hora${h > 1 ? 's' : ''}`
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
}

/**
 * Verifica se o horário atual está dentro do horário útil
 */
export function isWorkingHours(): boolean {
    const h = new Date().getHours()
    return h >= WORK_HOURS.START && h < WORK_HOURS.END
}

/**
 * Retorna o início e fim do horário de trabalho para um dia específico
 */
export function getWorkDayRange(date: Date): { workStart: Date; workEnd: Date } {
    const workStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), WORK_HOURS.START, 0, 0, 0)
    const workEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), WORK_HOURS.END, 0, 0, 0)
    return { workStart, workEnd }
}

/**
 * Calcula milissegundos de trabalho entre duas datas (apenas horário útil)
 */
export function calculateWorkingMs(start: Date | null, end: Date | null): number {
    if (!start) return 0

    const s = new Date(start)
    const e = new Date(end || Date.now())

    if (e <= s) return 0

    let total = 0
    let cur = new Date(s.getFullYear(), s.getMonth(), s.getDate())
    const last = new Date(e.getFullYear(), e.getMonth(), e.getDate())

    while (cur <= last) {
        const { workStart, workEnd } = getWorkDayRange(cur)
        const segStart = new Date(Math.max(workStart.getTime(), s.getTime()))
        const segEnd = new Date(Math.min(workEnd.getTime(), e.getTime()))

        if (segEnd > segStart) {
            total += segEnd.getTime() - segStart.getTime()
        }

        cur = new Date(cur.getTime() + 86400000)
    }

    return total
}

/**
 * Calcula milissegundos totais entre duas datas (sem considerar horário útil)
 */
export function calculateTotalMs(start: Date | null, end: Date | null): number {
    if (!start) return 0
    const s = new Date(start)
    const e = new Date(end || Date.now())
    return Math.max(e.getTime() - s.getTime(), 0)
}

/**
 * Gera o ID da sprint baseado na data atual
 */
export function deriveSprintId(date: Date = new Date()): string {
    const year = date.getFullYear()
    const oneJan = new Date(date.getFullYear(), 0, 1)
    const week = Math.ceil((((date.getTime() - oneJan.getTime()) / 86400000) + oneJan.getDay() + 1) / 7)
    return `Sprint-${year}-${String(week).padStart(2, '0')}`
}

/**
 * Parse de string YYYY-MM-DD para Date
 */
export function parseDate(value: string): Date | null {
    if (!value || typeof value !== 'string') return null
    const parts = value.split('-')
    if (parts.length !== 3) return null

    const y = parseInt(parts[0], 10)
    const m = parseInt(parts[1], 10)
    const d = parseInt(parts[2], 10)

    if (!y || !m || !d) return null
    return new Date(y, m - 1, d, 0, 0, 0, 0)
}

/**
 * Formata data para string DD/MM/YYYY
 */
export function formatDateBR(date: Date | string): string {
    if (typeof date === 'string' && date.includes('-')) {
        date = new Date(date)
    }

    if (date instanceof Date) {
        const dia = String(date.getDate()).padStart(2, '0')
        const mes = String(date.getMonth() + 1).padStart(2, '0')
        const ano = date.getFullYear()
        return `${dia}/${mes}/${ano}`
    }

    return String(date)
}

/**
 * Formata data e hora usando o formatter padrão
 */
export function formatDateTime(date: Date): string {
    return dateFormatter.format(date)
}

/**
 * Formata data curta (DD/MM)
 */
export function formatShortDate(date: Date): string {
    return shortDateFormatter.format(date)
}

/**
 * Retorna o número de dias em um mês
 */
export function daysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate()
}

/**
 * Aplica a máscara de Sprint ID (Sprint-XXXX)
 */
export function formatSprintId(value: string): string {
    let clean = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()

    if (clean.startsWith('SPRINT')) {
        clean = clean.substring(6)
    }

    return clean.length > 0 ? `Sprint-${clean}` : 'Sprint-'
}

/**
 * Calcula métricas por dia com cap de MAX_HOURS_PER_DAY
 */
export function calculateDailyMetrics(
    docs: Array<{ startTime: Date; endTime: Date | null }>
): Map<string, number> {
    const dayTotals = new Map<string, number>()

    for (const d of docs) {
        const start = d.startTime instanceof Date ? d.startTime : new Date(d.startTime)
        const end = d.endTime ? (d.endTime instanceof Date ? d.endTime : new Date(d.endTime)) : new Date()

        let cur = new Date(start.getFullYear(), start.getMonth(), start.getDate())
        const last = new Date(end.getFullYear(), end.getMonth(), end.getDate())

        while (cur <= last) {
            const k = `${cur.getFullYear()}-${cur.getMonth() + 1}-${cur.getDate()}`
            const { workStart, workEnd } = getWorkDayRange(cur)
            const segStart = new Date(Math.max(workStart.getTime(), start.getTime()))
            const segEnd = new Date(Math.min(workEnd.getTime(), end.getTime()))
            const addMs = segEnd > segStart ? (segEnd.getTime() - segStart.getTime()) : 0
            dayTotals.set(k, (dayTotals.get(k) || 0) + addMs)
            cur = new Date(cur.getTime() + 86400000)
        }
    }

    // Aplica cap de MAX_HOURS_PER_DAY
    const cappedTotals = new Map<string, number>()
    for (const [date, ms] of dayTotals.entries()) {
        cappedTotals.set(date, Math.min(ms, MAX_HOURS_PER_DAY * 3600000))
    }

    return cappedTotals
}

/**
 * Normaliza o motivo do bloqueio para formato canônico
 */
export function canonicalizeReason(reason: string): string {
    const s = String(reason || '').trim().toLowerCase()

    if (!s) return 'Outro'
    if (s.includes('ambiente')) return 'Ambiente'
    if (s.includes('depend')) return 'Dependência Externa'
    if (s.includes('bug')) return 'Bug Interno'
    if (s.includes('getnet')) return 'Getnet'
    if (s.includes('occ')) return 'OCC'
    if (s.includes('especifi')) return 'Falta de Especificação'

    return 'Outro'
}
