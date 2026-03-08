import { describe, it, expect } from "vitest";
import {
  getLocalDate,
  getDateStr,
  getTodaySchedule,
  getTomorrowSchedule,
  parseTimeToSeconds,
  getNextPrayerCyclic,
  formatCountdown,
} from "./countdown-helpers";
import { ScheduleDay } from "@/types";

function makeScheduleDay(date: string, times?: Partial<ScheduleDay>): ScheduleDay {
  return {
    tanggal: "",
    date,
    imsak: "04:30",
    subuh: "04:40",
    terbit: "05:50",
    dhuha: "06:15",
    dzuhur: "12:00",
    ashar: "15:15",
    maghrib: "18:05",
    isya: "19:15",
    ...times,
  };
}

describe("getLocalDate", () => {
  it("adds UTC offset to UTC midnight", () => {
    const utcMidnight = new Date("2026-03-08T00:00:00Z");
    const local = getLocalDate(utcMidnight, 7);
    expect(local.getUTCHours()).toBe(7);
  });

  it("handles WIT offset (UTC+9)", () => {
    const utcMidnight = new Date("2026-03-08T00:00:00Z");
    const local = getLocalDate(utcMidnight, 9);
    expect(local.getUTCHours()).toBe(9);
  });
});

describe("getDateStr", () => {
  it("returns YYYY-MM-DD format", () => {
    const date = new Date("2026-03-08T12:00:00Z");
    expect(getDateStr(date)).toBe("2026-03-08");
  });

  it("pads single digit months and days", () => {
    const date = new Date("2026-01-05T12:00:00Z");
    expect(getDateStr(date)).toBe("2026-01-05");
  });
});

describe("getTodaySchedule", () => {
  const schedules = [
    makeScheduleDay("2026-03-08"),
    makeScheduleDay("2026-03-09"),
  ];

  it("returns schedule matching today", () => {
    // 2026-03-08 05:00 WIB = 2026-03-07 22:00 UTC
    const now = new Date("2026-03-07T22:00:00Z");
    const result = getTodaySchedule(schedules, now, 7);
    expect(result?.date).toBe("2026-03-08");
  });

  it("returns null when no schedule matches", () => {
    const now = new Date("2026-03-10T00:00:00Z");
    const result = getTodaySchedule(schedules, now, 7);
    expect(result).toBeNull();
  });
});

describe("getTomorrowSchedule", () => {
  const schedules = [
    makeScheduleDay("2026-03-08"),
    makeScheduleDay("2026-03-09"),
  ];

  it("returns schedule for the next day", () => {
    const now = new Date("2026-03-07T22:00:00Z"); // 2026-03-08 WIB
    const result = getTomorrowSchedule(schedules, now, 7);
    expect(result?.date).toBe("2026-03-09");
  });

  it("returns null when tomorrow is not in array", () => {
    const now = new Date("2026-03-08T22:00:00Z"); // 2026-03-09 WIB
    const result = getTomorrowSchedule(schedules, now, 7);
    expect(result).toBeNull();
  });
});

describe("parseTimeToSeconds", () => {
  it("returns 0 for 00:00", () => {
    expect(parseTimeToSeconds("00:00")).toBe(0);
  });

  it("returns 3600 for 01:00", () => {
    expect(parseTimeToSeconds("01:00")).toBe(3600);
  });

  it("returns 19800 for 05:30", () => {
    expect(parseTimeToSeconds("05:30")).toBe(19800);
  });

  it("returns 86340 for 23:59", () => {
    expect(parseTimeToSeconds("23:59")).toBe(86340);
  });
});

describe("getNextPrayerCyclic", () => {
  const schedules = [
    makeScheduleDay("2026-03-08"),
    makeScheduleDay("2026-03-09"),
  ];

  it("returns next upcoming prayer when some remain today", () => {
    // 2026-03-08 10:00 WIB = 03:00 UTC
    const now = new Date("2026-03-08T03:00:00Z");
    const result = getNextPrayerCyclic(schedules, now, 7);
    expect(result).not.toBeNull();
    expect(result!.name).toBe("Dzuhur"); // 12:00 is next after 10:00
    expect(result!.remainingMs).toBeGreaterThan(0);
  });

  it("returns tomorrow Imsak when all today's prayers passed", () => {
    // 2026-03-08 20:00 WIB = 13:00 UTC (after Isya 19:15)
    const now = new Date("2026-03-08T13:00:00Z");
    const result = getNextPrayerCyclic(schedules, now, 7);
    expect(result).not.toBeNull();
    expect(result!.name).toBe("Imsak");
    expect(result!.isTomorrow).toBe(true);
  });

  it("returns null at end of month (no tomorrow data)", () => {
    const singleDay = [makeScheduleDay("2026-03-08")];
    // After all prayers on the last day
    const now = new Date("2026-03-08T13:00:00Z");
    const result = getNextPrayerCyclic(singleDay, now, 7);
    expect(result).toBeNull();
  });

  it("calculates correct remainingMs", () => {
    // 2026-03-08 04:00 WIB = 2026-03-07 21:00 UTC
    const now = new Date("2026-03-07T21:00:00Z");
    const result = getNextPrayerCyclic(schedules, now, 7);
    expect(result).not.toBeNull();
    expect(result!.name).toBe("Imsak"); // 04:30 is next after 04:00
    // 30 minutes = 1800 seconds = 1800000 ms
    expect(result!.remainingMs).toBe(1800000);
  });

  it("returns next prayer when exactly at a prayer time", () => {
    // At exactly 04:30 (Imsak time), should return Subuh (04:40)
    // 04:30 WIB = 2026-03-07 21:30 UTC
    const now = new Date("2026-03-07T21:30:00Z");
    const result = getNextPrayerCyclic(schedules, now, 7);
    expect(result).not.toBeNull();
    // At exactly 04:30, prayerTotalSeconds === currentTotalSeconds, so it's NOT > so Imsak is skipped
    expect(result!.name).toBe("Subuh");
  });
});

describe("formatCountdown", () => {
  it("returns all zeros for 0 or negative", () => {
    expect(formatCountdown(0)).toEqual({ hours: "00", minutes: "00", seconds: "00" });
    expect(formatCountdown(-1000)).toEqual({ hours: "00", minutes: "00", seconds: "00" });
  });

  it("formats 1.5 hours correctly", () => {
    expect(formatCountdown(5400000)).toEqual({ hours: "01", minutes: "30", seconds: "00" });
  });

  it("pads single digits", () => {
    // 5 minutes and 9 seconds = 309000 ms
    expect(formatCountdown(309000)).toEqual({ hours: "00", minutes: "05", seconds: "09" });
  });

  it("handles large values", () => {
    // 12 hours, 34 minutes, 56 seconds
    const ms = (12 * 3600 + 34 * 60 + 56) * 1000;
    expect(formatCountdown(ms)).toEqual({ hours: "12", minutes: "34", seconds: "56" });
  });
});
