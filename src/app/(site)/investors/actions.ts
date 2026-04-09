"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";

const FIELDS = [
  "name",
  "type",
  "stage",
  "sectors",
  "chequeSize",
  "geography",
  "leadOrFollow",
  "deals12m",
  "notablePortfolio",
  "contactApproach",
] as const;
const fieldSchema = z.enum(FIELDS);
const valueSchema = z.string().min(1).max(5000);

type Result = { ok: boolean; error?: string };

export async function updateInvestorField(
  id: string,
  field: string,
  value: string,
): Promise<Result> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Not authorized" };
  }
  const f = fieldSchema.safeParse(field);
  const v = valueSchema.safeParse(value);
  if (!f.success || !v.success) return { ok: false, error: "Invalid input" };
  await prisma.investor.update({ where: { id }, data: { [f.data]: v.data } });
  revalidatePath("/investors");
  return { ok: true };
}

export async function addInvestor(): Promise<Result> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Not authorized" };
  }
  const max = await prisma.investor.aggregate({ _max: { sortOrder: true } });
  await prisma.investor.create({
    data: {
      name: "New investor",
      type: "VC",
      stage: "Seed",
      sectors: "—",
      chequeSize: "—",
      geography: "—",
      leadOrFollow: "Lead",
      deals12m: "—",
      notablePortfolio: "—",
      contactApproach: "—",
      sortOrder: (max._max.sortOrder ?? 0) + 1,
    },
  });
  revalidatePath("/investors");
  return { ok: true };
}

export async function deleteInvestor(id: string): Promise<Result> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Not authorized" };
  }
  if (!z.string().min(1).safeParse(id).success) {
    return { ok: false, error: "Invalid id" };
  }
  await prisma.investor.delete({ where: { id } });
  revalidatePath("/investors");
  return { ok: true };
}
