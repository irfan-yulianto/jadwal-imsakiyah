import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Header from "../Header";
import { useStore } from "@/store/useStore";

// Mock the store
vi.mock("@/store/useStore", () => ({
  useStore: vi.fn(),
}));

// Mock the components used inside Header
vi.mock("@/components/location/LocationSearch", () => ({
  default: () => <div data-testid="location-search">Location Search</div>,
}));

vi.mock("@/components/ui/Icons", () => ({
  CrescentIcon: () => <svg data-testid="crescent-icon" />,
  SunIcon: () => <svg data-testid="sun-icon" />,
  MoonIcon: () => <svg data-testid="moon-icon" />,
}));

vi.mock("@/lib/hijri", () => ({
  getHijriMonthsForGregorianMonth: vi.fn().mockReturnValue([
    { monthName: "Ramadan", year: 1446 },
    { monthName: "Syawal", year: 1446 }
  ]),
}));

describe("Header", () => {
  const mockSetTheme = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default store mock implementation
    vi.mocked(useStore).mockImplementation((selector: any) => {
      const state = {
        isOffline: false,
        theme: "light",
        setTheme: mockSetTheme,
        viewMonth: 3,
        viewYear: 2024,
      };
      return selector(state);
    });

    // Reset localStorage mock
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
  });

  it("renders correctly", () => {
    render(<Header />);
    expect(screen.getByText("Si-Imsak")).toBeInTheDocument();
    expect(screen.getByTestId("location-search")).toBeInTheDocument();
  });

  it("sets theme from localStorage if available", () => {
    vi.spyOn(window.localStorage, 'getItem').mockReturnValue('dark');
    render(<Header />);
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("sets default dark theme if localStorage is empty", () => {
    vi.spyOn(window.localStorage, 'getItem').mockReturnValue(null);
    render(<Header />);
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("handles localStorage errors gracefully and sets default dark theme", () => {
    vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
      throw new Error("Access denied (e.g., Safari Private Mode)");
    });

    render(<Header />);
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("toggles theme when button is clicked", () => {
    render(<Header />);
    const button = screen.getByRole("button", { name: /aktifkan mode gelap/i });
    fireEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("displays offline indicator when isOffline is true", () => {
    vi.mocked(useStore).mockImplementation((selector: any) => {
      const state = {
        isOffline: true,
        theme: "light",
        setTheme: mockSetTheme,
        viewMonth: 3,
        viewYear: 2024,
      };
      return selector(state);
    });

    render(<Header />);
    expect(screen.getByText("Offline")).toBeInTheDocument();
  });
});
