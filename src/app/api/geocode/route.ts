import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ kecamatan: "", city: "" });
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&format=json&zoom=16&addressdetails=1&accept-language=id`,
      {
        headers: {
          "User-Agent": "Si-Imsak/1.0 (jadwal-imsakiyah prayer times app)",
        },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ kecamatan: "", city: "" });
    }

    const data = await res.json();
    const address = data.address || {};

    // Indonesian address hierarchy for kecamatan:
    // suburb > city_district > village > district
    const kecamatan =
      address.suburb ||
      address.city_district ||
      address.village ||
      address.district ||
      "";

    // City/kabupaten level
    const city =
      address.city ||
      address.county ||
      address.town ||
      "";

    return NextResponse.json({ kecamatan, city });
  } catch {
    return NextResponse.json({ kecamatan: "", city: "" });
  }
}
