"use client";

import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "Est-ce que le diagnostic est vraiment gratuit ?",
    answer:
      "Oui, le diagnostic de base est 100 % gratuit et sans engagement. Vous décrivez votre symptôme, notre IA vous donne une hypothèse diagnostique. Si vous voulez un rapport complet avec estimations de coûts et mise en relation avec des garages, vous passez au forfait Pro à 29 $ CAD.",
  },
  {
    question: "Est-ce que ça fonctionne pour tous les modèles de voiture ?",
    answer:
      "Absolument. Notre IA est entraînée sur des milliers de cas couvrant toutes les marques et tous les modèles courants au Québec — Toyota, Honda, Ford, Hyundai, Chevrolet, Nissan, etc. Du VUS à la berline, électrique ou à essence.",
  },
  {
    question: "Les garages sur GARAJ sont-ils fiables ?",
    answer:
      "Tous les garages partenaires sont vérifiés manuellement par notre équipe. Nous contrôlons les certifications (licence RBQ, certifications SAAQ), les avis clients, et l'historique. Seuls les garages qui maintiennent une note de 4+ étoiles restent sur la plateforme.",
  },
  {
    question: "Combien de temps avant d'avoir des offres de garages ?",
    answer:
      "En moyenne, les automobilistes reçoivent leur première estimation en moins de 2 heures. Les garages sont notifiés par SMS et répondent rapidement — ils savent qu'un client qui attend trop longtemps va ailleurs !",
  },
  {
    question: "Est-ce que GARAJ est disponible partout au Québec ?",
    answer:
      "Nous couvrons les régions de Montréal, Québec, Laval, Longueuil, Sherbrooke, Gatineau, Trois-Rivières et leurs environs. Nous ajoutons des garages partenaires chaque semaine. Si votre région n'est pas encore couverte, le diagnostic IA reste disponible gratuitement.",
  },
  {
    question: "Et si l'IA se trompe dans son diagnostic ?",
    answer:
      "Le diagnostic IA est une hypothèse de départ, pas un verdict final. Il vous aide à comprendre ce qui pourrait se passer et à communiquer efficacement avec un garage. Le diagnostic final doit toujours être posé par un mécanicien certifié après inspection du véhicule.",
  },
  {
    question: "Comment les garages sont-ils payés ?",
    answer:
      "Les garages paient un abonnement mensuel pour recevoir des leads qualifiés. Vous, en tant qu'automobiliste, ne payez rien pour le diagnostic gratuit. Les prix des réparations sont négociés directement avec le garage que vous choisissez.",
  },
  {
    question: "Puis-je utiliser GARAJ sur mon téléphone ?",
    answer:
      "Oui ! GARAJ est conçu mobile-first. Vous pouvez décrire votre symptôme, recevoir votre diagnostic, et comparer les offres de garages directement depuis votre téléphone, où que vous soyez.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="bg-warm-gray py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy tracking-tight">
            Questions fréquentes
          </h2>
          <p className="mt-3 text-sm sm:text-base text-navy/50">
            Tout ce que vous devez savoir avant de commencer.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-xl bg-white border border-navy/5 overflow-hidden"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between px-5 sm:px-6 py-4 text-left"
              >
                <span className="text-sm sm:text-base font-semibold text-navy pr-4">
                  {faq.question}
                </span>
                <svg
                  className={`h-5 w-5 flex-shrink-0 text-orange transition-transform duration-200 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-5 sm:px-6 pb-4">
                  <p className="text-sm text-navy/60 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
