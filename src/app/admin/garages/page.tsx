"use client";

/* ------------------------------------------------------------------ */
/*  GARAJ V3 — /admin/garages                                         */
/*  Liste de validation des garages (approuver/rejeter)               */
/*  Branché: /api/admin/garages (GET + PATCH)                         */
/* ------------------------------------------------------------------ */

import { useState, useMemo, useEffect, useCallback } from "react";

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
  address?: string;
  lat?: number;
  lng?: number;
  rating?: number;
  review_count?: number;
}

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
  const [garages, setGarages] = useState<GarageRecord[]>([]);
  const [filter, setFilter] = useState<"ALL" | "pending" | "active" | "rejected">("pending");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Fetch from API
  const loadGarages = useCallback(async (status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = status && status !== "ALL"
        ? `/api/admin/garages?status=${status}`
        : "/api/admin/garages";
      const res = await fetch(url);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      // Normalize DB shape to GarageRecord shape
      const normalized: GarageRecord[] = (data.garages || []).map((g: any) => ({
        id: g.id,
        name: g.garage_name || "(sans nom)",
        phone: g.phone || "",
        postalCode: extractPostal(g.address || ""),
        city: extractCity(g.address || ""),
        specialties: g.specialties || [],
        status: g.validation_status || "pending",
        submittedAt: g.created_at,
        reviewedAt: null,
        reviewedBy: null,
        reviewNotes: null,
        smsEnabled: !!g.phone,
        address: g.address,
        lat: g.lat,
        lng: g.lng,
        rating: g.rating,
        review_count: g.review_count,
      }));
      setGarages(normalized);
    } catch (e: any) {
      setError(e.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGarages(filter === "ALL" ? undefined : filter);
  }, [filter, loadGarages]);

  // PATCH validation_status
  async function updateStatus(id: string, newStatus: "active" | "rejected", notes?: string) {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/garages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ garage_id: id, status: newStatus, notes: notes || null }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      // Update local state
      setGarages((prev) =>
        prev.map((g) =>
          g.id === id
            ? {
                ...g,
                status: newStatus,
                reviewedAt: new Date().toISOString(),
                reviewedBy: "admin@garaj.ca",
                reviewNotes: notes || (newStatus === "active" ? "Approuvé manuellement." : "Rejeté sans note."),
              }
            : g
        )
      );
      setRejectingId(null);
      setRejectReason("");
    } catch (e: any) {
      alert(`Erreur: ${e.message}`);
    } finally {
      setUpdatingId(null);
    }
  }

  function handleApprove(id: string) {
    updateStatus(id, "active");
  }

  function handleReject(id: string) {
    if (!rejectReason.trim()) return;
    updateStatus(id, "rejected", rejectReason);
  }

  const filtered = useMemo(() => {
    if (filter === "ALL") return garages;
    return garages.filter((g) => g.status === filter);
  }, [garages, filter]);

  const counts = {
    pending: garages.filter((g) => g.status === "pending").length,
    active: garages.filter((g) => g.status === "active").length,
    rejected: garages.filter((g) => g.status === "rejected").length,
  };

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
          <span className="text-[10px] text-slate-500 uppercase tracking-wide">
            {loading ? "Chargement…" : `${garages.length} au total`}
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">Erreur API</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
            <button
              onClick={() => loadGarages(filter === "ALL" ? undefined : filter)}
              className="mt-2 text-xs text-red-700 underline"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
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
          {loading ? (
            <div className="text-center py-16 text-slate-400">
              <div className="inline-block w-6 h-6 border-2 border-orange border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm">Chargement…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-4xl mb-2">📭</p>
              <p className="text-sm">Aucun garage à afficher</p>
              <p className="text-xs mt-1 text-slate-300">
                {filter === "pending"
                  ? "Tous les garages ont été traités."
                  : "Aucun garage dans cette catégorie."}
              </p>
            </div>
          ) : (
            filtered.map((garage) => (
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
                      📞 {garage.phone || "—"} · 📍 {garage.city || "—"} {garage.postalCode && `· ${garage.postalCode}`}
                    </p>
                    {garage.address && (
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {garage.address}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {timeAgo(garage.submittedAt)}
                  </span>
                </div>

                {/* Specialties */}
                {garage.specialties.length > 0 && (
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
                )}

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
                            disabled={!rejectReason.trim() || updatingId === garage.id}
                            className="flex-1 py-2 rounded-lg text-xs font-semibold text-white
                                       bg-red-500 hover:bg-red-600 disabled:opacity-40
                                       disabled:cursor-not-allowed transition-colors"
                          >
                            {updatingId === garage.id ? "…" : "Confirmer le rejet"}
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
                          disabled={updatingId === garage.id}
                          className="flex-1 py-2 rounded-lg text-xs font-semibold text-white
                                     bg-garaj-green hover:bg-green-600 transition-colors
                                     disabled:opacity-40"
                        >
                          {updatingId === garage.id ? "…" : "✅ Approuver"}
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
            ))
          )}
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

/* ---- Address parsing helpers ---- */

function extractPostal(address: string): string {
  if (!address) return "";
  const match = address.match(/[A-Z]\d[A-Z]\s?\d[A-Z]\d/i);
  return match ? match[0].toUpperCase() : "";
}

function extractCity(address: string): string {
  if (!address) return "";
  // Try to find last word(s) that look like a city
  const parts = address.split(/[,\s]+/);
  // If last part contains "Montréal", "Laval", etc., it's a city
  const knownCities = [
    "Montréal", "Laval", "Longueuil", "Brossard", "Québec", "Gatineau",
    "Sherbrooke", "Trois-Rivières", "Saguenay", "Lévis", "Terrebonne",
    "Saint-Jérôme", "Repentigny", "Drummondville", "Saint-Hyacinthe",
  ];
  for (let i = parts.length - 1; i >= 0; i--) {
    for (const city of knownCities) {
      if (parts[i].toLowerCase().includes(city.toLowerCase())) {
        return city;
      }
    }
  }
  // Fallback: last 1-2 words
  return parts.slice(-2).join(" ");
}
