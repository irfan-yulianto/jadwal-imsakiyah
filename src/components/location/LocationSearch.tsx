"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Location } from "@/types";
import { searchCities, getSchedule } from "@/lib/api";
import { getTimezone } from "@/lib/timezone";
import { useStore } from "@/store/useStore";
import { SearchIcon, MapPinIcon } from "@/components/ui/Icons";

export default function LocationSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Location[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const { location, setLocation, setSchedule, setScheduleLoading, setScheduleError, setViewMonth, setCountdownSchedule } =
    useStore();

  const fetchSchedule = useCallback(
    async (cityId: string, daerah: string, loc: Location) => {
      const now = new Date();
      setScheduleLoading(true);
      try {
        const res = await getSchedule(cityId, now.getFullYear(), now.getMonth() + 1);
        if (res.status && res.data?.jadwal) {
          const tz = getTimezone(res.data.daerah || daerah);
          setLocation({ ...loc, daerah: res.data.daerah || daerah }, tz);
          setSchedule(res.data.jadwal);
          setCountdownSchedule(res.data.jadwal);
          setViewMonth(now.getMonth() + 1, now.getFullYear());
        } else {
          setScheduleError("Data jadwal tidak tersedia");
        }
      } catch {
        setScheduleError("Gagal memuat jadwal. Periksa koneksi internet.");
      }
    },
    [setLocation, setSchedule, setScheduleLoading, setScheduleError, setViewMonth, setCountdownSchedule]
  );

  const detectLocation = useCallback(async () => {
    if (!navigator.geolocation) return;
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const cityGuess = getCityGuess(pos.coords.latitude, pos.coords.longitude);
          if (cityGuess) {
            const searchRes = await searchCities(cityGuess);
            if (searchRes.status && searchRes.data?.length > 0) {
              const city = searchRes.data[0];
              localStorage.setItem("selectedLocation", JSON.stringify(city));
              localStorage.setItem("locationPermissionDismissed", "true");
              setShowLocationPrompt(false);
              fetchSchedule(city.id, city.daerah || "", city);
            }
          }
        } catch {
          // Stick with default
        } finally {
          setIsDetecting(false);
        }
      },
      () => {
        setIsDetecting(false);
      },
      { timeout: 5000 }
    );
  }, [fetchSchedule]);

  useEffect(() => {
    const savedLocation = localStorage.getItem("selectedLocation");
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation);
        fetchSchedule(parsed.id, parsed.daerah || "", parsed);
        return;
      } catch {
        // ignore
      }
    }

    // No saved location — show permission prompt and load default
    const dismissed = localStorage.getItem("locationPermissionDismissed");
    if (!dismissed) {
      setShowLocationPrompt(true);
    }

    fetchSchedule(location.cityId, location.province, {
      id: location.cityId,
      lokasi: location.cityName,
      daerah: location.province,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresh: check every hour if month changed
  useEffect(() => {
    let lastMonth = new Date().getMonth();
    const interval = setInterval(() => {
      const currentMonth = new Date().getMonth();
      if (currentMonth !== lastMonth) {
        lastMonth = currentMonth;
        const savedLocation = localStorage.getItem("selectedLocation");
        if (savedLocation) {
          try {
            const parsed = JSON.parse(savedLocation);
            fetchSchedule(parsed.id, parsed.daerah || "", parsed);
          } catch {
            // ignore
          }
        }
      }
    }, 3600000); // 1 hour
    return () => clearInterval(interval);
  }, [fetchSchedule]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchCities(query);
        if (res.status && res.data) {
          setResults(res.data);
          setIsOpen(true);
        }
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (city: Location) => {
    setQuery("");
    setIsOpen(false);
    localStorage.setItem("selectedLocation", JSON.stringify(city));
    fetchSchedule(city.id, city.daerah || "", city);
  };

  const handleDismissPrompt = () => {
    setShowLocationPrompt(false);
    localStorage.setItem("locationPermissionDismissed", "true");
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-[260px]">
      {/* Location permission prompt */}
      {showLocationPrompt && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-emerald-200 bg-emerald-50 p-3 shadow-lg dark:border-emerald-800 dark:bg-emerald-900/40">
          <p className="mb-2 text-xs font-medium text-emerald-800 dark:text-emerald-200">
            Gunakan lokasi Anda untuk menampilkan jadwal yang sesuai?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={detectLocation}
              disabled={isDetecting}
              className="flex-1 cursor-pointer rounded-md bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              {isDetecting ? (
                <span className="flex items-center justify-center gap-1.5">
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Mendeteksi...
                </span>
              ) : (
                "Gunakan Lokasi"
              )}
            </button>
            <button
              type="button"
              onClick={handleDismissPrompt}
              className="cursor-pointer rounded-md px-3 py-1.5 text-[11px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-800/50"
            >
              Nanti
            </button>
          </div>
        </div>
      )}

      <div className="relative">
        <SearchIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Cari kota..."
          className="w-full rounded-lg border border-slate-200/80 bg-slate-50/80 py-2 pl-9 pr-4 text-xs font-medium text-slate-700 placeholder-slate-400 transition-all focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/20 dark:border-slate-600/80 dark:bg-slate-800/80 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-emerald-500 dark:focus:bg-slate-800"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-lg border border-slate-100 bg-white py-1 shadow-xl shadow-black/[0.08] dark:border-slate-700 dark:bg-slate-800 dark:shadow-black/30">
          {results.map((city) => (
            <li key={city.id}>
              <button
                type="button"
                onClick={() => handleSelect(city)}
                className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
              >
                <MapPinIcon size={14} className="shrink-0 text-slate-300 dark:text-slate-500" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {city.lokasi}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function getCityGuess(lat: number, lng: number): string | null {
  const cities = [
    // === SUMATRA ===
    { name: "Banda Aceh", lat: 5.55, lng: 95.32 },
    { name: "Lhokseumawe", lat: 5.18, lng: 97.15 },
    { name: "Medan", lat: 3.6, lng: 98.7 },
    { name: "Binjai", lat: 3.6, lng: 98.49 },
    { name: "Pematang Siantar", lat: 2.95, lng: 99.05 },
    { name: "Padang Sidempuan", lat: 1.38, lng: 99.27 },
    { name: "Pekanbaru", lat: 0.5, lng: 101.45 },
    { name: "Dumai", lat: 1.68, lng: 101.45 },
    { name: "Batam", lat: 1.05, lng: 104.03 },
    { name: "Tanjung Pinang", lat: 0.92, lng: 104.44 },
    { name: "Padang", lat: -0.95, lng: 100.35 },
    { name: "Bukittinggi", lat: -0.3, lng: 100.37 },
    { name: "Jambi", lat: -1.6, lng: 103.62 },
    { name: "Palembang", lat: -3.0, lng: 104.75 },
    { name: "Lubuk Linggau", lat: -3.3, lng: 102.86 },
    { name: "Bengkulu", lat: -3.8, lng: 102.26 },
    { name: "Bandar Lampung", lat: -5.43, lng: 105.26 },
    { name: "Metro", lat: -5.11, lng: 105.31 },
    { name: "Pangkal Pinang", lat: -2.13, lng: 106.11 },

    // === JAWA ===
    { name: "Jakarta", lat: -6.2, lng: 106.85 },
    { name: "Bogor", lat: -6.6, lng: 106.8 },
    { name: "Depok", lat: -6.4, lng: 106.8 },
    { name: "Tangerang", lat: -6.17, lng: 106.63 },
    { name: "Bekasi", lat: -6.24, lng: 107.0 },
    { name: "Serang", lat: -6.12, lng: 106.15 },
    { name: "Cilegon", lat: -6.0, lng: 106.05 },
    { name: "Bandung", lat: -6.9, lng: 107.6 },
    { name: "Cirebon", lat: -6.71, lng: 108.56 },
    { name: "Sukabumi", lat: -6.92, lng: 106.93 },
    { name: "Tasikmalaya", lat: -7.33, lng: 108.22 },
    { name: "Semarang", lat: -7.0, lng: 110.4 },
    { name: "Solo", lat: -7.57, lng: 110.82 },
    { name: "Tegal", lat: -6.87, lng: 109.14 },
    { name: "Pekalongan", lat: -6.89, lng: 109.67 },
    { name: "Magelang", lat: -7.47, lng: 110.22 },
    { name: "Purwokerto", lat: -7.42, lng: 109.23 },
    { name: "Yogyakarta", lat: -7.8, lng: 110.36 },
    { name: "Surabaya", lat: -7.25, lng: 112.75 },
    { name: "Malang", lat: -7.98, lng: 112.63 },
    { name: "Kediri", lat: -7.82, lng: 112.01 },
    { name: "Madiun", lat: -7.63, lng: 111.52 },
    { name: "Jember", lat: -8.17, lng: 113.7 },
    { name: "Blitar", lat: -8.1, lng: 112.16 },
    { name: "Banyuwangi", lat: -8.22, lng: 114.35 },
    { name: "Probolinggo", lat: -7.75, lng: 113.22 },

    // === KALIMANTAN ===
    { name: "Pontianak", lat: -0.03, lng: 109.34 },
    { name: "Singkawang", lat: 0.9, lng: 108.98 },
    { name: "Palangkaraya", lat: -2.21, lng: 113.92 },
    { name: "Banjarmasin", lat: -3.32, lng: 114.59 },
    { name: "Banjarbaru", lat: -3.44, lng: 114.83 },
    { name: "Balikpapan", lat: -1.27, lng: 116.83 },
    { name: "Samarinda", lat: -0.5, lng: 117.15 },
    { name: "Tarakan", lat: 3.3, lng: 117.63 },
    { name: "Tanjung Selor", lat: 2.84, lng: 117.36 },

    // === SULAWESI ===
    { name: "Makassar", lat: -5.15, lng: 119.4 },
    { name: "Parepare", lat: -4.01, lng: 119.63 },
    { name: "Manado", lat: 1.49, lng: 124.84 },
    { name: "Gorontalo", lat: 0.54, lng: 123.06 },
    { name: "Palu", lat: -0.9, lng: 119.84 },
    { name: "Kendari", lat: -3.97, lng: 122.51 },
    { name: "Mamuju", lat: -2.68, lng: 118.89 },
    { name: "Bitung", lat: 1.44, lng: 125.19 },
    { name: "Palopo", lat: -2.99, lng: 120.2 },

    // === BALI & NUSA TENGGARA ===
    { name: "Denpasar", lat: -8.65, lng: 115.22 },
    { name: "Singaraja", lat: -8.11, lng: 115.09 },
    { name: "Mataram", lat: -8.58, lng: 116.1 },
    { name: "Bima", lat: -8.46, lng: 118.73 },
    { name: "Sumbawa Besar", lat: -8.49, lng: 117.42 },
    { name: "Kupang", lat: -10.17, lng: 123.61 },
    { name: "Ende", lat: -8.84, lng: 121.66 },
    { name: "Maumere", lat: -8.62, lng: 122.21 },

    // === MALUKU & PAPUA ===
    { name: "Ambon", lat: -3.69, lng: 128.17 },
    { name: "Tual", lat: -5.64, lng: 132.75 },
    { name: "Ternate", lat: 0.79, lng: 127.38 },
    { name: "Tidore", lat: 0.69, lng: 127.4 },
    { name: "Jayapura", lat: -2.53, lng: 140.72 },
    { name: "Sorong", lat: -0.87, lng: 131.25 },
    { name: "Manokwari", lat: -0.86, lng: 134.08 },
    { name: "Merauke", lat: -8.49, lng: 140.4 },
    { name: "Timika", lat: -4.55, lng: 136.89 },
    { name: "Nabire", lat: -3.37, lng: 135.5 },
  ];

  let closest = cities[0];
  let minDist = Infinity;
  for (const city of cities) {
    const dist = Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2);
    if (dist < minDist) {
      minDist = dist;
      closest = city;
    }
  }
  return closest.name;
}
