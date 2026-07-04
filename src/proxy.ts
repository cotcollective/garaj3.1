import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* ------------------------------------------------------------------ */
/*  GARAJ V3 — Proxy (ex-middleware, renommé pour Next.js 16)          */
/*  Staging: pas d'auth redirect — toutes les routes accessibles       */
/*  (Prod: ajouter redirects pour /admin et /garage quand prêt)        */
/* ------------------------------------------------------------------ */

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Refresh Supabase auth cookies on every request (no-op if no session)
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => request.cookies.get(name)?.value,
          set: (name, value, options) => {
            response.cookies.set({ name, value, ...options });
          },
          remove: (name, options) => {
            response.cookies.set({ name, value: "", ...options });
          },
        },
      }
    );

    // Just touch the session — no auth gating in staging
    await supabase.auth.getUser();
  } catch (e) {
    // Continue without auth refresh on error
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/garage/:path*",
    "/diagnostic/result",
    "/checkout",
  ],
};
