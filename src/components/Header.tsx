"use client";

import Link from "next/link";
import { useState } from "react";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-navy text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-orange">
              GARAJ
            </span>
            <span className="hidden sm:inline text-xs text-white/60 font-medium mt-1">
              au Québec
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/diagnostic"
              className="text-sm font-medium text-white/80 hover:text-orange transition-colors"
            >
              Diagnostic gratuit
            </Link>
            <Link
              href="/garage/onboarding"
              className="text-sm font-medium text-white/60 hover:text-orange transition-colors"
            >
              Je suis mécanicien
            </Link>
            <Link
              href="/diagnostic"
              className="inline-flex items-center justify-center rounded-lg bg-orange px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-dark transition-colors shadow-sm"
            >
              Diagnostiquer mon auto
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-white/80 hover:text-orange"
            aria-label="Menu"
          >
            {mobileOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-white/10">
            <nav className="flex flex-col gap-3 pt-4">
              <Link
                href="/diagnostic"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-white/80 hover:text-orange transition-colors"
              >
                Diagnostic gratuit
              </Link>
              <Link
                href="/garage/onboarding"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-white/60 hover:text-orange transition-colors"
              >
                Je suis mécanicien
              </Link>
              <Link
                href="/diagnostic"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center rounded-lg bg-orange px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-dark transition-colors"
              >
                Diagnostiquer mon auto
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
