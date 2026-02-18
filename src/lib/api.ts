import { CitySearchResponse, ScheduleResponse } from "@/types";

const API_BASE = "/api";
const REQUEST_TIMEOUT = 15000; // 15 seconds

export async function searchCities(keyword: string, signal?: AbortSignal): Promise<CitySearchResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  if (signal) signal.addEventListener("abort", () => controller.abort(), { once: true });

  try {
    const res = await fetch(`${API_BASE}/cities?q=${encodeURIComponent(keyword)}`, { signal: controller.signal });
    if (!res.ok) throw new Error("Failed to search cities");
    return res.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getSchedule(
  cityId: string,
  year: number,
  month: number
): Promise<ScheduleResponse> {
  const cacheKey = `schedule_${cityId}_${year}_${month}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const res = await fetch(
        `${API_BASE}/schedule?city_id=${cityId}&year=${year}&month=${month}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error("Failed to fetch schedule");
      const data: ScheduleResponse = await res.json();

      // Cache to localStorage for offline use (with timestamp for TTL)
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(cacheKey, JSON.stringify({ _ts: Date.now(), ...data }));
        } catch {
          // localStorage full or Safari private mode
        }
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    // Try offline fallback
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            // Reject cache older than 7 days
            if (parsed._ts && Date.now() - parsed._ts > 7 * 24 * 3600000) {
              localStorage.removeItem(cacheKey);
            } else {
              return parsed;
            }
          } catch {
            localStorage.removeItem(cacheKey);
          }
        }
      } catch {
        // localStorage not available (Safari private mode)
      }
    }
    throw error;
  }
}
