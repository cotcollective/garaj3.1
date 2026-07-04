"use client";

/* ------------------------------------------------------------------ */
/*  LeadCard — Fiche lead pour le dashboard garage                    */
/*  État compact (liste) + état déplié (fiche complète)               */
/*  Score CHAUD/TIÈDE/FROID avec couleur, symptômes IA, boutons       */
/* ------------------------------------------------------------------ */

import { useState } from "react";
import BidForm from "./BidForm";
import type { MockLead } from "@/lib/mock-data";

const SCORE_CONFIG = {
  CHAUD: {
    label: "CHAUD",
    dot: "🔴",
    bg: "bg-red-50",
    border: "border-l-red-500",
    text: "text-red-700",
    badge: "bg-red-100 text-red-700",
  },
  TIÈDE: {
    label: "TIÈDE",
    dot: "🟡",
    bg: "bg-amber-50",
    border: "border-l-amber-400",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-700",
  },
  FROID: {
    label: "FROID",
    dot: "🟦",
    bg: "bg-blue-50",
    border: "border-l-blue-400",
    text: "text-blue-700",
    badge: "bg-blue-100 text-blue-700",
  },
};

function timeAgo(iso: string): string {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return `il y a ${h}h`;
  const d = Math.floor(h / 24);
  return `il y a ${d}j`;
}

interface Props {
  lead: MockLead;
  onAccept?: (id: string) => void;
  onRefuse?: (id: string) => void;
  onBidSubmit?: (leadId: string, amount: number, delay: string) => void;
}

export default function LeadCard({ lead, onAccept, onRefuse, onBidSubmit }: Props) {
  const [expanded, setExpanded] = useState(false);
  const conf = SCORE_CONFIG[lead.score];

  return (
    <div
      className={`rounded-xl border border-slate-200 overflow-hidden transition-all
                  ${expanded ? "shadow-md" : "shadow-sm hover:shadow-md"}
                  border-l-4 ${conf.border} bg-white`}
    >
      {/* ---- Compact row (always visible) ---- */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 flex items-start gap-3"
      >
        {/* Score dot */}
        <span className="text-lg mt-0.5 flex-shrink-0">{conf.dot}</span>

        <div className="flex-1 min-w-0">
          {/* Header line */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${conf.badge}`}>
              {conf.label}
            </span>
            <span className="text-xs text-slate-400">{timeAgo(lead.createdAt)}</span>
          </div>

          {/* Vehicle + symptom preview */}
          <p className="font-semibold text-garaj-navy text-sm leading-snug">
            {lead.vehicle} {lead.year} — {lead.iaSummary.slice(0, 70)}…
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
            <span>📍 {lead.postalCode} ({lead.distanceKm} km)</span>
            <span>⚙️ {lead.complexity}/10</span>
            {lead.budget && <span>💵 {lead.budget}</span>}
          </div>
        </div>

        {/* Expand arrow */}
        <span className="text-slate-300 text-sm mt-1 flex-shrink-0">
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {/* ---- Expanded details ---- */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-100 pt-3">
          {/* Symptôme client */}
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1">
              Symptôme client
            </p>
            <p className="text-sm text-slate-700 leading-relaxed italic">
              « {lead.symptom} »
            </p>
          </div>

          {/* Résumé IA */}
          <div className="bg-garaj-navy/5 rounded-lg p-3">
            <p className="text-[11px] uppercase tracking-wide text-garaj-navy/60 font-semibold mb-1">
              Résumé IA
            </p>
            <p className="text-sm text-garaj-navy leading-relaxed">{lead.iaSummary}</p>
          </div>

          {/* Hypothèses IA */}
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-2">
              Hypothèses diagnostiques
            </p>
            <div className="space-y-2">
              {lead.iaHypotheses.map((h, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-garaj-navy flex-1">
                    {h.hypothesis}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Probability bar */}
                    <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-garaj-orange transition-all"
                        style={{ width: `${h.probability}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 w-8 text-right">
                      {h.probability}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions: Accepter / Refuser */}
          <div className="flex gap-2">
            <button
              onClick={() => onAccept?.(lead.id)}
              className="flex-1 py-2.5 rounded-lg font-semibold text-sm text-white
                         bg-garaj-orange hover:bg-garaj-orange-light active:scale-[0.98]
                         transition-all shadow-sm"
            >
              ✓ Accepter le lead
            </button>
            <button
              onClick={() => onRefuse?.(lead.id)}
              className="flex-1 py-2.5 rounded-lg font-semibold text-sm
                         border border-slate-300 text-slate-600 hover:bg-slate-50
                         active:scale-[0.98] transition-all"
            >
              ✕ Refuser
            </button>
          </div>

          {/* Contacter le client */}
          <div className="flex gap-2">
            <a
              href={`tel:${lead.clientPhone.replace(/\D/g, "")}`}
              className="flex-1 py-2.5 rounded-lg font-semibold text-sm text-center
                         bg-garaj-navy text-white hover:bg-garaj-navy/90
                         active:scale-[0.98] transition-all"
            >
              📞 Appeler le client
            </a>
            <a
              href={`sms:${lead.clientPhone.replace(/\D/g, "")}?body=Bonjour,%20j'ai%20reçu%20votre%20diagnostic%20GARAJ%20pour%20votre%20${encodeURIComponent(lead.vehicle)}%20${lead.year}.%20Quand%20voulez-vous%20qu'on%20planifie%20une%20inspection%20?%20-%20${encodeURIComponent("Garage Steph")}`}
              className="flex-1 py-2.5 rounded-lg font-semibold text-sm text-center
                         border border-garaj-navy text-garaj-navy hover:bg-garaj-navy/5
                         active:scale-[0.98] transition-all"
            >
              💬 Texter le client
            </a>
          </div>

          {/* Bid form (après acceptation) */}
          {lead.accepted && (
            <div className="pt-2">
              <BidForm
                leadId={lead.id}
                onSubmit={(amount, delay) => onBidSubmit?.(lead.id, amount, delay)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
