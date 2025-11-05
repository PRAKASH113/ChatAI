import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // ✅ Skip type checking in production builds
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
