import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="text-2xl font-extrabold tracking-tight text-orange">
              GARAJ
            </Link>
            <p className="mt-2 text-sm text-white/50">
              Diagnostic auto intelligent au Québec. Trouvez le bon garage, sans stress.
            </p>
          </div>

          {/* Client */}
          <div>
            <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-3">
              Automobilistes
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/diagnostic" className="text-sm text-white/50 hover:text-orange transition-colors">
                  Diagnostic gratuit
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-sm text-white/50 hover:text-orange transition-colors">
                  Comment ça marche
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="text-sm text-white/50 hover:text-orange transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Garage */}
          <div>
            <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-3">
              Mécaniciens
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/garage/onboarding" className="text-sm text-white/50 hover:text-orange transition-colors">
                  Inscription garage
                </Link>
              </li>
              <li>
                <Link href="/garage/dashboard" className="text-sm text-white/50 hover:text-orange transition-colors">
                  Tableau de bord
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-3">
              Légal
            </h4>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-white/50">
                  Prix en $ CAD
                </span>
              </li>
              <li>
                <span className="text-sm text-white/50">
                  Service au Québec
                </span>
              </li>
              <li>
                <span className="text-sm text-white/50">
                  © {new Date().getFullYear()} GARAJ
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 text-center">
          <p className="text-xs text-white/40">
            GARAJ est une plateforme de mise en relation entre automobilistes et garages indépendants au Québec.
            Les diagnostics sont fournis à titre indicatif par une intelligence artificielle et ne remplacent pas
            l&apos;avis d&apos;un mécanicien certifié.
          </p>
        </div>
      </div>
    </footer>
  );
}
