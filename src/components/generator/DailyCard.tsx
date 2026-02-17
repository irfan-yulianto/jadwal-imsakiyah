"use client";

import { forwardRef } from "react";
import { ScheduleDay, PRAYER_NAMES, PRAYER_KEYS } from "@/types";
import { getHijriDate } from "@/lib/hijri";

interface DailyCardProps {
  schedule: ScheduleDay;
  cityName: string;
  timezone: string;
  mosqueName?: string;
}

const DailyCard = forwardRef<HTMLDivElement, DailyCardProps>(
  ({ schedule, cityName, timezone, mosqueName }, ref) => {
    const hijri = getHijriDate(schedule.date);
    const dayName = schedule.tanggal?.split(",")[0] || "";
    const dateFormatted = new Date(schedule.date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return (
      <div
        ref={ref}
        style={{ width: 1080, height: 1920, fontFamily: "system-ui, -apple-system, sans-serif" }}
        className="relative flex flex-col items-center justify-between overflow-hidden bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 p-16 text-white"
      >
        {/* Mosque silhouette background */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.05]">
          <svg viewBox="0 0 1080 1920" className="h-full w-full" preserveAspectRatio="xMidYMax slice">
            <path d="M0,1920 L0,1600 Q100,1560 200,1600 L200,1500 Q250,1350 300,1500 L300,1600 Q400,1560 500,1600 L500,1300 Q540,1000 580,1300 L580,1200 Q620,900 660,1200 L660,1300 Q700,1000 740,1300 L740,1600 Q840,1560 940,1600 L940,1500 Q990,1350 1040,1500 L1040,1600 Q1060,1560 1080,1600 L1080,1920 Z" fill="white"/>
          </svg>
        </div>

        {/* Geometric pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M40 0l8 16h-16zM0 40l16-8v16zM80 40l-16 8v-16zM40 80l-8-16h16z'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        {/* Top: Mosque name + Title */}
        <div className="relative z-10 w-full text-center">
          {mosqueName && (
            <p className="mb-6 text-[30px] font-medium tracking-wide text-green-300">
              {mosqueName}
            </p>
          )}
          <div className="mx-auto mb-6 h-[2px] w-48 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
          <h1 className="text-[52px] font-extrabold leading-tight tracking-tight">
            Jadwal Imsakiyah
          </h1>
          <p className="mt-3 text-[28px] font-medium text-amber-300">
            Ramadan 1447H / 2026M
          </p>
        </div>

        {/* Middle: Date */}
        <div className="relative z-10 w-full text-center">
          <div className="mx-auto mb-6 h-[2px] w-32 bg-gradient-to-r from-transparent via-green-400/50 to-transparent" />
          <p className="text-[40px] font-bold">{dayName}</p>
          <p className="mt-2 text-[28px] text-green-200">{dateFormatted}</p>
          {hijri && (
            <p className="mt-2 text-[28px] font-semibold text-amber-300">
              {hijri}
            </p>
          )}
          <div className="mx-auto mt-6 h-[2px] w-32 bg-gradient-to-r from-transparent via-green-400/50 to-transparent" />
        </div>

        {/* Prayer times */}
        <div className="relative z-10 w-full space-y-4 px-6">
          {PRAYER_KEYS.map((key, idx) => {
            const isImsak = key === "imsak";
            return (
              <div
                key={key}
                className={`flex items-center justify-between rounded-2xl px-10 py-5 ${
                  isImsak
                    ? "bg-amber-500/20 ring-2 ring-amber-400/30"
                    : "bg-white/8"
                }`}
              >
                <span className={`text-[30px] font-semibold ${isImsak ? "text-amber-200" : "text-green-100"}`}>
                  {PRAYER_NAMES[idx]}
                </span>
                <span className={`font-mono text-[38px] font-bold ${isImsak ? "text-amber-300" : "text-white"}`}>
                  {schedule[key]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bottom */}
        <div className="relative z-10 w-full text-center">
          <p className="text-[22px] font-medium text-green-300">
            {cityName} ({timezone})
          </p>
          <div className="mx-auto my-3 h-[1px] w-24 bg-green-500/30" />
          <p className="text-[16px] text-green-500">
            Sumber: Bimas Islam Kemenag RI
          </p>
        </div>
      </div>
    );
  }
);

DailyCard.displayName = "DailyCard";

export default DailyCard;
