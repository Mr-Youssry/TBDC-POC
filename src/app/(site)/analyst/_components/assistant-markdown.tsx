"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Markdown renderer scoped to the chat pane. Supports GFM (tables,
// strikethrough, task lists). Every tag is explicitly styled so assistant
// replies blend with the TBDC design tokens instead of looking like raw
// browser defaults. User messages (whose `sender === "user"`) render as
// plain pre-wrapped text because users typically type prose, not markdown.
export function AssistantMarkdown({ content }: { content: string }) {
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
