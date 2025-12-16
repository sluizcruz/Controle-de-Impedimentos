import { useState, useEffect, useCallback } from 'react'
import type { Impediment } from '@/types'
import { formatDuration, formatDateTime, calculateWorkingMs } from '@/utils/dateUtils'
import { CAROUSEL_INTERVAL } from '@/constants'

interface ActiveCarouselProps {
    items: Impediment[]
    useWorkingHours?: boolean
}

/**
 * Carrossel de bloqueios ativos
 */
export function ActiveCarousel({ items, useWorkingHours = true }: ActiveCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)

    // Dados do carrossel
    const slides = items
        .filter(i => !i.endTime)
        .map(imp => ({
            usId: imp.usId,
            usTitle: imp.usTitle,
            reason: imp.reason,
            start: imp.startTime,
            durMs: useWorkingHours
                ? calculateWorkingMs(imp.startTime, null)
                : Math.max(Date.now() - imp.startTime.getTime(), 0),
        }))
        .sort((a, b) => b.durMs - a.durMs)

    // Auto-play
    useEffect(() => {
        if (slides.length <= 1) return

        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % slides.length)
        }, CAROUSEL_INTERVAL)

        return () => clearInterval(timer)
    }, [slides.length])

    // Navegação
    const goToPrev = useCallback(() => {
        setCurrentIndex(prev => (prev - 1 + slides.length) % slides.length)
    }, [slides.length])

    const goToNext = useCallback(() => {
        setCurrentIndex(prev => (prev + 1) % slides.length)
    }, [slides.length])

    // Touch/Drag Logic
    const [touchStart, setTouchStart] = useState<number | null>(null)
    const [touchEnd, setTouchEnd] = useState<number | null>(null)

    // Minimum swipe distance (in px)
    const minSwipeDistance = 50

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null) // Reset
        setTouchStart(e.targetTouches[0].clientX)
    }

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX)
    }

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return
        const distance = touchStart - touchEnd
        const isLeftSwipe = distance > minSwipeDistance
        const isRightSwipe = distance < -minSwipeDistance

        if (isLeftSwipe) {
            goToNext()
        }
        if (isRightSwipe) {
            goToPrev()
        }
    }

    // Mouse Drag Logic
    const onMouseDown = (e: React.MouseEvent) => {
        setTouchEnd(null)
        setTouchStart(e.clientX)
    }

    const onMouseUp = (e: React.MouseEvent) => {
        setTouchEnd(e.clientX)
        // Check immediately for mouse as we have the final coord
        if (!touchStart) return
        const distance = touchStart - e.clientX
        const isLeftSwipe = distance > minSwipeDistance
        const isRightSwipe = distance < -minSwipeDistance

        if (isLeftSwipe) {
            goToNext()
        }
        if (isRightSwipe) {
            goToPrev()
        }
        setTouchStart(null)
    }

    if (slides.length === 0) {
        return (
            <section className="bg-white border border-gray-200 rounded-md p-3">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold">Bloqueios Ativos</h2>
                    <div className="text-sm text-gray-500">Carrossel</div>
                </div>
                <div className="text-sm text-gray-500 mt-2">Nenhum bloqueio ativo</div>
            </section>
        )
    }

    const current = slides[currentIndex]

    return (
        <section className="bg-white border border-gray-200 rounded-md p-3">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Bloqueios Ativos</h2>
                <div className="text-sm text-gray-500">Carrossel</div>
            </div>

            <div
                className="relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onMouseLeave={() => setTouchStart(null)} // Cancel drag if leave
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="border border-gray-200 rounded-md p-3 pointer-events-none">
                        <div className="text-sm text-gray-500">SHP</div>
                        <div className="text-lg font-semibold">{current.usId}</div>
                    </div>
                    <div className="border border-gray-200 rounded-md p-3 pointer-events-none">
                        <div className="text-sm text-gray-500">Motivo</div>
                        <div className="text-lg font-semibold">{current.reason}</div>
                    </div>
                    <div className="border border-gray-200 rounded-md p-3 pointer-events-none">
                        <div className="text-sm text-gray-500">Tempo Bloqueado</div>
                        <div className="text-lg font-semibold">{formatDuration(Math.max(current.durMs, 0))}</div>
                    </div>
                </div>

                <div className="mt-2 text-sm text-gray-600 pointer-events-none">
                    {current.usTitle} • Início: {formatDateTime(current.start)}
                </div>

                <div className="flex items-center justify-between mt-2">
                    <button
                        onClick={goToPrev}
                        className="px-2 py-1 bg-gray-100 text-gray-900 rounded hover:bg-gray-200 transition"
                    >
                        Anterior
                    </button>
                    <button
                        onClick={goToNext}
                        className="px-2 py-1 bg-gray-100 text-gray-900 rounded hover:bg-gray-200 transition"
                    >
                        Próximo
                    </button>
                </div>

                {/* Dots */}
                <div className="flex items-center justify-center gap-1 mt-2">
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`w-2 h-2 rounded-full transition ${idx === currentIndex ? 'bg-gray-800' : 'bg-gray-300'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}
