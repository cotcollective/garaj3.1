interface Testimonial {
  name: string;
  location: string;
  car: string;
  quote: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    name: "Martin L.",
    location: "Montréal",
    car: "Toyota Corolla 2018",
    quote:
      "Ma Corolla faisait un bruit de cliquetis au démarrage. J'ai décrit le symptôme sur GARAJ, l'IA m'a tout de suite dit que ça ressemblait à un problème de tendeur de chaîne. Le garage m'a confirmé et m'a fait un prix honnête. J'ai économisé au moins 300 $.",
    rating: 5,
  },
  {
    name: "Sophie D.",
    location: "Québec",
    car: "Honda CR-V 2020",
    quote:
      "Je n'y connais rien en mécanique et j'ai toujours peur de me faire avoir. Avec GARAJ, j'ai eu 3 offres de garages différents pour mon problème de freins. J'ai pu comparer les prix ET les avis. Service impeccable.",
    rating: 5,
  },
  {
    name: "Karim B.",
    location: "Longueuil",
    car: "Hyundai Elantra 2017",
    quote:
      "Le diagnostic gratuit m'a donné une hypothèse que j'ai pu vérifier avec mon beau-frère mécanicien. L'IA avait raison à 90 %. Pour 29 $, le rapport Pro m'a même donné une fourchette de prix qui m'a évité de payer trop cher.",
    rating: 4,
  },
  {
    name: "Isabelle R.",
    location: "Laval",
    car: "Ford Escape 2019",
    quote:
      "Première fois que j'utilisais un service comme ça. En 2 minutes j'avais un diagnostic crédible. Le garage partenaire à Laval m'a rappelée dans l'heure. Efficace, rapide, et je me suis sentie respectée comme cliente.",
    rating: 5,
  },
  {
    name: "Jean-François T.",
    location: "Sherbrooke",
    car: "Chevrolet Silverado 2021",
    quote:
      "Mon truck faisait un bruit de transmission inquiétant. GARAJ m'a rassuré : l'IA penchait pour un heat shield desserré, pas une transmission à changer. Le garage a confirmé en 5 minutes. Facture : 40 $ au lieu de potentiellement 4000 $.",
    rating: 5,
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < rating ? "text-orange" : "text-navy/10"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="bg-offwhite py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy tracking-tight">
            Ce que nos clients disent
          </h2>
          <p className="mt-3 text-sm sm:text-base text-navy/50">
            Des automobilistes québécois comme vous.
          </p>
        </div>

        {/* Mobile: horizontal scroll; desktop: grid */}
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[85vw] sm:w-[320px] md:w-auto snap-center rounded-xl bg-white border border-navy/5 p-5 sm:p-6 shadow-sm"
            >
              <Stars rating={t.rating} />
              <blockquote className="mt-3 text-sm text-navy/70 leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy/5 text-xs font-bold text-navy/40">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy">{t.name}</p>
                  <p className="text-xs text-navy/40">
                    {t.location} &middot; {t.car}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
