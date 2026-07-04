"use client";

/* ------------------------------------------------------------------ */
/*  GARAJ V3 — Hook de polling Supabase Realtime sur ai_status         */
/*  Surveille le statut de traitement IA d'une consultation.          */
/* ------------------------------------------------------------------ */

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export type AIStatus = "pending" | "processing" | "completed" | "failed";

interface DiagnosticPollResult {
  status: AIStatus;
  hypotheses: any[];
  error: string | null;
}

export function useDiagnosticPolling(consultationId: string | null): DiagnosticPollResult {
  const [status, setStatus] = useState<AIStatus>("pending");
  const [hypotheses, setHypotheses] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!consultationId) return;
    const supabase = createClient();

    const { data, error: fetchErr } = await supabase
      .from("consultations")
      .select("ai_status, diagnostic_hypotheses")
      .eq("id", consultationId)
      .single();

    if (fetchErr) {
      setError(fetchErr.message);
      return;
    }

    if (data) {
      setStatus(data.ai_status as AIStatus);
      if (data.diagnostic_hypotheses) {
        setHypotheses(data.diagnostic_hypotheses);
      }
    }
  }, [consultationId]);

  useEffect(() => {
    if (!consultationId) return;

    const supabase = createClient();

    // 1. Fetch initial status
    fetchStatus();

    // 2. Subscribe to Realtime changes
    const channel = supabase
      .channel(`consultation-${consultationId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "consultations",
          filter: `id=eq.${consultationId}`,
        },
        (payload: any) => {
          const newStatus = payload.new?.ai_status;
          if (newStatus) {
            setStatus(newStatus);
            if (payload.new?.diagnostic_hypotheses) {
              setHypotheses(payload.new.diagnostic_hypotheses);
            }
            // If completed or failed, unsubscribe
            if (newStatus === "completed" || newStatus === "failed") {
              supabase.removeChannel(channel);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [consultationId, fetchStatus]);

  return { status, hypotheses, error };
}
