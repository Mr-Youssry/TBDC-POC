"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";

const STRING_FIELDS = ["warmPath", "portfolioGap", "rationale", "nextStep"] as const;
const NUMBER_FIELDS = [
  "score",
  "geoPts",
  "stagePts",
  "sectorPts",
  "revenuePts",
  "chequePts",
  "founderPts",
  "gapPts",
  "tier",
] as const;
const stringField = z.enum(STRING_FIELDS);
const numberField = z.enum(NUMBER_FIELDS);
const strValue = z.string().min(1).max(10000);

type Result = { ok: boolean; error?: string };

export async function updateMatchStringField(
  id: string,
  field: string,
  value: string,
): Promise<Result> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Not authorized" };
  }
  const f = stringField.safeParse(field);
  const v = strValue.safeParse(value);
  if (!f.success || !v.success) return { ok: false, error: "Invalid input" };
  await prisma.match.update({ where: { id }, data: { [f.data]: v.data } });
  revalidatePath("/match");
  return { ok: true };
}

export async function updateMatchNumberField(
  id: string,
  field: string,
  value: string,
): Promise<Result> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Not authorized" };
  }
  const f = numberField.safeParse(field);
  if (!f.success) return { ok: false, error: "Invalid field" };
  const n = Number(value);
  if (!Number.isFinite(n)) return { ok: false, error: "Not a number" };
  await prisma.match.update({ where: { id }, data: { [f.data]: Math.trunc(n) } });
  revalidatePath("/match");
  return { ok: true };
}

export async function updateDoNotMatch(
  id: string,
  field: string,
  value: string,
): Promise<Result> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Not authorized" };
  }
  const allowed = z.enum(["label", "reason"]).safeParse(field);
  const v = strValue.safeParse(value);
  if (!allowed.success || !v.success) return { ok: false, error: "Invalid input" };
  await prisma.doNotMatch.update({ where: { id }, data: { [allowed.data]: v.data } });
  revalidatePath("/match");
  return { ok: true };
}

export async function updateCustomerTarget(
  id: string,
  field: string,
  value: string,
): Promise<Result> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Not authorized" };
  }
  const allowed = z.enum(["name", "targetType", "hq", "description"]).safeParse(field);
  const v = strValue.safeParse(value);
  if (!allowed.success || !v.success) return { ok: false, error: "Invalid input" };
  await prisma.customerTarget.update({ where: { id }, data: { [allowed.data]: v.data } });
  revalidatePath("/match");
  return { ok: true };
}
