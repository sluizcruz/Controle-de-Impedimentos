import { useState } from 'react'
import type { CreateImpedimentData, BlockReason } from '@/types'
import { BLOCK_REASON_OPTIONS } from '@/constants'

interface ImpedimentFormProps {
    onSubmit: (data: CreateImpedimentData) => Promise<boolean>
    isAuthenticated: boolean
}

/**
 * Formulário para registrar novo bloqueio
 */
export function ImpedimentForm({ onSubmit, isAuthenticated }: ImpedimentFormProps) {
    const [usId, setUsId] = useState('')
    const [usTitle, setUsTitle] = useState('')
    const [reason, setReason] = useState<BlockReason>('Ambiente')
    const [responsavel, setResponsavel] = useState('')
    const [externalLink, setExternalLink] = useState('')
    const [description, setDescription] = useState('')
    const [errors, setErrors] = useState<Record<string, boolean>>({})
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async () => {
        const newErrors: Record<string, boolean> = {}

        if (!usId.trim()) newErrors.usId = true
        if (!responsavel.trim()) newErrors.responsavel = true

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        setSubmitting(true)
        const success = await onSubmit({
            usId: usId.trim(),
            usTitle: usTitle.trim(),
            reason,
            responsavel: responsavel.trim(),
            externalLink: externalLink.trim(),
            description: description.trim(),
        })

        if (success) {
            // Limpa formulário
            setUsId('')
            setUsTitle('')
            setExternalLink('')
            setDescription('')
            setErrors({})
            alert('Bloqueio registrado com sucesso!')
        } else {
            alert('Erro ao registrar bloqueio. Verifique se você está logado e tem permissão.')
        }
        setSubmitting(false)
    }

    return (
        <section className="bg-white border border-gray-200 rounded-md p-3">
            <h2 className="text-lg font-semibold mb-3">Registrar Bloqueio</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">ID da US</label>
                    <input
                        value={usId}
                        onChange={(e) => {
                            setUsId(e.target.value)
                            setErrors(prev => ({ ...prev, usId: false }))
                        }}
                        className={`mt-1 w-full border rounded px-3 py-2 ${errors.usId ? 'border-red-500' : 'border-gray-200'}`}
                        placeholder="ex.: SHP-123"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Título da US</label>
                    <input
                        value={usTitle}
                        onChange={(e) => setUsTitle(e.target.value)}
                        className="mt-1 w-full border border-gray-200 rounded px-3 py-2"
                        placeholder="Descrição breve"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Motivo do Bloqueio</label>
                    <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value as BlockReason)}
                        className="mt-1 w-full border border-gray-200 rounded px-3 py-2"
                    >
                        {BLOCK_REASON_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium">Responsável</label>
                    <input
                        value={responsavel}
                        onChange={(e) => {
                            setResponsavel(e.target.value)
                            setErrors(prev => ({ ...prev, responsavel: false }))
                        }}
                        className={`mt-1 w-full border rounded px-3 py-2 ${errors.responsavel ? 'border-red-500' : 'border-gray-200'}`}
                        placeholder="Nome ou e-mail"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Link/ID na Ferramenta</label>
                    <input
                        value={externalLink}
                        onChange={(e) => setExternalLink(e.target.value)}
                        className="mt-1 w-full border border-gray-200 rounded px-3 py-2"
                        placeholder="JIRA/Trello/Azure"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium">Descrição do Problema (opcional)</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 w-full border border-gray-200 rounded px-3 py-2"
                        rows={3}
                        placeholder="Descreva brevemente o problema"
                    />
                </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition disabled:opacity-50"
                >
                    {submitting ? 'Salvando...' : 'Iniciar bloqueio'}
                </button>

                {!isAuthenticated && (
                    <div className="text-sm text-red-600">
                        Necessário login para registrar/editar.
                    </div>
                )}
            </div>
        </section>
    )
}
