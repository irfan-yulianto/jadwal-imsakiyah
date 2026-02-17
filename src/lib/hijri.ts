import { RAMADAN_START_DATE } from "./constants";

/**
 * Convert a Gregorian date to Hijri date string during Ramadan 1447H.
 * Based on government decree (Sidang Isbat): 1 Ramadan 1447H = 19 Feb 2026
 */
export function getHijriDate(dateStr: string): string {
  const ramadanStart = new Date(RAMADAN_START_DATE);
  const current = new Date(dateStr);

  const diffTime = current.getTime() - ramadanStart.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    // Before Ramadan - approximate Sya'ban
    const syabanDay = 30 + diffDays + 1; // Sya'ban has ~30 days
    if (syabanDay > 0) {
      return `${syabanDay} Sya'ban 1447H`;
    }
    return "";
  }

  if (diffDays < 30) {
    return `${diffDays + 1} Ramadan 1447H`;
  }

  // After Ramadan - Syawal
  const syawalDay = diffDays - 30 + 1;
  if (syawalDay <= 30) {
    return `${syawalDay} Syawal 1447H`;
  }

  return "";
}

/**
 * Check if a given date falls within Ramadan 1447H
 */
export function isRamadan(dateStr: string): boolean {
  const ramadanStart = new Date(RAMADAN_START_DATE);
  const current = new Date(dateStr);
  const diffTime = current.getTime() - ramadanStart.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays < 30;
}
