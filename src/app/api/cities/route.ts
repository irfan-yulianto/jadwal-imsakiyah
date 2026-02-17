import { MYQURAN_API_BASE } from "@/lib/constants";
import { isRateLimited } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { status: false, data: [], error: "Too many requests" },
      { status: 429 }
    );
  }

  const q = request.nextUrl.searchParams.get("q");

  if (!q || q.length < 2) {
    return NextResponse.json({ status: false, data: [] });
  }

  // Sanitize: allow only letters, spaces, and common Indonesian characters
  const sanitized = q.replace(/[^a-zA-Z\s\-']/g, "").trim();
  if (sanitized.length < 2 || sanitized.length > 50) {
    return NextResponse.json({ status: false, data: [] });
  }

  try {
    const res = await fetch(`${MYQURAN_API_BASE}/kota/cari/${encodeURIComponent(sanitized)}`, {
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
