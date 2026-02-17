# Si-Imsak — Jadwal Imsakiyah Ramadan 1447H/2026

Aplikasi web jadwal imsakiyah dan waktu sholat untuk seluruh kota/kabupaten di Indonesia. Menampilkan countdown real-time menuju waktu sholat berikutnya, jadwal harian & bulanan, serta fitur download PDF dan gambar untuk kebutuhan masjid.

## Fitur

- **Countdown Real-time** — Timer mundur menuju waktu sholat berikutnya, berjalan 24/7 secara siklis (termasuk transisi Isya ke Imsak besok)
- **Jadwal Hari Ini** — Kartu waktu sholat hari ini dengan highlight waktu sholat yang sedang berlaku
- **Tabel Jadwal Bulanan** — Navigasi antar bulan untuk melihat jadwal lengkap
- **Tanggal Hijriyah** — Konversi otomatis ke kalender Hijriyah (Sya'ban, Ramadan, Syawal 1447H)
- **Deteksi Lokasi** — Geolocation dengan 83+ kota referensi di seluruh Indonesia
- **Pencarian Kota** — Cari kota/kabupaten dari database Kemenag RI via MyQuran API
- **Generator PDF** — Download jadwal dalam format PDF siap cetak
- **Generator Gambar** — Export jadwal sebagai gambar PNG untuk Instagram Story dan kartu bulanan
- **Dark Mode** — Default dark mode dengan toggle light/dark
- **Offline Support** — Cache jadwal di localStorage untuk akses tanpa internet
- **Responsive** — Optimal di mobile dan desktop dengan bottom navigation pada mobile

## Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS 4 |
| State | Zustand 5 |
| PDF | @react-pdf/renderer |
| Image Export | html-to-image |
| Bahasa | TypeScript 5 |

## Sumber Data

Jadwal sholat bersumber dari **API MyQuran** (`api.myquran.com/v2/sholat`) yang mengambil data resmi dari **Kementerian Agama Republik Indonesia (Kemenag RI)**.

## Memulai

### Prasyarat

- Node.js 18+
- npm

### Instalasi

```bash
git clone <repo-url>
cd jadwal-imsakiyah
npm install
```

### Development

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Build Production

```bash
npm run build
npm start
```

## Struktur Project

```
src/
├── app/
│   ├── api/
│   │   ├── cities/route.ts      # Proxy pencarian kota ke MyQuran API
│   │   └── schedule/route.ts    # Proxy jadwal sholat ke MyQuran API
│   ├── layout.tsx               # Root layout (font, metadata, theme init)
│   └── page.tsx                 # Halaman utama
├── components/
│   ├── generator/
│   │   ├── ImageGenerator.tsx   # Export gambar PNG (Story & Monthly)
│   │   ├── PdfGenerator.tsx     # Download PDF jadwal
│   │   ├── PdfDocument.tsx      # Template dokumen PDF
│   │   ├── DailyCard.tsx        # Kartu jadwal harian (untuk gambar)
│   │   └── MonthlyCard.tsx      # Kartu jadwal bulanan (untuk gambar)
│   ├── layout/
│   │   ├── Header.tsx           # Header dengan logo, search, theme toggle
│   │   └── Footer.tsx           # Footer
│   ├── location/
│   │   └── LocationSearch.tsx   # Search kota + geolocation + offline detection
│   ├── schedule/
│   │   ├── CountdownTimer.tsx   # Countdown real-time ke sholat berikutnya
│   │   ├── TodayCard.tsx        # Kartu waktu sholat hari ini
│   │   └── ScheduleTable.tsx    # Tabel jadwal bulanan + navigasi bulan
│   └── ui/
│       └── Icons.tsx            # Icon components (Lucide-style SVG)
├── lib/
│   ├── api.ts                   # Client API (fetch + offline cache)
│   ├── constants.ts             # Konfigurasi (Ramadan date, default location, timezone map)
│   ├── hijri.ts                 # Konversi tanggal Hijriyah
│   ├── rate-limit.ts            # Rate limiter untuk API routes
│   ├── time.ts                  # Sinkronisasi waktu server (NTP-style)
│   └── timezone.ts              # Mapping timezone Indonesia (WIB/WITA/WIT)
├── store/
│   └── useStore.ts              # Zustand store (location, schedule, countdown, theme)
└── types/
    └── index.ts                 # TypeScript types & interfaces
```

## Keamanan

- Input validation pada semua API routes (city_id, year, month, keyword)
- Rate limiting (30 req/menit per IP)
- Security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- Sanitasi input pencarian kota
- Tidak menyimpan data personal pengguna

## Deployment

Dioptimalkan untuk deployment di [Vercel](https://vercel.com):

```bash
npm run build
```

API routes menggunakan ISR cache 24 jam untuk meminimalkan request ke upstream API.

## Lisensi

MIT
