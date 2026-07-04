/* ------------------------------------------------------------------ */
/*  GARAJ V3 — GET /api/garages/[id]/leads                            */
/*  Retourne les consultations qui matchent les specialties du garage  */
/*  + les bids déjà placées par ce garage                             */
/* ------------------------------------------------------------------ */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: garageId } = await context.params;

    // 1. Récupérer le garage pour ses specialties
    const { data: garage, error: gErr } = await supabase
      .from("garages")
      .select("id, garage_name, specialties, validation_status, lat, lng")
      .eq("id", garageId)
      .single();

    if (gErr || !garage) {
      return NextResponse.json(
        { error: "Garage introuvable", code: gErr?.code },
        { status: 404 }
      );
    }

    const specialties: string[] = (garage.specialties || []).map((s: string) =>
      s.toLowerCase()
    );

    if (specialties.length === 0) {
      return NextResponse.json({
        garage,
        leads: [],
        bids: [],
        message: "Aucune spécialité configurée pour ce garage",
      });
    }

    // 2. Récupérer les consultation_ids qui ont au moins une hypothesis matchant
    const { data: matchingHypotheses, error: hErr } = await supabase
      .from("diagnostic_hypotheses")
      .select("consultation_id, rank, hypothesis, probability_pct, urgency, specialty_tag")
      .in("specialty_tag", specialties);

    if (hErr) {
      return NextResponse.json({ error: hErr.message }, { status: 500 });
    }

    // Grouper par consultation, garder la meilleure hypothesis
    const consultationsMap = new Map<string, any>();
    for (const h of matchingHypotheses || []) {
      const existing = consultationsMap.get(h.consultation_id);
      if (!existing || h.rank < existing.bestHypothesis.rank) {
        consultationsMap.set(h.consultation_id, {
          consultationId: h.consultation_id,
          bestHypothesis: h,
        });
      }
    }

    const consultationIds = Array.from(consultationsMap.keys());

    if (consultationIds.length === 0) {
      return NextResponse.json({
        garage,
        leads: [],
        bids: [],
        message: "Aucun lead disponible pour vos spécialités",
      });
    }

    // 3. Récupérer les consultations complètes
    const { data: consultations, error: cErr } = await supabase
      .from("consultations")
      .select(
        "id, type, ai_status, symptoms_description, vehicle_snapshot, email_captured, created_at"
      )
      .in("id", consultationIds)
      .eq("ai_status", "completed")
      .order("created_at", { ascending: false })
      .limit(20);

    if (cErr) {
      return NextResponse.json({ error: cErr.message }, { status: 500 });
    }

    // 4. Récupérer les bids déjà placées par ce garage
    const { data: existingBids, error: bErr } = await supabase
      .from("bids")
      .select("id, consultation_id, amount_cad, estimated_duration_hours, status, notes, created_at")
      .eq("garage_id", garageId)
      .in(
        "consultation_id",
        (consultations || []).map((c: any) => c.id)
      );

    if (bErr) {
      return NextResponse.json({ error: bErr.message }, { status: 500 });
    }

    const bidByConsultation = new Map<string, any>();
    for (const b of existingBids || []) {
      bidByConsultation.set(b.consultation_id, b);
    }

    // 5. Mapper en format lead
    const leads = (consultations || []).map((c: any) => {
      const meta = consultationsMap.get(c.id);
      const h = meta?.bestHypothesis;
      const bid = bidByConsultation.get(c.id);
      const vs = c.vehicle_snapshot || {};
      return {
        id: c.id,
        consultationId: c.id,
        type: c.type,
        score:
          h?.urgency === "high"
            ? "CHAUD"
            : h?.urgency === "medium"
            ? "TIÈDE"
            : "FROID",
        vehicle: vs.make ? `${vs.make} ${vs.model || ""}`.trim() : "Véhicule non spécifié",
        year: vs.year || null,
        symptom: c.symptoms_description || "",
        iaSummary: h?.hypothesis || "",
        iaHypotheses: h
          ? [
              {
                hypothesis: h.hypothesis,
                probability: h.probability_pct,
                confidence: 80,
              },
            ]
          : [],
        specialty: h?.specialty_tag || "",
        urgency: h?.urgency || "low",
        createdAt: c.created_at,
        clientPhone: null, // jamais stocké pour privacy
        email: c.email_captured || null,
        bidPlaced: !!bid,
        bidAmount: bid?.amount_cad || null,
        bidStatus: bid?.status || null,
        accepted: bid?.status === "accepted",
      };
    });

    return NextResponse.json({
      garage,
      leads,
      bids: existingBids || [],
      counts: {
        total: leads.length,
        chauds: leads.filter((l: any) => l.score === "CHAUD").length,
        tiedes: leads.filter((l: any) => l.score === "TIÈDE").length,
        froids: leads.filter((l: any) => l.score === "FROID").length,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
