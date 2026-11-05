import type { NextConfig } from "next";

// ── Security headers ──────────────────────────────────────────────────────────
const securityHeaders = [
  // Prevent embedding in iframes (clickjacking)
  { key: "X-Frame-Options",           value: "DENY" },
  // Stop MIME-type sniffing
  { key: "X-Content-Type-Options",    value: "nosniff" },
  // Referrer policy — don't leak URL to third parties
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  // Allow only HTTPS
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Permissions policy — disable unnecessary browser features
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(self), geolocation=(), payment=()",
  },
  // Content Security Policy
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Scripts: self + inline (Next.js requires this) + eval for code runner
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // Styles: self + inline (Tailwind CSS-in-JS)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts
      "font-src 'self' https://fonts.gstatic.com",
      // Images: self + data URIs (base64 uploads) + Pollinations (image gen) + DuckDuckGo icons
      "img-src 'self' data: blob: https://image.pollinations.ai https://*.duckduckgo.com https://icons.duckduckgo.com",
      // Connect: self + Supabase + Groq + DuckDuckGo + Pollinations
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.groq.com https://api.duckduckgo.com https://image.pollinations.ai",
      // Media: self + blob
      "media-src 'self' blob:",
      // Worker for Service Workers
      "worker-src 'self' blob:",
      // Object/frame: block everything
      "object-src 'none'",
      "frame-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,

  // Apply security headers to all routes
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  // Image domains allowed for next/image
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.pollinations.ai" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" }, // Google avatars
    ],
  },

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
