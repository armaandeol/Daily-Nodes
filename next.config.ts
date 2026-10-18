import type { NextConfig } from "next";

// Mirrors the fallback in src/app/home/actions.ts so local/raw-path node
// images (the rare case a Supabase signed URL failed to generate) resolve
// to whatever API host is actually configured, in any environment.
const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage — avatars + node/digest photos (signed URLs).
      { protocol: "https", hostname: "qsldsgxhdqygurboapzh.supabase.co", pathname: "/storage/v1/object/**" },
      // Clerk's hosted profile images.
      { protocol: "https", hostname: "img.clerk.com" },
      {
        protocol: apiUrl.protocol.replace(":", "") as "http" | "https",
        hostname: apiUrl.hostname,
        port: apiUrl.port || undefined,
        pathname: "/**",
      },
    ],
  },
  experimental: {
    // Lets the client router reuse a page's last-rendered RSC payload
    // instead of refetching + re-running loading.tsx on every navigation
    // back to it, so Home/Explore feel instant on revisit within the
    // window and only go stale after it.
    staleTimes: {
      dynamic: 60,
      static: 300,
    },
  },
};

export default nextConfig;
