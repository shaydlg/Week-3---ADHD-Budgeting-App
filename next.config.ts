import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These experimental features make Next.js try to pre-render pages ahead of
  // time. Our app is mostly private, per-user pages that must render fresh for
  // each person, so we keep them off to avoid pre-render conflicts.
  cacheComponents: false,
  partialPrefetching: false,
};

export default nextConfig;
