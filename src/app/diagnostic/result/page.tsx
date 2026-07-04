/* ------------------------------------------------------------------ */
/*  GARAJ V3 — /diagnostic/result                                     */
/*  SSR: fetch initial consultation + hypotheses from Supabase        */
/*  Client: ResultClient handles polling + result UI                  */
/* ------------------------------------------------------------------ */

import { Suspense } from "react";
import { createClient } from "@supabase/supabase-js";
import { ResultClient } from "./ResultClient";

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function DiagnosticResultPage({ searchParams }: PageProps) {
  const { id } = await searchParams;

  if (!id) {
    return <NoConsultation />;
  }

  // SSR fetch initial data
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: consultation } = await supabase
    .from("consultations")
    .select("id, type, ai_status, symptoms_description, payment_status, vehicle_snapshot, email_captured")
    .eq("id", id)
    .single();

  if (!consultation) {
    return <NoConsultation />;
  }

  // Fetch hypotheses
  const { data: hypotheses } = await supabase
    .from("diagnostic_hypotheses")
    .select("*")
    .eq("consultation_id", id)
    .order("rank");

  const initialConsultation = {
    ...consultation,
    symptom: consultation.symptoms_description,
    diagnostic_hypotheses: hypotheses || [],
  };

  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] bg-offwhite flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-orange border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-navy/40">Chargement…</p>
          </div>
        </div>
      }
    >
      <ResultClient
        consultationId={id}
        initialConsultation={initialConsultation}
      />
    </Suspense>
  );
}

function NoConsultation() {
  return (
    <div className="min-h-[80vh] bg-offwhite flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 mb-4">
          <svg
            className="h-8 w-8 text-amber-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-extrabold text-navy">Aucun diagnostic trouvé</h2>
        <p className="mt-2 text-sm text-navy/50">
          Veuillez d&apos;abord soumettre votre symptôme depuis la page de diagnostic.
        </p>
        <a
          href="/diagnostic"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-orange px-6 py-3 text-sm font-semibold text-white hover:bg-orange-dark transition-colors"
        >
          Faire un diagnostic
        </a>
      </div>
    </div>
  );
}
