"use client";
import { useEffect, useRef, useState } from "react";

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

export type ConnectionState =
  | "connecting"
  | "open"
  | "closed"
  | "error"
  | "rate-limited";

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
  const [state, setState] = useState<ConnectionState>("connecting");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let cancelled = false;
    let ws: WebSocket | null = null;

    async function connect() {
      try {
        // 1. Ask the Next.js route handler to mint a short-lived token.
        const tokenRes = await fetch(
          `/api/analyst/ws-token?session=${encodeURIComponent(openclawSessionId)}`,
        );
        if (!tokenRes.ok) {
          setState("error");
          return;
        }
        const { url } = (await tokenRes.json()) as { url: string };
        if (cancelled) return;

        // 2. Open the WebSocket to the Caddy-proxied OpenClaw gateway.
        const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
        ws = new WebSocket(`${proto}//${window.location.host}${url}`);
        wsRef.current = ws;

        ws.onopen = () => setState("open");
        ws.onerror = () => setState("error");
        ws.onclose = () => setState("closed");

        ws.onmessage = (evt) => {
          try {
            const msg = JSON.parse(evt.data);
            if (msg.type === "message") {
              setMessages((prev) => [
                ...prev,
                {
                  id: msg.payload.id,
                  sender:
                    msg.payload.role === "user" ? "user" : "assistant",
                  senderName: msg.payload.senderName ?? "Assistant",
                  content: msg.payload.content,
                  timestamp: msg.payload.timestamp ?? Date.now(),
                  toolCalls: msg.payload.toolCalls,
                },
              ]);
            } else if (msg.type === "rate_limit") {
              setState("rate-limited");
            } else if (msg.type === "system") {
              setMessages((prev) => [
                ...prev,
                {
                  id: `sys-${Date.now()}`,
                  sender: "system",
                  senderName: "System",
                  content: msg.payload.content,
                  timestamp: Date.now(),
                },
              ]);
            }
          } catch (e) {
            console.error("ws parse error", e);
          }
        };
      } catch {
        setState("error");
      }
    }

    void connect();

    return () => {
      cancelled = true;
      ws?.close();
    };
  }, [openclawSessionId]);

  const sendMessage = (content: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    const payload = {
      type: "message",
      payload: {
        content,
        metadata: {
          actingUserId: currentUserId,
          chatSessionId: openclawSessionId,
          senderName: currentUserName,
        },
      },
    };
    wsRef.current.send(JSON.stringify(payload));
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        sender: "user",
        senderName: currentUserName,
        content,
        timestamp: Date.now(),
      },
    ]);
  };

  return { messages, state, sendMessage };
}
