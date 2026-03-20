// Create a getter function that initializes Prisma ONLY at runtime.
// This prevents Prisma from initializing during the "static scanning" build phase.
export function getPrisma() {
  // During Vercel's build worker, we want to return a mock or just avoid the real DB hit
  if (
    process.env.NEXT_PHASE === "phase-production-build" ||
    (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL)
  ) {
    // Return a Proxy to avoid crashing during static analysis
    return new Proxy({} as any, {
      get: (_, prop) => {
        if (prop === "then") return undefined;
        return () => { throw new Error(`Prisma.${String(prop)} called during build-time.`); };
      }
    });
  }

  // Import from the standard node_modules location
  const { PrismaClient } = require("@prisma/client");

  const globalForPrisma = globalThis as unknown as {
    prisma: any;
  };

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  }
  return globalForPrisma.prisma;
}


export default getPrisma;
