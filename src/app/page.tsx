"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CountdownTimer from "@/components/schedule/CountdownTimer";
import TodayCard from "@/components/schedule/TodayCard";
import ScheduleTable from "@/components/schedule/ScheduleTable";
import InstallBanner from "@/components/pwa/InstallBanner";
import { CalendarIcon, DownloadIcon, FileTextIcon } from "@/components/ui/Icons";

const PdfGenerator = dynamic(() => import("@/components/generator/PdfGenerator"), {
  ssr: false,
  loading: () => <div className="h-32 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />,
});
const ImageGenerator = dynamic(() => import("@/components/generator/ImageGenerator"), {
  ssr: false,
  loading: () => <div className="h-32 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />,
});

type ActiveTab = "jadwal" | "generator";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("jadwal");

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* Spacer for fixed header */}
      <div className="h-16" />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-4">
        {/* Hero: Full-width countdown */}
        <div className="animate-fade-in mb-3">
          <CountdownTimer />
        </div>

        {/* Today's prayer times */}
        <div className="animate-fade-in mb-4" style={{ animationDelay: "100ms" }}>
          <TodayCard />
        </div>

        {/* PWA install banner */}
        <div className="animate-fade-in mb-4" style={{ animationDelay: "200ms" }}>
          <InstallBanner />
        </div>

        {/* Content area */}
        <div className="grid gap-4 md:grid-cols-[1fr_360px]">
          {/* Schedule Table — always visible on desktop */}
          <div className={activeTab === "jadwal" ? "block" : "hidden md:block"}>
            <ScheduleTable />
          </div>

          {/* Generator sidebar — always visible on desktop */}
          <div className={`space-y-4 ${activeTab === "generator" ? "block" : "hidden md:block"}`}>
            <PdfGenerator />
            <ImageGenerator />
          </div>
        </div>
      </main>

      <Footer />

      {/* Mobile bottom navigation */}
      <nav aria-label="Menu utama" className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-100 bg-white/90 backdrop-blur-xl md:hidden dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-md">
          <button
            type="button"
            aria-current={activeTab === "jadwal" ? "page" : undefined}
            onClick={() => setActiveTab("jadwal")}
            className={`flex flex-1 cursor-pointer flex-col items-center gap-1 py-3 transition-colors ${
              activeTab === "jadwal" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"
            }`}
          >
            <CalendarIcon size={20} />
            <span className="text-[10px] font-semibold">Jadwal</span>
          </button>
          <button
            type="button"
            aria-current={activeTab === "generator" ? "page" : undefined}
            onClick={() => setActiveTab("generator")}
            className={`flex flex-1 cursor-pointer flex-col items-center gap-1 py-3 transition-colors ${
              activeTab === "generator" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"
            }`}
          >
            <DownloadIcon size={20} />
            <span className="text-[10px] font-semibold">Download</span>
          </button>
          <a
            href="https://bimasislam.kemenag.go.id"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 cursor-pointer flex-col items-center gap-1 py-3 text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-400"
          >
            <FileTextIcon size={20} />
            <span className="text-[10px] font-semibold">Sumber</span>
          </a>
        </div>
      </nav>

      {/* Spacer for mobile bottom nav */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
