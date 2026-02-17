import { CrescentIcon } from "@/components/ui/Icons";

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-gradient-to-b from-white to-slate-50 py-8">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <CrescentIcon size={16} />
            <span className="text-sm font-semibold text-slate-500">Si-Imsak</span>
          </div>
          <p className="text-center text-xs text-slate-400">
            Sumber data:{" "}
            <a
              href="https://bimasislam.kemenag.go.id"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer font-medium text-emerald-600 transition-colors hover:text-emerald-700"
            >
              Bimas Islam Kemenag RI
            </a>
          </p>
          <p className="text-[10px] text-slate-300">
            Sistem Informasi & Generator Jadwal Imsakiyah
          </p>
        </div>
      </div>
    </footer>
  );
}
