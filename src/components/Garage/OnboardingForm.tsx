"use client";

/* ------------------------------------------------------------------ */
/*  OnboardingForm — Inscription garage SIMPLIFIÉE (1 step)            */
/*  PAS de SMS verification en staging — flow direct vers dashboard    */
/*  Flow: phone + name + postal + specialties → POST /api/garages/register */
/* ------------------------------------------------------------------ */

import { useState, useRef, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";

/* ------ Types ------ */
type Step = "form" | "submitting" | "done";

interface Speciality {
  id: string;
  label: string;
  icon: string;
}

const SPECIALITIES: Speciality[] = [
  { id: "general", label: "Généraliste", icon: "🔧" },
  { id: "moteur", label: "Moteur", icon: "⚙️" },
  { id: "freins", label: "Freins", icon: "🛑" },
  { id: "electrique", label: "Électrique", icon: "⚡" },
  { id: "climatisation", label: "Climatisation", icon: "❄️" },
  { id: "transmission", label: "Transmission", icon: "🔄" },
  { id: "suspension", label: "Suspension", icon: "🔩" },
  { id: "diagnostic", label: "Diagnostic", icon: "💻" },
];

/* ------ Helpers ------ */
function formatPhone(v: string): string {
  const digits = v.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function formatPostal(v: string): string {
  let chars = v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  chars = chars.replace(/^([A-Z]\d[A-Z])(\d[A-Z]\d?)$/, "$1 $2");
  return chars.length <= 3 ? chars : chars.slice(0, 3) + " " + chars.slice(3);
}

/* ------ Component ------ */
export default function OnboardingForm() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [error, setError] = useState("");
  const [createdGarageId, setCreatedGarageId] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "form") nameRef.current?.focus();
  }, [step]);

  /* ---- Specs toggle ---- */
  function toggleSpeciality(id: string) {
    setSelectedSpecs((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  /* ---- Submit ---- */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    // Validation
    if (!name.trim()) {
      setError("Entrez le nom de votre garage");
      return;
    }
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      setError("Entrez un numéro à 10 chiffres (ex: 514-555-0199)");
      return;
    }
    const postal = postalCode.replace(/\s/g, "");
    if (postal.length < 6) {
      setError("Entrez un code postal valide (ex: J4K 2R1)");
      return;
    }
    if (selectedSpecs.length === 0) {
      setError("Sélectionnez au moins une spécialité");
      return;
    }

    setStep("submitting");
    try {
      const res = await fetch("/api/garages/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          postalCode,
          specialties: selectedSpecs,
          smsEnabled,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      if (data.garage?.id) {
        setCreatedGarageId(data.garage.id);
        setStep("done");
      } else {
        // Legacy mock response — try to find the id anyway
        setCreatedGarageId(data.id || null);
        setStep("done");
      }
    } catch (e: any) {
      setError(e.message || "Erreur lors de l'inscription");
      setStep("form");
    }
  }

  /* ---- RENDER: Form step ---- */
  if (step === "form") {
    return (
      <div className="flex flex-col min-h-screen bg-garaj-cream">
        <header className="px-4 py-6 text-center bg-garaj-navy text-white">
          <h1 className="text-2xl font-bold tracking-tight">GARAJ</h1>
          <p className="text-sm text-slate-300 mt-1">
            Inscription garage — 30 secondes
          </p>
        </header>

        <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-center space-y-1">
              <span className="text-3xl">🏪</span>
              <h2 className="text-xl font-bold text-garaj-navy">
                Votre garage
              </h2>
              <p className="text-xs text-slate-500">
                Pas de SMS ni de mot de passe. Vous serez en ligne après vérification admin.
              </p>
            </div>

            {/* Nom du garage */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-600 mb-1"
              >
                Nom du garage
              </label>
              <input
                ref={nameRef}
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                placeholder="Ex: Garage Steph Montréal"
                className="w-full px-4 py-3 text-base rounded-xl border-2 border-slate-200 bg-white
                           focus:border-garaj-orange focus:ring-2 focus:ring-garaj-orange/20
                           outline-none transition-colors"
                required
              />
            </div>

            {/* Téléphone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-slate-600 mb-1"
              >
                Numéro de téléphone
              </label>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => {
                  setPhone(formatPhone(e.target.value));
                  setError("");
                }}
                placeholder="514-555-0199"
                className="w-full px-4 py-3 text-base rounded-xl border-2 border-slate-200 bg-white
                           focus:border-garaj-orange focus:ring-2 focus:ring-garaj-orange/20
                           outline-none transition-colors"
                autoComplete="tel"
                required
              />
            </div>

            {/* Code postal */}
            <div>
              <label
                htmlFor="postal"
                className="block text-sm font-medium text-slate-600 mb-1"
              >
                Code postal
              </label>
              <input
                id="postal"
                type="text"
                inputMode="text"
                value={postalCode}
                onChange={(e) => {
                  setPostalCode(formatPostal(e.target.value));
                  setError("");
                }}
                placeholder="J4K 2R1"
                className="w-full px-4 py-3 text-base rounded-xl border-2 border-slate-200 bg-white
                           focus:border-garaj-orange focus:ring-2 focus:ring-garaj-orange/20
                           outline-none transition-colors uppercase tracking-wider"
                autoComplete="postal-code"
                required
              />
              <p className="mt-1 text-xs text-slate-400">
                Vos leads seront filtrés par proximité.
              </p>
            </div>

            {/* Spécialités */}
            <fieldset>
              <legend className="block text-sm font-medium text-slate-600 mb-2">
                Spécialités <span className="text-garaj-orange">*</span>
              </legend>
              <div className="grid grid-cols-2 gap-2">
                {SPECIALITIES.map((spec) => {
                  const active = selectedSpecs.includes(spec.id);
                  return (
                    <button
                      key={spec.id}
                      type="button"
                      onClick={() => toggleSpeciality(spec.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium
                                  transition-all active:scale-[0.97] ${
                                    active
                                      ? "border-garaj-orange bg-garaj-orange/5 text-garaj-navy shadow-sm"
                                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                                  }`}
                    >
                      <span className="text-lg">{spec.icon}</span>
                      {spec.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* SMS toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Recevoir les leads par SMS
                </p>
                <p className="text-xs text-slate-500">
                  Notifications instantanées sur votre téléphone
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSmsEnabled(!smsEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  smsEnabled ? "bg-garaj-orange" : "bg-slate-300"
                }`}
                role="switch"
                aria-checked={smsEnabled}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    smsEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center animate-shake">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-semibold text-white text-base
                         bg-garaj-orange hover:bg-garaj-orange-light active:scale-[0.98]
                         transition-all shadow-lg shadow-garaj-orange/20"
            >
              Créer mon compte garage
            </button>

            <p className="text-xs text-center text-slate-400">
              En continuant, vous acceptez nos conditions. Aucune carte de crédit requise.
            </p>
          </form>
        </main>
      </div>
    );
  }

  /* ---- RENDER: Submitting ---- */
  if (step === "submitting") {
    return (
      <div className="flex flex-col min-h-screen bg-garaj-cream items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-orange border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm text-slate-500">
            Création de votre compte garage…
          </p>
        </div>
      </div>
    );
  }

  /* ---- RENDER: Done ---- */
  return (
    <div className="flex flex-col min-h-screen bg-garaj-cream">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-md mx-auto w-full">
        <div className="text-center space-y-6 animate-fade-in">
          <span className="text-6xl">🎉</span>
          <h2 className="text-2xl font-bold text-garaj-navy">
            Inscription reçue !
          </h2>
          <p className="text-slate-500 leading-relaxed text-sm">
            Votre garage <strong>{name}</strong> est inscrit sur GARAJ. Notre équipe
            valide votre profil sous 24h. Vous recevrez un email à{" "}
            <strong>{phone}</strong> quand votre compte sera activé.
          </p>

          {createdGarageId && (
            <div className="bg-garaj-navy/5 rounded-xl p-3 text-left">
              <p className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold mb-1">
                ID de référence
              </p>
              <p className="text-xs font-mono text-garaj-navy break-all">
                {createdGarageId}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Gardez-le pour accéder à votre dashboard.
              </p>
            </div>
          )}

          <div className="bg-garaj-navy/5 rounded-xl p-4 space-y-2 text-left text-sm">
            <p className="font-semibold text-garaj-navy">
              📱 SMS activés au {phone}
            </p>
            <p className="text-slate-500">
              📍 {postalCode} — vos leads seront filtrés par proximité.
            </p>
            <p className="text-slate-500">
              🔧 {selectedSpecs.length} spécialité
              {selectedSpecs.length > 1 ? "s" : ""} sélectionnée
              {selectedSpecs.length > 1 ? "s" : ""}.
            </p>
          </div>

          {/* Bouton dashboard si garage_id dispo */}
          {createdGarageId && (
            <a
              href={`/garage/dashboard?garage=${createdGarageId}`}
              className="block w-full py-3.5 rounded-xl font-semibold text-white text-base
                         bg-garaj-orange hover:bg-garaj-orange-light active:scale-[0.98]
                         transition-all shadow-lg shadow-garaj-orange/20 text-center"
            >
              Accéder à mon dashboard →
            </a>
          )}

          <a
            href="/"
            className="block w-full py-3 rounded-xl font-medium text-slate-600 text-sm
                       border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Retour à l&apos;accueil
          </a>
        </div>
      </main>
    </div>
  );
}
