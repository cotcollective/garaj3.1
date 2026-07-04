"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function Hero() {
  const router = useRouter();
  const [symptom, setSymptom] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = symptom.trim();
    if (!trimmed) return;
    router.push(`/diagnostic?symptom=${encodeURIComponent(trimmed)}`);
  };

  return (
    <section className="relative overflow-hidden bg-navy">
      {/* Background subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy to-orange/10" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-2xl text-center">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 mb-6 text-xs sm:text-sm text-white/70">
            <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span>134 garages partenaires au Québec</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Votre auto fait un bruit bizarre&nbsp;?
            <br />
            <span className="text-orange">On vous aide.</span>
          </h1>

          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-white/60 max-w-xl mx-auto leading-relaxed">
            Diagnostic gratuit en 2 minutes. Décrivez votre symptôme et obtenez
            une hypothèse IA validée par des mécaniciens québécois.
          </p>

          {/* Diagnostic form — the core CTA */}
          <form onSubmit={handleSubmit} className="mt-8 sm:mt-10">
            <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input
                type="text"
                value={symptom}
                onChange={(e) => setSymptom(e.target.value)}
                placeholder="Ex: bruit de cliquetis au démarrage..."
                className="flex-1 rounded-xl border border-white/20 bg-white/10 px-5 py-3.5 text-white placeholder-white/40 outline-none focus:border-orange focus:ring-2 focus:ring-orange/30 transition-all text-sm sm:text-base"
                maxLength={200}
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-orange px-6 py-3.5 text-sm sm:text-base font-semibold text-white hover:bg-orange-dark transition-colors shadow-lg shadow-orange/25 whitespace-nowrap"
              >
                Diagnostiquer mon auto
              </button>
            </div>
            <p className="mt-3 text-xs text-white/40">
              Gratuit • Sans inscription • Résultat en ~2 minutes
            </p>
          </form>

          {/* Social proof stats */}
          <div className="mt-10 sm:mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-white">
                2&nbsp;847
              </p>
              <p className="text-xs sm:text-sm text-white/50 mt-1">
                diagnostics réalisés
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-orange">
                134
              </p>
              <p className="text-xs sm:text-sm text-white/50 mt-1">
                garages au Québec
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-white">
                4.8
              </p>
              <p className="text-xs sm:text-sm text-white/50 mt-1">
                /5 satisfaction
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
