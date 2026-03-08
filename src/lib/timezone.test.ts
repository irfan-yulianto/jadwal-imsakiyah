import { describe, it, expect } from "vitest";
import { getTimezone, getUtcOffset } from "./timezone";

describe("getTimezone", () => {
  // WIB provinces
  it.each([
    "ACEH",
    "SUMATERA UTARA",
    "SUMATERA BARAT",
    "RIAU",
    "JAMBI",
    "SUMATERA SELATAN",
    "BENGKULU",
    "LAMPUNG",
    "DKI JAKARTA",
    "JAWA BARAT",
    "JAWA TENGAH",
    "DI YOGYAKARTA",
    "JAWA TIMUR",
    "BANTEN",
    "KALIMANTAN BARAT",
  ])("returns WIB for %s", (province) => {
    expect(getTimezone(province)).toBe("WIB");
  });

  // WITA provinces
  it.each([
    "BALI",
    "NUSA TENGGARA BARAT",
    "NUSA TENGGARA TIMUR",
    "KALIMANTAN TENGAH",
    "KALIMANTAN SELATAN",
    "KALIMANTAN TIMUR",
    "KALIMANTAN UTARA",
    "SULAWESI UTARA",
    "SULAWESI TENGAH",
    "SULAWESI SELATAN",
    "SULAWESI TENGGARA",
    "GORONTALO",
    "SULAWESI BARAT",
  ])("returns WITA for %s", (province) => {
    expect(getTimezone(province)).toBe("WITA");
  });

  // WIT provinces
  it.each([
    "MALUKU",
    "MALUKU UTARA",
    "PAPUA",
    "PAPUA BARAT",
    "PAPUA BARAT DAYA",
    "PAPUA TENGAH",
    "PAPUA PEGUNUNGAN",
    "PAPUA SELATAN",
  ])("returns WIT for %s", (province) => {
    expect(getTimezone(province)).toBe("WIT");
  });

  it("is case insensitive", () => {
    expect(getTimezone("bali")).toBe("WITA");
    expect(getTimezone("dki jakarta")).toBe("WIB");
  });

  it("trims whitespace", () => {
    expect(getTimezone("  BALI  ")).toBe("WITA");
  });

  it("returns WIB as default for unknown province", () => {
    expect(getTimezone("UNKNOWN")).toBe("WIB");
  });

  it("returns WIB for empty string", () => {
    expect(getTimezone("")).toBe("WIB");
  });
});

describe("getUtcOffset", () => {
  it("returns 7 for WIB", () => {
    expect(getUtcOffset("WIB")).toBe(7);
  });

  it("returns 8 for WITA", () => {
    expect(getUtcOffset("WITA")).toBe(8);
  });

  it("returns 9 for WIT", () => {
    expect(getUtcOffset("WIT")).toBe(9);
  });

  it("returns 7 for unknown timezone", () => {
    expect(getUtcOffset("UNKNOWN" as "WIB")).toBe(7);
  });
});
