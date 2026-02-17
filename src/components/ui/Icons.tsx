import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const defaultProps = (size: number = 24): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

// Crescent moon + plate (pre-dawn meal)
export function ImsakIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
      <path d="M5 18h14" strokeWidth={1.5} />
      <path d="M7 21h10" strokeWidth={1} strokeDasharray="2 2" />
    </svg>
  );
}

// Dawn horizon with rays
export function SubuhIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M4 18h16" />
      <path d="M12 14a4 4 0 0 1 4-4" />
      <path d="M12 14a4 4 0 0 0-4-4" />
      <path d="M12 6v2" />
      <path d="M6.34 8.34l1.42 1.42" />
      <path d="M17.66 8.34l-1.42 1.42" />
    </svg>
  );
}

// Sunrise
export function TerbitIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M4 18h16" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v4" />
      <path d="M4.93 4.93l2.83 2.83" />
      <path d="M19.07 4.93l-2.83 2.83" />
    </svg>
  );
}

// Morning sun (higher)
export function DhuhaIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <circle cx="12" cy="10" r="4" />
      <path d="M12 2v2" />
      <path d="M4 18h16" />
      <path d="M3.5 10H5" />
      <path d="M19 10h1.5" />
      <path d="M5.64 4.64l1.06 1.06" />
      <path d="M18.36 4.64l-1.06 1.06" />
    </svg>
  );
}

// Full sun at zenith
export function DzuhurIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
      <path d="M4.93 4.93l2.83 2.83" />
      <path d="M16.24 16.24l2.83 2.83" />
      <path d="M19.07 4.93l-2.83 2.83" />
      <path d="M4.93 19.07l2.83-2.83" />
    </svg>
  );
}

// Afternoon sun (descending)
export function AsharIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
      <path d="M16.24 7.76l1.42-1.42" />
      <path d="M6.34 17.66l1.42-1.42" />
    </svg>
  );
}

// Sunset
export function MaghribIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M4 18h16" />
      <circle cx="12" cy="14" r="4" />
      <path d="M12 6v2" />
      <path d="M6.34 8.34l1.42 1.42" />
      <path d="M17.66 8.34l-1.42 1.42" />
      <path d="M3.5 14H5" />
      <path d="M19 14h1.5" />
    </svg>
  );
}

// Night crescent + stars
export function IsyaIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
      <path d="M19 3l.5 1.5L21 5l-1.5.5L19 7l-.5-1.5L17 5l1.5-.5L19 3z" fill="currentColor" strokeWidth={0} />
      <path d="M15 1l.3.9.9.3-.9.3-.3.9-.3-.9-.9-.3.9-.3L15 1z" fill="currentColor" strokeWidth={0} />
    </svg>
  );
}

// Mosque silhouette (for branding)
export function MosqueIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M12 2C9 5 7 7 7 10v10h10V10c0-3-2-5-5-8z" />
      <path d="M3 22V14a2 2 0 0 1 2-2h2" />
      <path d="M21 22V14a2 2 0 0 0-2-2h-2" />
      <path d="M3 22h18" />
      <circle cx="12" cy="10" r="1.5" />
      <path d="M10 22v-4a2 2 0 0 1 4 0v4" />
    </svg>
  );
}

// Crescent for logo
export function CrescentIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props} fill="currentColor" stroke="none">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 0 1 0-16c-3 2-5 5-5 8s2 6 5 8z" />
    </svg>
  );
}

// Download icon
export function DownloadIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

// Share icon
export function ShareIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

// Copy icon
export function CopyIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

// Map pin
export function MapPinIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

// Search icon
export function SearchIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

// Image icon
export function ImageIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

// File text icon (PDF)
export function FileTextIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

// Calendar icon
export function CalendarIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

// Sun icon (for light mode indicator)
export function SunIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

// Moon icon (for dark mode indicator)
export function MoonIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

// Map all prayer keys to their icons
export const PRAYER_ICON_MAP: Record<string, React.ComponentType<IconProps>> = {
  imsak: ImsakIcon,
  subuh: SubuhIcon,
  terbit: TerbitIcon,
  dhuha: DhuhaIcon,
  dzuhur: DzuhurIcon,
  ashar: AsharIcon,
  maghrib: MaghribIcon,
  isya: IsyaIcon,
};
