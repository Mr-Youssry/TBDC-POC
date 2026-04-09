"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";

const STRING_FIELDS = [
  "name",
  "cohort",
  "stage",
  "sector",
  "arrTraction",
  "askSize",
  "homeMarket",
  "targetMarket",
  "founderProfile",
  "gateNote",
] as const;
const stringFieldSchema = z.enum(STRING_FIELDS);
const valueSchema = z.string().min(1).max(10000);

type Result = { ok: boolean; error?: string };

export async function updateCompanyField(
  id: string,
  field: string,
  value: string,
): Promise<Result> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Not authorized" };
  }
  const f = stringFieldSchema.safeParse(field);
  const v = valueSchema.safeParse(value);
  if (!f.success || !v.success) return { ok: false, error: "Invalid input" };
  await prisma.company.update({ where: { id }, data: { [f.data]: v.data } });
  revalidatePath("/companies");
  revalidatePath("/match");
  return { ok: true };
}

export async function toggleAcceptsIntros(id: string, accepts: boolean): Promise<Result> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Not authorized" };
  }
  await prisma.company.update({
    where: { id },
    data: { acceptsInvestorIntros: accepts },
  });
  revalidatePath("/companies");
  revalidatePath("/match");
  return { ok: true };
}

export async function addCompany(): Promise<Result> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Not authorized" };
  }
  const max = await prisma.company.aggregate({ _max: { sortOrder: true } });
  await prisma.company.create({
    data: {
      name: "New company",
      cohort: "Pivot 1",
      stage: "Seed",
      sector: "—",
      arrTraction: "—",
      askSize: "—",
      homeMarket: "—",
      targetMarket: "—",
      founderProfile: "—",
      acceptsInvestorIntros: true,
      sortOrder: (max._max.sortOrder ?? 0) + 1,
    },
  });
  revalidatePath("/companies");
  revalidatePath("/match");
  return { ok: true };
}

export async function deleteCompany(id: string): Promise<Result> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Not authorized" };
  }
  await prisma.company.delete({ where: { id } });
  revalidatePath("/companies");
  revalidatePath("/match");
  return { ok: true };
}
