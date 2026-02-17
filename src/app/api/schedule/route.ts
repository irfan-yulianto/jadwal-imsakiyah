import { MYQURAN_API_BASE } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cityId = request.nextUrl.searchParams.get("city_id");
  const year = request.nextUrl.searchParams.get("year");
  const month = request.nextUrl.searchParams.get("month");

  if (!cityId || !year || !month) {
    return NextResponse.json(
      { status: false, error: "Missing parameters" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `${MYQURAN_API_BASE}/jadwal/${cityId}/${year}/${month}`,
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
