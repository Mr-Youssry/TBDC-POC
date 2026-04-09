import { NextRequest } from "next/server";
import { requireSessionForPage } from "@/lib/guards";
import { mintOpenClawSessionToken } from "@/lib/openclaw-session-jwt";

// Route notes:
// - Next.js 16 Route Handlers cannot complete a WebSocket upgrade, so this
//   endpoint mints a short-lived JWT and returns the URL the browser should
//   open its WebSocket to. Caddy is responsible for reverse-proxying the
//   `/analyst/ws/socket` path to the OpenClaw gateway in production.
// - Deviation from the v2.0 plan: the plan originally placed this at
//   `src/app/analyst/ws/route.ts`, but that would clash with the UI page
//   `src/app/(site)/analyst/page.tsx` on the `/analyst` URL segment. The
//   token-mint endpoint was moved into the `/api` namespace to avoid the
//   conflict.
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await requireSessionForPage();
  const role = (session.user as { role?: string }).role;
  if (role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }

  const sessionId = req.nextUrl.searchParams.get("session");
  if (!sessionId) {
    return new Response("Missing session param", { status: 400 });
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return new Response("Session missing user id", { status: 500 });
  }

  const token = await mintOpenClawSessionToken({
    userId,
    openclawSessionId: sessionId,
  });

  return Response.json({
    token,
    url: `/analyst/ws/socket?session=${encodeURIComponent(sessionId)}&token=${encodeURIComponent(token)}`,
  });
}
