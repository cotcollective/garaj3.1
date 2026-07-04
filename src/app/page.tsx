import Hero from "@/components/Landing/Hero";
import HowItWorks from "@/components/Landing/HowItWorks";
import FAQ from "@/components/Landing/FAQ";
import Testimonials from "@/components/Landing/Testimonials";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Testimonials />
      <FAQ />

      {/* Bottom CTA */}
      <section className="bg-navy py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Prêt à diagnostiquer votre auto&nbsp;?
          </h2>
          <p className="mt-3 text-base text-white/60">
            Gratuit, sans inscription, en 2 minutes. Des garages québécois près
            de chez vous.
          </p>
          <a
            href="/diagnostic"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-orange px-8 py-4 text-base font-semibold text-white hover:bg-orange-dark transition-colors shadow-lg shadow-orange/25"
          >
            Commencer mon diagnostic gratuit
          </a>
          <p className="mt-4 text-xs text-white/30">
            Prix en $ CAD &middot; Service disponible au Québec
          </p>
        </div>
      </section>
    </>
  );
}
