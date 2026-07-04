import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/* ------------------------------------------------------------------ */
/*  GARAJ V3 — Supabase admin client (lazy-init)                      */
/*  Le client est créé au premier appel (runtime), pas au top-level   */
/*  du module. Cela évite le crash "supabaseUrl is required" pendant */
/*  le build Next.js quand les env vars ne sont pas encore chargées.  */
/* ------------------------------------------------------------------ */

let _adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (_adminClient) return _adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Si les env vars ne sont pas définies (ex: pendant le build), retourner
  // un proxy qui throw seulement au moment d'une vraie opération. Cela permet
  // à Next.js de collecter les metadata des routes sans crasher.
  if (!url || !key) {
    return new Proxy({} as SupabaseClient, {
      get(_target, prop) {
        // Permettre accès aux méthodes pour l'introspection de Next.js
        if (typeof prop === "string" && prop.startsWith("_")) {
          return undefined;
        }
        return new Proxy(function () {} as any, {
          get(_t, p) {
            if (typeof p === "string" && (p === "then" || p === "catch")) {
              return undefined;
            }
            throw new Error(
              `Supabase admin client not configured (missing env vars). Method: ${String(prop)}.${String(p)}`
            );
          },
          apply() {
            throw new Error("Supabase admin client not configured");
          },
        });
      },
    });
  }

  _adminClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _adminClient;
}
