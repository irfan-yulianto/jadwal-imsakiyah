"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useStore } from "@/store/useStore";
import { FileTextIcon, DownloadIcon } from "@/components/ui/Icons";
import PdfDocumentComponent from "./PdfDocument";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => (
      <button
        disabled
        className="flex w-full cursor-wait items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-400 dark:bg-slate-700 dark:text-slate-500"
      >
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-transparent dark:border-slate-600" />
        Memuat generator PDF...
      </button>
    ),
  }
);

export default function PdfGenerator() {
  const { schedule, location, customHeader, setCustomHeader } = useStore();
  const [showForm, setShowForm] = useState(false);

  if (schedule.data.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-700/50 dark:bg-slate-800/80">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-50 px-4 py-3 dark:border-slate-700/50">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
          <FileTextIcon size={18} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Download PDF</h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Format A4 untuk dicetak</p>
        </div>
      </div>

      <div className="p-4">
        {/* Toggle custom header */}
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="mb-3 cursor-pointer text-xs font-semibold text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          {showForm ? "Sembunyikan kustomisasi" : "Kustomisasi header masjid (opsional)"}
        </button>

        {showForm && (
          <div className="mb-3 space-y-2.5 rounded-xl bg-slate-50 p-3 dark:bg-slate-700/50">
            <input
              type="text"
              value={customHeader.mosqueName}
              onChange={(e) => setCustomHeader({ mosqueName: e.target.value })}
              placeholder="Nama Masjid/Musholla"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-300 transition-colors focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-emerald-500"
            />
            <input
              type="text"
              value={customHeader.address}
              onChange={(e) => setCustomHeader({ address: e.target.value })}
              placeholder="Alamat"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-300 transition-colors focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-emerald-500"
            />
            <input
              type="text"
              value={customHeader.contact}
              onChange={(e) => setCustomHeader({ contact: e.target.value })}
              placeholder="Kontak (opsional)"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-300 transition-colors focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-emerald-500"
            />
          </div>
        )}

        <PDFDownloadLink
          document={
            <PdfDocumentComponent
              scheduleData={schedule.data}
              cityName={location.cityName}
              province={location.province}
              timezone={location.timezone}
              customHeader={customHeader}
            />
          }
          fileName={`Jadwal-Imsakiyah-${location.cityName.replace(/\s+/g, "-")}-Ramadan-1447H.pdf`}
        >
          {({ loading }) => (
            <button
              type="button"
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-green-600/20 transition-all hover:shadow-lg hover:shadow-green-600/30 disabled:cursor-wait disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:shadow-none dark:shadow-green-900/30"
            >
              <DownloadIcon size={16} />
              {loading ? "Menyiapkan PDF..." : "Download PDF A4"}
            </button>
          )}
        </PDFDownloadLink>
      </div>
    </div>
  );
}
