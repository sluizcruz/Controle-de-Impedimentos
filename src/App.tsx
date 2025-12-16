import { useState, useCallback } from 'react'
import { useAuth, useImpediments, useSprint } from '@/hooks'
import {
    Header,
    SprintControl,
    MetricsCards,
    ReasonChart,
    TimelineChart,
    ActiveCarousel,
    BlockedTable,
    UnblockedTable,
    ImpedimentForm,
    LoginOverlay,
} from '@/components'
import type { Impediment } from '@/types'
import { formatDateTime } from '@/utils/dateUtils'

/**
 * Componente principal da aplicação
 */
function App() {
    const { user, loading: authLoading, error: authError, signIn, signOutUser } = useAuth()
    const { sprintId, sprint, isStarted, isOverdue, setSprintId, startSprint, endSprint, getSprintWindow } = useSprint()
    const {
        impediments,
        error: impedimentsError,
        metrics,
        blockedItems,
        unblockedItems,
        addImpediment,
        finishImpediment,
        reopen
    } = useImpediments(sprintId, user?.uid || null)

    const [useWorkingHours, setUseWorkingHours] = useState(true)

    // Handlers
    const handleOpenHistory = useCallback(() => {
        // TODO: Implementar modal de histórico
        console.log('Abrir histórico')
    }, [])

    const handleViewHistory = useCallback((usId: string) => {
        // TODO: Implementar modal de histórico por SHP
        console.log('Ver histórico de:', usId)
    }, [])

    const handleReopen = useCallback(async (impediment: Impediment) => {
        await reopen(impediment, {})
    }, [reopen])

    const handleExportPdf = useCallback(() => {
        const fmt = (d: Date) => formatDateTime(d)
        const rows = impediments.map(d => {
            const start = d.startTime
            const end = d.endTime
            const dur = (end ? end.getTime() : Date.now()) - start.getTime()
            const durStr = `${Math.round(dur / 3600000 * 100) / 100} h`
            return `<tr><td>${d.usId || ""}</td><td>${d.usTitle || ""}</td><td>${d.reason || ""}</td><td>${fmt(start)}</td><td>${end ? fmt(end) : ""}</td><td>${durStr}</td><td>${d.description || ""}</td></tr>`
        }).join("")

        const html = `
      <html><head><title>Impedimentos ${sprintId || "Sprint"}</title>
      <meta charset="utf-8" />
      <style>
        *{box-sizing:border-box} body{font-family:Arial, sans-serif;padding:20px}
        h1{font-size:18px;margin:0 0 6px}
        table{width:100%;border-collapse:collapse}
        th,td{border:1px solid #ddd;padding:6px;text-align:left}
        th{background:#f3f4f6}
        @media print { .no-print{display:none} }
      </style>
      </head><body>
      <h1>Impedimentos - ${sprintId || ""}</h1>
      <p>Gerado em ${fmt(new Date())}</p>
      <table><thead><tr><th>SHP</th><th>Título</th><th>Motivo</th><th>Início</th><th>Fim</th><th>Duração</th><th>Descrição</th></tr></thead><tbody>${rows}</tbody></table>
      </body></html>`

        const blob = new Blob([html], { type: "text/html" })
        const url = URL.createObjectURL(blob)
        const w = window.open(url, "_blank")

        if (w) {
            w.addEventListener("load", () => {
                w.focus()
                w.print()
                setTimeout(() => {
                    w.close()
                    URL.revokeObjectURL(url)
                }, 1000)
            })
        }
    }, [impediments, sprintId])

    // Loading
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-gray-500">Carregando...</div>
            </div>
        )
    }

    // Login required
    if (!user) {
        return <LoginOverlay onSignIn={signIn} message={authError || undefined} />
    }

    const sprintWindow = getSprintWindow()

    return (
        <div className="min-h-screen bg-gray-50">
            <Header
                user={user}
                onSignOut={signOutUser}
                onOpenHistory={handleOpenHistory}
            />

            {impedimentsError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-6xl mx-auto mt-4" role="alert">
                    <strong className="font-bold">Erro ao carregar impedimentos: </strong>
                    <span className="block sm:inline">{impedimentsError}</span>
                    <span className="block text-sm mt-1">Se for um erro de índice ausente, verifique o console para o link de criação.</span>
                </div>
            )}

            <main className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5">
                {/* Controle da Sprint */}
                <SprintControl
                    sprintId={sprintId}
                    sprint={sprint}
                    isStarted={isStarted}
                    onSprintIdChange={setSprintId}
                    onStartSprint={startSprint}
                    onEndSprint={endSprint}
                    isOverdue={isOverdue}
                    onExportPdf={handleExportPdf}
                />

                {/* Cards de Métricas */}
                <MetricsCards
                    metrics={metrics}
                    onClickBlocked={handleOpenHistory}
                    onClickUnblocked={handleOpenHistory}
                />

                {/* Toggle Horas Úteis / Totais */}
                <div className="flex items-center justify-end">
                    <div className="inline-flex rounded border border-gray-200 overflow-hidden">
                        <button
                            onClick={() => setUseWorkingHours(true)}
                            className={`px-3 py-1 ${useWorkingHours ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
                        >
                            Horas úteis
                        </button>
                        <button
                            onClick={() => setUseWorkingHours(false)}
                            className={`px-3 py-1 ${!useWorkingHours ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
                        >
                            Horas totais
                        </button>
                    </div>
                </div>

                {/* Gráficos */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <ReasonChart
                        impediments={impediments}
                        title="Distribuição por Motivo (Desbloqueadas)"
                        subtitle="Tempo por motivo"
                        useWorkingHours={useWorkingHours}
                        showOnlyBlocked={false}
                    />
                    <ReasonChart
                        impediments={impediments}
                        title="Distribuição por Motivo (Bloqueadas)"
                        subtitle="Tempo atual por motivo"
                        useWorkingHours={useWorkingHours}
                        showOnlyBlocked={true}
                    />
                </section>

                {/* Carrossel de Bloqueios Ativos */}
                <ActiveCarousel
                    items={blockedItems}
                    useWorkingHours={useWorkingHours}
                />

                {/* Timeline da Sprint */}
                <TimelineChart
                    impediments={impediments}
                    sprintWindow={sprintWindow}
                    isSprintStarted={isStarted}
                />

                {/* Formulário de Registro */}
                <ImpedimentForm
                    onSubmit={addImpediment}
                    isAuthenticated={!!user}
                />

                {/* Tabela de Bloqueadas */}
                <BlockedTable
                    items={blockedItems}
                    onEnd={finishImpediment}
                    onViewHistory={handleViewHistory}
                />

                {/* Tabela de Desbloqueadas */}
                <UnblockedTable
                    items={unblockedItems}
                    onReopen={handleReopen}
                    onViewHistory={handleViewHistory}
                />
            </main>
        </div>
    )
}

export default App
