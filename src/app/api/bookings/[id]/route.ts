/* ------------------------------------------------------------------ */
/*  GARAJ V3 — GET /api/bookings/[id]                                 */
/*  Retourne les infos d'un booking (daily_room_url + consultation_id) */
/* ------------------------------------------------------------------ */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { SupabaseNotConfiguredError } from "@/lib/supabase/admin";

const supabase = getSupabaseAdmin();

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Try lookup by booking.id first
    let { data: booking, error } = await supabase
      .from("bookings")
      .select("id, consultation_id, garage_id, daily_room_url, status, created_at")
      .eq("id", id)
      .maybeSingle();

    // If not found, try by consultation_id (so the URL can be /room/<consultation_id>)
    if (!booking) {
      const { data: altBooking } = await supabase
        .from("bookings")
        .select("id, consultation_id, garage_id, daily_room_url, status, created_at")
        .eq("consultation_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      booking = altBooking;
    }

    if (!booking) {
      return NextResponse.json(
        { error: "Aucun booking trouvé pour ce token" },
        { status: 404 }
      );
    }

    return NextResponse.json({ booking });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
