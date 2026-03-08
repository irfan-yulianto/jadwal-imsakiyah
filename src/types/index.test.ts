import { describe, it, expect } from "vitest";
import { PRAYER_NAMES, PRAYER_KEYS } from "./index";

describe("PRAYER_NAMES", () => {
  it("has exactly 8 entries", () => {
    expect(PRAYER_NAMES).toHaveLength(8);
  });

  it("contains all prayer names in correct order", () => {
    expect(PRAYER_NAMES).toEqual([
      "Imsak", "Subuh", "Terbit", "Dhuha",
      "Dzuhur", "Ashar", "Maghrib", "Isya",
    ]);
  });
});

describe("PRAYER_KEYS", () => {
  it("has exactly 8 entries", () => {
    expect(PRAYER_KEYS).toHaveLength(8);
  });

  it("contains lowercase versions matching PRAYER_NAMES", () => {
    expect(PRAYER_KEYS).toEqual([
      "imsak", "subuh", "terbit", "dhuha",
      "dzuhur", "ashar", "maghrib", "isya",
    ]);
  });

  it("each key matches its PRAYER_NAMES counterpart (lowercase)", () => {
    for (let i = 0; i < PRAYER_KEYS.length; i++) {
      expect(PRAYER_KEYS[i]).toBe(PRAYER_NAMES[i].toLowerCase());
    }
  });
});
