import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from '../App'
import * as firebaseService from '../services/firebase'
import { __resetMocks, __triggerError } from './mocks/firebaseMock'

// Mock the entire firebase service module
vi.mock('../services/firebase', async () => {
    const actual = await vi.importActual('./mocks/firebaseMock')
    return actual
})

// Mock chart.js to avoid canvas errors in jsdom
vi.mock('react-chartjs-2', () => ({
    Bar: () => null,
    Pie: () => null
}))

describe('App Integration Flow', () => {

    beforeEach(() => {
        __resetMocks()
        vi.clearAllMocks()
    })

    it('should display the main layout and sprint info', async () => {
        render(<App />)
        expect(screen.getByText(/Dashboard de Impedimentos/i)).toBeInTheDocument()
        // Sprint Active (mocked)
        expect(await screen.findByText(/Sprint Ativa/i)).toBeInTheDocument()
    })

    it('should validate form fields before submitting', async () => {
        // Mock alert
        const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => { })

        render(<App />)

        // Click start without filling
        const btn = screen.getByText('Iniciar Bloqueio')
        fireEvent.click(btn)

        expect(alertMock).toHaveBeenCalledWith(expect.stringContaining('preencha os campos obrigatórios'))
    })

    it('should register an impediment successfully', async () => {
        const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => { })

        render(<App />)

        // Fill form
        fireEvent.change(screen.getByPlaceholderText('Ex: SHP-123'), { target: { value: 'SHP-TEST' } })
        fireEvent.change(screen.getByPlaceholderText('Ex: João Silva'), { target: { value: 'Tester' } })
        fireEvent.change(screen.getByDisplayValue('Ambiente'), { target: { value: 'Ambiente' } }) // Select reason

        // Submit
        fireEvent.click(screen.getByText('Iniciar Bloqueio'))

        // Verify API call
        await waitFor(() => {
            expect(firebaseService.createImpediment).toHaveBeenCalled()
        })

        // Verify Success Alert
        expect(alertMock).toHaveBeenCalledWith('Bloqueio registrado com sucesso!')
    })

    it('should display "Missing Index" error when subscription fails', async () => {
        render(<App />)

        // Trigger the specific error that happens when index is missing
        const indexError = new Error('The query requires an index')

        // This needs to happen after the initial render/subscription
        await waitFor(() => {
            __triggerError(indexError)
        })

        // Check if the error banner appears
        expect(await screen.findByText(/Erro ao carregar impedimentos/i)).toBeInTheDocument()
        expect(screen.getByText(/The query requires an index/i)).toBeInTheDocument()
    })
})
