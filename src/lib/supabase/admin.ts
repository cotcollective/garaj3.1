import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/* ------------------------------------------------------------------ */
/*  GARAJ V3 — Supabase admin client (lazy-init)                      */
/*  Le client est créé au premier appel (runtime), pas au top-level   */
/*  du module. Cela évite le crash "supabaseUrl is required" pendant */
/*  le build Next.js quand les env vars ne sont pas encore chargées.  */
/*                                                                    */
/*  Au runtime, si les env vars sont toujours pas là, on throw une    */
/*  erreur explicite "Missing env vars" qui sera catchée par le       */
/*  handler et retournée en 503 au client (debuggable).               */
/* ------------------------------------------------------------------ */

let _adminClient: SupabaseClient | null = null;

export class SupabaseNotConfiguredError extends Error {
  constructor(missing: string[]) {
    super(
      `Supabase admin client not configured. Missing env vars: ${missing.join(", ")}. ` +
        `Set them in Netlify dashboard → Site settings → Environment variables.`
    );
    this.name = "SupabaseNotConfiguredError";
  }
}

export function isSupabaseAdminConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export function getSupabaseAdmin(): SupabaseClient {
  if (_adminClient) return _adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    const missing: string[] = [];
    if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!key) missing.push("SUPABASE_SERVICE_ROLE_KEY");
    throw new SupabaseNotConfiguredError(missing);
  }

  _adminClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _adminClient;
}
