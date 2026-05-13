import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Carely.tn — متجر التطبيقات المدفوعة",
  description: "متجر Carely.tn — حسابات واشتراكات تطبيقات مدفوعة بالدينار التونسي. دفع واضح، دعم واتساب.",
  keywords: ["Carely", "carely", "متجر تطبيقات", "تونس", "دينار تونسي", "اشتراك"],
  openGraph: {
    title: "Carely.tn — متجر التطبيقات المدفوعة",
    description: "حسابات واشتراكات رسمية بالدينار التونسي — دعم واتساب من تونس",
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
          href="https://fonts.googleapis.com/css2?family=Baloo+Bhaijaan+2:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased bg-carely-mint text-carely-gray min-h-screen flex flex-col overflow-x-hidden"
        style={{ fontFamily: "'Baloo Bhaijaan 2', sans-serif" }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
