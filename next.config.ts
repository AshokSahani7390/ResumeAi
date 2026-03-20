import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  reactCompiler: false, // Explicitly false as requested in earlier queries
  output: "standalone",
  serverExternalPackages: [
    "@prisma/client",
    "prisma",
    "bcryptjs",
    "jsonwebtoken",
    "resend",
    "openai"
  ],
  // Remove experimental block if it's causing unrecognized key errors
  // Next 15/16 uses top-level keys for many formerly experimental features
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("@prisma/client", "bcryptjs", "jsonwebtoken");
    }
    return config;
  }
};

export default nextConfig;
