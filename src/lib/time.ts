/**
 * Sync time with worldtimeapi.org to avoid relying on user's device clock.
 * Returns the offset in milliseconds (serverTime - clientTime).
 */
export async function syncServerTime(): Promise<number> {
  try {
    const before = Date.now();
    const res = await fetch("https://worldtimeapi.org/api/timezone/Asia/Jakarta");
    const after = Date.now();

    if (!res.ok) return 0;

    const data = await res.json();
    const serverTime = new Date(data.datetime).getTime();
    if (isNaN(serverTime)) return 0;
    // Account for network latency (approximate round-trip / 2)
    const latency = (after - before) / 2;
    const adjustedServerTime = serverTime + latency;

    return adjustedServerTime - after;
  } catch {
    // If worldtimeapi is down, use client time (offset = 0)
    return 0;
  }
}

/**
 * Get current time adjusted by server offset
 */
export function getAdjustedTime(offset: number): Date {
  return new Date(Date.now() + offset);
}

/**
 * Parse a time string (HH:MM) and a date string (YYYY-MM-DD) into a Date object
 */
export function parseScheduleTime(
  dateStr: string,
  timeStr: string,
  utcOffset: number // 7 for WIB, 8 for WITA, 9 for WIT
): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date(dateStr);
  // Set time in UTC, then subtract the timezone offset to get the correct UTC time
  date.setUTCHours(hours - utcOffset, minutes, 0, 0);
  return date;
}
