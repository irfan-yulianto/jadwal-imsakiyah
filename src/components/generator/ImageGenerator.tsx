"use client";

import { useRef, useState, useMemo, useCallback } from "react";
import { toPng } from "html-to-image";
import { useStore } from "@/store/useStore";
import { getAdjustedTime } from "@/lib/time";
import { getUtcOffset } from "@/lib/timezone";
import { ImageIcon, DownloadIcon, ShareIcon } from "@/components/ui/Icons";
import DailyCard from "./DailyCard";
import MonthlyCard from "./MonthlyCard";

type Tab = "daily" | "monthly";

export default function ImageGenerator() {
  const { schedule, location, customHeader, timeOffset } = useStore();
  const [activeTab, setActiveTab] = useState<Tab>("daily");
  const [isGenerating, setIsGenerating] = useState(false);
  const dailyRef = useRef<HTMLDivElement>(null);
  const monthlyRef = useRef<HTMLDivElement>(null);

  const utcOffset = getUtcOffset(location.timezone);

  const tomorrowSchedule = useMemo(() => {
    if (schedule.data.length === 0) return null;
    const now = getAdjustedTime(timeOffset);
    const localTime = new Date(now.getTime() + utcOffset * 3600000);
    localTime.setUTCDate(localTime.getUTCDate() + 1);
    const tomorrowStr = localTime.toISOString().split("T")[0];
    return schedule.data.find((s) => s.date === tomorrowStr) || schedule.data[0];
  }, [schedule.data, timeOffset, utcOffset]);

  const generateImage = useCallback(
    async (type: Tab): Promise<string | null> => {
      const ref = type === "daily" ? dailyRef : monthlyRef;
      if (!ref.current) return null;
      return toPng(ref.current, { quality: 1, pixelRatio: 1, cacheBust: true });
    },
    []
  );

  const handleDownload = useCallback(
    async (type: Tab) => {
      setIsGenerating(true);
      try {
        const dataUrl = await generateImage(type);
        if (!dataUrl) return;
        const link = document.createElement("a");
        link.download =
          type === "daily"
            ? `Jadwal-Imsakiyah-${location.cityName}-Besok.png`
            : `Jadwal-Imsakiyah-${location.cityName}-Sebulan.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Failed to generate image:", err);
      } finally {
        setIsGenerating(false);
      }
    },
    [location.cityName, generateImage]
  );

  const handleShare = useCallback(
    async (type: Tab) => {
      if (!navigator.share) {
        handleDownload(type);
        return;
      }
      setIsGenerating(true);
      try {
        const dataUrl = await generateImage(type);
        if (!dataUrl) return;
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], `jadwal-imsakiyah.png`, { type: "image/png" });
        await navigator.share({ files: [file], title: "Jadwal Imsakiyah" });
      } catch {
        // User cancelled or share failed
      } finally {
        setIsGenerating(false);
      }
    },
    [generateImage, handleDownload]
  );

  if (schedule.data.length === 0) return null;

  return (
    <div className="rounded-3xl border border-slate-100 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-50 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
          <ImageIcon size={20} className="text-violet-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">Download Gambar</h3>
          <p className="text-[11px] text-slate-400">Untuk IG Story & WhatsApp</p>
        </div>
      </div>

      <div className="p-5">
        {/* Tabs */}
        <div className="mb-4 flex gap-1.5 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("daily")}
            className={`flex-1 cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
              activeTab === "daily"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Harian (9:16)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("monthly")}
            className={`flex-1 cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
              activeTab === "monthly"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Bulanan (A4)
          </button>
        </div>

        {/* Preview */}
        <div className="mb-4 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
          <div className="relative mx-auto" style={{ height: 280 }}>
            {activeTab === "daily" && tomorrowSchedule && (
              <div className="absolute left-1/2 top-0 -translate-x-1/2 origin-top scale-[0.145]" style={{ width: 1080, height: 1920 }}>
                <DailyCard
                  ref={dailyRef}
                  schedule={tomorrowSchedule}
                  cityName={location.cityName}
                  timezone={location.timezone}
                  mosqueName={customHeader.mosqueName || undefined}
                />
              </div>
            )}
            {activeTab === "monthly" && (
              <div className="absolute left-1/2 top-0 -translate-x-1/2 origin-top scale-[0.08]" style={{ width: 2480, height: 3508 }}>
                <MonthlyCard
                  ref={monthlyRef}
                  scheduleData={schedule.data}
                  cityName={location.cityName}
                  province={location.province}
                  timezone={location.timezone}
                  mosqueName={customHeader.mosqueName || undefined}
                />
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleDownload(activeTab)}
            disabled={isGenerating}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-violet-600/20 transition-all hover:shadow-lg hover:shadow-violet-600/30 disabled:cursor-wait disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            <DownloadIcon size={16} />
            {isGenerating ? "Membuat..." : "Download"}
          </button>
          <button
            type="button"
            onClick={() => handleShare(activeTab)}
            disabled={isGenerating}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 disabled:cursor-wait disabled:text-slate-300"
          >
            <ShareIcon size={16} />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
