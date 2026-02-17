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
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const { location, setLocation, setSchedule, setScheduleLoading, setScheduleError } =
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
        } else {
          setScheduleError("Data jadwal tidak tersedia");
        }
      } catch {
        setScheduleError("Gagal memuat jadwal. Periksa koneksi internet.");
      }
    },
    [setLocation, setSchedule, setScheduleLoading, setScheduleError]
  );

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

    fetchSchedule(location.cityId, location.province, {
      id: location.cityId,
      lokasi: location.cityName,
      daerah: location.province,
    });

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const cityGuess = getCityGuess(pos.coords.latitude, pos.coords.longitude);
            if (cityGuess) {
              const searchRes = await searchCities(cityGuess);
              if (searchRes.status && searchRes.data?.length > 0) {
                const city = searchRes.data[0];
                localStorage.setItem("selectedLocation", JSON.stringify(city));
                fetchSchedule(city.id, city.daerah || "", city);
              }
            }
          } catch {
            // Stick with default
          }
        },
        () => {},
        { timeout: 5000 }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <div ref={containerRef} className="relative w-full max-w-[260px]">
      <div className="relative">
        <SearchIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Cari kota..."
          className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 py-2 pl-9 pr-4 text-xs font-medium text-slate-700 placeholder-slate-400 transition-all focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-slate-100 bg-white py-1 shadow-xl shadow-black/[0.08]">
          {results.map((city) => (
            <li key={city.id}>
              <button
                type="button"
                onClick={() => handleSelect(city)}
                className="flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-emerald-50"
              >
                <MapPinIcon size={14} className="shrink-0 text-slate-300" />
                <span className="text-xs font-semibold text-slate-700">
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
    { name: "Jakarta", lat: -6.2, lng: 106.85 },
    { name: "Surabaya", lat: -7.25, lng: 112.75 },
    { name: "Bandung", lat: -6.9, lng: 107.6 },
    { name: "Medan", lat: 3.6, lng: 98.7 },
    { name: "Semarang", lat: -7.0, lng: 110.4 },
    { name: "Makassar", lat: -5.15, lng: 119.4 },
    { name: "Palembang", lat: -3.0, lng: 104.75 },
    { name: "Bekasi", lat: -6.24, lng: 107.0 },
    { name: "Depok", lat: -6.4, lng: 106.8 },
    { name: "Tangerang", lat: -6.17, lng: 106.63 },
    { name: "Yogyakarta", lat: -7.8, lng: 110.36 },
    { name: "Denpasar", lat: -8.65, lng: 115.22 },
    { name: "Balikpapan", lat: -1.27, lng: 116.83 },
    { name: "Padang", lat: -0.95, lng: 100.35 },
    { name: "Manado", lat: 1.49, lng: 124.84 },
    { name: "Jayapura", lat: -2.53, lng: 140.72 },
    { name: "Bogor", lat: -6.6, lng: 106.8 },
    { name: "Malang", lat: -7.98, lng: 112.63 },
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
