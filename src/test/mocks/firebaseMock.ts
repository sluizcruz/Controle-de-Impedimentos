import { vi } from 'vitest'
import { Impediment, CreateImpedimentData } from '../../types'

// Store for managing listeners
let listeners: Array<(data: Impediment[]) => void> = []
let errorListeners: Array<(error: Error) => void> = []

// Mock Data Store
let mockImpediments: Impediment[] = []

export const subscribeToImpediments = vi.fn((
    _sprintId: string,
    onData: (data: Impediment[]) => void,
    onError?: (error: Error) => void
) => {
    // Register listeners
    listeners.push(onData)
    if (onError) errorListeners.push(onError)

    // Initial emission
    onData(mockImpediments)

    // Unsubscribe function
    return () => {
        listeners = listeners.filter(l => l !== onData)
        if (onError) errorListeners = errorListeners.filter(l => l !== onError)
    }
})

export const createImpediment = vi.fn(async (sprintId: string, data: CreateImpedimentData, userId: string) => {
    const newImpediment: Impediment = {
        id: 'new-id-' + Date.now(),
        sprintId,
        userId,
        startTime: new Date(),
        ...data,
        endTime: null,
        description: data.description || '',
        externalLink: data.externalLink || '',
        reopenedFrom: null,
        reopenedAt: null
    }
    mockImpediments = [...mockImpediments, newImpediment]
    emitUpdate()
    return { id: newImpediment.id }
})

export const endImpediment = vi.fn(async (id: string) => {
    mockImpediments = mockImpediments.map(imp =>
        imp.id === id ? { ...imp, endTime: new Date() } : imp
    )
    emitUpdate()
})

// Sprint Mocks
export const subscribeToActiveSprint = vi.fn((onData: (data: any) => void) => {
    onData({
        id: 'sprint-123',
        sprintId: 'Sprint 1',
        startDate: { toDate: () => new Date() },
        endDate: { toDate: () => new Date() },
        iniciada: true
    })
    return () => { }
})

export const startNewSprint = vi.fn()
export const endSprint = vi.fn()

// Auth Mocks
export const loginWithGoogle = vi.fn(async () => ({ user: { uid: 'user-123', displayName: 'Test User' } }))
export const logout = vi.fn(async () => { })
export const onAuthChange = vi.fn((cb) => {
    cb({ uid: 'user-123', displayName: 'Test User' }) // Auto login as test user
    return () => { }
})
export const isDemoMode = vi.fn(() => false)

// Helper to trigger updates
function emitUpdate() {
    listeners.forEach(l => l(mockImpediments))
}

// Helper to trigger error (for testing error handling)
export const __triggerError = (error: Error) => {
    errorListeners.forEach(l => l(error))
}

// Helper to reset store
export const __resetMocks = () => {
    mockImpediments = []
    listeners = []
    errorListeners = []
    vi.clearAllMocks()
}
