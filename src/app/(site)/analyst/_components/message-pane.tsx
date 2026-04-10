"use client";
import { useRef, useState, useEffect } from "react";
import { useOpenClawWs } from "./use-openclaw-ws";
import { ToolCallPill } from "./tool-call-pill";

export function MessagePane({
  openclawSessionId,
  displayName,
  currentUserId,
  currentUserName,
}: {
  openclawSessionId: string;
  displayName: string;
  currentUserId: string;
  currentUserName: string;
}) {
  const { messages, state, sendMessage } = useOpenClawWs({
    openclawSessionId,
    currentUserId,
    currentUserName,
  });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || state !== "open") return;
    sendMessage(input);
    setInput("");
  };

  return (
    <main className="flex-1 flex flex-col">
      <div className="px-6 py-3 border-b border-border bg-surface-2">
        <h2 className="font-serif text-lg text-text-1"># {displayName}</h2>
        {state === "rate-limited" && (
          <p className="text-xs text-text-3 mt-1 italic">
            Assistant is thinking… (30–60s on a cold turn)
          </p>
        )}
        {(state === "closed" || state === "error") && (
          <p className="text-xs text-warn-txt mt-1">
            {state === "error"
              ? "Last turn failed — try sending the message again."
              : "Disconnected."}
          </p>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
      >
        {messages.length === 0 && state === "open" && (
          <p className="text-sm text-text-3 italic">
            Start a conversation about {displayName}. The Assistant knows the
            full match history and can read or edit the database.
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id} className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="font-serif font-semibold text-sm text-text-1">
                {m.senderName}
              </span>
              <span className="text-xs text-text-3">
                {new Date(m.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="text-sm text-text-2 whitespace-pre-wrap">
              {m.content}
            </div>
            {m.toolCalls && m.toolCalls.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {m.toolCalls.map((tc) => (
                  <ToolCallPill
                    key={tc.id}
                    tool={tc.tool}
                    summary={tc.summary}
                    auditIds={tc.auditIds}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="px-6 py-3 border-t border-border bg-surface-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            state === "open"
              ? "Type a message to the Assistant…"
              : state === "rate-limited"
                ? "Waiting for the Assistant to reply…"
                : "Reconnecting…"
          }
          disabled={state !== "open"}
          className="w-full px-3 py-2 rounded border border-border bg-surface text-sm text-text-1 disabled:opacity-50"
        />
      </form>
    </main>
  );
}
