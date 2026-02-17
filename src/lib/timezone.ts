import { TimezoneLabel } from "@/types";
import { TIMEZONE_MAP } from "./constants";

/**
 * Get timezone label from province/daerah name
 */
export function getTimezone(daerah: string): TimezoneLabel {
  const upper = daerah.toUpperCase().trim();
  return (TIMEZONE_MAP[upper] as TimezoneLabel) || "WIB";
}

/**
 * Get UTC offset hours for a timezone label
 */
export function getUtcOffset(tz: TimezoneLabel): number {
  switch (tz) {
    case "WIB":
      return 7;
    case "WITA":
      return 8;
    case "WIT":
      return 9;
    default:
      return 7;
  }
}
