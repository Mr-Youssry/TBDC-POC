import type { Metadata } from "next";
export const metadata: Metadata = { title: "Analyst — TBDC POC" };

import { requireSessionForPage } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { ChannelSidebar } from "./_components/channel-sidebar";
import { MessagePane } from "./_components/message-pane";

export default async function AnalystPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const session = await requireSessionForPage();
  const role = (session.user as { role?: string }).role;
  if (role !== "admin") {
    throw new Error("Forbidden");
  }

  const params = await searchParams;
  const activeSessionId = params.session ?? "tbdc-general";

  const channels = await prisma.chatSession.findMany({
    where: { openclawSessionId: { not: "tbdc-configure" } },
    orderBy: [{ scopeType: "asc" }, { displayName: "asc" }],
    select: {
      id: true,
      scopeType: true,
      scopeEntityId: true,
      openclawSessionId: true,
      displayName: true,
      lastMessageAt: true,
    },
  });

  const active =
    channels.find((c) => c.openclawSessionId === activeSessionId) ??
    channels[0];

  const userId = (session.user as { id?: string }).id ?? "";
  const userName = session.user?.name ?? session.user?.email ?? "User";

  return (
    <div className="flex h-[calc(100vh-120px)]">
      <ChannelSidebar
        channels={channels}
        activeId={active?.openclawSessionId ?? ""}
      />
      <MessagePane
        key={active?.openclawSessionId}
        openclawSessionId={active?.openclawSessionId ?? ""}
        displayName={active?.displayName ?? ""}
        currentUserId={userId}
        currentUserName={userName}
      />
    </div>
  );
}
