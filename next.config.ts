import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a self-contained .next/standalone bundle for Docker.
  output: "standalone",
  // Prisma generates the client under node_modules/@prisma/client.
  // Tell Next to include pg and adapter-pg as external server packages
  // so they don't get bundled and break at runtime.
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg", "bcryptjs"],
};

export default nextConfig;
