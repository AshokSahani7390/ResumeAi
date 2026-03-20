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
  // Explicitly enable empty turbopack config for Next 16 production build compatibility 
  // This silences the error when Turbopack is used by default
  turbopack: {}
};

export default nextConfig;
