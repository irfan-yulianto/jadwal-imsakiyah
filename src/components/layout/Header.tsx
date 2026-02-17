"use client";

import LocationSearch from "@/components/location/LocationSearch";
import { CrescentIcon } from "@/components/ui/Icons";
import { useStore } from "@/store/useStore";

export default function Header() {
  const { isOffline } = useStore();

  return (
    <header className="fixed top-3 left-4 right-4 z-50 mx-auto max-w-5xl">
      <nav className="flex items-center justify-between gap-4 rounded-2xl border border-white/60 bg-white/80 px-4 py-2.5 shadow-lg shadow-black/[0.03] backdrop-blur-xl">
        {/* Logo */}
        <div className="flex shrink-0 items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 shadow-md shadow-green-600/25">
            <CrescentIcon size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight tracking-tight text-slate-800">
              Si-Imsak
            </h1>
            <p className="hidden text-[10px] font-medium tracking-wide text-slate-400 sm:block">
              Ramadan 1447H / 2026
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isOffline && (
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200">
              Offline
            </span>
          )}
          <LocationSearch />
        </div>
      </nav>
    </header>
  );
}
