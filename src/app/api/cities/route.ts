import { MYQURAN_API_BASE } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");

  if (!q || q.length < 2) {
    return NextResponse.json({ status: false, data: [] });
  }

  try {
    const res = await fetch(`${MYQURAN_API_BASE}/kota/cari/${encodeURIComponent(q)}`, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!res.ok) {
      return NextResponse.json({ status: false, data: [] }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { status: false, data: [] },
      { status: 500 }
    );
  }
}
