import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Header } from '@/components/Header'

describe('Header', () => {
    it('renderiza título corretamente', () => {
        render(
            <Header
                user={{ uid: '123', email: 'test@rethink.dev', displayName: 'Usuário Teste', photoURL: null }}
                onSignOut={vi.fn()}
                onOpenHistory={vi.fn()}
            />
        )

        expect(screen.getByText('Dashboard de Impedimentos da Sprint')).toBeInTheDocument()
    })

    it('exibe nome do usuário quando logado', () => {
        render(
            <Header
                user={{ uid: '123', email: 'test@rethink.dev', displayName: 'João Silva', photoURL: null }}
                onSignOut={vi.fn()}
                onOpenHistory={vi.fn()}
            />
        )

        expect(screen.getByText('João Silva')).toBeInTheDocument()
    })

    it('exibe email quando não há displayName', () => {
        render(
            <Header
                user={{ uid: '123', email: 'test@rethink.dev', displayName: null, photoURL: null }}
                onSignOut={vi.fn()}
                onOpenHistory={vi.fn()}
            />
        )

        expect(screen.getByText('test@rethink.dev')).toBeInTheDocument()
    })

    it('mostra botão Sair', () => {
        render(
            <Header
                user={{ uid: '123', email: 'test@rethink.dev', displayName: 'Test', photoURL: null }}
                onSignOut={vi.fn()}
                onOpenHistory={vi.fn()}
            />
        )

        expect(screen.getByText('Sair')).toBeInTheDocument()
    })

    it('chama onSignOut ao clicar em Sair', () => {
        const onSignOut = vi.fn()
        render(
            <Header
                user={{ uid: '123', email: 'test@rethink.dev', displayName: 'Test', photoURL: null }}
                onSignOut={onSignOut}
                onOpenHistory={vi.fn()}
            />
        )

        fireEvent.click(screen.getByText('Sair'))
        expect(onSignOut).toHaveBeenCalled()
    })

    it('chama onOpenHistory ao clicar em Histórico', () => {
        const onOpenHistory = vi.fn()
        render(
            <Header
                user={{ uid: '123', email: 'test@rethink.dev', displayName: 'Test', photoURL: null }}
                onSignOut={vi.fn()}
                onOpenHistory={onOpenHistory}
            />
        )

        fireEvent.click(screen.getByText('Histórico'))
        expect(onOpenHistory).toHaveBeenCalled()
    })
})
