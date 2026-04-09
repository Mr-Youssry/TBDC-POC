"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";

const dimensionFieldSchema = z.enum(["name", "maxWeight", "logic", "rationale"]);
const cardFieldSchema = z.enum(["title", "body"]);
const valueSchema = z.string().min(1).max(5000);

export async function updateDimensionField(
  id: string,
  field: string,
  value: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Not authorized" };
  }

  const parsedField = dimensionFieldSchema.safeParse(field);
  const parsedValue = valueSchema.safeParse(value);
  if (!parsedField.success || !parsedValue.success) {
    return { ok: false, error: "Invalid input" };
  }

  await prisma.methodologyDimension.update({
    where: { id },
    data: { [parsedField.data]: parsedValue.data },
  });
  revalidatePath("/methodology");
  return { ok: true };
}

export async function updateCardField(
  id: string,
  field: string,
  value: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Not authorized" };
  }

  const parsedField = cardFieldSchema.safeParse(field);
  const parsedValue = valueSchema.safeParse(value);
  if (!parsedField.success || !parsedValue.success) {
    return { ok: false, error: "Invalid input" };
  }

  await prisma.methodologyCard.update({
    where: { id },
    data: { [parsedField.data]: parsedValue.data },
  });
  revalidatePath("/methodology");
  return { ok: true };
}
