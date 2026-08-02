import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Leaflet's map container breaks under React 18 Strict Mode's dev-only double-invoke
  images: {
    unoptimized: true, // required for static export on Netlify free tier
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
  webpack: (config) => {
    // Leaflet / React Flow rely on browser globals; keep them client-only.
    config.resolve.fallback = { ...config.resolve.fallback, fs: false };
    return config;
  },
};

export default nextConfig;
