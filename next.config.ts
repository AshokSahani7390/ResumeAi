import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: false, // Turn off experimental compiler
  output: "standalone",
  serverExternalPackages: ["@prisma/client", "bcryptjs", "jsonwebtoken"],
  // This is the CRITICAL part: Disabling the new Turbopack build engine to fix the "instantiateModule" crash
  experimental: {
    turbo: {
      rules: {}
    }
  },
  webpack: (config) => {
    // Forcing Webpack to handle dependencies helps stabilize Prisma/bcrypt in Next.js 16
    return config;
  }
};

export default nextConfig;
