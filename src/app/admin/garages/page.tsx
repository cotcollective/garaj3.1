"use client";

/* ------------------------------------------------------------------ */
/*  GARAJ V3 — /admin/garages                                         */
/*  Liste de validation des garages (approuver/rejeter)               */
/*  Mode démo: données mockées                                        */
/* ------------------------------------------------------------------ */

import { useState, useMemo } from "react";

/* ---- Types ---- */

interface GarageRecord {
  id: string;
  name: string;
  phone: string;
  postalCode: string;
  city: string;
  specialties: string[];
  status: "pending" | "active" | "rejected";
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  reviewNotes: string | null;
  smsEnabled: boolean;
}

/* ---- Données mockées ---- */

const MOCK_GARAGES: GarageRecord[] = [
  {
    id: "garage-pending-001",
    name: "Garage Rapido Montréal",
    phone: "514-555-0888",
    postalCode: "H2X 1Y2",
    city: "Montréal",
    specialties: ["Moteur", "Freins", "Diagnostic"],
    status: "pending",
    submittedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    reviewedAt: null,
    reviewedBy: null,
    reviewNotes: null,
    smsEnabled: true,
  },
  {
    id: "garage-pending-002",
    name: "Auto Service Rive-Nord",
    phone: "450-555-0999",
    postalCode: "J7A 1B3",
    city: "Saint-Jérôme",
    specialties: ["Suspension", "Échappement", "Pneus"],
    status: "pending",
    submittedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    reviewedAt: null,
    reviewedBy: null,
    reviewNotes: null,
    smsEnabled: true,
  },
  {
    id: "garage-pending-003",
    name: "Garage Économique Plus",
    phone: "514-555-0777",
    postalCode: "H1M 2N4",
    city: "Montréal-Nord",
    specialties: ["Moteur", "Transmission"],
    status: "pending",
    submittedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    reviewedAt: null,
    reviewedBy: null,
    reviewNotes: null,
    smsEnabled: false,
  },
  {
    id: "garage-active-001",
    name: "Garage Steph",
    phone: "514-555-0199",
    postalCode: "J4K 2R1",
    city: "Longueuil",
    specialties: ["Moteur", "Freins", "Suspension", "Diagnostic", "Climatisation"],
    status: "active",
    submittedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    reviewedAt: new Date(Date.now() - 44 * 3600 * 1000).toISOString(),
    reviewedBy: "admin@garaj.ca",
    reviewNotes: "Garage vérifié, bonne réputation Google.",
    smsEnabled: true,
  },
  {
    id: "garage-rejected-001",
    name: "Garage Pas Sérieux Inc.",
    phone: "514-555-0666",
    postalCode: "H0H 0H0",
    city: "Montréal",
    specialties: ["Moteur"],
    status: "rejected",
    submittedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    reviewedAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    reviewedBy: "admin@garaj.ca",
    reviewNotes: "Numéro de téléphone non valide.",
    smsEnabled: true,
  },
];

type FilterStatus = "ALL" | "pending" | "active" | "rejected";

/* ---- Helpers ---- */

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

function statusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: {
      label: "En attente",
      cls: "bg-amber-100 text-amber-800 border-amber-200",
    },
    active: {
      label: "Actif",
      cls: "bg-green-100 text-green-800 border-green-200",
    },
    rejected: {
      label: "Rejeté",
      cls: "bg-red-100 text-red-800 border-red-200",
    },
  };
  const s = map[status] || map.pending;
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${s.cls}`}
    >
      {s.label}
    </span>
  );
}

/* ---- Page ---- */

export default function AdminGaragesPage() {
  const [garages, setGarages] = useState<GarageRecord[]>(MOCK_GARAGES);
  const [filter, setFilter] = useState<FilterStatus>("pending");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "ALL") return garages;
    return garages.filter((g) => g.status === filter);
  }, [garages, filter]);

  const counts = {
    pending: garages.filter((g) => g.status === "pending").length,
    active: garages.filter((g) => g.status === "active").length,
    rejected: garages.filter((g) => g.status === "rejected").length,
  };

  function handleApprove(id: string) {
    setGarages((prev) =>
      prev.map((g) =>
        g.id === id
          ? {
              ...g,
              status: "active",
              reviewedAt: new Date().toISOString(),
              reviewedBy: "admin@garaj.ca",
              reviewNotes: "Approuvé manuellement.",
            }
          : g
      )
    );
  }

  function handleReject(id: string) {
    if (!rejectReason.trim()) return;
    setGarages((prev) =>
      prev.map((g) =>
        g.id === id
          ? {
              ...g,
              status: "rejected",
              reviewedAt: new Date().toISOString(),
              reviewedBy: "admin@garaj.ca",
              reviewNotes: rejectReason,
            }
          : g
      )
    );
    setRejectReason("");
    setRejectingId(null);
  }

  return (
    <div className="min-h-screen bg-garaj-cream">
      {/* Header */}
      <header className="bg-garaj-navy text-white px-4 py-4 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Admin — Validation Garages</h1>
            <p className="text-[11px] text-slate-400">
              Gestion des inscriptions garage
            </p>
          </div>
          <a
            href="/admin/ai"
            className="text-[11px] text-slate-300 hover:text-white transition-colors"
          >
            Stats IA →
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto">
          <FilterTab
            label={`En attente (${counts.pending})`}
            active={filter === "pending"}
            onClick={() => setFilter("pending")}
            color="amber"
          />
          <FilterTab
            label={`Actifs (${counts.active})`}
            active={filter === "active"}
            onClick={() => setFilter("active")}
            color="green"
          />
          <FilterTab
            label={`Rejetés (${counts.rejected})`}
            active={filter === "rejected"}
            onClick={() => setFilter("rejected")}
            color="red"
          />
          <FilterTab
            label={`Tous (${garages.length})`}
            active={filter === "ALL"}
            onClick={() => setFilter("ALL")}
            color="slate"
          />
        </div>

        {/* Garage list */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <p className="text-4xl mb-2">📭</p>
              <p className="text-sm">Aucun garage à afficher</p>
            </div>
          )}

          {filtered.map((garage) => (
            <div
              key={garage.id}
              className="bg-white rounded-xl border border-slate-200 p-4 space-y-3"
            >
              {/* Top row */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-garaj-navy">
                      {garage.name}
                    </h3>
                    {statusBadge(garage.status)}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    📞 {garage.phone} · 📍 {garage.city} · {garage.postalCode}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {timeAgo(garage.submittedAt)}
                </span>
              </div>

              {/* Specialties */}
              <div className="flex flex-wrap gap-1">
                {garage.specialties.map((s) => (
                  <span
                    key={s}
                    className="text-[10px] bg-garaj-navy/5 text-garaj-navy px-2 py-0.5 rounded"
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Review info if already reviewed */}
              {garage.reviewedAt && (
                <div className="bg-slate-50 rounded-lg p-2.5 text-[11px] text-slate-500">
                  <p>
                    Revu {timeAgo(garage.reviewedAt)} par{" "}
                    {garage.reviewedBy}
                  </p>
                  {garage.reviewNotes && (
                    <p className="mt-1 italic">{garage.reviewNotes}</p>
                  )}
                </div>
              )}

              {/* Actions (only for pending) */}
              {garage.status === "pending" && (
                <div className="space-y-2">
                  {rejectingId === garage.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Raison du rejet..."
                        rows={2}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-red-200 
                                   bg-red-50 text-garaj-navy placeholder:text-slate-400
                                   focus:border-red-400 focus:ring-2 focus:ring-red-200 
                                   outline-none resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReject(garage.id)}
                          disabled={!rejectReason.trim()}
                          className="flex-1 py-2 rounded-lg text-xs font-semibold text-white
                                     bg-red-500 hover:bg-red-600 disabled:opacity-40 
                                     disabled:cursor-not-allowed transition-colors"
                        >
                          Confirmer le rejet
                        </button>
                        <button
                          onClick={() => {
                            setRejectingId(null);
                            setRejectReason("");
                          }}
                          className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600
                                     border border-slate-300 hover:bg-slate-50 transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(garage.id)}
                        className="flex-1 py-2 rounded-lg text-xs font-semibold text-white
                                   bg-garaj-green hover:bg-green-600 transition-colors"
                      >
                        ✅ Approuver
                      </button>
                      <button
                        onClick={() => setRejectingId(garage.id)}
                        className="flex-1 py-2 rounded-lg text-xs font-semibold text-red-600
                                   border border-red-200 hover:bg-red-50 transition-colors"
                      >
                        ❌ Rejeter
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

/* ---- FilterTab micro-component ---- */

function FilterTab({
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
  const activeMap: Record<string, string> = {
    amber: "bg-amber-500 text-white border-amber-500",
    green: "bg-green-500 text-white border-green-500",
    red: "bg-red-500 text-white border-red-500",
    slate: "bg-garaj-navy text-white border-garaj-navy",
  };

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap
                  transition-all active:scale-95 ${
                    active
                      ? activeMap[color]
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
    >
      {label}
    </button>
  );
}
