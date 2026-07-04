import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { SupabaseNotConfiguredError } from "@/lib/supabase/admin";

const supabase = getSupabaseAdmin();

/* PATCH /api/admin/garages
 * body: { garage_id, status: 'active' | 'rejected', notes?: string }
 * Updates validation_status on the garage.
 */
export async function PATCH(req: NextRequest) {
  try {
    const { garage_id, status, notes } = await req.json();

    if (!garage_id) {
      return NextResponse.json({ error: "garage_id requis" }, { status: 400 });
    }
    if (!["active", "approved", "rejected", "pending"].includes(status)) {
      return NextResponse.json(
        { error: "status doit être 'active', 'approved', 'rejected' ou 'pending'" },
        { status: 400 }
      );
    }

    // Map external status to DB validation_status
    const dbStatus = status === "active" ? "approved" : status;

    const updates: Record<string, any> = {
      validation_status: dbStatus,
    };

    const { data: garage, error } = await supabase
      .from("garages")
      .update(updates)
      .eq("id", garage_id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ garage });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/* GET /api/admin/garages?status=pending|active|rejected|all
 * Default: pending only
 * Returns { garages: [], counts: { pending, active, rejected } }
 *
 * DB stores validation_status as 'pending' | 'approved' | 'rejected'.
 * External API uses 'pending' | 'active' | 'rejected' for clarity.
 * Mapping: 'active' <-> 'approved'
 */
export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status") || "pending";

    // Map external status to DB status
    const dbStatusMap: Record<string, string> = {
      pending: "pending",
      active: "approved",
      rejected: "rejected",
      all: "all",
      ALL: "all",
    };
    const dbStatus = dbStatusMap[status] || status;

    let query = supabase.from("garages").select("*").order("created_at", { ascending: false });

    if (dbStatus !== "all") {
      query = query.eq("validation_status", dbStatus);
    }

    const { data: garages, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map DB validation_status back to external status for consistency
    const normalizedGarages = (garages || []).map((g: any) => ({
      ...g,
      validation_status: g.validation_status === "approved" ? "active" : g.validation_status,
    }));

    // Compute counts (using DB column names)
    const [
      { count: pendingCount },
      { count: activeCount },
      { count: rejectedCount },
    ] = await Promise.all([
      supabase
        .from("garages")
        .select("id", { count: "exact", head: true })
        .eq("validation_status", "pending"),
      supabase
        .from("garages")
        .select("id", { count: "exact", head: true })
        .eq("validation_status", "approved"),
      supabase
        .from("garages")
        .select("id", { count: "exact", head: true })
        .eq("validation_status", "rejected"),
    ]);

    return NextResponse.json({
      garages: normalizedGarages,
      counts: {
        pending: pendingCount || 0,
        active: activeCount || 0,
        rejected: rejectedCount || 0,
        total: (pendingCount || 0) + (activeCount || 0) + (rejectedCount || 0),
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
