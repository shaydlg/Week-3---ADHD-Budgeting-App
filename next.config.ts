import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These experimental features make Next.js try to pre-render pages ahead of
  // time. Our app is mostly private, per-user pages that must render fresh for
  // each person, so we keep them off to avoid pre-render conflicts.
  cacheComponents: false,
  partialPrefetching: false,
  // Strict Mode double-mounts components in development, which makes Plaid Link
  // load its script twice and jam. Off here; production already runs once.
  reactStrictMode: false,
};

export default nextConfig;
