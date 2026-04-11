import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Carely.tn — حمي عيلتك على النت",
  description: "اشتري اشتراك Qustodio بالدينار التونسي — فعّل في دقيقتين — تابع من هاتفك. Carely.tn",
  keywords: ["Carely", "Qustodio", "حماية الأطفال", "تونس", "مراقبة أطفال"],
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
          href="https://fonts.googleapis.com/css2?family=Baloo+Bhaijaan+2:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased bg-carely-mint text-carely-gray min-h-screen flex flex-col"
        style={{ fontFamily: "'Baloo Bhaijaan 2', sans-serif" }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
