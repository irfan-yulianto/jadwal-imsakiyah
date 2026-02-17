"use client";

import { useStore } from "@/store/useStore";
import { getHijriDate } from "@/lib/hijri";
import { getAdjustedTime } from "@/lib/time";
import { getUtcOffset } from "@/lib/timezone";
import { PRAYER_NAMES, PRAYER_KEYS } from "@/types";
import { PRAYER_ICON_MAP, CalendarIcon } from "@/components/ui/Icons";
import { useMemo } from "react";

export default function TodayCard() {
  const { schedule, location, timeOffset } = useStore();
  const utcOffset = getUtcOffset(location.timezone);

  const { todaySchedule, hijriDate, todayDateStr, currentPrayerIdx } = useMemo(() => {
    const now = getAdjustedTime(timeOffset);
    const localTime = new Date(now.getTime() + utcOffset * 3600000);
    const dateStr = localTime.toISOString().split("T")[0];

    const today = schedule.data.find((s) => s.date === dateStr);
    const hijri = getHijriDate(dateStr);

    let prayerIdx = -1;
    if (today) {
      const localHours = localTime.getUTCHours();
      const localMinutes = localTime.getUTCMinutes();
      const currentMinutes = localHours * 60 + localMinutes;

      for (let i = PRAYER_KEYS.length - 1; i >= 0; i--) {
        const timeStr = today[PRAYER_KEYS[i]];
        if (timeStr) {
          const [h, m] = timeStr.split(":").map(Number);
          if (currentMinutes >= h * 60 + m) {
            prayerIdx = i;
            break;
          }
        }
      }
    }

    return { todaySchedule: today, hijriDate: hijri, todayDateStr: dateStr, currentPrayerIdx: prayerIdx };
  }, [schedule.data, timeOffset, utcOffset]);

  if (!todaySchedule) {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <p className="text-center text-sm text-slate-400">
          {schedule.loading ? "Memuat jadwal..." : "Jadwal hari ini belum tersedia"}
        </p>
      </div>
    );
  }

  const dayName = todaySchedule.tanggal?.split(",")[0] || "";

  return (
    <div className="rounded-3xl border border-slate-100 bg-white shadow-sm">
      {/* Hijri date banner */}
      {hijriDate && (
        <div className="flex items-center justify-center gap-2 rounded-t-3xl bg-gradient-to-r from-amber-50 to-amber-100/50 px-4 py-2.5">
          <CalendarIcon size={14} className="text-amber-600" />
          <span className="text-xs font-bold text-amber-800">{hijriDate}</span>
        </div>
      )}

      <div className="p-5">
        <p className="mb-4 text-center text-sm text-slate-500">
          {dayName},{" "}
          {new Date(todayDateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

        {/* Prayer times — horizontal scroll on mobile, grid on desktop */}
        <div className="stagger-fade-in scrollbar-hide -mx-1 flex gap-2 overflow-x-auto pb-1 md:grid md:grid-cols-4 md:overflow-visible">
          {PRAYER_KEYS.map((key, idx) => {
            const isActive = idx === currentPrayerIdx;
            const time = todaySchedule[key];
            const Icon = PRAYER_ICON_MAP[key];

            return (
              <div
                key={key}
                className={`flex min-w-[88px] shrink-0 cursor-default flex-col items-center gap-1.5 rounded-2xl px-3 py-3 transition-all duration-200 md:min-w-0 ${
                  isActive
                    ? "animate-pulse-glow bg-gradient-to-b from-amber-50 to-amber-100/80 ring-2 ring-amber-300/50"
                    : "bg-slate-50 hover:-translate-y-0.5 hover:bg-slate-100/80"
                }`}
              >
                {Icon && (
                  <Icon
                    size={18}
                    className={isActive ? "text-amber-600" : "text-slate-400"}
                  />
                )}
                <p
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    isActive ? "text-amber-700" : "text-slate-400"
                  }`}
                >
                  {PRAYER_NAMES[idx]}
                </p>
                <p
                  className={`font-mono text-base font-bold ${
                    isActive ? "text-amber-800" : "text-slate-700"
                  }`}
                >
                  {time}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
