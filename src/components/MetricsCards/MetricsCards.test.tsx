import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MetricsCards } from '@/components/MetricsCards'

describe('MetricsCards', () => {
    it('renderiza corretamente com métricas zero', () => {
        render(
            <MetricsCards
                metrics={{ totalMs: 0, blockedCount: 0, unblockedCount: 0 }}
            />
        )

        expect(screen.getByText('Tempo Total Bloqueado')).toBeInTheDocument()
        expect(screen.getByText('SHP Bloqueadas')).toBeInTheDocument()
        expect(screen.getByText('SHP Desbloqueadas')).toBeInTheDocument()
    })

    it('exibe contadores corretamente', () => {
        render(
            <MetricsCards
                metrics={{ totalMs: 3600000, blockedCount: 5, unblockedCount: 10 }}
            />
        )

        expect(screen.getByText('5')).toBeInTheDocument()
        expect(screen.getByText('10')).toBeInTheDocument()
    })

    it('formata duração corretamente', () => {
        render(
            <MetricsCards
                metrics={{ totalMs: 2 * 60 * 60 * 1000 + 30 * 60 * 1000, blockedCount: 0, unblockedCount: 0 }}
            />
        )

        expect(screen.getByText('2h 30m')).toBeInTheDocument()
    })
})
