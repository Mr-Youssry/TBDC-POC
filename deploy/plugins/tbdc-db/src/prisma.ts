import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Build a PrismaClient bound to the given Postgres URL, using the same
 * driver-adapter pattern as the main app (`src/lib/prisma.ts`). This is the
 * only place inside the plugin that talks directly to `@prisma/adapter-pg`
 * or `@prisma/client` constructors — every tool takes an already-built
 * client via closure from `register(api)`.
 */
export function makePrisma(databaseUrl: string): PrismaClient {
  if (!databaseUrl) {
    throw new Error(
      "[tbdc-db] makePrisma: databaseUrl is empty — refusing to build a PrismaClient without a connection string.",
    );
  }
  const adapter = new PrismaPg(databaseUrl);
  return new PrismaClient({ adapter });
}
