import { describe, it, expect } from 'vitest'
import {
    formatDuration,
    formatDateBR,
    deriveSprintId,
    formatSprintId,
    calculateWorkingMs,
    canonicalizeReason
} from '@/utils/dateUtils'

describe('formatDuration', () => {
    it('formata segundos corretamente', () => {
        expect(formatDuration(30000)).toBe('30s')
    })

    it('formata minutos corretamente', () => {
        expect(formatDuration(5 * 60 * 1000)).toBe('5m')
    })

    it('formata horas e minutos', () => {
        expect(formatDuration(2 * 60 * 60 * 1000 + 30 * 60 * 1000)).toBe('2h 30m')
    })

    it('formata dias e horas', () => {
        expect(formatDuration(1 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000)).toBe('1 dia e 5 horas')
    })
})

describe('formatDateBR', () => {
    it('formata Date para DD/MM/YYYY', () => {
        const date = new Date(2024, 11, 14) // 14/12/2024
        expect(formatDateBR(date)).toBe('14/12/2024')
    })

    it('formata string ISO para DD/MM/YYYY', () => {
        expect(formatDateBR('2024-12-14')).toBe('14/12/2024')
    })
})

describe('deriveSprintId', () => {
    it('gera ID no formato Sprint-YYYY-WW', () => {
        const date = new Date(2024, 11, 14)
        const result = deriveSprintId(date)
        expect(result).toMatch(/^Sprint-\d{4}-\d{2}$/)
    })
})

describe('formatSprintId', () => {
    it('adiciona prefixo Sprint-', () => {
        expect(formatSprintId('2024')).toBe('Sprint-2024')
    })

    it('remove caracteres especiais', () => {
        expect(formatSprintId('Sprint-2024!')).toBe('Sprint-2024')
    })

    it('converte para uppercase', () => {
        expect(formatSprintId('abc')).toBe('Sprint-ABC')
    })
})

describe('calculateWorkingMs', () => {
    it('retorna 0 para start null', () => {
        expect(calculateWorkingMs(null, null)).toBe(0)
    })

    it('calcula tempo dentro do horário útil', () => {
        const start = new Date(2024, 11, 14, 10, 0, 0) // 10h
        const end = new Date(2024, 11, 14, 12, 0, 0)   // 12h
        expect(calculateWorkingMs(start, end)).toBe(2 * 60 * 60 * 1000) // 2 horas
    })

    it('ignora tempo fora do horário útil', () => {
        const start = new Date(2024, 11, 14, 6, 0, 0)  // 6h (antes do expediente)
        const end = new Date(2024, 11, 14, 10, 0, 0)   // 10h
        expect(calculateWorkingMs(start, end)).toBe(1 * 60 * 60 * 1000) // 1 hora (9h-10h)
    })
})

describe('canonicalizeReason', () => {
    it('mapeia ambiente corretamente', () => {
        expect(canonicalizeReason('ambiente')).toBe('Ambiente')
        expect(canonicalizeReason('AMBIENTE')).toBe('Ambiente')
    })

    it('mapeia bug interno', () => {
        expect(canonicalizeReason('bug')).toBe('Bug Interno')
        expect(canonicalizeReason('bug interno')).toBe('Bug Interno')
    })

    it('mapeia dependência externa', () => {
        expect(canonicalizeReason('dependencia')).toBe('Dependência Externa')
        expect(canonicalizeReason('dependência externa')).toBe('Dependência Externa')
    })

    it('retorna Outro para valores desconhecidos', () => {
        expect(canonicalizeReason('')).toBe('Outro')
        expect(canonicalizeReason('xyz')).toBe('Outro')
    })
})
