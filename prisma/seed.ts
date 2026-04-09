import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { INVESTORS } from "./data/investors";
import { COMPANIES } from "./data/companies";
import { MATCH_BLOCKS } from "./data/matches";
import { DIMENSIONS, CARDS } from "./data/methodology";

function getPrisma(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required to seed");
  const adapter = new PrismaPg(url);
  return new PrismaClient({ adapter });
}

async function main() {
  const prisma = getPrisma();

  console.log("🌱  TBDC POC seed — reference HTML → Postgres");

  // ── 1. Methodology content ─────────────────────────────────────────
  await prisma.methodologyDimension.deleteMany({});
  for (let i = 0; i < DIMENSIONS.length; i++) {
    const d = DIMENSIONS[i]!;
    await prisma.methodologyDimension.create({
      data: { ...d, sortOrder: i },
    });
  }
  console.log(`   ✓ ${DIMENSIONS.length} methodology dimensions`);

  await prisma.methodologyCard.deleteMany({});
  for (let i = 0; i < CARDS.length; i++) {
    const c = CARDS[i]!;
    await prisma.methodologyCard.create({
      data: { ...c, sortOrder: i },
    });
  }
  console.log(`   ✓ ${CARDS.length} methodology cards`);

  // ── 2. Investors ───────────────────────────────────────────────────
  // Nuke relations first (cascade would handle this, but explicit is safer)
  await prisma.match.deleteMany({});
  await prisma.doNotMatch.deleteMany({});
  await prisma.customerTarget.deleteMany({});
  await prisma.industryEvent.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.investor.deleteMany({});

  const investorIdByName = new Map<string, string>();
  for (let i = 0; i < INVESTORS.length; i++) {
    const iv = INVESTORS[i]!;
    const created = await prisma.investor.create({
      data: { ...iv, sortOrder: i },
    });
    investorIdByName.set(iv.name, created.id);
  }
  console.log(`   ✓ ${INVESTORS.length} investors`);

  // ── 3. Companies ───────────────────────────────────────────────────
  const companyIdByIndex = new Map<number, string>();
  for (let i = 0; i < COMPANIES.length; i++) {
    const co = COMPANIES[i]!;
    const created = await prisma.company.create({
      data: { ...co, sortOrder: i },
    });
    companyIdByIndex.set(i, created.id);
  }
  console.log(`   ✓ ${COMPANIES.length} companies`);

  // ── 4. Matches, Do Not Match, Customer Targets, Events ─────────────
  let matchCount = 0;
  let dnCount = 0;
  let ctCount = 0;
  let evCount = 0;
  for (const block of MATCH_BLOCKS) {
    const companyId = companyIdByIndex.get(block.companyIndex);
    if (!companyId) continue;

    if (block.tier1) {
      for (let i = 0; i < block.tier1.length; i++) {
        const m = block.tier1[i]!;
        const investorId = investorIdByName.get(m.investor);
        if (!investorId) {
          console.warn(`   ! unknown investor in tier1: ${m.investor}`);
          continue;
        }
        await prisma.match.create({
          data: {
            companyId,
            investorId,
            tier: 1,
            score: m.score,
            geoPts: m.geo,
            stagePts: m.stage,
            sectorPts: m.sector,
            revenuePts: m.revenue,
            chequePts: m.cheque,
            founderPts: m.founder,
            gapPts: m.gap,
            warmPath: m.warmPath,
            portfolioGap: m.portfolioGap,
            rationale: m.rationale,
            nextStep: m.nextStep,
            sortOrder: i,
          },
        });
        matchCount++;
      }
    }
    if (block.tier2) {
      for (let i = 0; i < block.tier2.length; i++) {
        const m = block.tier2[i]!;
        const investorId = investorIdByName.get(m.investor);
        if (!investorId) {
          console.warn(`   ! unknown investor in tier2: ${m.investor}`);
          continue;
        }
        await prisma.match.create({
          data: {
            companyId,
            investorId,
            tier: 2,
            score: m.score,
            geoPts: m.geo,
            stagePts: m.stage,
            sectorPts: m.sector,
            revenuePts: m.revenue,
            chequePts: m.cheque,
            founderPts: m.founder,
            gapPts: m.gap,
            warmPath: m.warmPath,
            portfolioGap: m.portfolioGap,
            rationale: m.rationale,
            nextStep: m.nextStep,
            sortOrder: i,
          },
        });
        matchCount++;
      }
    }
    if (block.doNotMatch) {
      for (let i = 0; i < block.doNotMatch.length; i++) {
        const d = block.doNotMatch[i]!;
        const investorId = investorIdByName.get(d.label) ?? null;
        await prisma.doNotMatch.create({
          data: {
            companyId,
            investorId,
            label: d.label,
            reason: d.reason,
            sortOrder: i,
          },
        });
        dnCount++;
      }
    }
    if (block.customerTargets) {
      for (let i = 0; i < block.customerTargets.length; i++) {
        const t = block.customerTargets[i]!;
        await prisma.customerTarget.create({
          data: { companyId, ...t, sortOrder: i },
        });
        ctCount++;
      }
    }
    if (block.events) {
      for (let i = 0; i < block.events.length; i++) {
        await prisma.industryEvent.create({
          data: { companyId, name: block.events[i]!, sortOrder: i },
        });
        evCount++;
      }
    }
  }
  console.log(
    `   ✓ ${matchCount} matches, ${dnCount} do-not-match rows, ${ctCount} customer targets, ${evCount} events`,
  );

  // ── 5. Bootstrap admins ────────────────────────────────────────────
  const rawEmails = process.env.BOOTSTRAP_ADMIN_EMAILS ?? "";
  const rawPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD ?? "";
  const emails = rawEmails
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  if (emails.length && rawPassword) {
    const existing = await prisma.user.count();
    if (existing === 0) {
      const hash = await bcrypt.hash(rawPassword, 10);
      for (const email of emails) {
        await prisma.user.create({
          data: {
            email,
            passwordHash: hash,
            name: email.split("@")[0] ?? email,
            role: "admin",
          },
        });
      }
      console.log(`   ✓ bootstrapped ${emails.length} admin(s): ${emails.join(", ")}`);
    } else {
      console.log(
        `   • user table non-empty (${existing} rows) — skipping bootstrap admin creation`,
      );
    }
  } else {
    console.log(
      "   • BOOTSTRAP_ADMIN_EMAILS / BOOTSTRAP_ADMIN_PASSWORD not set — skipping admin creation",
    );
  }

  await prisma.$disconnect();
  console.log("✅ seed complete");
}

main().catch(async (err) => {
  console.error("❌ seed failed:", err);
  process.exit(1);
});
