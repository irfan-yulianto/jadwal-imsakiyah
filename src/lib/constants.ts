// Ramadan 1447H start date based on Sidang Isbat
export const RAMADAN_START_DATE = "2026-02-19";
export const RAMADAN_HIJRI_START = { day: 1, month: 9, year: 1447 }; // 1 Ramadan 1447H

// Fallback location (Jakarta Pusat)
export const DEFAULT_LOCATION = {
  id: "1301",
  lokasi: "KOTA JAKARTA",
  daerah: "DKI JAKARTA",
};

// API base URL
export const MYQURAN_API_BASE = "https://api.myquran.com/v2/sholat";

// Timezone mapping based on province/region
export const TIMEZONE_MAP: Record<string, string> = {
  // WIB (UTC+7)
  "ACEH": "WIB",
  "SUMATERA UTARA": "WIB",
  "SUMATERA BARAT": "WIB",
  "RIAU": "WIB",
  "JAMBI": "WIB",
  "SUMATERA SELATAN": "WIB",
  "BENGKULU": "WIB",
  "LAMPUNG": "WIB",
  "KEP. BANGKA BELITUNG": "WIB",
  "KEP. RIAU": "WIB",
  "DKI JAKARTA": "WIB",
  "JAWA BARAT": "WIB",
  "JAWA TENGAH": "WIB",
  "DI YOGYAKARTA": "WIB",
  "JAWA TIMUR": "WIB",
  "BANTEN": "WIB",
  "KALIMANTAN BARAT": "WIB",
  // WITA (UTC+8)
  "BALI": "WITA",
  "NUSA TENGGARA BARAT": "WITA",
  "NUSA TENGGARA TIMUR": "WITA",
  "KALIMANTAN TENGAH": "WITA",
  "KALIMANTAN SELATAN": "WITA",
  "KALIMANTAN TIMUR": "WITA",
  "KALIMANTAN UTARA": "WITA",
  "SULAWESI UTARA": "WITA",
  "SULAWESI TENGAH": "WITA",
  "SULAWESI SELATAN": "WITA",
  "SULAWESI TENGGARA": "WITA",
  "GORONTALO": "WITA",
  "SULAWESI BARAT": "WITA",
  // WIT (UTC+9)
  "MALUKU": "WIT",
  "MALUKU UTARA": "WIT",
  "PAPUA": "WIT",
  "PAPUA BARAT": "WIT",
  "PAPUA BARAT DAYA": "WIT",
  "PAPUA TENGAH": "WIT",
  "PAPUA PEGUNUNGAN": "WIT",
  "PAPUA SELATAN": "WIT",
};

export const TIMEZONE_OFFSETS: Record<string, number> = {
  WIB: 7,
  WITA: 8,
  WIT: 9,
};
