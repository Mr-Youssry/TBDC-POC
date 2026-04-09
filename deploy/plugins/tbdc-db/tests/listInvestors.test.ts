import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { PrismaClient } from "@prisma/client";
import {
  startTestDatabase,
  stopTestDatabase,
  makeTestPrisma,
  seedTestData,
  createFakeApi,
} from "./setup.js";
import { registerListInvestors } from "../src/tools/listInvestors.js";

let prisma: PrismaClient;

beforeAll(async () => {
  prisma = makeTestPrisma();
  await seedTestData(prisma);
});

afterAll(async () => {
  await prisma?.$disconnect();
});

describe("list_investors", () => {
  it("returns all seeded investors ordered by sortOrder", async () => {
    const { api, tools } = createFakeApi();
    registerListInvestors(api, prisma);
    const tool = tools.get("list_investors")!;
    expect(tool).toBeDefined();

    const result = await tool.execute("t1", {});
    expect(result.content).toHaveLength(1);
    const rows = JSON.parse(result.content[0]!.text);
    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(2);
    expect(rows[0].name).toBe("Radical Ventures");
    expect(rows[1].name).toBe("Golden Ventures");
  });
});
