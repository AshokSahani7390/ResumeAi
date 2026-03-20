import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone",
  serverExternalPackages: ["@prisma/client", "jsonwebtoken"],
  transpilePackages: ["bcryptjs"],
};

export default nextConfig;
