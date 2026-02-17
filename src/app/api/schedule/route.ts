import { MYQURAN_API_BASE } from "@/lib/constants";
import { isRateLimited } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

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

  // Validate city_id: numeric string only
  if (!/^\d{1,5}$/.test(cityId)) {
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
    const res = await fetch(
      `${MYQURAN_API_BASE}/jadwal/${cityId}/${yearNum}/${monthNum}`,
      {
        next: { revalidate: 86400 }, // Cache for 24 hours (jadwal is static per month)
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { status: false, error: "Upstream API error" },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { status: false, error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}
