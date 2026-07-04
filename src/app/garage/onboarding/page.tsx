/* ------------------------------------------------------------------ */
/*  GARAJ V3 — Garage Onboarding                                     */
/*  Route: /garage/onboarding                                         */
/*  Accessible SANS auth (le middleware laisse passer cette route)     */
/*  Formulaire 3 étapes: téléphone → code SMS → code postal + specs   */
/* ------------------------------------------------------------------ */

import type { Metadata } from "next";
import OnboardingForm from "@/components/Garage/OnboardingForm";

export const metadata: Metadata = {
  title: "Inscription garage — GARAJ",
  description:
    "Inscrivez votre garage en 60 secondes. Téléphone + code postal + spécialités. Pas de mot de passe.",
};

export default function GarageOnboardingPage() {
  return <OnboardingForm />;
}
