import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["glass-refraction"],

  experimental: {
    // Disable client-side router cache for dynamic segments.
    // Prevents stale page segments from being served after a new Vercel deploy.
    staleTimes: {
      dynamic: 0,
      static: 180,
    },

    // Server actions body limit — default is 1MB which blocks uploads.
    // Keep this ABOVE the largest allowed client upload (25 MB documentos)
    // because the multipart/server-action envelope adds overhead and can
    // otherwise surface as a generic "Failed to fetch" before the action runs.
    serverActions: {
      bodySizeLimit: "32mb",
    },
  },

  async headers() {
    return [
      {
        // Auth-sensitive routes must never be served from cache
        source: "/dashboard/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
        ],
      },
      {
        source: "/auth/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
        ],
      },
    ];
  },
};

export default nextConfig;
