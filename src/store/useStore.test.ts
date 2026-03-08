import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies before importing store
vi.mock("@/lib/api", () => ({
  getSchedule: vi.fn(),
}));

vi.mock("@/lib/timezone", () => ({
  getTimezone: vi.fn((d: string) => {
    if (d.includes("BALI")) return "WITA";
    if (d.includes("PAPUA")) return "WIT";
    return "WIB";
  }),
}));

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("useStore", () => {
  it("initializes with default Jakarta location when no cache", async () => {
    const { useStore } = await import("./useStore");
    const state = useStore.getState();
    expect(state.location.cityId).toBe("58a2fc6ed39fd083f55d4182bf88826d");
    expect(state.location.cityName).toBe("KOTA JAKARTA");
  });

  it("hydrates location from localStorage cache", async () => {
    localStorage.setItem(
      "selectedLocation",
      JSON.stringify({ id: "test-id", lokasi: "KOTA BALI", daerah: "BALI" })
    );
    const { useStore } = await import("./useStore");
    const state = useStore.getState();
    expect(state.location.cityId).toBe("test-id");
    expect(state.location.cityName).toBe("KOTA BALI");
  });

  it("returns default location when cached data is invalid JSON", async () => {
    localStorage.setItem("selectedLocation", "not-json{{{");
    const { useStore } = await import("./useStore");
    const state = useStore.getState();
    expect(state.location.cityName).toBe("KOTA JAKARTA");
  });

  it("returns default location when cached data lacks id", async () => {
    localStorage.setItem(
      "selectedLocation",
      JSON.stringify({ lokasi: "KOTA BALI", daerah: "BALI" })
    );
    const { useStore } = await import("./useStore");
    const state = useStore.getState();
    expect(state.location.cityName).toBe("KOTA JAKARTA");
  });

  it("setLocation updates location state", async () => {
    const { useStore } = await import("./useStore");
    useStore.getState().setLocation(
      { id: "new-id", lokasi: "KOTA SURABAYA", daerah: "JAWA TIMUR" },
      "WIB"
    );
    expect(useStore.getState().location.cityId).toBe("new-id");
    expect(useStore.getState().location.cityName).toBe("KOTA SURABAYA");
  });

  it("setSchedule sets data and clears loading/error", async () => {
    const { useStore } = await import("./useStore");
    useStore.getState().setScheduleLoading(true);
    useStore.getState().setSchedule([{ date: "2026-03-01" } as never]);
    const schedule = useStore.getState().schedule;
    expect(schedule.data).toHaveLength(1);
    expect(schedule.loading).toBe(false);
    expect(schedule.error).toBeNull();
  });

  it("setScheduleLoading sets loading flag", async () => {
    const { useStore } = await import("./useStore");
    useStore.getState().setScheduleLoading(true);
    expect(useStore.getState().schedule.loading).toBe(true);
  });

  it("setScheduleError sets error and clears loading", async () => {
    const { useStore } = await import("./useStore");
    useStore.getState().setScheduleLoading(true);
    useStore.getState().setScheduleError("Something went wrong");
    const schedule = useStore.getState().schedule;
    expect(schedule.error).toBe("Something went wrong");
    expect(schedule.loading).toBe(false);
  });

  it("setViewMonth updates viewMonth and viewYear", async () => {
    const { useStore } = await import("./useStore");
    useStore.getState().setViewMonth(6, 2025);
    expect(useStore.getState().viewMonth).toBe(6);
    expect(useStore.getState().viewYear).toBe(2025);
  });

  it("setTimeOffset updates timeOffset", async () => {
    const { useStore } = await import("./useStore");
    useStore.getState().setTimeOffset(1500);
    expect(useStore.getState().timeOffset).toBe(1500);
  });

  it("setTheme stores to localStorage and toggles dark class", async () => {
    const { useStore } = await import("./useStore");
    useStore.getState().setTheme("light");
    expect(useStore.getState().theme).toBe("light");
    expect(localStorage.getItem("theme")).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    useStore.getState().setTheme("dark");
    expect(useStore.getState().theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("setCountdownSchedule updates countdownSchedule", async () => {
    const { useStore } = await import("./useStore");
    useStore.getState().setCountdownSchedule([{ date: "2026-03-01" } as never]);
    expect(useStore.getState().countdownSchedule).toHaveLength(1);
  });

  it("setIsOffline updates isOffline", async () => {
    const { useStore } = await import("./useStore");
    useStore.getState().setIsOffline(true);
    expect(useStore.getState().isOffline).toBe(true);
  });

  it("setUserCoords updates userCoords", async () => {
    const { useStore } = await import("./useStore");
    useStore.getState().setUserCoords({ lat: -6.17, lng: 106.85 });
    expect(useStore.getState().userCoords).toEqual({ lat: -6.17, lng: 106.85 });
  });

  describe("fetchScheduleForMonth", () => {
    it("sets loading and updates view month/year", async () => {
      const { getSchedule } = await import("@/lib/api");
      vi.mocked(getSchedule).mockResolvedValue({
        status: true,
        data: { id: "x", lokasi: "X", daerah: "X", jadwal: [] },
      });

      const { useStore } = await import("./useStore");
      await useStore.getState().fetchScheduleForMonth(2025, 6);
      expect(useStore.getState().viewMonth).toBe(6);
      expect(useStore.getState().viewYear).toBe(2025);
    });

    it("sets schedule data on success", async () => {
      const { getSchedule } = await import("@/lib/api");
      vi.mocked(getSchedule).mockResolvedValue({
        status: true,
        data: { id: "x", lokasi: "X", daerah: "X", jadwal: [{ date: "2025-06-01" } as never] },
      });

      const { useStore } = await import("./useStore");
      await useStore.getState().fetchScheduleForMonth(2025, 6);
      expect(useStore.getState().schedule.data).toHaveLength(1);
      expect(useStore.getState().schedule.loading).toBe(false);
    });

    it("sets error on failure", async () => {
      const { getSchedule } = await import("@/lib/api");
      vi.mocked(getSchedule).mockRejectedValue(new Error("fail"));

      const { useStore } = await import("./useStore");
      await useStore.getState().fetchScheduleForMonth(2025, 6);
      expect(useStore.getState().schedule.error).toBeTruthy();
      expect(useStore.getState().schedule.loading).toBe(false);
    });
  });

  describe("refetchSchedule", () => {
    it("updates countdownSchedule on success", async () => {
      const { getSchedule } = await import("@/lib/api");
      vi.mocked(getSchedule).mockResolvedValue({
        status: true,
        data: { id: "x", lokasi: "X", daerah: "X", jadwal: [{ date: "2026-03-01" } as never] },
      });

      const { useStore } = await import("./useStore");
      await useStore.getState().refetchSchedule();
      expect(useStore.getState().countdownSchedule).toHaveLength(1);
    });

    it("silently fails on error", async () => {
      const { getSchedule } = await import("@/lib/api");
      vi.mocked(getSchedule).mockRejectedValue(new Error("fail"));

      const { useStore } = await import("./useStore");
      const before = useStore.getState().countdownSchedule;
      await useStore.getState().refetchSchedule();
      expect(useStore.getState().countdownSchedule).toEqual(before);
    });
  });
});
