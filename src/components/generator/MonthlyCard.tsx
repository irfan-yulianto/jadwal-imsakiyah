"use client";

import { forwardRef } from "react";
import { ScheduleDay } from "@/types";
import { getHijriDate } from "@/lib/hijri";

interface MonthlyCardProps {
  scheduleData: ScheduleDay[];
  cityName: string;
  province: string;
  timezone: string;
  mosqueName?: string;
}

const PRAYER_COLS = ["Imsak", "Subuh", "Terbit", "Dhuha", "Dzuhur", "Ashar", "Maghrib", "Isya"];

const MonthlyCard = forwardRef<HTMLDivElement, MonthlyCardProps>(
  ({ scheduleData, cityName, province, timezone, mosqueName }, ref) => {
    return (
      <div
        ref={ref}
        style={{ width: 2480, height: 3508, fontFamily: "system-ui, -apple-system, sans-serif" }}
        className="relative flex flex-col bg-white p-16"
      >
        {/* Gold accent line at top */}
        <div className="mb-8 h-[6px] w-full rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400" />

        {/* Header */}
        <div className="mb-10 text-center">
          {mosqueName && (
            <p className="mb-3 text-[44px] font-bold text-emerald-800">
              {mosqueName}
            </p>
          )}
          <h1 className="text-[54px] font-extrabold tracking-tight text-slate-900">
            JADWAL IMSAKIYAH
          </h1>
          <p className="mt-2 text-[34px] font-bold text-amber-600">
            RAMADAN 1447H / 2026M
          </p>
          <p className="mt-3 text-[26px] text-slate-400">
            {cityName}, {province} ({timezone})
          </p>
          <div className="mx-auto mt-6 h-[3px] w-64 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
        </div>

        {/* Table */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex rounded-t-2xl bg-gradient-to-r from-emerald-800 to-green-800 text-white">
            <div className="w-[4%] p-4 text-center text-[20px] font-bold">No</div>
            <div className="w-[7%] p-4 text-center text-[20px] font-bold">Hari</div>
            <div className="w-[11%] p-4 text-center text-[20px] font-bold">Tgl</div>
            {PRAYER_COLS.map((name, i) => (
              <div
                key={name}
                className={`w-[9.75%] p-4 text-center text-[20px] font-bold ${
                  i === 0 ? "bg-amber-600/30" : ""
                }`}
              >
                {name}
              </div>
            ))}
          </div>

          {/* Rows */}
          {scheduleData.map((day, idx) => {
            const dayName = day.tanggal?.split(",")[0] || "";
            const dateNum = day.date?.split("-")[2] || "";
            const hijri = getHijriDate(day.date);
            const hijriDay = hijri ? hijri.split(" ")[0] : "";

            return (
              <div
                key={day.date}
                className={`flex border-b border-slate-100 ${
                  idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                }`}
              >
                <div className="w-[4%] p-3 text-center text-[18px] text-slate-400">
                  {idx + 1}
                </div>
                <div className="w-[7%] p-3 text-center text-[18px] text-slate-600">
                  {dayName.substring(0, 3)}
                </div>
                <div className="w-[11%] p-3 text-center text-[18px]">
                  <span className="font-semibold text-slate-800">{dateNum}</span>
                  {hijriDay && (
                    <span className="ml-2 text-[15px] font-medium text-emerald-500">
                      ({hijriDay})
                    </span>
                  )}
                </div>
                {[day.imsak, day.subuh, day.terbit, day.dhuha, day.dzuhur, day.ashar, day.maghrib, day.isya].map(
                  (time, i) => (
                    <div
                      key={i}
                      className={`w-[9.75%] p-3 text-center font-mono text-[18px] ${
                        i === 0
                          ? "bg-amber-50/70 font-bold text-amber-800"
                          : "text-slate-700"
                      }`}
                    >
                      {time}
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-8">
          <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          <p className="mt-4 text-center text-[20px] text-slate-400">
            Sumber: Bimas Islam Kemenag RI &bull; Si-Imsak &mdash; Jadwal Imsakiyah Ramadan 1447H
          </p>
        </div>
      </div>
    );
  }
);

MonthlyCard.displayName = "MonthlyCard";

export default MonthlyCard;
