import { CitySearchResponse, ScheduleResponse } from "@/types";

const API_BASE = "/api";

export async function searchCities(keyword: string, signal?: AbortSignal): Promise<CitySearchResponse> {
  const res = await fetch(`${API_BASE}/cities?q=${encodeURIComponent(keyword)}`, { signal });
  if (!res.ok) throw new Error("Failed to search cities");
  return res.json();
}

export async function getSchedule(
  cityId: string,
  year: number,
  month: number
): Promise<ScheduleResponse> {
  const cacheKey = `schedule_${cityId}_${year}_${month}`;

  try {
    const res = await fetch(
      `${API_BASE}/schedule?city_id=${cityId}&year=${year}&month=${month}`
    );
    if (!res.ok) throw new Error("Failed to fetch schedule");
    const data: ScheduleResponse = await res.json();

    // Cache to localStorage for offline use
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch {
        // localStorage full, ignore
      }
    }

    return data;
  } catch (error) {
    // Try offline fallback
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          localStorage.removeItem(cacheKey);
        }
      }
    }
    throw error;
  }
}
