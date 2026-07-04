"use client";

/* ------------------------------------------------------------------ */
/*  BidForm — Formulaire de soumission d'offre (prix + délai)         */
/*  Design épuré, 2 champs, mobile-first.                             */
/* ------------------------------------------------------------------ */

import { useState, type FormEvent } from "react";

interface Props {
  leadId: string;
  onSubmit: (amount: number, delay: string) => void;
}

const DELAY_OPTIONS = [
  { value: "24h", label: "Sous 24h" },
  { value: "48h", label: "Sous 48h" },
  { value: "semaine", label: "Cette semaine" },
  { value: "2semaines", label: "Sous 2 semaines" },
];

export default function BidForm({ leadId, onSubmit }: Props) {
  const [amount, setAmount] = useState("");
  const [delay, setDelay] = useState(DELAY_OPTIONS[0].value);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const amt = parseInt(amount, 10);
    if (!amt || amt <= 0) return;
    onSubmit(amt, delay);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="bg-garaj-green/10 rounded-lg p-4 text-center">
        <p className="text-sm font-semibold text-garaj-green">
          ✅ Offre envoyée — {amount}$ CAD ({DELAY_OPTIONS.find((d) => d.value === delay)?.label})
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-garaj-light rounded-lg p-3">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        Soumettre une offre
      </p>

      <div className="flex gap-2">
        {/* Prix */}
        <div className="flex-1">
          <label className="block text-[11px] text-slate-400 mb-1">Prix estimé</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              $
            </span>
            <input
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="450"
              className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-slate-200
                         bg-white text-sm font-medium text-garaj-navy
                         focus:border-garaj-orange focus:ring-2 focus:ring-garaj-orange/20
                         outline-none transition-colors"
              min={0}
              required
            />
          </div>
        </div>

        {/* Délai */}
        <div className="flex-1">
          <label className="block text-[11px] text-slate-400 mb-1">Délai</label>
          <select
            value={delay}
            onChange={(e) => setDelay(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200
                       bg-white text-sm font-medium text-garaj-navy
                       focus:border-garaj-orange focus:ring-2 focus:ring-garaj-orange/20
                       outline-none transition-colors appearance-none"
          >
            {DELAY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={!amount || parseInt(amount, 10) <= 0}
        className="w-full py-2.5 rounded-lg font-semibold text-sm text-white
                   bg-garaj-orange hover:bg-garaj-orange-light active:scale-[0.98]
                   transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Envoyer l&apos;offre
      </button>
    </form>
  );
}
