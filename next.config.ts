import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Initialize CF bindings for local development
if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,

  // Cloudflare Workers doesn't support native Node.js binaries (sharp)
  images: {
    unoptimized: true,
  },

  // Don't bundle Node.js-only packages for edge runtime
  experimental: {
    serverComponentsExternalPackages: ["sharp"],
  },
};

export default nextConfig;
