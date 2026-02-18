"use client";

import { create } from "zustand";
import { CustomHeader, Location, ScheduleDay, TimezoneLabel } from "@/types";
import { DEFAULT_LOCATION } from "@/lib/constants";
import { getSchedule } from "@/lib/api";

interface LocationState {
  cityId: string;
  cityName: string;
  province: string;
  timezone: TimezoneLabel;
}

interface ScheduleState {
  data: ScheduleDay[];
  loading: boolean;
  error: string | null;
}

interface AppState {
  // Location
  location: LocationState;
  setLocation: (loc: Location & { daerah?: string }, tz: TimezoneLabel) => void;

  // Schedule (table view — user-navigated month)
  schedule: ScheduleState;
  setSchedule: (data: ScheduleDay[]) => void;
  setScheduleLoading: (loading: boolean) => void;
  setScheduleError: (error: string | null) => void;

  // Countdown schedule (always current month, separate from table)
  countdownSchedule: ScheduleDay[];
  setCountdownSchedule: (data: ScheduleDay[]) => void;

  // View month (which month the schedule table is showing)
  viewMonth: number; // 1-12
  viewYear: number;
  setViewMonth: (month: number, year: number) => void;

  // Custom header for PDF/Image
  customHeader: CustomHeader;
  setCustomHeader: (header: Partial<CustomHeader>) => void;

  // Server time offset (ms)
  timeOffset: number;
  setTimeOffset: (offset: number) => void;

  // Offline mode indicator
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;

  // Theme
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;

  // Re-fetch countdown schedule for current month (used by CountdownTimer)
  refetchSchedule: () => Promise<void>;
  // Fetch schedule for a specific month (used by table month navigation)
  fetchScheduleForMonth: (year: number, month: number) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  // Location defaults to Jakarta
  location: {
    cityId: DEFAULT_LOCATION.id,
    cityName: DEFAULT_LOCATION.lokasi,
    province: DEFAULT_LOCATION.daerah,
    timezone: "WIB",
  },
  setLocation: (loc, tz) =>
    set({
      location: {
        cityId: loc.id,
        cityName: loc.lokasi,
        province: loc.daerah || "",
        timezone: tz,
      },
    }),

  // Schedule (table view)
  schedule: { data: [], loading: false, error: null },
  setSchedule: (data) =>
    set({ schedule: { data, loading: false, error: null } }),
  setScheduleLoading: (loading) =>
    set((state) => ({ schedule: { ...state.schedule, loading, error: null } })),
  setScheduleError: (error) =>
    set((state) => ({ schedule: { ...state.schedule, loading: false, error } })),

  // Countdown schedule (always current month)
  countdownSchedule: [],
  setCountdownSchedule: (data) => set({ countdownSchedule: data }),

  // View month
  viewMonth: new Date().getMonth() + 1,
  viewYear: new Date().getFullYear(),
  setViewMonth: (month, year) => set({ viewMonth: month, viewYear: year }),

  // Custom header
  customHeader: { mosqueName: "", address: "", contact: "" },
  setCustomHeader: (header) =>
    set((state) => ({
      customHeader: { ...state.customHeader, ...header },
    })),

  // Time
  timeOffset: 0,
  setTimeOffset: (offset) => set({ timeOffset: offset }),

  // Offline
  isOffline: false,
  setIsOffline: (offline) => set({ isOffline: offline }),

  // Theme
  theme: "dark",
  setTheme: (theme) => {
    if (typeof window !== "undefined") {
      try { localStorage.setItem("theme", theme); } catch {}
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
    set({ theme });
  },

  // Re-fetch countdown schedule for current month (does NOT touch table schedule)
  refetchSchedule: async () => {
    const { location } = get();
    const now = new Date();
    try {
      const res = await getSchedule(location.cityId, now.getFullYear(), now.getMonth() + 1);
      if (res.status && res.data?.jadwal) {
        set({ countdownSchedule: res.data.jadwal });
      }
    } catch {
      // silently fail — countdown will retry next second
    }
  },

  // Fetch schedule for a specific month
  fetchScheduleForMonth: async (year, month) => {
    const { location } = get();
    set((state) => ({ schedule: { ...state.schedule, loading: true, error: null }, viewMonth: month, viewYear: year }));
    try {
      const res = await getSchedule(location.cityId, year, month);
      // Only apply result if user hasn't navigated away during fetch
      const { viewMonth, viewYear } = get();
      if (viewMonth !== month || viewYear !== year) return;
      if (res.status && res.data?.jadwal) {
        set({ schedule: { data: res.data.jadwal, loading: false, error: null } });
      } else {
        set((state) => ({ schedule: { ...state.schedule, loading: false, error: "Data tidak tersedia untuk bulan ini" } }));
      }
    } catch {
      const { viewMonth, viewYear } = get();
      if (viewMonth !== month || viewYear !== year) return;
      set((state) => ({ schedule: { ...state.schedule, loading: false, error: "Gagal memuat jadwal" } }));
    }
  },
}));
