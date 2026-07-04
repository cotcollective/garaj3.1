"use client";

/* ------------------------------------------------------------------ */
/*  GARAJ V3 — Garage Dashboard ONE-PAGE                              */
/*  Route: /garage/dashboard                                           */
/*  Structure: Stats → Lead filters → Leads scrollables → Settings    */
/*  Mobile-first, tri chaud > tiède > froid, pas de nesting profond.  */
/* ------------------------------------------------------------------ */

import { useState, useMemo } from "react";
import GarageStats from "@/components/Garage/GarageStats";
import LeadCard from "@/components/Garage/LeadCard";
import { MOCK_LEADS, MOCK_GARAGE_STATS, MOCK_GARAGE_PROFILE } from "@/lib/mock-data";
import type { MockLead } from "@/lib/mock-data";

type FilterMode = "ALL" | "CHAUD" | "TIÈDE" | "FROID";

export default function GarageDashboardPage() {
  const [leads] = useState<MockLead[]>(MOCK_LEADS);
  const [filter, setFilter] = useState<FilterMode>("ALL");
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set(["lead-001"]));
  const [refusedIds, setRefusedIds] = useState<Set<string>>(new Set());
  const [smsEnabled, setSmsEnabled] = useState(MOCK_GARAGE_PROFILE.smsEnabled);
  const [maxLeads, setMaxLeads] = useState(MOCK_GARAGE_PROFILE.maxLeadsPerDay);

  /* Tri: CHAUD > TIÈDE > FROID, puis par date (plus récent d'abord) */
  const sorted = useMemo(() => {
    const scoreOrder: Record<string, number> = { CHAUD: 0, TIÈDE: 1, FROID: 2 };
    return [...leads]
      .filter((l) => !refusedIds.has(l.id))
      .filter((l) => (filter === "ALL" ? true : l.score === filter))
      .sort((a, b) => {
        const s = scoreOrder[a.score] - scoreOrder[b.score];
        if (s !== 0) return s;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [leads, filter, refusedIds]);

  const counts = {
    CHAUD: leads.filter((l) => l.score === "CHAUD" && !refusedIds.has(l.id)).length,
    TIÈDE: leads.filter((l) => l.score === "TIÈDE" && !refusedIds.has(l.id)).length,
    FROID: leads.filter((l) => l.score === "FROID" && !refusedIds.has(l.id)).length,
  };

  function handleAccept(id: string) {
    setAcceptedIds((prev) => new Set(prev).add(id));
  }

  function handleRefuse(id: string) {
    setRefusedIds((prev) => new Set(prev).add(id));
    setAcceptedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function handleBidSubmit(leadId: string, amount: number, delay: string) {
    // Placeholder: plus tard, POST vers Supabase
    console.log("Bid submitted", { leadId, amount, delay });
  }

  return (
    <div className="flex flex-col min-h-screen bg-garaj-cream">
      {/* ---- HEADER ---- */}
      <header className="sticky top-0 z-10 bg-garaj-navy text-white px-4 py-4 shadow-md">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              GARAJ — {MOCK_GARAGE_PROFILE.name}
            </h1>
            <p className="text-[11px] text-slate-300">
              📍 {MOCK_GARAGE_PROFILE.city} · 🔧{" "}
              {MOCK_GARAGE_PROFILE.specialties.join(", ")}
            </p>
          </div>
          <a
            href="/garage/onboarding"
            className="text-slate-400 hover:text-white transition-colors text-xl"
            title="Paramètres"
          >
            ⚙️
          </a>
        </div>
      </header>

      {/* ---- MAIN CONTENT ---- */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 space-y-4">
        {/* Stats row */}
        <GarageStats {...MOCK_GARAGE_STATS} />

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <FilterChip
            label={`Tous (${counts.CHAUD + counts.TIÈDE + counts.FROID})`}
            active={filter === "ALL"}
            onClick={() => setFilter("ALL")}
          />
          <FilterChip
            label={`🔴 Chauds (${counts.CHAUD})`}
            active={filter === "CHAUD"}
            onClick={() => setFilter("CHAUD")}
            color="red"
          />
          <FilterChip
            label={`🟡 Tièdes (${counts.TIÈDE})`}
            active={filter === "TIÈDE"}
            onClick={() => setFilter("TIÈDE")}
            color="amber"
          />
          <FilterChip
            label={`🟦 Froids (${counts.FROID})`}
            active={filter === "FROID"}
            onClick={() => setFilter("FROID")}
            color="blue"
          />
        </div>

        {/* Leads list */}
        <div className="space-y-3">
          {sorted.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-4xl mb-2">📭</p>
              <p className="text-sm">Aucun lead pour le moment.</p>
              <p className="text-xs mt-1">Les leads entrants apparaîtront ici.</p>
            </div>
          )}

          {sorted.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={{ ...lead, accepted: acceptedIds.has(lead.id) }}
              onAccept={handleAccept}
              onRefuse={handleRefuse}
              onBidSubmit={handleBidSubmit}
            />
          ))}
        </div>

        {/* ---- QUICK SETTINGS ---- */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Paramètres rapides
          </p>

          {/* SMS toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-garaj-navy">Notifications SMS</p>
              <p className="text-[11px] text-slate-400">
                Recevez les leads par texto sur votre téléphone
              </p>
            </div>
            <button
              onClick={() => setSmsEnabled(!smsEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                smsEnabled ? "bg-garaj-orange" : "bg-slate-300"
              }`}
              aria-label="Toggle SMS"
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  smsEnabled ? "left-6" : "left-0.5"
                }`}
              />
            </button>
          </div>

          {/* Max leads slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-garaj-navy">Maximum leads / jour</p>
              <span className="text-sm font-bold text-garaj-orange">{maxLeads}</span>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              value={maxLeads}
              onChange={(e) => setMaxLeads(parseInt(e.target.value, 10))}
              className="w-full h-2 rounded-full appearance-none bg-slate-200
                         accent-garaj-orange [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                         [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-garaj-orange
                         [&::-webkit-slider-thumb]:shadow"
            />
          </div>

          {/* Pause toggle (placeholder) */}
          <button className="w-full py-2 rounded-lg border border-slate-300 text-sm
                             font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            ⏸ Mettre le garage en pause
          </button>
        </div>
      </main>
    </div>
  );
}

/* ---- FilterChip micro-component ---- */
function FilterChip({
  label,
  active,
  onClick,
  color = "slate",
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: string;
}) {
  const activeStyles: Record<string, string> = {
    slate: "bg-garaj-navy text-white border-garaj-navy",
    red: "bg-red-500 text-white border-red-500",
    amber: "bg-amber-500 text-white border-amber-500",
    blue: "bg-blue-500 text-white border-blue-500",
  };

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap
                  transition-all active:scale-95 ${
                    active
                      ? activeStyles[color]
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
    >
      {label}
    </button>
  );
}
