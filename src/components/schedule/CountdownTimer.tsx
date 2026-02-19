"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  isTomorrow?: boolean;
}

function getLocalDate(now: Date, utcOffset: number): Date {
  return new Date(now.getTime() + utcOffset * 3600000);
}

function getDateStr(localTime: Date): string {
  return localTime.toISOString().split("T")[0];
}

function getTodaySchedule(
  schedules: ScheduleDay[],
  now: Date,
  utcOffset: number
): ScheduleDay | null {
  const dateStr = getDateStr(getLocalDate(now, utcOffset));
  return schedules.find((s) => s.date === dateStr) || null;
}

function getTomorrowSchedule(
  schedules: ScheduleDay[],
  now: Date,
  utcOffset: number
): ScheduleDay | null {
  const localTime = getLocalDate(now, utcOffset);
  const tomorrow = new Date(localTime);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const dateStr = getDateStr(tomorrow);
  return schedules.find((s) => s.date === dateStr) || null;
}

function parseTimeToSeconds(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 3600 + m * 60;
}

function getNextPrayerCyclic(
  schedules: ScheduleDay[],
  now: Date,
  utcOffset: number
): NextPrayer | null {
  const localTime = getLocalDate(now, utcOffset);
  const localHours = localTime.getUTCHours();
  const localMinutes = localTime.getUTCMinutes();
  const localSeconds = localTime.getUTCSeconds();
  const currentTotalSeconds = localHours * 3600 + localMinutes * 60 + localSeconds;

  const todaySchedule = getTodaySchedule(schedules, now, utcOffset);

  // Try today's remaining prayers
  if (todaySchedule) {
    for (let i = 0; i < PRAYER_KEYS.length; i++) {
      const key = PRAYER_KEYS[i];
      const timeStr = todaySchedule[key];
      if (!timeStr) continue;

      const prayerTotalSeconds = parseTimeToSeconds(timeStr);
      if (prayerTotalSeconds > currentTotalSeconds) {
        const remainingMs = (prayerTotalSeconds - currentTotalSeconds) * 1000;
        return { name: PRAYER_NAMES[i], key, time: timeStr, remainingMs };
      }
    }
  }

  // All today's prayers passed → countdown to tomorrow's Imsak
  const tomorrowSchedule = getTomorrowSchedule(schedules, now, utcOffset);
  if (tomorrowSchedule && tomorrowSchedule.imsak) {
    const tomorrowImsakSeconds = parseTimeToSeconds(tomorrowSchedule.imsak);
    const secondsLeftToday = 86400 - currentTotalSeconds;
    const remainingMs = (secondsLeftToday + tomorrowImsakSeconds) * 1000;
    return {
      name: "Imsak",
      key: "imsak",
      time: tomorrowSchedule.imsak,
      remainingMs,
      isTomorrow: true,
    };
  }

  // No tomorrow data (end of month) → return null to trigger refetch
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
  const countdownSchedule = useStore((s) => s.countdownSchedule);
  const location = useStore((s) => s.location);
  const timeOffset = useStore((s) => s.timeOffset);
  const setTimeOffset = useStore((s) => s.setTimeOffset);
  const refetchSchedule = useStore((s) => s.refetchSchedule);
  const [nextPrayer, setNextPrayer] = useState<NextPrayer | null>(null);
  const [time, setTime] = useState({ hours: "--", minutes: "--", seconds: "--" });
  const [loadError, setLoadError] = useState(false);
  const lastDateRef = useRef<string>("");
  const refetchingRef = useRef(false);
  const refetchCountRef = useRef(0);
  const nextPrayerRef = useRef<NextPrayer | null>(null);

  useEffect(() => {
    syncServerTime().then(setTimeOffset).catch(() => {});
  }, [setTimeOffset]);

  const utcOffset = getUtcOffset(location.timezone);

  // Recompute which prayer is next (only when schedule/offset changes or date rolls over)
  useEffect(() => {
    // Reset stale ref immediately on schedule change (e.g. city switch)
    nextPrayerRef.current = null;
    if (countdownSchedule.length === 0) return;

    function checkAndRefetch() {
      const now = getAdjustedTime(timeOffset);
      const localTime = getLocalDate(now, utcOffset);
      const currentDateStr = getDateStr(localTime);

      if (lastDateRef.current && lastDateRef.current !== currentDateStr && !refetchingRef.current) {
        const tomorrowSchedule = getTomorrowSchedule(countdownSchedule, now, utcOffset);
        if (!tomorrowSchedule) {
          refetchingRef.current = true;
          refetchSchedule().finally(() => {
            refetchingRef.current = false;
          });
        }
      }
      lastDateRef.current = currentDateStr;

      const next = getNextPrayerCyclic(countdownSchedule, now, utcOffset);
      if (next) {
        refetchCountRef.current = 0;
        setLoadError(false);
        nextPrayerRef.current = next;
        setNextPrayer(next);
        setTime(formatCountdown(next.remainingMs));
      } else if (!refetchingRef.current && refetchCountRef.current < 3) {
        refetchingRef.current = true;
        refetchCountRef.current += 1;
        refetchSchedule().finally(() => {
          refetchingRef.current = false;
        });
      } else if (refetchCountRef.current >= 3) {
        setLoadError(true);
      }
    }

    checkAndRefetch();
    // Re-check every 30s for prayer transitions and date changes
    const interval = setInterval(checkAndRefetch, 30000);
    return () => clearInterval(interval);
  }, [countdownSchedule, timeOffset, utcOffset, refetchSchedule]);

  // Fast countdown tick — only updates display, no state recalculation
  useEffect(() => {
    const interval = setInterval(() => {
      const ref = nextPrayerRef.current;
      if (!ref) return;
      const now = getAdjustedTime(timeOffset);
      const localTime = getLocalDate(now, utcOffset);
      const localHours = localTime.getUTCHours();
      const localMinutes = localTime.getUTCMinutes();
      const localSeconds = localTime.getUTCSeconds();
      const currentTotalSeconds = localHours * 3600 + localMinutes * 60 + localSeconds;
      const prayerTotalSeconds = parseTimeToSeconds(ref.time);

      let remainingMs: number;
      if (ref.isTomorrow) {
        const secondsLeftToday = 86400 - currentTotalSeconds;
        remainingMs = (secondsLeftToday + prayerTotalSeconds) * 1000;
      } else {
        remainingMs = (prayerTotalSeconds - currentTotalSeconds) * 1000;
      }

      if (remainingMs <= 0) {
        // Prayer time reached — force recomputation on next 30s tick
        return;
      }
      setTime(formatCountdown(remainingMs));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeOffset, utcOffset]);

  const PrayerIcon = nextPrayer ? PRAYER_ICON_MAP[nextPrayer.key] : null;

  return (
    <div role="timer" aria-label="Countdown waktu sholat" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 via-green-800 to-teal-800 p-4 text-white shadow-xl shadow-green-900/20 md:p-6">
      {/* Geometric pattern overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M20 0l4 8h-8zM0 20l8-4v8zM40 20l-8 4v-8zM20 40l-4-8h8z'/%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="relative z-10">
        {/* Location badge */}
        <div className="mb-3 flex items-center gap-1.5">
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
            <div className="mb-2 flex items-center justify-center gap-2">
              {PrayerIcon && <PrayerIcon size={18} className="text-amber-300" />}
              <p aria-live="polite" className="text-[11px] font-bold uppercase tracking-[0.2em] text-green-200">
                {nextPrayer.isTomorrow ? "Menuju Imsak Besok" : `Menuju Waktu ${nextPrayer.name}`}
              </p>
            </div>

            {/* Countdown digits */}
            <div className="flex items-center justify-center gap-1.5 md:gap-2">
              <div className="rounded-xl bg-white/10 px-3 py-2 backdrop-blur-sm md:px-5 md:py-3">
                <span className="font-mono text-3xl font-extrabold tracking-tight md:text-5xl">
                  {time.hours}
                </span>
                <p className="mt-0.5 text-[9px] font-medium uppercase tracking-wider text-green-300">Jam</p>
              </div>
              <span className="animate-countdown-pulse font-mono text-2xl font-bold text-green-300 md:text-4xl">:</span>
              <div className="rounded-xl bg-white/10 px-3 py-2 backdrop-blur-sm md:px-5 md:py-3">
                <span className="font-mono text-3xl font-extrabold tracking-tight md:text-5xl">
                  {time.minutes}
                </span>
                <p className="mt-0.5 text-[9px] font-medium uppercase tracking-wider text-green-300">Menit</p>
              </div>
              <span className="animate-countdown-pulse font-mono text-2xl font-bold text-green-300 md:text-4xl">:</span>
              <div className="rounded-xl bg-white/10 px-3 py-2 backdrop-blur-sm md:px-5 md:py-3">
                <span className="font-mono text-3xl font-extrabold tracking-tight md:text-5xl">
                  {time.seconds}
                </span>
                <p className="mt-0.5 text-[9px] font-medium uppercase tracking-wider text-green-300">Detik</p>
              </div>
            </div>

            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1">
              <span className="text-sm font-bold text-amber-300">
                {nextPrayer.time} {location.timezone}
              </span>
            </div>
          </div>
        ) : (
          <div className="py-3 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-green-300">
              {loadError ? "Jadwal Tidak Tersedia" : "Memuat Jadwal..."}
            </p>
            {loadError ? (
              <p className="mt-2 text-[10px] text-green-400/70">
                Coba pilih lokasi atau periksa koneksi internet
              </p>
            ) : (
              <div className="mt-3 flex justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-green-300 border-t-transparent" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
