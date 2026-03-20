import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: false,
  output: "standalone",
  serverExternalPackages: [
    "@prisma/client",
    "prisma",
    "bcryptjs",
    "jsonwebtoken",
    "resend",
    "openai"
  ],
  experimental: {
    // Ensuring no conflicting experimental flags are active
  }
};

export default nextConfig;
