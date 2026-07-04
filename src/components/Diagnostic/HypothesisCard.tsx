"use client";

/* ------------------------------------------------------------------ */
/*  GARAJ V3 — Carte hypothèse diagnostic                              */
/*  Affiche : urgence 🔴🟡🟢, probabilité, coûts (masqués si Express) */
/* ------------------------------------------------------------------ */

export interface HypothesisData {
  hypothesis: string;
  probability: number; // 0-100
  confidence: number;  // 0-100
  urgency: "ÉLEVÉE" | "MODÉRÉE" | "FAIBLE" | "NULLE";
  explanation?: string;
  estimated_cost?: {
    min: number;
    max: number;
    currency: "CAD";
  };
}

interface HypothesisCardProps {
  hypothesis: HypothesisData;
  index: number;
  plan: "express" | "pro";
}

const urgencyConfig: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
  ÉLEVÉE:   { emoji: "🔴", label: "Urgence ÉLEVÉE", color: "text-garaj-chaud", bg: "bg-red-50 border-red-200" },
  MODÉRÉE:  { emoji: "🟡", label: "Urgence MODÉRÉE", color: "text-garaj-tiede", bg: "bg-amber-50 border-amber-200" },
  FAIBLE:    { emoji: "🟢", label: "Urgence FAIBLE", color: "text-garaj-green", bg: "bg-green-50 border-green-200" },
  NULLE:     { emoji: "⚪", label: "Urgence NULLE", color: "text-garaj-gray", bg: "bg-gray-50 border-gray-200" },
};

export function HypothesisCard({ hypothesis, index, plan }: HypothesisCardProps) {
  const config = urgencyConfig[hypothesis.urgency] || urgencyConfig.MODÉRÉE;
  const isExpress = plan === "express";

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 transition-all ${config.bg} ${
        index === 0 ? "ring-2 ring-orange/30 shadow-md shadow-orange/5" : "opacity-90 hover:opacity-100"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-white/60 text-navy/60">
            #{index + 1}
          </span>
          {index === 0 && (
            <span className="text-xs font-semibold text-orange bg-orange/10 px-2 py-0.5 rounded-full">
              Principal
            </span>
          )}
        </div>
        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${config.color}`}>
          <span className="text-sm">{config.emoji}</span>
          {config.label}
        </span>
      </div>

      {/* Hypothèse */}
      <h4 className="text-base sm:text-lg font-bold text-navy mb-1">
        {hypothesis.hypothesis}
      </h4>

      {/* Barre de probabilité */}
      <div className="flex items-center gap-2 mt-3 mb-2">
        <div className="flex-1 h-2 bg-white/60 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              hypothesis.probability >= 70
                ? "bg-garaj-chaud"
                : hypothesis.probability >= 40
                ? "bg-garaj-tiede"
                : "bg-garaj-froid"
            }`}
            style={{ width: `${hypothesis.probability}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-navy/60 whitespace-nowrap">
          {hypothesis.probability}%
        </span>
      </div>

      {/* Confiance IA */}
      <p className="text-xs text-navy/40 mb-3">
        Confiance IA : {hypothesis.confidence}%
      </p>

      {/* Explication */}
      {hypothesis.explanation && (
        <p className="text-sm text-navy/60 leading-relaxed mb-3">
          {hypothesis.explanation}
        </p>
      )}

      {/* Coût estimé → visible uniquement en Pro */}
      {!isExpress && hypothesis.estimated_cost ? (
        <div className="mt-3 pt-3 border-t border-navy/5">
          <span className="text-xs font-semibold text-navy/40 uppercase tracking-wide">
            Coût estimé
          </span>
          <p className="text-lg font-bold text-navy mt-0.5">
            {hypothesis.estimated_cost.min}$ — {hypothesis.estimated_cost.max}${" "}
            <span className="text-sm font-normal text-navy/40">CAD</span>
          </p>
        </div>
      ) : isExpress ? (
        <div className="mt-3 pt-3 border-t border-dashed border-navy/10">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-navy/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <p className="text-xs text-navy/30 italic">
              Coûts masqués — Passez Pro pour voir l&apos;estimation
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
