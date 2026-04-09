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
import { registerUpdateMatch } from "../src/tools/updateMatch.js";

let prisma: PrismaClient;
let seed: SeedIds;

beforeAll(async () => {
  prisma = makeTestPrisma();
  seed = await seedTestData(prisma);
});

afterAll(async () => {
  await prisma?.$disconnect();
});

describe("update_match", () => {
  it("updates allowed fields and writes an AuditLog entry", async () => {
    const { api, tools } = createFakeApi();
    registerUpdateMatch(api, prisma, {
      assistantUserId: seed.assistantUserId,
    });
    const tool = tools.get("update_match")!;

    const result = await tool.execute("t1", {
      matchId: seed.matchAcmeRadicalId,
      actingUserId: seed.adminUserId,
      patch: { score: 15, rationale: "Updated rationale" },
    });
    expect(result.details?.error).not.toBe(true);

    const after = await prisma.match.findUniqueOrThrow({
      where: { id: seed.matchAcmeRadicalId },
    });
    expect(after.score).toBe(15);
    expect(after.rationale).toBe("Updated rationale");
    expect(after.updatedByUserId).toBe(seed.adminUserId);

    const audit = await prisma.auditLog.findFirst({
      where: { tableName: "Match", rowId: seed.matchAcmeRadicalId },
      orderBy: { createdAt: "desc" },
    });
    expect(audit).toBeTruthy();
    expect(audit!.operation).toBe("update");
    expect(audit!.actorUserId).toBe(seed.assistantUserId);
    expect(audit!.onBehalfOfUserId).toBe(seed.adminUserId);
    const oldVal = audit!.oldValueJson as Record<string, unknown>;
    const newVal = audit!.newValueJson as Record<string, unknown>;
    expect(oldVal.score).toBe(14);
    expect(newVal.score).toBe(15);
  });

  it("rejects disallowed fields (id, createdAt) silently and no-ops if patch becomes empty", async () => {
    const { api, tools } = createFakeApi();
    registerUpdateMatch(api, prisma, {
      assistantUserId: seed.assistantUserId,
    });
    const tool = tools.get("update_match")!;
    const result = await tool.execute("t1", {
      matchId: seed.matchAcmeRadicalId,
      actingUserId: seed.adminUserId,
      patch: { id: "evil", createdAt: "2000-01-01" },
    });
    expect(result.details?.error).toBe(true);
  });

  it("requires actingUserId", async () => {
    const { api, tools } = createFakeApi();
    registerUpdateMatch(api, prisma, {
      assistantUserId: seed.assistantUserId,
    });
    const tool = tools.get("update_match")!;
    const result = await tool.execute("t1", {
      matchId: seed.matchAcmeRadicalId,
      patch: { score: 10 },
    });
    expect(result.details?.error).toBe(true);
  });
});
