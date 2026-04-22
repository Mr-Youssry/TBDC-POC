"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const statusEnum = z.enum([
  "not_started",
  "researching",
  "outreach_sent",
  "meeting_set",
  "follow_up",
  "closed_won",
  "closed_pass",
]);

export async function updatePipelineStatus(
  matchId: string,
  status: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const parsed = statusEnum.safeParse(status);
  if (!parsed.success) return { ok: false, error: "Invalid status" };

  await prisma.match.update({
    where: { id: matchId },
    data: { pipelineStatus: parsed.data },
  });
  revalidatePath("/pipeline");
  revalidatePath("/activation-playbook");
  return { ok: true };
}
