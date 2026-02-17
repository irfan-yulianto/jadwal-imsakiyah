import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Si-Imsak — Jadwal Imsakiyah Ramadan 1447H/2026",
  description:
    "Jadwal Imsakiyah dan waktu sholat Ramadan 1447H/2026 untuk seluruh kota di Indonesia. Countdown real-time, generator PDF & gambar untuk masjid Anda.",
  keywords: [
    "jadwal imsakiyah",
    "jadwal sholat",
    "ramadan 2026",
    "ramadan 1447H",
    "waktu sholat",
    "imsakiyah",
  ],
  openGraph: {
    title: "Si-Imsak — Jadwal Imsakiyah Ramadan 1447H/2026",
    description:
      "Jadwal Imsakiyah real-time untuk seluruh kota di Indonesia. Download PDF & gambar untuk masjid Anda.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${jakarta.variable} ${jetbrains.variable} antialiased`}>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');if(t!=='light'){document.documentElement.classList.add('dark')}})()`,
          }}
        />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
