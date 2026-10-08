import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: { cpus: 2 },
  eslint: {
    ignoreDuringBuilds: true
  },
  // The scanner resolves Playwright's browsers and axe-core's script from disk at runtime.
  // Bundled, require.resolve() returns a webpack module id (a number) instead of a path.
  serverExternalPackages: ["playwright", "playwright-core", "axe-core"]
};

export default nextConfig;
