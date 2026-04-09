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
import { registerUpdateInvestor } from "../src/tools/updateInvestor.js";

let prisma: PrismaClient;
let seed: SeedIds;

beforeAll(async () => {
  prisma = makeTestPrisma();
  seed = await seedTestData(prisma);
});

afterAll(async () => {
  await prisma?.$disconnect();
});

describe("update_investor", () => {
  it("updates allowed fields and writes an AuditLog entry", async () => {
    const { api, tools } = createFakeApi();
    registerUpdateInvestor(api, prisma, {
      assistantUserId: seed.assistantUserId,
    });
    const tool = tools.get("update_investor")!;

    const result = await tool.execute("t1", {
      investorId: seed.radicalInvestorId,
      actingUserId: seed.adminUserId,
      patch: { chequeSize: "$5–20M CAD" },
    });
    expect(result.details?.error).not.toBe(true);

    const after = await prisma.investor.findUniqueOrThrow({
      where: { id: seed.radicalInvestorId },
    });
    expect(after.chequeSize).toBe("$5–20M CAD");

    const audit = await prisma.auditLog.findFirst({
      where: { tableName: "Investor", rowId: seed.radicalInvestorId },
      orderBy: { createdAt: "desc" },
    });
    expect(audit).toBeTruthy();
    expect(audit!.onBehalfOfUserId).toBe(seed.adminUserId);
  });
});
