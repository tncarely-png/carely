import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "9arini.tn — Gestion des cours particuliers en Tunisie",
  description: "La plateforme qui simplifie la gestion des cours particuliers : paiements, présence, et coordination — pour les enseignants et étudiants tunisiens.",
  keywords: ["9arini", "cours particuliers", "tunisie", "enseignant", "étudiant", "paiement", "présence"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" dir="ltr" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+Bhaijaan+2:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased bg-white text-zinc-900 min-h-screen flex flex-col overflow-x-hidden"
        style={{ fontFamily: "'Baloo Bhaijaan 2', sans-serif" }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
