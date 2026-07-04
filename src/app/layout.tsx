import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "GARAJ — Diagnostic auto gratuit au Québec",
  description:
    "Décrivez votre symptôme et obtenez un diagnostic auto gratuit en 2 minutes. 134 garages partenaires au Québec prêts à vous aider.",
  openGraph: {
    title: "GARAJ — Diagnostic auto gratuit au Québec",
    description:
      "Décrivez votre symptôme et obtenez un diagnostic auto gratuit en 2 minutes. 134 garages partenaires au Québec.",
    type: "website",
    locale: "fr_CA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-offwhite text-navy">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
