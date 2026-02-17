"use client";

import { useState, useEffect, useCallback } from "react";
import { useStore } from "@/store/useStore";
import { syncServerTime, getAdjustedTime } from "@/lib/time";
import { getUtcOffset } from "@/lib/timezone";
import { PrayerName, PRAYER_NAMES, PRAYER_KEYS } from "@/types";
import { ScheduleDay } from "@/types";
import { PRAYER_ICON_MAP, MapPinIcon } from "@/components/ui/Icons";

interface NextPrayer {
  name: PrayerName;
  key: string;
  time: string;
  remainingMs: number;
}

function getTodaySchedule(
  schedules: ScheduleDay[],
  now: Date,
  utcOffset: number
): ScheduleDay | null {
  const localTime = new Date(now.getTime() + utcOffset * 3600000);
  const dateStr = localTime.toISOString().split("T")[0];
  return schedules.find((s) => s.date === dateStr) || null;
}

function getNextPrayer(
  schedule: ScheduleDay,
  now: Date,
  utcOffset: number
): NextPrayer | null {
  const localTime = new Date(now.getTime() + utcOffset * 3600000);
  const localHours = localTime.getUTCHours();
  const localMinutes = localTime.getUTCMinutes();
  const localSeconds = localTime.getUTCSeconds();
  const currentTotalSeconds = localHours * 3600 + localMinutes * 60 + localSeconds;

  for (let i = 0; i < PRAYER_KEYS.length; i++) {
    const key = PRAYER_KEYS[i];
    const timeStr = schedule[key];
    if (!timeStr) continue;

    const [h, m] = timeStr.split(":").map(Number);
    const prayerTotalSeconds = h * 3600 + m * 60;

    if (prayerTotalSeconds > currentTotalSeconds) {
      const remainingMs = (prayerTotalSeconds - currentTotalSeconds) * 1000;
      return { name: PRAYER_NAMES[i], key, time: timeStr, remainingMs };
    }
  }

  return null;
}

function formatCountdown(ms: number): { hours: string; minutes: string; seconds: string } {
  if (ms <= 0) return { hours: "00", minutes: "00", seconds: "00" };
  const totalSeconds = Math.floor(ms / 1000);
  return {
    hours: String(Math.floor(totalSeconds / 3600)).padStart(2, "0"),
    minutes: String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0"),
    seconds: String(totalSeconds % 60).padStart(2, "0"),
  };
}

export default function CountdownTimer() {
  const { schedule, location, timeOffset, setTimeOffset } = useStore();
  const [nextPrayer, setNextPrayer] = useState<NextPrayer | null>(null);
  const [time, setTime] = useState({ hours: "--", minutes: "--", seconds: "--" });

  useEffect(() => {
    syncServerTime().then(setTimeOffset);
  }, [setTimeOffset]);

  const utcOffset = getUtcOffset(location.timezone);

  const computeNextPrayer = useCallback(() => {
    if (schedule.data.length === 0) return;
    const now = getAdjustedTime(timeOffset);
    const todaySchedule = getTodaySchedule(schedule.data, now, utcOffset);
    if (!todaySchedule) {
      setNextPrayer(null);
      return;
    }
    const next = getNextPrayer(todaySchedule, now, utcOffset);
    if (next) {
      setNextPrayer(next);
      setTime(formatCountdown(next.remainingMs));
    } else {
      setNextPrayer(null);
      setTime({ hours: "--", minutes: "--", seconds: "--" });
    }
  }, [schedule.data, timeOffset, utcOffset]);

  useEffect(() => {
    computeNextPrayer();
    const interval = setInterval(computeNextPrayer, 1000);
    return () => clearInterval(interval);
  }, [computeNextPrayer]);

  const PrayerIcon = nextPrayer ? PRAYER_ICON_MAP[nextPrayer.key] : null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-green-800 to-teal-800 p-6 text-white shadow-xl shadow-green-900/20 md:p-8">
      {/* Decorative mosque silhouette */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
        <svg viewBox="0 0 800 400" className="absolute bottom-0 left-0 h-full w-full" preserveAspectRatio="xMidYMax slice">
          <path d="M0,400 L0,300 Q50,280 100,300 L100,250 Q125,180 150,250 L150,300 Q200,280 250,300 L250,200 Q300,50 350,200 L350,180 Q400,30 450,180 L450,200 Q500,50 550,200 L550,300 Q600,280 650,300 L650,250 Q675,180 700,250 L700,300 Q750,280 800,300 L800,400 Z" fill="currentColor"/>
        </svg>
      </div>

      {/* Geometric pattern overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M20 0l4 8h-8zM0 20l8-4v8zM40 20l-8 4v-8zM20 40l-4-8h8z'/%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="relative z-10">
        {/* Location badge */}
        <div className="mb-4 flex items-center gap-1.5">
          <MapPinIcon size={14} className="text-green-300" />
          <span className="text-xs font-medium text-green-300">
            {location.cityName}, {location.province}
          </span>
          <span className="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-green-200">
            {location.timezone}
          </span>
        </div>

        {nextPrayer ? (
          <div className="text-center">
            <div className="mb-3 flex items-center justify-center gap-2">
              {PrayerIcon && <PrayerIcon size={20} className="text-amber-300" />}
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-200">
                Menuju Waktu {nextPrayer.name}
              </p>
            </div>

            {/* Countdown digits */}
            <div className="flex items-center justify-center gap-2 md:gap-3">
              <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm md:px-6 md:py-4">
                <span className="font-mono text-4xl font-extrabold tracking-tight md:text-6xl">
                  {time.hours}
                </span>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-green-300">Jam</p>
              </div>
              <span className="animate-countdown-pulse font-mono text-3xl font-bold text-green-300 md:text-5xl">:</span>
              <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm md:px-6 md:py-4">
                <span className="font-mono text-4xl font-extrabold tracking-tight md:text-6xl">
                  {time.minutes}
                </span>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-green-300">Menit</p>
              </div>
              <span className="animate-countdown-pulse font-mono text-3xl font-bold text-green-300 md:text-5xl">:</span>
              <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm md:px-6 md:py-4">
                <span className="font-mono text-4xl font-extrabold tracking-tight md:text-6xl">
                  {time.seconds}
                </span>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-green-300">Detik</p>
              </div>
            </div>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-4 py-1.5">
              <span className="text-sm font-bold text-amber-300">
                {nextPrayer.time} {location.timezone}
              </span>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-300">
              Waktu Sholat Hari Ini
            </p>
            <p className="mt-3 text-lg font-medium text-green-100">
              Semua waktu sholat telah berlalu
            </p>
            <p className="mt-1 text-sm text-green-300/70">
              Jadwal akan diperbarui esok hari
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
