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
import { registerGetCompany } from "../src/tools/getCompany.js";

let prisma: PrismaClient;
let seed: SeedIds;

beforeAll(async () => {
  prisma = makeTestPrisma();
  seed = await seedTestData(prisma);
});

afterAll(async () => {
  await prisma?.$disconnect();
});

describe("get_company", () => {
  it("returns a company with its customer targets and events", async () => {
    const { api, tools } = createFakeApi();
    registerGetCompany(api, prisma);
    const tool = tools.get("get_company")!;

    const result = await tool.execute("t1", { companyId: seed.widmoCompanyId });
    const row = JSON.parse(result.content[0]!.text);
    expect(row.name).toBe("WIDMO Spectral");
    expect(row.acceptsInvestorIntros).toBe(false);
    expect(row.customerTargets).toHaveLength(1);
    expect(row.events).toHaveLength(1);
  });

  it("returns an error for missing companyId", async () => {
    const { api, tools } = createFakeApi();
    registerGetCompany(api, prisma);
    const tool = tools.get("get_company")!;
    const result = await tool.execute("t1", {});
    expect(result.details?.error).toBe(true);
  });
});
