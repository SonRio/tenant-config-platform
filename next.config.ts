import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root: a stray lockfile in the home dir otherwise confuses
  // Next's root inference (and breaks output file tracing on deploy).
  turbopack: {
    root: import.meta.dirname,
  },
  // Force the Prisma query engine + schema into every serverless function
  // bundle. Needed because building on macOS otherwise traces only the native
  // engine and omits the Linux engine the Vercel runtime requires.
  outputFileTracingIncludes: {
    "/**": [
      "./node_modules/.prisma/client/**",
      "./node_modules/@prisma/client/**",
      "./prisma/schema.prisma",
    ],
  },
};

export default nextConfig;
