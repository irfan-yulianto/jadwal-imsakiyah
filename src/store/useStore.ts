"use client";

import { create } from "zustand";
import { CustomHeader, Location, ScheduleDay, TimezoneLabel } from "@/types";
import { DEFAULT_LOCATION } from "@/lib/constants";

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

  // Schedule
  schedule: ScheduleState;
  setSchedule: (data: ScheduleDay[]) => void;
  setScheduleLoading: (loading: boolean) => void;
  setScheduleError: (error: string | null) => void;

  // Custom header for PDF/Image
  customHeader: CustomHeader;
  setCustomHeader: (header: Partial<CustomHeader>) => void;

  // Server time offset (ms)
  timeOffset: number;
  setTimeOffset: (offset: number) => void;

  // Offline mode indicator
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
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

  // Schedule
  schedule: { data: [], loading: false, error: null },
  setSchedule: (data) =>
    set({ schedule: { data, loading: false, error: null } }),
  setScheduleLoading: (loading) =>
    set((state) => ({ schedule: { ...state.schedule, loading, error: null } })),
  setScheduleError: (error) =>
    set((state) => ({ schedule: { ...state.schedule, loading: false, error } })),

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
}));
