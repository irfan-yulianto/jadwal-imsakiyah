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

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = requests.get(ip) || [];
  const valid = timestamps.filter((t) => now - t < windowMs);

  if (valid.length >= maxRequests) {
    requests.set(ip, valid);
    return true;
  }

  // Prevent memory exhaustion from high-cardinality IPs
  if (!requests.has(ip) && requests.size >= MAX_IPS) {
    return false; // Allow but don't track
  }

  valid.push(now);
  requests.set(ip, valid);
  return false;
}
