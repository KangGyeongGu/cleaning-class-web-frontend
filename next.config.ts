import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  images: {
    localPatterns: [{ pathname: "/images/**" }],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gezvfabmalvpnumewwgu.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "gezvfabmalvpnumewwgu.supabase.co",
        pathname: "/storage/v1/render/image/public/**",
      },
    ],
    deviceSizes: [390, 430, 640, 750, 828, 1080, 1200, 1920],
    qualities: [75, 85, 100],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
