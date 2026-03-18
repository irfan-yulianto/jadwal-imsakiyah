// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";

vi.mock("@/lib/rate-limit", () => ({
  isRateLimited: vi.fn(() => false),
  extractClientIp: vi.fn(() => "127.0.0.1"),
}));

function makeRequest(params: Record<string, string>) {
  const url = new URL("http://localhost/api/schedule");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return new NextRequest(url);
}

const validCityId = "58a2fc6ed39fd083f55d4182bf88826d";

function mockUpstreamSuccess(date: string) {
  return {
    status: true,
    data: {
      kabko: "KOTA JAKARTA",
      prov: "DKI JAKARTA",
      jadwal: {
        [date]: {
          tanggal: "Minggu, 01/03/2026",
          imsak: "04:30",
          subuh: "04:40",
          terbit: "05:50",
          dhuha: "06:15",
          dzuhur: "12:00",
          ashar: "15:15",
          maghrib: "18:05",
          isya: "19:15",
        },
      },
    },
  };
}

beforeEach(async () => {
  vi.restoreAllMocks();
  const { isRateLimited } = await import("@/lib/rate-limit");
  vi.mocked(isRateLimited).mockReturnValue(false);
});

describe("GET /api/schedule", () => {
  it("returns 429 when rate limited", async () => {
    const { isRateLimited } = await import("@/lib/rate-limit");
    vi.mocked(isRateLimited).mockReturnValue(true);

    const res = await GET(makeRequest({ city_id: validCityId, year: "2026", month: "3" }));
    expect(res.status).toBe(429);
  });

  it("returns 400 when city_id is missing", async () => {
    const res = await GET(makeRequest({ year: "2026", month: "3" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when year is missing", async () => {
    const res = await GET(makeRequest({ city_id: validCityId, month: "3" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when month is missing", async () => {
    const res = await GET(makeRequest({ city_id: validCityId, year: "2026" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid city_id (not MD5)", async () => {
    const res = await GET(makeRequest({ city_id: "not-valid", year: "2026", month: "3" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("city_id");
  });

  it("returns 400 for uppercase hex city_id", async () => {
    const res = await GET(makeRequest({ city_id: "58A2FC6ED39FD083F55D4182BF88826D", year: "2026", month: "3" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for year below 2020", async () => {
    const res = await GET(makeRequest({ city_id: validCityId, year: "2019", month: "3" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Invalid year");
  });

  it("returns 400 for year above 2030", async () => {
    const res = await GET(makeRequest({ city_id: validCityId, year: "2031", month: "3" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Invalid year");
  });

  it("returns 400 for non-integer year", async () => {
    const res = await GET(makeRequest({ city_id: validCityId, year: "2024.5", month: "3" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Invalid year");
  });

  it("returns 400 for non-numeric year", async () => {
    const res = await GET(makeRequest({ city_id: validCityId, year: "abc", month: "3" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Invalid year");
  });

  it("returns 400 for month 0", async () => {
    const res = await GET(makeRequest({ city_id: validCityId, year: "2026", month: "0" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Invalid month");
  });

  it("returns 400 for month 13", async () => {
    const res = await GET(makeRequest({ city_id: validCityId, year: "2026", month: "13" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Invalid month");
  });

  it("returns 400 for non-integer month", async () => {
    const res = await GET(makeRequest({ city_id: validCityId, year: "2026", month: "3.5" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Invalid month");
  });

  it("returns 400 for non-numeric month", async () => {
    const res = await GET(makeRequest({ city_id: validCityId, year: "2026", month: "xyz" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Invalid month");
  });

  it("returns 502 when all upstream calls fail", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    const res = await GET(makeRequest({ city_id: validCityId, year: "2026", month: "3" }));
    expect(res.status).toBe(502);
  });

  it("returns 200 with jadwal array on success", async () => {
    const date = "2026-03-01";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockUpstreamSuccess(date)),
      })
    );

    const res = await GET(makeRequest({ city_id: validCityId, year: "2026", month: "3" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe(true);
    expect(json.data.jadwal).toBeDefined();
    expect(json.data.lokasi).toBe("KOTA JAKARTA");
    expect(json.data.daerah).toBe("DKI JAKARTA");
  });

  it("transforms v3 response to v2 format with date field", async () => {
    const date = "2026-03-01";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockUpstreamSuccess(date)),
      })
    );

    const res = await GET(makeRequest({ city_id: validCityId, year: "2026", month: "3" }));
    const json = await res.json();
    const firstDay = json.data.jadwal[0];
    expect(firstDay.date).toBe("2026-03-01");
    expect(firstDay.imsak).toBe("04:30");
    expect(firstDay.tanggal).toBe("Minggu, 01/03/2026");
  });
});
