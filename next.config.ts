import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root: a stray lockfile in the home dir otherwise confuses
  // Next's root inference (and breaks output file tracing on deploy).
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
