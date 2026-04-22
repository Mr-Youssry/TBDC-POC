import { NextRequest } from "next/server";
import {
  isDummyOpenClawEnabled,
  listMockHistory,
} from "@/lib/mock-openclaw";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return Response.json(
      { ok: false, error: "Missing sessionId" },
      { status: 400 },
    );
  }

  if (isDummyOpenClawEnabled()) {
    return Response.json({ ok: true, messages: listMockHistory(sessionId) });
  }

  return Response.json(
    { ok: false, error: "OpenClaw history is not available in this environment" },
    { status: 404 },
  );
}
