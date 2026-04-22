import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSessionForPage } from "@/lib/guards";
import {
  appendMockConversation,
  buildMockReply,
  isDummyOpenClawEnabled,
} from "@/lib/mock-openclaw";

/**
 * v2.0 analyst chat HTTP bridge — server-side Next.js route handler.
 *
 * Flow:
 *   browser → POST /api/analyst/chat
 *          → this handler (auth-gated, admin-only)
 *          → POST $OPENCLAW_CHAT_BRIDGE_URL/chat
 *          → openclaw-gateway:3020 (docker network)
 *          → `openclaw agent -m ... --session-id ...` CLI
 *          → z.ai + tbdc-db plugin
 *          → reply text
 *
 * Attribution: the authenticated admin's user id is injected into the
 * bridge payload as `actingUserId`, which the bridge then passes into the
 * tbdc-db plugin tool call context. Write tools require it; read tools
 * ignore it. **The browser cannot spoof it** — we overwrite whatever
 * the client might send with the server-side session user id.
 *
 * The bridge is one hop away on the docker_rafiq-shared network at
 * `openclaw-gateway:3020`. Configured via OPENCLAW_CHAT_BRIDGE_URL env
 * var, default `http://openclaw-gateway:3020`.
 */

export const runtime = "nodejs";

const BodySchema = z.object({
  sessionId: z.string().min(1).max(200),
  message: z.string().min(1).max(8000),
});

const BRIDGE_URL =
  process.env.OPENCLAW_CHAT_BRIDGE_URL ?? "http://openclaw-gateway:3020";

export async function POST(req: NextRequest) {
  const session = await requireSessionForPage();
  const user = session.user as { id?: string; role?: string };
  if (user.role !== "admin") {
    return NextResponse.json(
      { ok: false, error: "admin role required" },
      { status: 403 },
    );
  }

  let parsed;
  try {
    const raw = await req.json();
    parsed = BodySchema.safeParse(raw);
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid JSON body" },
      { status: 400 },
    );
  }
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: `invalid body: ${parsed.error.issues.map((i) => i.path.join(".") + " " + i.message).join(", ")}`,
      },
      { status: 400 },
    );
  }

  const { sessionId, message } = parsed.data;
  const actingUserId = user.id;
  if (!actingUserId) {
    return NextResponse.json(
      { ok: false, error: "session missing user id" },
      { status: 500 },
    );
  }

  if (isDummyOpenClawEnabled()) {
    const reply = buildMockReply(sessionId, message);
    appendMockConversation(sessionId, message, reply);
    return NextResponse.json({ ok: true, reply });
  }

  // Forward to the bridge. The bridge runs inside the openclaw-gateway
  // container on port 3020 and is reachable at `openclaw-gateway:3020` on
  // the docker_rafiq-shared network.
  let bridgeRes: Response;
  try {
    bridgeRes = await fetch(`${BRIDGE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, message, actingUserId }),
      // Agent turns can take a while when tool calls are involved; match
      // the bridge's own 120s timeout so we don't give up early.
      signal: AbortSignal.timeout(130_000),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: `bridge unreachable: ${msg}` },
      { status: 502 },
    );
  }

  const bodyText = await bridgeRes.text();
  if (!bridgeRes.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: `bridge returned ${bridgeRes.status}`,
        detail: bodyText.slice(0, 1000),
      },
      { status: bridgeRes.status },
    );
  }

  // Bridge already returns `{ ok, reply, error? }` — pass it through.
  try {
    const payload = JSON.parse(bodyText) as {
      ok: boolean;
      reply?: string;
      error?: string;
    };
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { ok: false, error: "bridge returned non-JSON", detail: bodyText.slice(0, 500) },
      { status: 502 },
    );
  }
}
