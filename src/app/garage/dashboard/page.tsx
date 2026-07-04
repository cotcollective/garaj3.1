"use client";

/* ------------------------------------------------------------------ */
/*  GARAJ V3 — Garage Dashboard                                       */
/*  Route: /garage/dashboard?garage=<id>                              */
/*  Fetch leads depuis /api/garages/[id]/leads (Supabase direct)      */
/*  Si pas de garage_id, fallback sur MOCK_LEADS (mode démo)         */
/* ------------------------------------------------------------------ */

import { Suspense, useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import GarageStats from "@/components/Garage/GarageStats";
import LeadCard from "@/components/Garage/LeadCard";
import { MOCK_LEADS } from "@/lib/mock-data";
import type { MockLead } from "@/lib/mock-data";

type FilterMode = "ALL" | "CHAUD" | "TIÈDE" | "FROID";

interface ApiLead {
  id: string;
  consultationId: string;
  score: "CHAUD" | "TIÈDE" | "FROID";
  vehicle: string;
  year: number | null;
  symptom: string;
  iaSummary: string;
  specialty: string;
  urgency: string;
  createdAt: string;
  email: string | null;
  bidPlaced: boolean;
  bidAmount: number | null;
  bidStatus: string | null;
  accepted: boolean;
  clientPhone: string | null;
}

export default function GarageDashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-garaj-cream items-center justify-center">
        <div className="inline-block w-6 h-6 border-2 border-orange border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <GarageDashboardContent />
    </Suspense>
  );
}

function GarageDashboardContent() {
  const searchParams = useSearchParams();
  const garageId = searchParams.get("garage");

  const [leads, setLeads] = useState<MockLead[]>([]);
  const [filter, setFilter] = useState<FilterMode>("ALL");
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());
  const [refusedIds, setRefusedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [garageName, setGarageName] = useState<string>("Garage");

  // Fetch leads from API
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      if (!garageId) {
        // Fallback mode: no garage_id, use mock data
        if (!cancelled) {
          setLeads(MOCK_LEADS);
          setGarageName("Garage Steph (démo)");
          setLoading(false);
        }
        return;
      }

      try {
        const res = await fetch(`/api/garages/${garageId}/leads`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${res.status}`);
        }
        const data = await res.json();
        if (cancelled) return;

        setGarageName(data.garage?.garage_name || "Garage");
        // Map ApiLead to MockLead (limited fields, but enough for display)
        const mapped: MockLead[] = (data.leads || []).map((l: ApiLead) => ({
          id: l.id,
          score: l.score,
          vehicle: l.vehicle,
          year: l.year || 0,
          kilometrage: 0,
          symptom: l.symptom,
          iaSummary: l.iaSummary,
          iaHypotheses: [
            { hypothesis: l.iaSummary, probability: 75, confidence: 80 },
          ],
          postalCode: "",
          city: "",
          distanceKm: 0,
          complexity: l.urgency === "high" ? 7 : l.urgency === "medium" ? 4 : 2,
          createdAt: l.createdAt,
          budget: l.bidAmount ? `${l.bidAmount}$` : undefined,
          clientPhone: l.clientPhone || "",
          accepted: l.accepted,
          bidPlaced: l.bidPlaced,
          bidAmount: l.bidAmount || undefined,
        }));
        setLeads(mapped);
        setLoading(false);
      } catch (e: any) {
        if (!cancelled) {
          setError(e.message || "Erreur de chargement");
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [garageId]);

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

  // POST une bid vers l'API
  const handleBidSubmit = useCallback(
    async (leadId: string, amount: number, delay: string) => {
      if (!garageId) {
        console.warn("Cannot submit bid: no garage_id");
        return;
      }
      // Convert delay string (e.g. "Demain", "2-3 jours") to hours estimate
      const hoursMap: Record<string, number> = {
        "Aujourd'hui": 8,
        Demain: 24,
        "2-3 jours": 72,
        "Cette semaine": 96,
        "Semaine prochaine": 168,
      };
      const hours = hoursMap[delay] || 48;

      try {
        const res = await fetch("/api/bids", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            consultation_id: leadId,
            garage_id: garageId,
            amount_cad: amount,
            estimated_duration_hours: hours,
            notes: null,
          }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${res.status}`);
        }
        // Marquer comme bid placed localement
        setLeads((prev) =>
          prev.map((l) =>
            l.id === leadId
              ? { ...l, bidPlaced: true, bidAmount: amount, bidDelay: delay }
              : l
          )
        );
      } catch (e: any) {
        console.error("Bid submit failed:", e.message);
        alert(`Erreur lors de la soumission: ${e.message}`);
      }
    },
    [garageId]
  );

  return (
    <div className="flex flex-col min-h-screen bg-garaj-cream">
      {/* ---- HEADER ---- */}
      <header className="sticky top-0 z-10 bg-garaj-navy text-white px-4 py-4 shadow-md">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              GARAJ — {garageName}
            </h1>
            <p className="text-[11px] text-slate-300">
              {garageId
                ? `ID: ${garageId.slice(0, 8)}…`
                : "Mode démo — ajoute ?garage=<id> pour le mode live"}
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
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">Erreur</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
            <p className="text-[11px] text-red-500 mt-2">
              Si tu vois ça, vérifie que le garage_id est valide et que
              l'endpoint /api/garages/[id]/leads répond.
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-slate-400">
            <div className="inline-block w-6 h-6 border-2 border-orange border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm">Chargement des leads…</p>
          </div>
        ) : (
          <>
            {/* Stats row */}
            <GarageStats
              leadsRecus={leads.length}
              leadsAcceptes={acceptedIds.size}
              bidsPlaces={leads.filter((l) => l.bidPlaced).length}
              bidsGagnes={leads.filter((l) => l.accepted).length}
              revenusEstimes={leads
                .filter((l) => l.bidAmount)
                .reduce((sum, l) => sum + (l.bidAmount || 0), 0)}
              tauxConversion={
                leads.length > 0
                  ? Math.round((leads.filter((l) => l.bidPlaced).length / leads.length) * 100)
                  : 0
              }
              tempsReponseMoyen="—"
            />

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
                  <p className="text-xs mt-1">
                    Les leads entrants apparaîtront ici dès qu'ils matchent vos
                    spécialités.
                  </p>
                </div>
              )}

              {sorted.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={{
                    ...lead,
                    accepted: acceptedIds.has(lead.id) || lead.accepted,
                  }}
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

              <div className="text-[11px] text-slate-400 italic">
                Pause toggle + max leads/jour : à brancher Supabase (Phase E.3)
              </div>
            </div>
          </>
        )}
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
