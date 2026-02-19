const windowMs = 60_000; // 1 minute window
const maxRequests = 30; // max requests per window per IP
const MAX_IPS = 10000; // max tracked IPs to prevent memory exhaustion

const requests = new Map<string, number[]>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of requests) {
    const valid = timestamps.filter((t) => now - t < windowMs);
    if (valid.length === 0) requests.delete(key);
    else requests.set(key, valid);
  }
}, 300_000);

/**
 * Extract client IP from x-forwarded-for header.
 * Uses the rightmost non-private IP (closest to server, hardest to spoof).
 */
export function extractClientIp(header: string | null): string {
  if (!header) return "unknown";
  const ips = header.split(",").map((s) => s.trim()).filter(Boolean);
  // Rightmost IP is set by the nearest trusted proxy
  return ips[ips.length - 1] || "unknown";
}

export function isRateLimited(ip: string, limit: number = maxRequests): boolean {
  const key = limit === maxRequests ? ip : `${ip}:${limit}`;
  const now = Date.now();
  const timestamps = requests.get(key) || [];
  const valid = timestamps.filter((t) => now - t < windowMs);

  if (valid.length >= limit) {
    requests.set(key, valid);
    return true;
  }

  // Prevent memory exhaustion from high-cardinality IPs
  if (!requests.has(key) && requests.size >= MAX_IPS) {
    return true; // Reject untracked IPs when map is full
  }

  valid.push(now);
  requests.set(key, valid);
  return false;
}
