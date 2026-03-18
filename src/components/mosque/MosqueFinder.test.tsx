import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import MosqueFinder from "./MosqueFinder";
import { useStore } from "@/store/useStore";

// Mock zustand store
vi.mock("@/store/useStore", () => ({
  useStore: vi.fn(),
}));

// Mock CITIES
vi.mock("@/lib/cities", () => ({
  CITIES: [
    { id: "1", name: "JAKARTA", lat: -6.17, lng: 106.85, provinceId: "1", type: "KOTA" },
    { id: "2", name: "BANDUNG", lat: -6.91, lng: 107.61, provinceId: "2", type: "KOTA" },
  ],
}));

describe("MosqueFinder", () => {
  const mockLocation = { cityName: "JAKARTA" };
  const mockSetUserCoords = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default store mock
    (useStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: unknown) => unknown) => {
      const state = {
        location: mockLocation,
        userCoords: null,
        setUserCoords: mockSetUserCoords,
        isOffline: false,
      };
      return selector(state);
    });

    // Mock global fetch
    global.fetch = vi.fn();

    // Mock sessionStorage
    const sessionStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    Object.defineProperty(window, 'sessionStorage', {
      value: sessionStorageMock,
      writable: true
    });

    // Mock navigator.geolocation
    const geolocationMock = {
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    };
    Object.defineProperty(navigator, 'geolocation', {
      value: geolocationMock,
      writable: true
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders correctly with initial city location", async () => {
    // Initial fetch from city coords
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: true,
        data: [{ id: "node/1", name: "Masjid Istiqlal", lat: -6.170, lng: 106.831, distance: 2000 }],
      }),
    });

    await act(async () => {
      render(<MosqueFinder />);
    });

    expect(screen.getByText("Masjid Terdekat")).toBeInTheDocument();
    expect(screen.getByText("Perkiraan lokasi: JAKARTA")).toBeInTheDocument();
    expect(screen.getByText("Gunakan Lokasi GPS")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Masjid Istiqlal")).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("/api/mosques?lat=-6.17&lng=106.85"));
  });

  it("handles empty results correctly", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: true,
        data: [],
      }),
    });

    await act(async () => {
      render(<MosqueFinder />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Tidak ada masjid ditemukan dalam radius/)).toBeInTheDocument();
    });
  });

  it("handles API error correctly", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await act(async () => {
      render(<MosqueFinder />);
    });

    await waitFor(() => {
      expect(screen.getByText("Server error (500). Coba lagi nanti.")).toBeInTheDocument();
    });
  });

  it("shows offline message when store isOffline is true", async () => {
    (useStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: unknown) => unknown) => {
      const state = {
        location: mockLocation,
        userCoords: null,
        setUserCoords: mockSetUserCoords,
        isOffline: true, // Mock offline
      };
      return selector(state);
    });

    await act(async () => {
      render(<MosqueFinder />);
    });

    await waitFor(() => {
      expect(screen.getByText("Anda sedang offline. Periksa koneksi internet Anda.")).toBeInTheDocument();
    });

    // Fetch should not be called when offline
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("detects GPS and updates location", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        status: true,
        data: [{ id: "node/1", name: "Masjid GPS", lat: -6.20, lng: 106.80, distance: 500 }],
      }),
    });

    const watchPositionMock = vi.fn().mockImplementation((successCallback) => {
      successCallback({
        coords: { latitude: -6.20, longitude: 106.80, accuracy: 50 },
      });
      return 1; // watch ID
    });

    navigator.geolocation.watchPosition = watchPositionMock;

    await act(async () => {
      render(<MosqueFinder />);
    });

    // Clear initial city fetch
    (global.fetch as ReturnType<typeof vi.fn>).mockClear();

    const gpsButton = screen.getByText("Gunakan Lokasi GPS");

    await act(async () => {
      fireEvent.click(gpsButton);
    });

    expect(watchPositionMock).toHaveBeenCalled();

    // The UI should update to show GPS location
    await waitFor(() => {
      expect(screen.getByText(/Lokasi GPS \(-6.2000, 106.8000\)/)).toBeInTheDocument();
    });

    // We shouldn't fetch immediately because it's still detecting, but since accuracy=50 <= 100,
    // it triggers `settle()`, which sets `detecting` to false and triggers fetch
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("lat=-6.2"));
      expect(screen.getByText("Masjid GPS")).toBeInTheDocument();
    });
  });

  it("handles city search correctly", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        status: true,
        data: [],
      }),
    });

    await act(async () => {
      render(<MosqueFinder />);
    });

    // Clear initial city fetch
    (global.fetch as ReturnType<typeof vi.fn>).mockClear();

    const searchInput = screen.getByPlaceholderText("Cari kota untuk lokasi masjid...");

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "BANDUNG" } });
    });

    const cityResult = screen.getByText("BANDUNG");
    expect(cityResult).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(cityResult);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("lat=-6.91&lng=107.61"));
    });
  });

  it("uses cached data if available", async () => {
    const cachedData = {
      data: [{ id: "node/cached", name: "Cached Mosque", lat: -6.17, lng: 106.85, distance: 100 }],
      ts: Date.now(),
    };

    window.sessionStorage.getItem = vi.fn().mockReturnValue(JSON.stringify(cachedData));

    await act(async () => {
      render(<MosqueFinder />);
    });

    // Fetch should NOT be called because data is cached
    expect(global.fetch).not.toHaveBeenCalled();

    expect(screen.getByText("Cached Mosque")).toBeInTheDocument();
  });
});
