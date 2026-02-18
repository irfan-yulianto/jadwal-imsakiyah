# Si-Imsak — Jadwal Imsakiyah & Waktu Sholat

Aplikasi web jadwal imsakiyah dan waktu sholat untuk seluruh kota/kabupaten di Indonesia. Menampilkan countdown real-time menuju waktu sholat berikutnya, jadwal harian & bulanan dengan konversi kalender Hijriyah otomatis, serta fitur download PDF dan gambar untuk kebutuhan masjid.

## Fitur

- **Countdown Real-time** — Timer mundur menuju waktu sholat berikutnya dengan sinkronisasi waktu server, berjalan 24/7 secara siklis (termasuk transisi Isya ke Imsak besok)
- **Jadwal Hari Ini** — Kartu waktu sholat hari ini dengan highlight otomatis waktu sholat yang sedang berlaku
- **Tabel Jadwal Bulanan** — Navigasi antar bulan untuk melihat jadwal sepanjang tahun
- **Kalender Hijriyah** — Konversi otomatis ke kalender Hijriyah menggunakan `Intl.DateTimeFormat` (`islamic-umalqura`) — mendukung seluruh 12 bulan Hijriyah sepanjang tahun
- **Deteksi Lokasi** — Geolocation otomatis dengan database 514 kota/kabupaten di seluruh Indonesia
- **Pencarian Kota** — Cari kota/kabupaten dari database Kemenag RI via MyQuran API v3
- **Generator PDF** — Download jadwal dalam format PDF A4 siap cetak dengan kustomisasi header masjid
- **Generator Gambar** — Export jadwal sebagai gambar PNG untuk Instagram Story (9:16) dan kartu bulanan (A4)
- **Dark Mode** — Mengikuti preferensi sistem (OS) dengan toggle manual light/dark
- **Offline Support** — Cache jadwal di localStorage untuk akses tanpa internet
- **Responsive** — Optimal di mobile dan desktop dengan bottom navigation pada mobile
- **Sinkronisasi Waktu** — NTP-style time sync via WorldTimeAPI untuk akurasi countdown

## Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS 4 |
| State | Zustand 5 |
| PDF | @react-pdf/renderer |
| Image Export | html-to-image |
| Analytics | Vercel Analytics, Vercel Speed Insights, Microsoft Clarity |
| Font | Plus Jakarta Sans, JetBrains Mono |
| Bahasa | TypeScript 5 |

## Sumber Data

Jadwal sholat bersumber dari **[MyQuran API v3](https://api.myquran.com)** (`api.myquran.com/v3/sholat`) yang mengambil data resmi dari **Kementerian Agama Republik Indonesia (Kemenag RI)**.

Sinkronisasi waktu menggunakan **[WorldTimeAPI](https://worldtimeapi.org)** dengan fallback ke waktu lokal perangkat jika API tidak tersedia.

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
│   │   ├── cities/route.ts      # Proxy pencarian kota ke MyQuran API v3
│   │   └── schedule/route.ts    # Proxy jadwal sholat ke MyQuran API v3
│   ├── layout.tsx               # Root layout (font, metadata, analytics, theme init)
│   ├── globals.css              # Global styles, animasi, Islamic geometric background
│   └── page.tsx                 # Halaman utama
├── components/
│   ├── generator/
│   │   ├── ImageGenerator.tsx   # Export gambar PNG (Daily Story & Monthly)
│   │   ├── PdfGenerator.tsx     # Download PDF jadwal
│   │   ├── PdfDocument.tsx      # Template dokumen PDF (A4)
│   │   ├── DailyCard.tsx        # Kartu harian 1080x1920 (Instagram Story)
│   │   └── MonthlyCard.tsx      # Kartu bulanan 2480x3508 (A4)
│   ├── layout/
│   │   ├── Header.tsx           # Floating header (glassmorphism) + theme toggle
│   │   └── Footer.tsx           # Footer
│   ├── location/
│   │   └── LocationSearch.tsx   # Search kota + geolocation + offline detection
│   ├── schedule/
│   │   ├── CountdownTimer.tsx   # Countdown real-time ke sholat berikutnya
│   │   ├── TodayCard.tsx        # Kartu waktu sholat hari ini + Hijriyah banner
│   │   └── ScheduleTable.tsx    # Tabel jadwal bulanan + navigasi bulan
│   └── ui/
│       └── Icons.tsx            # Custom SVG icon components (prayer-specific)
├── lib/
│   ├── api.ts                   # Client API (fetch + timeout + offline cache)
│   ├── cities.ts                # Database 514 kota/kabupaten dengan koordinat
│   ├── constants.ts             # Konfigurasi (default location, timezone map)
│   ├── hijri.ts                 # Konversi kalender Hijriyah (Intl.DateTimeFormat)
│   ├── rate-limit.ts            # Rate limiter untuk API routes (sliding window)
│   ├── time.ts                  # Sinkronisasi waktu server (NTP-style)
│   └── timezone.ts              # Mapping timezone Indonesia (WIB/WITA/WIT)
├── store/
│   └── useStore.ts              # Zustand store (location, schedule, countdown, theme)
└── types/
    └── index.ts                 # TypeScript types & interfaces
```

## Keamanan

- **Content Security Policy (CSP)** — Whitelist ketat untuk script, connect, dan image sources
- **HSTS** — Strict-Transport-Security dengan preload (max-age 2 tahun)
- **Security Headers** — X-Frame-Options (DENY), X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- **Rate Limiting** — Sliding window 30 req/menit per IP dengan cap 10.000 entries
- **Input Sanitization** — Validasi dan sanitasi pada semua API routes (city_id, year, month, keyword)
- **Request Timeout** — 15 detik timeout pada semua upstream API calls
- **No Personal Data** — Tidak menyimpan data personal pengguna di server

## Deployment

Dioptimalkan untuk deployment di [Vercel](https://vercel.com):

```bash
npm run build
```

API routes menggunakan ISR cache 24 jam untuk meminimalkan request ke upstream API.

Fitur Vercel yang terintegrasi:
- **Vercel Analytics** — Page views dan web vitals
- **Vercel Speed Insights** — Performance monitoring
- **Microsoft Clarity** — Session replay dan heatmap

## Lisensi

MIT
