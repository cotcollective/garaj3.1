"use client";

/* ------------------------------------------------------------------ */
/*  OnboardingForm — Inscription garage 60 secondes                   */
/*  Flow: Téléphone → Code reçu → Code postal + Spécialités           */
/*  PAS de mot de passe. Lien magique par SMS.                        */
/* ------------------------------------------------------------------ */

import { useState, useRef, useEffect, type FormEvent } from "react";

/* ------ Types ------ */
type Step = "phone" | "verify" | "details" | "done";

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
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const [postalCode, setPostalCode] = useState("");
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);
  const phoneRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "phone") phoneRef.current?.focus();
  }, [step]);

  /* ---- Phone step ---- */
  function handlePhoneSubmit(e: FormEvent) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      setError("Entrez un numéro à 10 chiffres (ex: 514-555-0199)");
      return;
    }
    setError("");
    setStep("verify");
  }

  /* ---- Verify step ---- */
  function handleCodeChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const next = [...verificationCode];
    next[index] = value;
    setVerificationCode(next);
    if (value && index < 5) codeRefs.current[index + 1]?.focus();
    if (next.every((d) => d !== "") && next.join("").length === 6) {
      // Auto-submit quand les 6 chiffres sont entrés
      setTimeout(() => handleVerify(next), 300);
    }
  }

  function handleVerify(code?: string[]) {
    const c = code || verificationCode;
    const codeStr = c.join("");
    if (codeStr.length < 6) {
      setError("Entrez le code à 6 chiffres reçu par SMS");
      return;
    }
    setError("");
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep("details");
    }, 800);
  }

  /* ---- Details step ---- */
  function toggleSpeciality(id: string) {
    setSelectedSpecs((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function handleDetailsSubmit(e: FormEvent) {
    e.preventDefault();
    const postal = postalCode.replace(/\s/g, "");
    if (postal.length < 6) {
      setError("Entrez un code postal valide (ex: J4K 2R1)");
      return;
    }
    if (selectedSpecs.length === 0) {
      setError("Sélectionnez au moins une spécialité");
      return;
    }
    setError("");
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep("done");
    }, 600);
  }

  /* ------ Render: Progress bar ------ */
  const steps: { id: Step; label: string }[] = [
    { id: "phone", label: "Téléphone" },
    { id: "verify", label: "Vérification" },
    { id: "details", label: "Profil" },
    { id: "done", label: "Terminé" },
  ];
  const currentStepIdx = steps.findIndex((s) => s.id === step);

  return (
    <div className="flex flex-col min-h-screen bg-garaj-cream">
      {/* --- Header --- */}
      <header className="px-4 py-6 text-center bg-garaj-navy text-white">
        <h1 className="text-2xl font-bold tracking-tight">GARAJ</h1>
        <p className="text-sm text-slate-300 mt-1">Inscription garage — 60 secondes</p>
      </header>

      {/* --- Progress dots (desktop: bar) --- */}
      <div className="flex items-center justify-center gap-2 px-4 py-4 bg-white border-b border-slate-100">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                i < currentStepIdx
                  ? "bg-garaj-green text-white"
                  : i === currentStepIdx
                  ? "bg-garaj-orange text-white ring-2 ring-garaj-orange/30"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {i < currentStepIdx ? "✓" : i + 1}
            </div>
            <span className="hidden sm:inline text-xs text-slate-500">{s.label}</span>
            {i < steps.length - 1 && (
              <div
                className={`hidden sm:block w-8 h-0.5 ${
                  i < currentStepIdx ? "bg-garaj-green" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* --- Main content area --- */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-md mx-auto w-full">
        {/* ---- STEP 1: Phone ---- */}
        {step === "phone" && (
          <form onSubmit={handlePhoneSubmit} className="w-full space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <span className="text-4xl">📱</span>
              <h2 className="text-xl font-bold text-garaj-navy">
                Votre numéro de téléphone
              </h2>
              <p className="text-sm text-slate-500">
                On vous enverra un code par SMS. Pas de mot de passe requis.
              </p>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-600 mb-1">
                Numéro de téléphone
              </label>
              <input
                ref={phoneRef}
                id="phone"
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => {
                  setPhone(formatPhone(e.target.value));
                  setError("");
                }}
                placeholder="514-555-0199"
                className="w-full px-4 py-3.5 text-lg rounded-xl border-2 border-slate-200 bg-white
                           focus:border-garaj-orange focus:ring-2 focus:ring-garaj-orange/20
                           outline-none transition-colors text-center tracking-wider"
                autoComplete="tel"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center animate-shake">{error}</p>
            )}

            <button
              type="submit"
              disabled={phone.replace(/\D/g, "").length < 10}
              className="w-full py-3.5 rounded-xl font-semibold text-white text-lg
                         bg-garaj-orange hover:bg-garaj-orange-light active:scale-[0.98]
                         transition-all disabled:opacity-40 disabled:cursor-not-allowed
                         shadow-lg shadow-garaj-orange/20"
            >
              Recevoir le code SMS
            </button>

            <p className="text-xs text-center text-slate-400">
              En continuant, vous acceptez nos conditions. Aucune carte de crédit requise.
            </p>
          </form>
        )}

        {/* ---- STEP 2: Verify code ---- */}
        {step === "verify" && (
          <div className="w-full space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <span className="text-4xl">🔐</span>
              <h2 className="text-xl font-bold text-garaj-navy">Vérifiez votre numéro</h2>
              <p className="text-sm text-slate-500">
                Code envoyé au <strong>{phone}</strong>
              </p>
            </div>

            <div className="flex justify-center gap-2" role="group">
              {verificationCode.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    codeRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !digit && i > 0)
                      codeRefs.current[i - 1]?.focus();
                  }}
                  className="w-12 h-14 text-2xl font-bold text-center rounded-xl
                             border-2 border-slate-200 bg-white focus:border-garaj-orange
                             focus:ring-2 focus:ring-garaj-orange/20 outline-none transition-colors"
                  aria-label={`Chiffre ${i + 1}`}
                />
              ))}
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center animate-shake">{error}</p>
            )}

            <button
              onClick={() => handleVerify()}
              disabled={isSubmitting || verificationCode.join("").length < 6}
              className="w-full py-3.5 rounded-xl font-semibold text-white text-lg
                         bg-garaj-orange hover:bg-garaj-orange-light active:scale-[0.98]
                         transition-all disabled:opacity-40 disabled:cursor-not-allowed
                         shadow-lg shadow-garaj-orange/20"
            >
              {isSubmitting ? "Vérification..." : "Vérifier"}
            </button>

            <button
              onClick={() => setStep("phone")}
              className="w-full text-sm text-slate-500 hover:text-garaj-navy transition-colors"
            >
              ← Changer de numéro
            </button>

            <p className="text-xs text-center text-slate-400">
              Pas reçu? Vérifiez vos SMS. Renvoi dans 30s.
            </p>
          </div>
        )}

        {/* ---- STEP 3: Details ---- */}
        {step === "details" && (
          <form onSubmit={handleDetailsSubmit} className="w-full space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <span className="text-4xl">🏪</span>
              <h2 className="text-xl font-bold text-garaj-navy">Votre garage</h2>
              <p className="text-sm text-slate-500">
                Dites-nous où vous êtes et ce que vous faites.
              </p>
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
                className="w-full px-4 py-3 text-lg rounded-xl border-2 border-slate-200 bg-white
                           focus:border-garaj-orange focus:ring-2 focus:ring-garaj-orange/20
                           outline-none transition-colors text-center tracking-wider uppercase"
                autoComplete="postal-code"
              />
            </div>

            {/* Spécialités */}
            <fieldset>
              <legend className="block text-sm font-medium text-slate-600 mb-3">
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
                      className={`flex items-center gap-2 px-3 py-3 rounded-xl border-2 text-sm font-medium
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

            {error && (
              <p className="text-sm text-red-500 text-center animate-shake">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || selectedSpecs.length === 0}
              className="w-full py-3.5 rounded-xl font-semibold text-white text-lg
                         bg-garaj-orange hover:bg-garaj-orange-light active:scale-[0.98]
                         transition-all disabled:opacity-40 disabled:cursor-not-allowed
                         shadow-lg shadow-garaj-orange/20"
            >
              {isSubmitting ? "Création..." : "Créer mon compte garage"}
            </button>

            <button
              onClick={() => setStep("phone")}
              className="w-full text-sm text-slate-500 hover:text-garaj-navy transition-colors"
            >
              ← Retour
            </button>
          </form>
        )}

        {/* ---- STEP 4: Done ---- */}
        {step === "done" && (
          <div className="w-full text-center space-y-6 animate-fade-in">
            <span className="text-6xl">🎉</span>
            <h2 className="text-2xl font-bold text-garaj-navy">Vous êtes en ligne!</h2>
            <p className="text-slate-500 leading-relaxed">
              Votre garage est maintenant inscrit sur <strong>GARAJ</strong>. Vous recevrez
              des leads par SMS directement sur votre téléphone. Pas de mot de passe — un
              lien magique vous connecte à votre dashboard.
            </p>

            <div className="bg-garaj-navy/5 rounded-xl p-4 space-y-2 text-left">
              <p className="text-sm font-semibold text-garaj-navy">
                📱 SMS activés au {phone}
              </p>
              <p className="text-sm text-slate-500">
                📍 {postalCode} — vos leads seront filtrés par proximité.
              </p>
              <p className="text-sm text-slate-500">
                🔧 {selectedSpecs.length} spécialité{selectedSpecs.length > 1 ? "s" : ""}{" "}
                sélectionnée{selectedSpecs.length > 1 ? "s" : ""}.
              </p>
            </div>

            {/* Simulated magic link button */}
            <a
              href="/garage/dashboard"
              className="block w-full py-3.5 rounded-xl font-semibold text-white text-lg
                         bg-garaj-orange hover:bg-garaj-orange-light active:scale-[0.98]
                         transition-all shadow-lg shadow-garaj-orange/20 text-center"
            >
              Accéder à mon dashboard →
            </a>

            <p className="text-xs text-slate-400">
              Vous recevrez un SMS avec un lien magique pour vous connecter.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

/* ------ Keyframes inline via style tag ------ */
const style = `
@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(3px); }
}
.animate-fade-in  { animation: fade-in 0.35s ease-out; }
.animate-shake    { animation: shake 0.4s ease; }
`;
if (typeof document !== "undefined" && !document.getElementById("onboarding-keyframes")) {
  const s = document.createElement("style");
  s.id = "onboarding-keyframes";
  s.textContent = style;
  document.head.appendChild(s);
}
