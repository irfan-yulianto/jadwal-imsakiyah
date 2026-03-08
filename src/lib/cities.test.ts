import { describe, it, expect } from "vitest";
import { getCityGuess } from "./cities";

describe("getCityGuess", () => {
  it("returns KOTA JAKARTA for Jakarta coordinates", () => {
    expect(getCityGuess(-6.17, 106.85)).toBe("KOTA JAKARTA");
  });

  it("returns KOTA SURABAYA for Surabaya coordinates", () => {
    expect(getCityGuess(-7.25, 112.75)).toBe("KOTA SURABAYA");
  });

  it("returns KOTA BANDA ACEH for northwestern Indonesia", () => {
    expect(getCityGuess(5.55, 95.32)).toBe("KOTA BANDA ACEH");
  });

  it("returns KAB. MERAUKE for southeastern Papua", () => {
    expect(getCityGuess(-8.50, 140.40)).toBe("KAB. MERAUKE");
  });

  it("returns closest city for coordinates near Jakarta", () => {
    // Slightly offset from Jakarta center
    expect(getCityGuess(-6.18, 106.84)).toBe("KOTA JAKARTA");
  });

  it("returns KOTA DENPASAR for Bali coordinates", () => {
    expect(getCityGuess(-8.65, 115.22)).toBe("KOTA DENPASAR");
  });

  it("never returns null", () => {
    // Even for extreme coordinates, it should return the closest city
    const result = getCityGuess(0, 110);
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });

  it("returns correct city for Pontianak (near equator)", () => {
    expect(getCityGuess(-0.02, 109.34)).toBe("KOTA PONTIANAK");
  });
});
