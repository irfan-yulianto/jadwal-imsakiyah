import { describe, it, expect } from "vitest";
import { normalizeToMyquranName, extractCityFromNominatim } from "./geocode";

describe("normalizeToMyquranName", () => {
  it('converts "Kabupaten X" to "KAB. X"', () => {
    expect(normalizeToMyquranName("Kabupaten Gresik")).toBe("KAB. GRESIK");
    expect(normalizeToMyquranName("Kabupaten Bekasi")).toBe("KAB. BEKASI");
    expect(normalizeToMyquranName("Kabupaten Bandung")).toBe("KAB. BANDUNG");
    expect(normalizeToMyquranName("Kabupaten Bogor")).toBe("KAB. BOGOR");
  });

  it('converts "Kota X" to "KOTA X"', () => {
    expect(normalizeToMyquranName("Kota Bekasi")).toBe("KOTA BEKASI");
    expect(normalizeToMyquranName("Kota Surabaya")).toBe("KOTA SURABAYA");
    expect(normalizeToMyquranName("Kota Bandung")).toBe("KOTA BANDUNG");
  });

  it('converts "Kota Administrasi X" to "KOTA X"', () => {
    expect(normalizeToMyquranName("Kota Administrasi Jakarta Selatan")).toBe("KOTA JAKARTA SELATAN");
    expect(normalizeToMyquranName("Kota Administrasi Jakarta Pusat")).toBe("KOTA JAKARTA PUSAT");
    expect(normalizeToMyquranName("Kota Administrasi Jakarta Utara")).toBe("KOTA JAKARTA UTARA");
    expect(normalizeToMyquranName("Kota Administrasi Jakarta Barat")).toBe("KOTA JAKARTA BARAT");
    expect(normalizeToMyquranName("Kota Administrasi Jakarta Timur")).toBe("KOTA JAKARTA TIMUR");
  });

  it('converts "DKI Jakarta" to "KOTA JAKARTA"', () => {
    expect(normalizeToMyquranName("DKI Jakarta")).toBe("KOTA JAKARTA");
    expect(normalizeToMyquranName("Daerah Khusus Ibukota Jakarta")).toBe("KOTA JAKARTA");
  });

  it("is case insensitive", () => {
    expect(normalizeToMyquranName("kabupaten gresik")).toBe("KAB. GRESIK");
    expect(normalizeToMyquranName("KABUPATEN GRESIK")).toBe("KAB. GRESIK");
    expect(normalizeToMyquranName("kota bekasi")).toBe("KOTA BEKASI");
    expect(normalizeToMyquranName("KOTA BEKASI")).toBe("KOTA BEKASI");
  });

  it("passes through already-normalized names", () => {
    expect(normalizeToMyquranName("KAB. GRESIK")).toBe("KAB. GRESIK");
    expect(normalizeToMyquranName("KOTA BEKASI")).toBe("KOTA BEKASI");
    expect(normalizeToMyquranName("KOTA JAKARTA")).toBe("KOTA JAKARTA");
  });

  it("returns empty string for empty/whitespace input", () => {
    expect(normalizeToMyquranName("")).toBe("");
    expect(normalizeToMyquranName("   ")).toBe("");
    expect(normalizeToMyquranName(null as unknown as string)).toBe("");
    expect(normalizeToMyquranName(undefined as unknown as string)).toBe("");
  });

  it("trims whitespace", () => {
    expect(normalizeToMyquranName("  Kabupaten Gresik  ")).toBe("KAB. GRESIK");
    expect(normalizeToMyquranName("  Kota Bekasi  ")).toBe("KOTA BEKASI");
  });

  it("uppercases unrecognized format", () => {
    expect(normalizeToMyquranName("Yogyakarta")).toBe("YOGYAKARTA");
    expect(normalizeToMyquranName("Sleman")).toBe("SLEMAN");
  });
});

describe("extractCityFromNominatim", () => {
  it("returns city when present", () => {
    expect(extractCityFromNominatim({ city: "Kota Bekasi" })).toBe("Kota Bekasi");
  });

  it("returns county when city is absent", () => {
    expect(extractCityFromNominatim({ county: "Kabupaten Gresik" })).toBe("Kabupaten Gresik");
  });

  it("returns municipality when city and county absent", () => {
    expect(extractCityFromNominatim({ municipality: "Kota Yogyakarta" })).toBe("Kota Yogyakarta");
  });

  it("returns town when city, county, municipality absent", () => {
    expect(extractCityFromNominatim({ town: "Depok" })).toBe("Depok");
  });

  it("prefers city over county", () => {
    expect(extractCityFromNominatim({ city: "Kota Bekasi", county: "Kabupaten Bekasi" })).toBe("Kota Bekasi");
  });

  it("returns empty string for null/undefined/empty", () => {
    expect(extractCityFromNominatim(null)).toBe("");
    expect(extractCityFromNominatim(undefined)).toBe("");
    expect(extractCityFromNominatim({})).toBe("");
  });

  it("trims whitespace", () => {
    expect(extractCityFromNominatim({ city: "  Kota Bekasi  " })).toBe("Kota Bekasi");
  });
});
