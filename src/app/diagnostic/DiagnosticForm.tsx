"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useRef, type FormEvent, type ChangeEvent } from "react";

interface MediaPreview {
  file: File;
  preview: string;
}

function DiagnosticForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSymptom = searchParams.get("symptom") ?? "";

  const [symptom, setSymptom] = useState(initialSymptom);
  const [media, setMedia] = useState<MediaPreview[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [emailCaptured, setEmailCaptured] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = 3 - media.length;
    const toAdd = files.slice(0, remaining);

    const previews: MediaPreview[] = toAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setMedia((prev) => [...prev, ...previews]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeMedia = (index: number) => {
    setMedia((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].preview);
      next.splice(index, 1);
      return next;
    });
  };

  const handleSubmitSymptom = async (e: FormEvent) => {
    e.preventDefault();
    if (!symptom.trim()) return;

    setSubmitting(true);
    try {
      const formData = new FormData()
      formData.append('symptoms', symptom)
      formData.append('type', 'express')
      media.forEach(m => formData.append('media', m.file))
      
      const res = await fetch('/api/capture', { method: 'POST', body: formData })
      const data = await res.json()
      
      if (data.consultation_id) {
        sessionStorage.setItem('consultation_id', data.consultation_id)
        setSubmitted(true)
      }
    } catch (err) {
      console.error('Capture failed:', err)
    } finally {
      setSubmitting(false)
    }
  };

  const handleCaptureEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;

    setSubmitting(true);
    try {
      const cid = sessionStorage.getItem('consultation_id')
      // Mettre à jour l'email sur la consultation
      if (cid) {
        await fetch('/api/capture', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ consultation_id: cid, email })
        })
      }
      router.push(`/diagnostic/result?id=${cid}`)
    } catch (err) {
      console.error('Email capture failed:', err)
    } finally {
      setSubmitting(false)
    }
  };

  // --- STATE: Symptom entry ---
  if (!submitted) {
    return (
      <div className="min-h-[80vh] bg-offwhite py-12 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-navy/40 hover:text-orange transition-colors mb-8 inline-flex items-center gap-1"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>

          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy tracking-tight">
              Diagnostic gratuit
            </h1>
            <p className="mt-3 text-sm sm:text-base text-navy/50">
              Décrivez votre symptôme ci-dessous. Pas besoin de compte — on
              vous demande juste votre email après pour vous envoyer le résultat.
            </p>
          </div>

          <form onSubmit={handleSubmitSymptom} className="space-y-6">
            <div>
              <label
                htmlFor="symptom"
                className="block text-sm font-semibold text-navy mb-2"
              >
                Décrivez votre symptôme
              </label>
              <textarea
                id="symptom"
                value={symptom}
                onChange={(e) => setSymptom(e.target.value)}
                placeholder="Exemple : Ma Toyota Corolla 2018 fait un bruit de cliquetis au démarrage le matin. Le bruit disparaît après 2-3 minutes. Kilométrage : 85 000 km."
                rows={5}
                maxLength={1000}
                className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3.5 text-sm sm:text-base text-navy placeholder-navy/30 outline-none focus:border-orange focus:ring-2 focus:ring-orange/20 transition-all resize-y min-h-[120px]"
                required
              />
              <p className="mt-1.5 text-xs text-navy/30">
                Soyez aussi précis que possible : modèle, année, kilométrage,
                conditions (à froid, en virage, à l&apos;accélération…)
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-2">
                Ajoutez des photos ou une vidéo (max 3)
              </label>

              {media.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {media.map((m, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-navy/5">
                      {m.file.type.startsWith("video/") ? (
                        <video
                          src={m.preview}
                          controls
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <img
                          src={m.preview}
                          alt={`Media ${i + 1}`}
                          className="h-full w-full object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removeMedia(i)}
                        className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-navy/70 text-white text-xs hover:bg-red-500 transition-colors"
                        aria-label="Supprimer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {media.length < 3 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-xl border-2 border-dashed border-navy/15 bg-white px-4 py-3 text-sm text-navy/40 hover:border-orange hover:text-orange transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Ajouter une photo ou vidéo
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="mt-1.5 text-xs text-navy/30">
                Format accepté : JPG, PNG, MP4. Max 20 Mo par fichier. Une photo
                du tableau de bord ou du bruit entendu nous aide beaucoup.
              </p>
            </div>

            <button
              type="submit"
              disabled={!symptom.trim() || submitting}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-orange px-8 py-3.5 text-base font-semibold text-white hover:bg-orange-dark transition-colors shadow-lg shadow-orange/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Analyse en cours…
                </>
              ) : (
                "Analyser mon symptôme"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- STATE: Email capture ---
  if (!emailCaptured) {
    return (
      <div className="min-h-[80vh] bg-offwhite py-12 sm:py-20">
        <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white border border-navy/5 p-6 sm:p-8 shadow-sm text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-navy">
              Diagnostic en cours !
            </h2>
            <p className="mt-2 text-sm text-navy/50 leading-relaxed">
              Notre IA analyse votre symptôme. Entrez votre email pour recevoir
              le résultat gratuitement dans quelques instants.
            </p>
            <form onSubmit={handleCaptureEmail} className="mt-6 space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full rounded-xl border border-navy/10 bg-warm-gray px-4 py-3 text-sm text-navy placeholder-navy/30 outline-none focus:border-orange focus:ring-2 focus:ring-orange/20 transition-all"
                required
              />
              <button
                type="submit"
                disabled={!email.includes("@") || submitting}
                className="w-full inline-flex items-center justify-center rounded-xl bg-orange px-6 py-3 text-base font-semibold text-white hover:bg-orange-dark transition-colors shadow-lg shadow-orange/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Envoi en cours…" : "Voir mon diagnostic gratuit"}
              </button>
              <p className="text-xs text-navy/30">
                Aucun spam. Votre email sert uniquement à vous envoyer le
                résultat et créer votre compte automatiquement.
              </p>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- STATE: Confirmation ---
  return (
    <div className="min-h-[80vh] bg-offwhite py-12 sm:py-20">
      <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white border border-navy/5 p-6 sm:p-8 shadow-sm text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-navy">
            Résultat envoyé !
          </h2>
          <p className="mt-2 text-sm text-navy/50 leading-relaxed">
            Votre diagnostic a été envoyé à{" "}
            <strong className="text-navy">{email}</strong>.
          </p>
          <p className="mt-1 text-sm text-navy/50 leading-relaxed">
            Vous allez recevoir un email avec un lien vers votre rapport
            complet. Vous pourrez ensuite comparer les offres des garages près
            de chez vous au Québec.
          </p>

          <div className="mt-8">
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-navy/90 transition-colors"
            >
              Retour à l&apos;accueil
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiagnosticForm;
