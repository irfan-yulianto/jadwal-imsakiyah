import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Si-Imsak — Jadwal Imsakiyah & Waktu Sholat",
    short_name: "Si-Imsak",
    description:
      "Jadwal Imsakiyah dan waktu sholat untuk seluruh kota di Indonesia",
    start_url: "/",
    display: "standalone",
    background_color: "#0F1419",
    theme_color: "#064E3B",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
