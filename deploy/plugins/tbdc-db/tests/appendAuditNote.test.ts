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
import { registerAppendAuditNote } from "../src/tools/appendAuditNote.js";

let prisma: PrismaClient;
let seed: SeedIds;

beforeAll(async () => {
  prisma = makeTestPrisma();
  seed = await seedTestData(prisma);
});

afterAll(async () => {
  await prisma?.$disconnect();
});

describe("append_audit_note", () => {
  it("writes an audit row without mutating any content table", async () => {
    const { api, tools } = createFakeApi();
    registerAppendAuditNote(api, prisma, {
      assistantUserId: seed.assistantUserId,
    });
    const tool = tools.get("append_audit_note")!;

    const beforeCount = await prisma.company.count();
    const result = await tool.execute("t1", {
      actingUserId: seed.adminUserId,
      tableName: "Match",
      rowId: seed.matchAcmeRadicalId,
      note: "Considered but not changed — score already optimal",
    });
    expect(result.details?.error).not.toBe(true);

    const afterCount = await prisma.company.count();
    expect(afterCount).toBe(beforeCount);

    const audit = await prisma.auditLog.findFirst({
      where: {
        tableName: "Match",
        rowId: seed.matchAcmeRadicalId,
        operation: "insert",
      },
      orderBy: { createdAt: "desc" },
    });
    expect(audit).toBeTruthy();
    const payload = audit!.newValueJson as Record<string, unknown>;
    expect(payload.note).toContain("Considered but not changed");
  });
});
