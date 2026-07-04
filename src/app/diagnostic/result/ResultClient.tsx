"use client";

/* ------------------------------------------------------------------ */
/*  GARAJ V3 — Composant client pour /diagnostic/result                */
/*  Gère : DiagnosticPending (polling) + DiagnosticResult + Upsell     */
/* ------------------------------------------------------------------ */

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDiagnosticPolling } from "@/hooks/useDiagnosticPolling";
import { HypothesisCard } from "@/components/Diagnostic/HypothesisCard";
import { UpsellPro } from "@/components/Diagnostic/UpsellPro";

interface ResultClientProps {
  consultationId: string | null;
  initialConsultation: any;
}

export function ResultClient({
  consultationId,
  initialConsultation,
}: ResultClientProps) {
  const router = useRouter();

  // Poll only if not already completed/failed from SSR
  const { status: polledStatus, hypotheses: polledHypotheses, error: pollError } =
    useDiagnosticPolling(consultationId);

  const [consultation, setConsultation] = useState(initialConsultation);
  const [plan, setPlan] = useState<"express" | "pro">("express");

  // Merge polling results into consultation state
  useEffect(() => {
    if (!consultationId) return;

    setConsultation((prev: any) => ({
      ...prev,
      ai_status: polledStatus,
      diagnostic_hypotheses: polledHypotheses.length
        ? polledHypotheses
        : prev?.diagnostic_hypotheses || [],
    }));
  }, [consultationId, polledStatus, polledHypotheses]);

  // Determine plan from initial data
  useEffect(() => {
    if (consultation?.plan) {
      setPlan(consultation.plan);
    }
  }, [consultation]);

  const aiStatus = consultation?.ai_status || "pending";
  const hypotheses = consultation?.diagnostic_hypotheses || [];
  const symptom = consultation?.symptom || "";

  // --- STATE: No consultationId ---
  if (!consultationId) {
    return (
      <div className="min-h-[80vh] bg-offwhite flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 mb-4">
            <svg className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-navy">Aucun diagnostic trouvé</h2>
          <p className="mt-2 text-sm text-navy/50">
            Veuillez d&apos;abord soumettre votre symptôme depuis la page de diagnostic.
          </p>
          <button
            onClick={() => router.push("/diagnostic")}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-orange px-6 py-3 text-sm font-semibold text-white hover:bg-orange-dark transition-colors"
          >
            Faire un diagnostic
          </button>
        </div>
      </div>
    );
  }

  // --- STATE: Pending / Processing ---
  if (aiStatus === "pending" || aiStatus === "processing") {
    return <DiagnosticPending status={aiStatus} symptom={symptom} />;
  }

  // --- STATE: Failed ---
  if (aiStatus === "failed") {
    return <DiagnosticFailed consultationId={consultationId} />;
  }

  // --- STATE: Completed → show results ---
  if (aiStatus === "completed" && hypotheses.length > 0) {
    return (
      <div className="min-h-screen bg-offwhite py-8 sm:py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <button
            onClick={() => router.push("/")}
            className="text-sm text-navy/40 hover:text-orange transition-colors mb-6 inline-flex items-center gap-1"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Accueil
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold mb-3">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Diagnostic complété
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight">
              Votre diagnostic {plan === "pro" ? "Pro" : "Express"}
            </h1>
            <p className="mt-2 text-sm text-navy/50 max-w-lg mx-auto">
              Basé sur votre description : <em className="text-navy/70">&ldquo;{symptom.slice(0, 150)}{symptom.length > 150 ? "…" : ""}&rdquo;</em>
            </p>
          </div>

          {/* Hypotheses cards */}
          <div className="space-y-4 mb-8">
            {hypotheses.map((h: any, i: number) => (
              <HypothesisCard
                key={i}
                hypothesis={h}
                index={i}
                plan={plan}
              />
            ))}
          </div>

          {/* Upsell CTA — only on Express plan */}
          {plan === "express" && (
            <UpsellPro consultationId={consultationId} />
          )}

          {/* Pro: extra info placeholder */}
          {plan === "pro" && (
            <div className="rounded-2xl bg-green-50 border border-green-200 p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-navy">Rapport Pro débloqué</h3>
              <p className="mt-1 text-sm text-navy/50">
                Vous avez accès aux estimations de coûts complètes. Les garages près de chez vous seront bientôt disponibles.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fallback — shouldn't happen
  return (
    <div className="min-h-[80vh] bg-offwhite flex items-center justify-center">
      <p className="text-navy/40">État inconnu : {aiStatus}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sous-composants                                                    */
/* ------------------------------------------------------------------ */

function DiagnosticPending({
  status,
  symptom,
}: {
  status: string;
  symptom: string;
}) {
  return (
    <div className="min-h-[80vh] bg-offwhite flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        {/* Animated spinner */}
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-navy/5" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange animate-spin" />
          <div className="absolute inset-2 rounded-full bg-offwhite flex items-center justify-center">
            <svg className="h-8 w-8 text-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-navy">
          {status === "pending" ? "Analyse en cours" : "L'IA réfléchit…"}
        </h2>
        <p className="mt-2 text-sm text-navy/50 leading-relaxed">
          {status === "pending"
            ? "Notre intelligence artificielle analyse votre symptôme. Cela prend habituellement 10 à 30 secondes."
            : "L'IA est en train d'analyser votre description. Encore quelques instants…"}
        </p>
        <div className="mt-4 flex items-center justify-center gap-1">
          <span className="flex h-2 w-2 rounded-full bg-orange animate-bounce [animation-delay:0ms]" />
          <span className="flex h-2 w-2 rounded-full bg-orange animate-bounce [animation-delay:150ms]" />
          <span className="flex h-2 w-2 rounded-full bg-orange animate-bounce [animation-delay:300ms]" />
        </div>

        {symptom && (
          <p className="mt-6 text-xs text-navy/30 italic">
            &ldquo;{symptom.slice(0, 120)}{symptom.length > 120 ? "…" : ""}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}

function DiagnosticFailed({ consultationId }: { consultationId: string }) {
  const router = useRouter();

  return (
    <div className="min-h-[80vh] bg-offwhite flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
          <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-xl font-extrabold text-navy">
          Diagnostic temporairement indisponible
        </h2>
        <p className="mt-2 text-sm text-navy/50 leading-relaxed">
          Une erreur est survenue lors de l&apos;analyse. Veuillez réessayer.
        </p>
        <button
          onClick={() => router.push("/diagnostic")}
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-orange px-6 py-3 text-sm font-semibold text-white hover:bg-orange-dark transition-colors"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
