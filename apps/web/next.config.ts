import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const ContentSecurityPolicy = [
  "default-src 'self'",
  // Next.js requires unsafe-inline for hydration scripts; unsafe-eval only in dev (Turbopack HMR)
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // Local images + data URIs for SVG/canvas; no external image hosts needed
  "img-src 'self' data: blob:",
  // Google Fonts are inlined by next/font at build time — no external font request needed
  "font-src 'self'",
  // Formspree for contact form; WebSocket for dev HMR
  `connect-src 'self' https://formspree.io${isDev ? " ws://localhost:* ws://127.0.0.1:*" : ""}`,
  // No iframes on this site and we don't want to be embedded in one
  "frame-ancestors 'none'",
  // Prevent base-tag injection attacks
  "base-uri 'self'",
  // Only allow form submissions to our origin and Formspree
  "form-action 'self' https://formspree.io",
  // Force HTTPS for any mixed-content resources
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  // Enable DNS prefetching for performance
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // HSTS: force HTTPS for 2 years, include subdomains, allow preloading
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Prevent clickjacking
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Only send origin in cross-origin referrer, full URL for same-origin
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable browser features not used by this site
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  // Content Security Policy
  { key: "Content-Security-Policy", value: ContentSecurityPolicy },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
