/**
 * Nominatim reverse geocode response → MyQuran city name normalization.
 */

export interface NominatimAddress {
  city?: string;
  county?: string;
  town?: string;
  municipality?: string;
  state?: string;
  [key: string]: string | undefined;
}

/**
 * Extract the city/kabupaten name from a Nominatim address object.
 * Priority: city (kota) > county (kabupaten) > municipality > town
 */
export function extractCityFromNominatim(address: NominatimAddress | undefined | null): string {
  if (!address) return "";
  return (address.city || address.county || address.municipality || address.town || "").trim();
}

// Special-case mappings for province-level names that Nominatim returns
const SPECIAL_CASES: Record<string, string> = {
  "DKI JAKARTA": "KOTA JAKARTA",
  "DAERAH KHUSUS IBUKOTA JAKARTA": "KOTA JAKARTA",
};

/**
 * Convert Nominatim city/county name to MyQuran's format.
 *
 * Nominatim → MyQuran examples:
 * - "Kabupaten Gresik" → "KAB. GRESIK"
 * - "Kota Bekasi" → "KOTA BEKASI"
 * - "Kota Administrasi Jakarta Selatan" → "KOTA JAKARTA SELATAN"
 */
export function normalizeToMyquranName(nominatimName: string): string {
  const trimmed = nominatimName?.trim();
  if (!trimmed) return "";

  const upper = trimmed.toUpperCase();

  // Check special cases first
  if (SPECIAL_CASES[upper]) return SPECIAL_CASES[upper];

  // "Kabupaten X" → "KAB. X"
  const kabMatch = upper.match(/^KABUPATEN\s+(.+)/);
  if (kabMatch) return `KAB. ${kabMatch[1].trim()}`;

  // "Kota Administrasi X" → "KOTA X" (Jakarta sub-cities)
  const kotaAdminMatch = upper.match(/^KOTA\s+ADMINISTRASI\s+(.+)/);
  if (kotaAdminMatch) return `KOTA ${kotaAdminMatch[1].trim()}`;

  // "Kota X" → "KOTA X"
  const kotaMatch = upper.match(/^KOTA\s+(.+)/);
  if (kotaMatch) return `KOTA ${kotaMatch[1].trim()}`;

  // Already in "KAB. X" or "KOTA X" format — passthrough
  if (upper.startsWith("KAB. ") || upper.startsWith("KOTA ")) return upper;

  // Unrecognized format — return uppercased as-is
  return upper;
}
