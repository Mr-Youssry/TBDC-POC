"use client";
import { useEffect, useRef, useState } from "react";

/**
 * v2.0 analyst chat hook — HTTP POST bridge, NOT WebSocket.
 *
 * Originally this was a WebSocket hook connecting directly to the OpenClaw
 * gateway through Caddy. During Phase 6 live deploy we discovered that
 * OpenClaw's gateway WS `connect` RPC silently drops frames from any
 * third-party client (even valid Bearer auth from loopback inside the same
 * container), because the Control UI's WS flow is tightly coupled to
 * in-process runtime state. Rewriting this hook to speak OpenClaw's full
 * connect/hello/challenge protocol turned out to be days of reverse
 * engineering, not hours.
 *
 * Instead the chat flow now goes: browser POST → Next.js route handler
 * (`/api/analyst/chat`) → Caddy → openclaw-gateway's internal HTTP bridge
 * at `:3020/chat` → `openclaw agent -m ... --session-id ...` CLI → z.ai
 * + tbdc-db plugin → response text. No streaming; the user sees a
 * "thinking…" state, then the full reply at once. Tool calls still work
 * (the plugin is invoked inside the CLI's embedded runtime) but their
 * intermediate events are not surfaced to the UI — the LLM's final text
 * summarises any reads/writes it performed.
 *
 * The hook name + return shape is unchanged so MessagePane and
 * ToolCallPill don't need to care about the transport change.
 */

export type ChatMessage = {
  id: string;
  sender: "user" | "assistant" | "system";
  senderName: string;
  content: string;
  timestamp: number;
  toolCalls?: Array<{
    id: string;
    tool: string;
    summary: string;
    auditIds?: string[];
  }>;
};

/**
 * Connection state is kept in the return shape for MessagePane's banner
 * rendering, but for an HTTP bridge it really only has four meaningful
 * values:
 *
 *   - "open"         : bridge health check passed, ready to send
 *   - "connecting"   : health check in flight
 *   - "error"        : bridge unreachable (network / 500)
 *   - "rate-limited" : one message in flight; UI should debounce sends
 */
export type ConnectionState =
  | "connecting"
  | "open"
  | "closed"
  | "error"
  | "rate-limited";

const CHAT_ENDPOINT = "/api/analyst/chat";

export function useOpenClawWs({
  openclawSessionId,
  currentUserId,
  currentUserName,
}: {
  openclawSessionId: string;
  currentUserId: string;
  currentUserName: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [state, setState] = useState<ConnectionState>("open");
  const inFlightRef = useRef(false);

  // Load persistent chat history when this session mounts. The component's
  // `key={openclawSessionId}` in page.tsx forces a re-mount on channel switch,
  // so this effect fires once per session. History is fetched directly from
  // the bridge via Caddy (/api/openclaw/history → bridge /history); no
  // Next.js route handler needed. Failures are silent — empty history is fine.
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/openclaw/history?sessionId=${encodeURIComponent(openclawSessionId)}`)
      .then(r => r.json())
      .then(data => {
        if (cancelled || !data.ok) return;
        const loaded: ChatMessage[] = data.messages.map((m: { timestamp: string; role: string; content: string }) => ({
          id: `hist-${m.timestamp}-${m.role}`,
          sender: m.role === "assistant" ? "assistant" as const : "user" as const,
          senderName: m.role === "assistant" ? "Assistant" : currentUserName,
          content: m.content,
          timestamp: new Date(m.timestamp).getTime(),
        }));
        setMessages(loaded);
      })
      .catch(() => { /* fail silently — empty history is fine */ });
    return () => { cancelled = true; };
  }, [openclawSessionId, currentUserName]);

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    if (inFlightRef.current) return;

    // 1. Optimistically append the user's message.
    const userMsgId = `local-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: "user",
        senderName: currentUserName,
        content: trimmed,
        timestamp: Date.now(),
      },
    ]);

    // 2. Lock sends while the bridge is thinking.
    inFlightRef.current = true;
    setState("rate-limited");

    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: openclawSessionId,
          message: trimmed,
          actingUserId: currentUserId,
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => `HTTP ${res.status}`);
        setMessages((prev) => [
          ...prev,
          {
            id: `sys-${Date.now()}`,
            sender: "system",
            senderName: "System",
            content: `Request failed (${res.status}): ${errText.slice(0, 400)}`,
            timestamp: Date.now(),
          },
        ]);
        setState("error");
        return;
      }

      const payload = (await res.json()) as {
        ok: boolean;
        reply?: string;
        error?: string;
      };

      if (!payload.ok || !payload.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `sys-${Date.now()}`,
            sender: "system",
            senderName: "System",
            content: `Assistant error: ${payload.error ?? "empty reply"}`,
            timestamp: Date.now(),
          },
        ]);
        setState("error");
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          sender: "assistant",
          senderName: "Assistant",
          content: payload.reply ?? "",
          timestamp: Date.now(),
        },
      ]);
      setState("open");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          sender: "system",
          senderName: "System",
          content: `Network error: ${msg}`,
          timestamp: Date.now(),
        },
      ]);
      setState("error");
    } finally {
      inFlightRef.current = false;
    }
  };

  return { messages, state, sendMessage };
}
