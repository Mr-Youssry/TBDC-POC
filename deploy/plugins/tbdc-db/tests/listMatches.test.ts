import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { PrismaClient } from "@prisma/client";
import {
  startTestDatabase,
  stopTestDatabase,
  makeTestPrisma,
  seedTestData,
  createFakeApi,
  type SeedIds,
} from "./setup.js";
import { registerListMatches } from "../src/tools/listMatches.js";

let prisma: PrismaClient;
let seed: SeedIds;

beforeAll(async () => {
  prisma = makeTestPrisma();
  seed = await seedTestData(prisma);
});

afterAll(async () => {
  await prisma?.$disconnect();
});

describe("list_matches", () => {
  it("returns matches for a company with investor summaries", async () => {
    const { api, tools } = createFakeApi();
    registerListMatches(api, prisma);
    const tool = tools.get("list_matches")!;

    const result = await tool.execute("t1", {
      companyId: seed.acmeCompanyId,
    });
    const rows = JSON.parse(result.content[0]!.text);
    expect(rows).toHaveLength(1);
    expect(rows[0].tier).toBe(1);
    expect(rows[0].investor.name).toBe("Radical Ventures");
  });

  it("returns empty list for WIDMO (hard gate)", async () => {
    const { api, tools } = createFakeApi();
    registerListMatches(api, prisma);
    const tool = tools.get("list_matches")!;
    const result = await tool.execute("t1", {
      companyId: seed.widmoCompanyId,
    });
    const rows = JSON.parse(result.content[0]!.text);
    expect(rows).toEqual([]);
  });
});
