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

    // Server actions body limit — default is 1MB which blocks photo uploads.
    // Set to match the 10MB validation in FotoUploadDialog.
    serverActions: {
      bodySizeLimit: "10mb",
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
