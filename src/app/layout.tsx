import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Carely.tn — متجر اشتراكات حماية الأطفال 🛡️",
  description: "اشتري اشتراك Qustodio بالدينار التونسي — حماية أطفالك على الإنترنت من Carely.tn. دفع آمن، تفعيل فوري، دعم واتساب.",
  keywords: ["Carely", "carely", "qustodio", "حماية الأطفال", "تونس", "دينار تونسي", "اشتراك", "parental control"],
  openGraph: {
    title: "Carely.tn — متجر اشتراكات حماية الأطفال",
    description: "اشتري اشتراك Qustodio بالدينار التونسي — حماية أطفالك على الإنترنت",
    type: "website",
    locale: "ar_TN",
    url: "https://carely.tn",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-white text-carely-dark min-h-screen flex flex-col overflow-x-hidden">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
