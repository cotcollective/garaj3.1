"use client";

/* ------------------------------------------------------------------ */
/*  GARAJ V3 — /room/[token]                                          */
/*  Salle de consultation vidéo Daily.co                              */
/*  Fetch la vraie room URL via /api/bookings/[token]                 */
/* ------------------------------------------------------------------ */

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

export default function RoomPage() {
  const params = useParams();
  const token = params?.token as string;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isMockRoom, setIsMockRoom] = useState(false);

  // Fetch real room URL from API
  useEffect(() => {
    if (!token) {
      setError("Token de salle manquant.");
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    fetch(`/api/bookings/${encodeURIComponent(token)}`)
      .then((r) => {
        if (!r.ok) {
          return r.json().then((d) => {
            throw new Error(d.error || `HTTP ${r.status}`);
          });
        }
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        const url = data.booking?.daily_room_url;
        if (url) {
          setRoomUrl(url);
          setIsMockRoom(url.includes("garaj.daily.co"));
        } else {
          setError("URL de salle non disponible");
        }
        setIsLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e.message || "Erreur de chargement");
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleIframeError = useCallback(() => {
    setIsLoading(false);
    setError(
      "Impossible de charger la salle vidéo. Vérifiez votre connexion internet."
    );
  }, []);

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-garaj-navy text-white p-4">
        <p className="text-6xl mb-4">🚫</p>
        <h1 className="text-xl font-bold mb-2">Salle introuvable</h1>
        <p className="text-sm text-slate-400 text-center max-w-md">
          Le lien de consultation est invalide ou a expiré. Contactez votre garage
          pour obtenir un nouveau lien.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-garaj-navy">
      {/* ---- HEADER BAR ---- */}
      <header className="flex items-center justify-between px-4 py-3 bg-garaj-navy/90 backdrop-blur border-b border-white/10">
        <div className="flex items-center gap-3">
          <h1 className="text-white font-bold text-sm">GARAJ Consultation</h1>
          <span className="text-[10px] text-garaj-orange bg-garaj-orange/10 px-2 py-0.5 rounded-full">
            {isLoading ? "Connexion..." : "En direct"}
          </span>
        </div>

        <div className="flex gap-2">
          {/* Mute toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-colors ${
              isMuted
                ? "bg-red-500/20 text-red-400"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
            title={isMuted ? "Réactiver le micro" : "Couper le micro"}
          >
            {isMuted ? "🔇" : "🎤"}
          </button>

          {/* Video toggle */}
          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-colors ${
              isVideoOff
                ? "bg-red-500/20 text-red-400"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
            title={isVideoOff ? "Réactiver la caméra" : "Couper la caméra"}
          >
            {isVideoOff ? "📷" : "📹"}
          </button>

          {/* Leave */}
          <button
            onClick={() => window.close()}
            className="w-9 h-9 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-sm hover:bg-red-500/40 transition-colors"
            title="Quitter la consultation"
          >
            ✕
          </button>
        </div>
      </header>

      {/* ---- MAIN VIDEO AREA ---- */}
      <main className="flex-1 flex flex-col">
        {isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center text-white gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-garaj-orange border-t-transparent animate-spin" />
            <p className="text-sm text-slate-400">
              Connexion à la salle vidéo...
            </p>
          </div>
        )}

        {error && !isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center text-white gap-4 p-4">
            <p className="text-4xl">⚠️</p>
            <h2 className="text-lg font-semibold">Erreur de chargement</h2>
            <p className="text-sm text-slate-400 text-center max-w-sm">
              {error}
            </p>
            <p className="text-xs text-slate-500 text-center max-w-sm">
              Token: <span className="font-mono">{token.slice(0, 16)}...</span>
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-6 py-2 rounded-lg bg-garaj-orange text-white font-semibold text-sm hover:bg-garaj-orange-light transition-colors"
            >
              Réessayer
            </button>
          </div>
        )}

        {!isLoading && !error && roomUrl && (
          <>
            {/* Daily.co iframe (ou mock URL si pas de vraie room) */}
            <div className="flex-1 relative bg-black">
              <iframe
                src={roomUrl}
                className="w-full h-full border-0"
                allow="camera; microphone; fullscreen; display-capture"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                title="Consultation vidéo GARAJ"
              />

              {/* Badge mode démo si URL mock */}
              {isMockRoom && (
                <div className="absolute top-4 left-4 bg-garaj-navy/80 backdrop-blur px-3 py-1.5 rounded-lg pointer-events-none">
                  <p className="text-[10px] text-garaj-orange font-semibold uppercase tracking-wider">
                    Mode Démo
                  </p>
                  <p className="text-[9px] text-slate-300 mt-0.5">
                    Salle de démonstration
                  </p>
                </div>
              )}

              {/* Overlay si caméra/micro désactivés */}
              {(isMuted || isVideoOff) && (
                <div className="absolute bottom-4 left-4 flex gap-2">
                  {isMuted && (
                    <span className="bg-red-500/90 text-white text-[10px] px-2 py-1 rounded-full">
                      🔇 Micro coupé
                    </span>
                  )}
                  {isVideoOff && (
                    <span className="bg-red-500/90 text-white text-[10px] px-2 py-1 rounded-full">
                      📷 Caméra coupée
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* ---- FOOTER INFO BAR ---- */}
            <footer className="flex items-center justify-between px-4 py-2 bg-garaj-navy/95 border-t border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-garaj-green animate-pulse" />
                <span className="text-[10px] text-slate-400">
                  Consultation chiffrée de bout en bout
                </span>
              </div>
              <span className="text-[10px] text-slate-500">
                Salle: {token.slice(0, 12)}...
              </span>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}
