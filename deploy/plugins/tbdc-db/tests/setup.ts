import { execSync, spawnSync } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Disposable Postgres container for vitest. Port 15434 picked to avoid
// colliding with v2-migration-test on 15433. We spin one container per
// test run (singleFork=true in vitest.config.ts) and tear it down after.

const CONTAINER = "tbdc-plugin-test-pg";
const PORT = 15434;
const PASSWORD = "test";
const DB = "tbdc_plugin_test";
export const TEST_DATABASE_URL = `postgresql://postgres:${PASSWORD}@127.0.0.1:${PORT}/${DB}`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// deploy/plugins/tbdc-db/tests → ../../../../prisma/schema.prisma
const ROOT_SCHEMA = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "..",
  "prisma",
  "schema.prisma",
);

function run(cmd: string, opts: { ignoreError?: boolean } = {}): string {
  try {
    return execSync(cmd, { stdio: ["ignore", "pipe", "pipe"] }).toString();
  } catch (err) {
    if (opts.ignoreError) return "";
    throw err;
  }
}

export async function startTestDatabase(): Promise<void> {
  // Tear down any stale container from a previous failed run.
  run(`docker rm -f ${CONTAINER}`, { ignoreError: true });

  run(
    `docker run -d --name ${CONTAINER} -e POSTGRES_PASSWORD=${PASSWORD} -e POSTGRES_DB=${DB} -p ${PORT}:5432 postgres:17-alpine`,
  );

  // Wait for readiness.
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    const out = run(`docker exec ${CONTAINER} pg_isready -U postgres`, {
      ignoreError: true,
    });
    if (out.includes("accepting connections")) break;
    await sleep(500);
  }

  // Push schema via prisma db push (non-destructive). Use the root schema
  // directly. Pass DATABASE_URL via env to prisma.
  const pushRes = spawnSync(
    "npx",
    [
      "prisma",
      "db",
      "push",
      `--schema=${ROOT_SCHEMA}`,
      `--url=${TEST_DATABASE_URL}`,
    ],
    {
      env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
      stdio: ["ignore", "pipe", "pipe"],
      shell: process.platform === "win32",
    },
  );
  if (pushRes.status !== 0) {
    const stderr = pushRes.stderr?.toString() ?? "";
    const stdout = pushRes.stdout?.toString() ?? "";
    throw new Error(
      `prisma db push failed (exit ${pushRes.status}):\n${stdout}\n${stderr}`,
    );
  }
}

export async function stopTestDatabase(): Promise<void> {
  run(`docker rm -f ${CONTAINER}`, { ignoreError: true });
}

export function makeTestPrisma(): PrismaClient {
  const adapter = new PrismaPg(TEST_DATABASE_URL);
  return new PrismaClient({ adapter });
}

export interface SeedIds {
  adminUserId: string;
  assistantUserId: string;
  acmeCompanyId: string;
  widmoCompanyId: string;
  radicalInvestorId: string;
  goldenInvestorId: string;
  matchAcmeRadicalId: string;
}

/**
 * Minimal programmatic seed — just enough rows to exercise every tool.
 * Does NOT use the main seed.ts file because that imports the full
 * reference data and would couple tests to real seed content.
 */
export async function seedTestData(prisma: PrismaClient): Promise<SeedIds> {
  // Nuke in FK-safe order.
  await prisma.auditLog.deleteMany();
  await prisma.match.deleteMany();
  await prisma.doNotMatch.deleteMany();
  await prisma.customerTarget.deleteMany();
  await prisma.industryEvent.deleteMany();
  await prisma.company.deleteMany();
  await prisma.investor.deleteMany();
  await prisma.methodologyDimension.deleteMany();
  await prisma.methodologyCard.deleteMany();
  await prisma.chatSession.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      email: "admin-test@tbdc.test",
      passwordHash: "x",
      name: "Test Admin",
      role: "admin",
    },
  });
  const assistant = await prisma.user.create({
    data: {
      email: "assistant@tbdc.ready4vc.com",
      passwordHash: "!",
      name: "Assistant",
      role: "assistant",
    },
  });

  const radical = await prisma.investor.create({
    data: {
      name: "Radical Ventures",
      type: "VC",
      stage: "Seed–Series A",
      sectors: "Enterprise AI",
      chequeSize: "$2–15M CAD",
      geography: "Canada+US",
      leadOrFollow: "Lead",
      deals12m: "6–8",
      notablePortfolio: "Cohere, Ada",
      contactApproach: "LinkedIn",
      sortOrder: 0,
    },
  });
  const golden = await prisma.investor.create({
    data: {
      name: "Golden Ventures",
      type: "VC",
      stage: "Pre-seed–Seed",
      sectors: "B2B SaaS",
      chequeSize: "$500K–$2M CAD",
      geography: "Canada",
      leadOrFollow: "Lead",
      deals12m: "8–12",
      notablePortfolio: "Wealthsimple",
      contactApproach: "LinkedIn",
      sortOrder: 1,
    },
  });

  const acme = await prisma.company.create({
    data: {
      name: "Acme AI",
      cohort: "2025",
      stage: "Seed",
      sector: "Enterprise AI",
      arrTraction: "$800K ARR",
      askSize: "$3M CAD",
      homeMarket: "Canada",
      targetMarket: "US",
      founderProfile: "2x exit",
      acceptsInvestorIntros: true,
      sortOrder: 0,
    },
  });
  const widmo = await prisma.company.create({
    data: {
      name: "WIDMO Spectral",
      cohort: "2025",
      stage: "Seed",
      sector: "Deep Tech",
      arrTraction: "pre-revenue",
      askSize: "n/a",
      homeMarket: "Canada",
      targetMarket: "Global",
      founderProfile: "Technical founder",
      acceptsInvestorIntros: false,
      gateNote: "Founder declined investor intros",
      sortOrder: 1,
    },
  });

  const match = await prisma.match.create({
    data: {
      companyId: acme.id,
      investorId: radical.id,
      tier: 1,
      score: 14,
      geoPts: 3,
      stagePts: 3,
      sectorPts: 3,
      revenuePts: 2,
      chequePts: 2,
      founderPts: 1,
      gapPts: 0,
      warmPath: "TBDC partner intro",
      portfolioGap: "No direct overlap",
      rationale: "Stage + sector fit",
      nextStep: "Schedule intro",
      sortOrder: 0,
    },
  });

  await prisma.customerTarget.create({
    data: {
      companyId: widmo.id,
      name: "Defense primes",
      targetType: "Enterprise",
      hq: "US",
      description: "Spectral sensing pilot candidates",
      sortOrder: 0,
    },
  });
  await prisma.industryEvent.create({
    data: { companyId: widmo.id, name: "Photonics West 2026", sortOrder: 0 },
  });

  await prisma.methodologyDimension.create({
    data: {
      name: "Geography",
      maxWeight: "3",
      logic: "Home market overlap",
      rationale: "Local investors preferred",
      sortOrder: 0,
    },
  });
  await prisma.methodologyCard.create({
    data: {
      title: "Hard Gate",
      body: "Companies with acceptsInvestorIntros=false get customer targets instead.",
      sortOrder: 0,
    },
  });

  return {
    adminUserId: admin.id,
    assistantUserId: assistant.id,
    acmeCompanyId: acme.id,
    widmoCompanyId: widmo.id,
    radicalInvestorId: radical.id,
    goldenInvestorId: golden.id,
    matchAcmeRadicalId: match.id,
  };
}

/**
 * A minimal fake RegisterApi that captures every registered tool so tests
 * can invoke them directly without running inside an OpenClaw gateway.
 */
export interface CapturedTool {
  name: string;
  label?: string;
  description: string;
  parameters: Record<string, unknown>;
  execute(
    id: string,
    params: Record<string, unknown>,
  ): Promise<{
    content: Array<{ type: "text"; text: string }>;
    details?: { error?: boolean; [k: string]: unknown };
  }>;
}

export function createFakeApi(): {
  tools: Map<string, CapturedTool>;
  api: {
    config: Record<string, unknown>;
    logger: { info: (m: string) => void; warn: (m: string) => void; error: (m: string) => void };
    registerTool: (t: CapturedTool) => void;
  };
} {
  const tools = new Map<string, CapturedTool>();
  return {
    tools,
    api: {
      config: {},
      logger: {
        info: () => {},
        warn: () => {},
        error: () => {},
      },
      registerTool: (t: CapturedTool) => {
        tools.set(t.name, t);
      },
    },
  };
}
