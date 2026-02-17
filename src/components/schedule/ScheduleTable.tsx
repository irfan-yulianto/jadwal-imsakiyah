"use client";

import { useStore } from "@/store/useStore";
import { getHijriDate } from "@/lib/hijri";
import { getAdjustedTime } from "@/lib/time";
import { getUtcOffset } from "@/lib/timezone";
import { useMemo } from "react";

const TIME_COLUMNS = [
  { key: "imsak", label: "Imsak", isImsak: true },
  { key: "subuh", label: "Subuh", isImsak: false },
  { key: "terbit", label: "Terbit", isImsak: false },
  { key: "dhuha", label: "Dhuha", isImsak: false },
  { key: "dzuhur", label: "Dzuhur", isImsak: false },
  { key: "ashar", label: "Ashar", isImsak: false },
  { key: "maghrib", label: "Maghrib", isImsak: false },
  { key: "isya", label: "Isya", isImsak: false },
] as const;

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <tr key={i} className="border-b border-slate-50">
          <td className="px-3 py-3"><div className="mx-auto h-4 w-6 animate-shimmer rounded" /></td>
          <td className="px-3 py-3"><div className="h-4 w-24 animate-shimmer rounded" /></td>
          {TIME_COLUMNS.map((col) => (
            <td key={col.key} className="px-3 py-3"><div className="mx-auto h-4 w-12 animate-shimmer rounded" /></td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function ScheduleTable() {
  const { schedule, location, timeOffset } = useStore();
  const utcOffset = getUtcOffset(location.timezone);

  const todayDate = useMemo(() => {
    const now = getAdjustedTime(timeOffset);
    const localTime = new Date(now.getTime() + utcOffset * 3600000);
    return localTime.toISOString().split("T")[0];
  }, [timeOffset, utcOffset]);

  if (schedule.error) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-600">{schedule.error}</p>
      </div>
    );
  }

  if (!schedule.loading && schedule.data.length === 0) {
    return null;
  }

  return (
    <div className="animate-fade-in rounded-3xl border border-slate-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="sticky top-0 z-10 whitespace-nowrap bg-slate-50 px-3 py-3.5 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                No
              </th>
              <th className="sticky top-0 z-10 whitespace-nowrap bg-slate-50 px-3 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Tanggal
              </th>
              {TIME_COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={`sticky top-0 z-10 whitespace-nowrap px-3 py-3.5 text-center text-[10px] font-bold uppercase tracking-widest ${
                    col.isImsak
                      ? "bg-amber-50 text-amber-700"
                      : "bg-slate-50 text-slate-400"
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedule.loading ? (
              <SkeletonRows />
            ) : (
              schedule.data.map((day, idx) => {
                const isToday = day.date === todayDate;
                const hijri = getHijriDate(day.date);
                const dayName = day.tanggal?.split(",")[0] || "";
                const dateNum = day.date.split("-")[2];
                const hijriDay = hijri ? hijri.split(" ")[0] : "";

                return (
                  <tr
                    key={day.date}
                    className={`border-b border-slate-50 transition-colors ${
                      isToday
                        ? "border-l-4 border-l-green-500 bg-green-50/80"
                        : idx % 2 === 0
                          ? "bg-white hover:bg-slate-50/50"
                          : "bg-slate-50/30 hover:bg-slate-50/70"
                    }`}
                  >
                    <td className={`px-3 py-2.5 text-center text-xs ${isToday ? "font-bold text-green-700" : "text-slate-400"}`}>
                      {idx + 1}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-medium ${isToday ? "text-green-800" : "text-slate-700"}`}>
                          {dayName.substring(0, 3)}, {dateNum}
                        </span>
                        {hijriDay && (
                          <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                            isToday ? "bg-green-200 text-green-800" : "bg-emerald-50 text-emerald-600"
                          }`}>
                            {hijriDay}
                          </span>
                        )}
                      </div>
                    </td>
                    {TIME_COLUMNS.map((col) => {
                      const value = day[col.key as keyof typeof day] as string;
                      return (
                        <td
                          key={col.key}
                          className={`px-3 py-2.5 text-center font-mono text-xs ${
                            col.isImsak
                              ? isToday
                                ? "bg-amber-100/50 font-bold text-amber-800"
                                : "bg-amber-50/30 font-semibold text-amber-700"
                              : isToday
                                ? "font-semibold text-green-800"
                                : "text-slate-600"
                          }`}
                        >
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
