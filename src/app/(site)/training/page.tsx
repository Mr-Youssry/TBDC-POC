import type { Metadata } from "next";
export const metadata: Metadata = { title: "SCOTE Training — TBDC POC" };

import { requireSessionForPage } from "@/lib/guards";
import { TrainingLayout } from "./_components/training-layout";

export default async function TrainingPage() {
  const session = await requireSessionForPage();
  const role = (session.user as { role?: string }).role;
  if (role !== "admin") {
    throw new Error("Forbidden");
  }

  const userId = (session.user as { id?: string }).id ?? "";
  const userName = session.user?.name ?? session.user?.email ?? "User";

  return (
    <TrainingLayout currentUserId={userId} currentUserName={userName} />
  );
}
