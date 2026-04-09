import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { PrismaClient } from "@prisma/client";
import {
  startTestDatabase,
  stopTestDatabase,
  makeTestPrisma,
  seedTestData,
  createFakeApi,
} from "./setup.js";
import { registerGetMethodology } from "../src/tools/getMethodology.js";

let prisma: PrismaClient;

beforeAll(async () => {
  prisma = makeTestPrisma();
  await seedTestData(prisma);
});

afterAll(async () => {
  await prisma?.$disconnect();
});

describe("get_methodology", () => {
  it("returns dimensions and cards", async () => {
    const { api, tools } = createFakeApi();
    registerGetMethodology(api, prisma);
    const tool = tools.get("get_methodology")!;

    const result = await tool.execute("t1", {});
    const payload = JSON.parse(result.content[0]!.text);
    expect(payload.dimensions).toHaveLength(1);
    expect(payload.dimensions[0].name).toBe("Geography");
    expect(payload.cards).toHaveLength(1);
    expect(payload.cards[0].title).toBe("Hard Gate");
  });
});
