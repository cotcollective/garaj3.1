'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

interface Hypothesis {
  rank: number; hypothesis: string; probability_pct: number; urgency: string
  specialty_tag: string; estimated_cost_min?: number; estimated_cost_max?: number; recommended_action?: string
}

function DiagnosticContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([])
  const [consultation, setConsultation] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetch(`/api/capture?id=${id}`).then(r => r.json()).then(data => {
      setConsultation(data.consultation)
      setHypotheses(data.hypotheses || [])
      setLoading(false)
    })
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <div className="text-center text-white">
        <div className="animate-spin w-12 h-12 border-4 border-[#F97316] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-xl">Analyse en cours...</p>
      </div>
    </div>
  )

  const isPro = consultation?.payment_status === 'paid'
  const primary = hypotheses[0]
  const secondaries = hypotheses.slice(1)

  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Résultat du diagnostic</h1>
        <p className="text-gray-400 mb-8">Analyse IA • {consultation?.type === 'pro' ? 'Pro' : 'Express'}</p>

        {primary && (
          <div className="bg-[#1E293B] border border-[#F97316]/30 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[#F97316] font-semibold">DIAGNOSTIC PRINCIPAL</span>
              <span className={`px-3 py-1 rounded-full text-sm ${primary.urgency === 'high' ? 'bg-red-500/20 text-red-400' : primary.urgency === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                {primary.urgency === 'high' ? '🔴 Urgent' : primary.urgency === 'medium' ? '🟡 Modéré' : '🟢 Léger'}
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-2">{primary.hypothesis}</h2>
            <p className="text-3xl font-bold text-[#F97316] mb-4">{primary.probability_pct}% de probabilité</p>
            {isPro ? (
              <div className="bg-[#0F172A] rounded-lg p-4 mb-3">
                <p className="text-gray-300 mb-2"><strong>Coût estimé:</strong> {primary.estimated_cost_min}$ - {primary.estimated_cost_max}$ CAD</p>
                <p className="text-gray-300"><strong>Recommandation:</strong> {primary.recommended_action}</p>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">{primary.recommended_action?.substring(0, 100)}...</p>
            )}
          </div>
        )}

        {secondaries.length > 0 && (
          <div className="grid gap-4 mb-8">
            {secondaries.map((h: Hypothesis) => (
              <div key={h.rank} className="bg-[#1E293B]/50 border border-gray-700 rounded-xl p-5">
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold">{h.hypothesis}</h3>
                  <span className="text-[#F97316] font-bold">{h.probability_pct}%</span>
                </div>
                {isPro ? <p className="text-sm text-gray-400">{h.recommended_action}</p> : <p className="text-sm text-gray-500 italic">Passez Pro pour voir les détails</p>}
              </div>
            ))}
          </div>
        )}

        {!isPro && (
          <div className="bg-gradient-to-r from-[#F97316]/20 to-[#0F172A] border border-[#F97316] rounded-xl p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Passez à GARAJ Pro</h3>
            <p className="text-gray-300 mb-4">29$ CAD • Rapport complet • Coûts estimés • Mise en relation avec des garages certifiés</p>
            <a href={`/checkout?id=${id}`} className="inline-block bg-[#F97316] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#EA580C] transition-colors">
              Obtenir le diagnostic Pro — 29$
            </a>
          </div>
        )}

        {isPro && (
          <div className="bg-[#1E293B] rounded-xl p-6 mt-8">
            <h3 className="text-xl font-bold mb-4">Trouver un garage</h3>
            <p className="text-gray-400 mb-4">Sélectionnez jusqu'à 3 garages pour recevoir des soumissions</p>
            <div className="h-64 bg-[#0F172A] rounded-lg flex items-center justify-center text-gray-500">
              Carte des garages — disponible après paiement
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DiagnosticResult() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0F172A] flex items-center justify-center"><div className="animate-spin w-12 h-12 border-4 border-[#F97316] border-t-transparent rounded-full" /></div>}>
      <DiagnosticContent />
    </Suspense>
  )
}
