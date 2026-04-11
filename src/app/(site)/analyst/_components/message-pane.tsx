"use client";
import { useRef, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useOpenClawWs } from "./use-openclaw-ws";
import { ToolCallPill } from "./tool-call-pill";
import { UploadModal } from "./upload-modal";

// Markdown renderer scoped to the chat pane. Supports GFM (tables,
// strikethrough, task lists). Every tag is explicitly styled so assistant
// replies blend with the TBDC design tokens instead of looking like raw
// browser defaults. User messages (whose `sender === "user"`) render as
// plain pre-wrapped text because users typically type prose, not markdown.
function AssistantMarkdown({ content }: { content: string }) {
  return (
    <div className="text-sm text-text-2 space-y-2 [&_strong]:text-text-1 [&_strong]:font-semibold [&_em]:italic [&_a]:text-t1-fg [&_a]:underline [&_code]:font-mono [&_code]:text-xs [&_code]:bg-surface-3 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="font-serif text-base text-text-1 font-semibold mt-3 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="font-serif text-base text-text-1 font-semibold mt-3 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-serif text-sm text-text-1 font-semibold mt-2 first:mt-0">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="font-serif text-sm text-text-1 font-semibold mt-2 first:mt-0">
              {children}
            </h4>
          ),
          p: ({ children }) => <p className="leading-relaxed">{children}</p>,
          ul: ({ children }) => (
            <ul className="list-disc list-outside pl-5 space-y-0.5">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside pl-5 space-y-0.5">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-border pl-3 text-text-3 italic">
              {children}
            </blockquote>
          ),
          pre: ({ children }) => (
            <pre className="font-mono text-xs bg-surface-3 text-text-1 p-3 rounded overflow-x-auto">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="text-xs border-collapse">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border px-2 py-1 bg-surface-2 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-2 py-1">{children}</td>
          ),
          hr: () => <hr className="border-border" />,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-t1-fg underline"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

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
  const [uploadOpen, setUploadOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const companySlug = displayName.toLowerCase().replace(/\s+/g, "-");

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
            {m.sender === "assistant" ? (
              <AssistantMarkdown content={m.content} />
            ) : (
              <div className="text-sm text-text-2 whitespace-pre-wrap">
                {m.content}
              </div>
            )}
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
        <div className="flex gap-2 items-center">
          {openclawSessionId.startsWith("tbdc-co-") && (
            <button
              type="button"
              onClick={() => setUploadOpen(true)}
              className="px-2 py-2 text-text-3 hover:text-text-1 transition-colors"
              title="Upload document to workspace"
            >
              📎
            </button>
          )}
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
            className="flex-1 px-3 py-2 rounded border border-border bg-surface text-sm text-text-1 disabled:opacity-50"
          />
        </div>
      </form>

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        companySlug={companySlug}
        sendMessage={sendMessage}
      />
    </main>
  );
}
