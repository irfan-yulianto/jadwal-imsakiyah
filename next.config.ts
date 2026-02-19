import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@react-pdf/renderer"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), payment=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://*.clarity.ms https://va.vercel-scripts.com; connect-src 'self' https://api.myquran.com https://worldtimeapi.org https://*.clarity.ms https://vitals.vercel-insights.com data:; img-src 'self' data: blob: https://*.clarity.ms; style-src 'self' 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; worker-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';" },
        ],
      },
    ];
  },
};

export default nextConfig;
