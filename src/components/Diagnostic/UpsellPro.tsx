"use client";

/* ------------------------------------------------------------------ */
/*  GARAJ V3 — CTA Upsell Pro (29$ CAD)                               */
/* ------------------------------------------------------------------ */

import Link from "next/link";

interface UpsellProProps {
  consultationId: string;
}

export function UpsellPro({ consultationId }: UpsellProProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-navy via-navy to-navy/95 border border-orange/20 p-6 sm:p-8 text-white shadow-xl shadow-orange/10">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-orange/20 mb-4">
          <svg className="h-7 w-7 text-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
        </div>

        <h3 className="text-xl sm:text-2xl font-extrabold text-white">
          Passez au diagnostic Pro
        </h3>
        <p className="mt-2 text-sm text-white/70 leading-relaxed max-w-md mx-auto">
          Débloquez le rapport complet avec estimations de coûts, recommandations
          de garages près de chez vous, et possibilité de recevoir des offres.
        </p>

        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-orange">29$</span>
            <span className="text-sm text-white/50">CAD</span>
          </div>

          <Link
            href={`/checkout?consultationId=${consultationId}`}
            className="inline-flex items-center justify-center rounded-xl bg-orange px-8 py-3.5 text-base font-semibold text-white hover:bg-orange-dark transition-colors shadow-lg shadow-orange/25"
          >
            Débloquer le rapport Pro
            <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-white/40">
          <span className="inline-flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Rapport complet avec coûts
          </span>
          <span className="inline-flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Match avec garages locaux
          </span>
          <span className="inline-flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Offres des garages en 24h
          </span>
        </div>

        <p className="mt-4 text-xs text-white/25">
          Paiement unique. Accès au rapport à vie. Satisfaction garantie.
        </p>
      </div>
    </div>
  );
}
