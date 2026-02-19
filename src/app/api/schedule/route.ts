import { MYQURAN_API_BASE } from "@/lib/constants";
import { isRateLimited } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

// Get number of days in a month
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// Format date as YYYY-MM-DD
function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { status: false, error: "Too many requests" },
      { status: 429 }
    );
  }

  const cityId = request.nextUrl.searchParams.get("city_id");
  const year = request.nextUrl.searchParams.get("year");
  const month = request.nextUrl.searchParams.get("month");

  if (!cityId || !year || !month) {
    return NextResponse.json(
      { status: false, error: "Missing parameters" },
      { status: 400 }
    );
  }

  // Validate city_id: MD5 hash (32 hex chars)
  if (!/^[a-f0-9]{32}$/.test(cityId)) {
    return NextResponse.json(
      { status: false, error: "Invalid city_id" },
      { status: 400 }
    );
  }

  // Validate year and month
  const yearNum = Number(year);
  const monthNum = Number(month);
  if (!Number.isInteger(yearNum) || yearNum < 2020 || yearNum > 2030) {
    return NextResponse.json(
      { status: false, error: "Invalid year" },
      { status: 400 }
    );
  }
  if (!Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12) {
    return NextResponse.json(
      { status: false, error: "Invalid month" },
      { status: 400 }
    );
  }

  try {
    const daysInMonth = getDaysInMonth(yearNum, monthNum);
    const dates = Array.from({ length: daysInMonth }, (_, i) =>
      formatDate(yearNum, monthNum, i + 1)
    );

    // Fetch a single day with retry and per-request timeout
    async function fetchDay(date: string, retries = 2): Promise<unknown> {
      for (let attempt = 0; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        try {
          const res = await fetch(`${MYQURAN_API_BASE}/jadwal/${cityId}/${date}`, {
            next: { revalidate: 86400 },
            signal: controller.signal,
          });
          if (res.ok) return res.json();
        } catch {
          // retry on timeout or network error
        } finally {
          clearTimeout(timeout);
        }
        if (attempt < retries) await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
      }
      return null;
    }

    // Fetch in batches of 7 to avoid overwhelming upstream API
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const responses: any[] = [];
    const BATCH_SIZE = 7;
    for (let i = 0; i < dates.length; i += BATCH_SIZE) {
      const batch = dates.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(batch.map((date) => fetchDay(date)));
      responses.push(...batchResults);
    }

    // Extract city info from first successful response
    const firstValid = responses.find((r) => r?.status && r?.data);
    if (!firstValid) {
      return NextResponse.json(
        { status: false, error: "Upstream API error" },
        { status: 502 }
      );
    }

    // Transform v3 responses to v2-compatible format
    const jadwal = dates
      .map((date, i) => {
        const res = responses[i];
        if (!res?.status || !res?.data?.jadwal?.[date]) return null;
        const day = res.data.jadwal[date];
        return {
          tanggal: day.tanggal,
          date,
          imsak: day.imsak,
          subuh: day.subuh,
          terbit: day.terbit,
          dhuha: day.dhuha,
          dzuhur: day.dzuhur,
          ashar: day.ashar,
          maghrib: day.maghrib,
          isya: day.isya,
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      status: true,
      data: {
        id: cityId,
        lokasi: firstValid.data.kabko,
        daerah: firstValid.data.prov,
        jadwal,
      },
    });
  } catch {
    return NextResponse.json(
      { status: false, error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}
