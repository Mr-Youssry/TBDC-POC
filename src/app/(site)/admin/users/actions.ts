"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";

const inviteSchema = z.object({
  email: z.string().email().toLowerCase(),
  name: z.string().min(1).max(200),
  password: z.string().min(8).max(200),
});

export type InviteState = { error?: string; ok?: boolean };

export async function inviteUser(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return { error: "Not authorized" };
  }

  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Invalid input (password must be at least 8 characters)" };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { error: "A user with that email already exists." };
  }

  const hash = await bcrypt.hash(parsed.data.password, 10);
  const invitedById = (session.user as { id?: string }).id ?? null;
  await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash: hash,
      role: "admin",
      invitedById,
    },
  });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function deleteUser(id: string): Promise<{ ok: boolean; error?: string }> {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return { ok: false, error: "Not authorized" };
  }
  const selfId = (session.user as { id?: string }).id;
  if (selfId === id) {
    return { ok: false, error: "You cannot delete your own account." };
  }
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/users");
  return { ok: true };
}
