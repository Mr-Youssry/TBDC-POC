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
import { registerUpdateCompany } from "../src/tools/updateCompany.js";

let prisma: PrismaClient;
let seed: SeedIds;

beforeAll(async () => {
  prisma = makeTestPrisma();
  seed = await seedTestData(prisma);
});

afterAll(async () => {
  await prisma?.$disconnect();
});

describe("update_company", () => {
  it("updates allowed fields and writes an AuditLog entry", async () => {
    const { api, tools } = createFakeApi();
    registerUpdateCompany(api, prisma, {
      assistantUserId: seed.assistantUserId,
    });
    const tool = tools.get("update_company")!;

    const result = await tool.execute("t1", {
      companyId: seed.acmeCompanyId,
      actingUserId: seed.adminUserId,
      patch: { stage: "Series A", askSize: "$5M CAD" },
    });
    expect(result.details?.error).not.toBe(true);

    const after = await prisma.company.findUniqueOrThrow({
      where: { id: seed.acmeCompanyId },
    });
    expect(after.stage).toBe("Series A");
    expect(after.askSize).toBe("$5M CAD");
    expect(after.updatedByUserId).toBe(seed.adminUserId);

    const audit = await prisma.auditLog.findFirst({
      where: { tableName: "Company", rowId: seed.acmeCompanyId },
      orderBy: { createdAt: "desc" },
    });
    expect(audit).toBeTruthy();
    expect(audit!.onBehalfOfUserId).toBe(seed.adminUserId);
  });
});
