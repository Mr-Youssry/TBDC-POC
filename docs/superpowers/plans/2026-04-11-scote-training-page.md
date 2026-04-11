# SCOTE Training Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a three-panel IDE-like "SCOTE Training" page where Ahmed Korayem can edit the agent's workspace files and chat with SCOTE about its configuration, plus rebrand "Analyst" → "SCOTE" throughout the UI.

**Architecture:** Three new bridge endpoints expose the OpenClaw workspace as a file API. A new `/training` page renders a file tree, a markdown editor/viewer, and reuses the existing `MessagePane` chat component with a dedicated `tbdc-configure` session. The sidebar and analyst page get naming updates.

**Tech Stack:** Next.js 16 (App Router, RSC), Tailwind v4 CSS-first, OpenClaw HTTP bridge (Node.js), Prisma + Postgres.

**Spec:** `docs/superpowers/specs/2026-04-11-scote-training-page-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `deploy/openclaw-chat-bridge.mjs` | Modify | Add 3 workspace endpoints: `/workspace/tree`, `/workspace/file` (GET), `/workspace/file` (PUT) |
| `src/app/(site)/analyst/_components/assistant-markdown.tsx` | Create | Extract `AssistantMarkdown` from message-pane.tsx into shared component |
| `src/app/(site)/analyst/_components/message-pane.tsx` | Modify | Import AssistantMarkdown from new file, remove inline definition |
| `src/app/(site)/analyst/_components/use-openclaw-ws.ts` | Modify | Rename "Assistant" → "SCOTE" (3 locations) |
| `src/app/(site)/analyst/page.tsx` | Modify | Filter out `tbdc-configure` from channel query |
| `src/app/(site)/training/page.tsx` | Create | Server component: auth guard, layout shell |
| `src/app/(site)/training/_components/training-layout.tsx` | Create | Client component: three-panel orchestrator with state |
| `src/app/(site)/training/_components/workspace-tree.tsx` | Create | Client component: collapsible file tree |
| `src/app/(site)/training/_components/file-editor.tsx` | Create | Client component: raw markdown textarea + Save |
| `src/app/(site)/training/_components/file-viewer.tsx` | Create | Client component: read-only rendered markdown + Copy |
| `src/components/sidebar.tsx` | Modify | Rename Analyst → SCOTE, add SCOTE Training nav item, add `/training` to forceCollapsed |
| `prisma/seed.ts` | Modify | Add `tbdc-configure` ChatSession upsert |

---

### Task 1: Bridge workspace endpoints

**Files:**
- Modify: `deploy/openclaw-chat-bridge.mjs`

**Context for implementer:** The bridge is a plain Node.js HTTP server (no npm packages) running inside the openclaw-gateway Docker container. It uses `import http from "node:http"`, `import { promises as fsPromises } from "node:fs"`, and `import { execFile } from "node:child_process"`. All endpoints follow a dual-path pattern — both `/endpoint` and `/api/openclaw/endpoint` are accepted. Read the file first to understand the existing patterns.

- [ ] **Step 1: Read the current bridge file**

Read `deploy/openclaw-chat-bridge.mjs` to understand the endpoint pattern. Note how each handler checks `req.method` and `req.url`, and how the dual-path pattern works (see lines 49-51, 83-86, etc.).

- [ ] **Step 2: Add GET /workspace/tree endpoint**

Insert before the `normalizedPath` / chat handler block. This endpoint recursively reads `/home/node/.openclaw/workspace/` and returns a nested JSON tree.

```javascript
// GET /workspace/tree — returns the full workspace directory tree as nested JSON.
// Skips dotfiles, .git/, .openclaw/, state/, node_modules/. Only includes .md files.
// Memory files (memory/ dir or MEMORY.md) are marked readOnly: true.
{
  const treePath = (req.url ?? "").split("?")[0];
  if (
    req.method === "GET" &&
    (treePath === "/workspace/tree" || treePath === "/api/openclaw/workspace/tree")
  ) {
    console.log("[bridge] GET /workspace/tree");
    const WORKSPACE = "/home/node/.openclaw/workspace";
    const SKIP = new Set([".git", ".openclaw", "state", "node_modules"]);

    async function buildTree(dir, relPath = "") {
      const entries = await fsPromises.readdir(dir, { withFileTypes: true });
      const result = [];
      for (const e of entries.sort((a, b) => a.name.localeCompare(b.name))) {
        if (e.name.startsWith(".") || SKIP.has(e.name)) continue;
        const childRel = relPath ? `${relPath}/${e.name}` : e.name;
        if (e.isDirectory()) {
          const children = await buildTree(`${dir}/${e.name}`, childRel);
          if (children.length === 0) continue; // skip empty dirs
          const isMemory = e.name === "memory";
          result.push({ name: e.name, type: "dir", readOnly: isMemory, children });
        } else if (e.name.endsWith(".md")) {
          const isMemory = e.name === "MEMORY.md" || relPath.startsWith("memory");
          result.push({ name: e.name, type: "file", readOnly: isMemory });
        }
      }
      return result;
    }

    try {
      const tree = await buildTree(WORKSPACE);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, tree }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: msg }));
    }
    return;
  }
}
```

- [ ] **Step 3: Add GET /workspace/file endpoint**

```javascript
// GET /workspace/file?path=SOUL.md — reads a single workspace file.
{
  const filePath = (req.url ?? "").split("?")[0];
  if (
    req.method === "GET" &&
    (filePath === "/workspace/file" || filePath === "/api/openclaw/workspace/file")
  ) {
    const reqPath = new URL(req.url, "http://localhost").searchParams.get("path") ?? "";
    console.log(`[bridge] GET /workspace/file path=${reqPath || "(none)"}`);
    if (!reqPath || /[.]{2}|^[/]|[\\]/.test(reqPath)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "missing or invalid path" }));
      return;
    }
    const fullPath = `/home/node/.openclaw/workspace/${reqPath}`;
    const isMemory = reqPath === "MEMORY.md" || reqPath.startsWith("memory/");
    try {
      const content = await fsPromises.readFile(fullPath, "utf8");
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, path: reqPath, content, readOnly: isMemory }));
    } catch (err) {
      if (err.code === "ENOENT") {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "file not found" }));
        return;
      }
      const msg = err instanceof Error ? err.message : String(err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: msg }));
    }
    return;
  }
}
```

- [ ] **Step 4: Add PUT /workspace/file endpoint**

```javascript
// PUT /workspace/file — saves content to an editable workspace file.
// Rejects writes to memory/ paths (read-only).
{
  const putPath = (req.url ?? "").split("?")[0];
  if (
    req.method === "PUT" &&
    (putPath === "/workspace/file" || putPath === "/api/openclaw/workspace/file")
  ) {
    let putBody = "";
    req.on("data", (chunk) => {
      putBody += chunk;
      if (putBody.length > 600_000) req.destroy();
    });
    req.on("end", async () => {
      let payload;
      try { payload = JSON.parse(putBody); } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "invalid JSON body" }));
        return;
      }
      const filePath = String(payload.path ?? "").trim();
      const content = payload.content;
      console.log(`[bridge] PUT /workspace/file path=${filePath}`);

      if (!filePath || /[.]{2}|^[/]|[\\]/.test(filePath)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "missing or invalid path" }));
        return;
      }
      if (filePath === "MEMORY.md" || filePath.startsWith("memory/")) {
        res.writeHead(403, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "memory files are read-only" }));
        return;
      }
      if (typeof content !== "string" || Buffer.byteLength(content, "utf8") > 500_000) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "content missing or exceeds 500KB" }));
        return;
      }
      const fullPath = `/home/node/.openclaw/workspace/${filePath}`;
      try {
        // Ensure parent directory exists (for nested company paths)
        const dir = fullPath.substring(0, fullPath.lastIndexOf("/"));
        await fsPromises.mkdir(dir, { recursive: true });
        await fsPromises.writeFile(fullPath, content, "utf8");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, path: filePath }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: msg }));
      }
    });
    return;
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add deploy/openclaw-chat-bridge.mjs
git commit -m "feat(bridge): /workspace/tree, /workspace/file GET+PUT for training page"
```

---

### Task 2: Extract AssistantMarkdown + rename Assistant → SCOTE

**Files:**
- Create: `src/app/(site)/analyst/_components/assistant-markdown.tsx`
- Modify: `src/app/(site)/analyst/_components/message-pane.tsx`
- Modify: `src/app/(site)/analyst/_components/use-openclaw-ws.ts`

**Context for implementer:** `AssistantMarkdown` is currently a file-private function inside `message-pane.tsx` (lines 13-91). It uses `react-markdown` and `remark-gfm`. The training page's `file-viewer.tsx` also needs this component, so it must be extracted into its own file. Additionally, "Assistant" must be renamed to "SCOTE" in 5 locations across 2 files.

- [ ] **Step 1: Create assistant-markdown.tsx**

Extract the `AssistantMarkdown` function from `message-pane.tsx` into its own file:

```typescript
"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function AssistantMarkdown({ content }: { content: string }) {
  return (
    <div className="text-sm text-text-2 space-y-2 [&_strong]:text-text-1 [&_strong]:font-semibold [&_em]:italic [&_a]:text-t1-fg [&_a]:underline [&_code]:font-mono [&_code]:text-xs [&_code]:bg-surface-3 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          /* ... exact same component overrides as currently in message-pane.tsx ... */
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
```

Copy the FULL `components` object from the existing code — every single override (h1, h2, h3, h4, p, ul, ol, li, blockquote, pre, table, th, td, hr, a). Do not summarize or abbreviate.

- [ ] **Step 2: Update message-pane.tsx to import from new file**

Remove the inline `AssistantMarkdown` function definition (lines 13-91) and the `ReactMarkdown`/`remarkGfm` imports. Add:

```typescript
import { AssistantMarkdown } from "./assistant-markdown";
```

The rest of the file stays exactly the same — it already references `<AssistantMarkdown content={m.content} />`.

- [ ] **Step 3: Rename "Assistant" → "SCOTE" in use-openclaw-ws.ts (3 locations)**

In `use-openclaw-ws.ts`:
1. History loading (~line 89): `senderName: m.role === "assistant" ? "Assistant"` → `"SCOTE"`
2. Live response (~line 161): `senderName: "Assistant"` → `"SCOTE"`
3. Error message (~line 144): `content: \`Assistant error:` → `content: \`SCOTE error:`

- [ ] **Step 4: Rename "Assistant" → "SCOTE" in message-pane.tsx (2 locations)**

1. In-flight banner (~line 129): `"Assistant is thinking…"` → `"SCOTE is thinking…"`
2. Placeholder text (~line 196): `"Waiting for the Assistant to reply…"` → `"Waiting for SCOTE to reply…"`

- [ ] **Step 5: Verify build**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/\(site\)/analyst/_components/assistant-markdown.tsx \
        src/app/\(site\)/analyst/_components/message-pane.tsx \
        src/app/\(site\)/analyst/_components/use-openclaw-ws.ts
git commit -m "refactor(analyst): extract AssistantMarkdown, rename Assistant → SCOTE"
```

---

### Task 3: Sidebar updates + database seed

**Files:**
- Modify: `src/components/sidebar.tsx`
- Modify: `prisma/seed.ts`
- Modify: `src/app/(site)/analyst/page.tsx`

**Context for implementer:** The sidebar has a `NAV_ITEMS` array and an `ADMIN_ITEMS` array. Each item has `{ id, label, href }` and gets an icon from the `icons` record keyed by `id`. The `forceCollapsed` variable controls auto-collapse for pages with secondary sidebars. The seed file has a `upsertInitialChatSessions()` function that uses a `__general__` sentinel for the general session's `scopeEntityId`.

- [ ] **Step 1: Add training icon to sidebar icons record**

Add after the `analyst` icon entry in the `icons` record:

```typescript
training: (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px] flex-shrink-0">
    <path d="M4 16V6l6-3 6 3v10" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 9l6 3 6-3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 12v5" strokeLinecap="round" />
    <path d="M16 6v4" strokeLinecap="round" />
  </svg>
),
```

(A graduation cap / learning icon — matches the training concept.)

- [ ] **Step 2: Rename Analyst → SCOTE and add Training item**

In `ADMIN_ITEMS`, change:

```typescript
const ADMIN_ITEMS = [
  { id: "analyst", label: "SCOTE", href: "/analyst" },
  { id: "training", label: "SCOTE Training", href: "/training" },
  { id: "audit", label: "Audit Log", href: "/admin/audit" },
  { id: "clawadmin", label: "Mission Control", href: "/ClawAdmin" },
];
```

- [ ] **Step 3: Add /training to forceCollapsed**

Change:

```typescript
const forceCollapsed =
  pathname.startsWith("/analyst") || pathname.startsWith("/match");
```

To:

```typescript
const forceCollapsed =
  pathname.startsWith("/analyst") || pathname.startsWith("/match") || pathname.startsWith("/training");
```

- [ ] **Step 4: Add configure session to seed.ts**

In the `upsertInitialChatSessions()` function, add after the general session upsert:

```typescript
// Configure session for SCOTE Training page (singleton)
const CONFIGURE_SCOPE_SENTINEL = "__configure__";
await prisma.chatSession.upsert({
  where: {
    scopeType_scopeEntityId: {
      scopeType: "general",
      scopeEntityId: CONFIGURE_SCOPE_SENTINEL,
    },
  },
  create: {
    scopeType: "general",
    scopeEntityId: CONFIGURE_SCOPE_SENTINEL,
    openclawSessionId: "tbdc-configure",
    displayName: "Configure SCOTE",
  },
  update: {},
});
```

- [ ] **Step 5: Filter configure session from analyst page**

In `src/app/(site)/analyst/page.tsx`, change the `findMany` query:

```typescript
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
```

- [ ] **Step 6: Verify build**

```bash
npx tsc --noEmit
```

- [ ] **Step 7: Commit**

```bash
git add src/components/sidebar.tsx prisma/seed.ts src/app/\(site\)/analyst/page.tsx
git commit -m "feat: sidebar SCOTE rename + training nav + configure session seed"
```

---

### Task 4: Workspace tree component

**Files:**
- Create: `src/app/(site)/training/_components/workspace-tree.tsx`

**Context for implementer:** This is a client component that fetches the workspace file tree from `/api/openclaw/workspace/tree` and renders it as a collapsible folder structure. It groups root-level `.md` files into a virtual "Identity" section. The styling should match the existing `ChannelSidebar` component pattern — same width (280px is too wide for three panels; use 220px), same active state highlight, same collapse toggles.

The known identity files at the workspace root are: `SOUL.md`, `IDENTITY.md`, `USER.md`, `AGENTS.md`, `HEARTBEAT.md`, `TOOLS.md`.

- [ ] **Step 1: Create workspace-tree.tsx**

```typescript
"use client";
import { useEffect, useState } from "react";

type TreeNode = {
  name: string;
  type: "file" | "dir";
  readOnly?: boolean;
  children?: TreeNode[];
};

const IDENTITY_FILES = new Set([
  "SOUL.md", "IDENTITY.md", "USER.md", "AGENTS.md", "HEARTBEAT.md", "TOOLS.md",
]);

export function WorkspaceTree({
  selectedPath,
  onSelect,
}: {
  selectedPath: string | null;
  onSelect: (path: string, readOnly: boolean) => void;
}) {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    __identity__: true,
    companies: false,
    memory: false,
  });

  useEffect(() => {
    fetch("/api/openclaw/workspace/tree")
      .then((r) => r.json())
      .then((data) => { if (data.ok) setTree(data.tree); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = (key: string) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  // Separate identity files from directories
  const identityFiles = tree.filter(
    (n) => n.type === "file" && IDENTITY_FILES.has(n.name)
  );
  const directories = tree.filter((n) => n.type === "dir");

  const renderFile = (node: TreeNode, pathPrefix: string) => {
    const fullPath = pathPrefix ? `${pathPrefix}/${node.name}` : node.name;
    const active = selectedPath === fullPath;
    const dimmed = node.readOnly;
    return (
      <button
        key={fullPath}
        onClick={() => onSelect(fullPath, !!node.readOnly)}
        className={[
          "w-full text-left px-3 py-1.5 text-[0.78rem] rounded transition-colors truncate",
          active
            ? "bg-[#e8e6e1] text-text-1 font-semibold border-l-[3px] border-l-t1-txt"
            : dimmed
              ? "text-text-3/60 hover:bg-surface-2 hover:text-text-3"
              : "text-text-2 hover:bg-surface-2 hover:text-text-1",
        ].join(" ")}
        title={fullPath}
      >
        {node.name}
      </button>
    );
  };

  const renderDir = (node: TreeNode, pathPrefix: string) => {
    const key = pathPrefix ? `${pathPrefix}/${node.name}` : node.name;
    const isOpen = expanded[node.name] ?? false;
    const dimmed = node.readOnly;
    return (
      <div key={key}>
        <button
          onClick={() => toggle(node.name)}
          className={[
            "flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-1 mt-3",
            dimmed ? "text-text-3/50" : "text-text-3",
          ].join(" ")}
        >
          <span className="text-[0.6rem]">{isOpen ? "▾" : "▸"}</span>
          {node.name}
          {dimmed && <span className="text-[0.55rem] normal-case tracking-normal font-normal ml-1">(read-only)</span>}
        </button>
        {isOpen && node.children && (
          <div className="pl-2 space-y-0.5">
            {node.children.map((child) =>
              child.type === "dir"
                ? renderDir(child, key)
                : renderFile(child, key)
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <aside className="w-[220px] flex-shrink-0 border-r border-border bg-surface p-3">
        <p className="text-xs text-text-3 italic">Loading workspace…</p>
      </aside>
    );
  }

  return (
    <aside className="w-[220px] flex-shrink-0 border-r border-border bg-surface p-3 overflow-y-auto">
      {/* Identity section (virtual group of root .md files) */}
      <button
        onClick={() => toggle("__identity__")}
        className="flex items-center gap-1.5 text-xs font-semibold text-text-3 uppercase tracking-wider mb-1"
      >
        <span className="text-[0.6rem]">{expanded.__identity__ ? "▾" : "▸"}</span>
        Identity
      </button>
      {expanded.__identity__ && (
        <div className="pl-2 space-y-0.5">
          {identityFiles.map((f) => renderFile(f, ""))}
        </div>
      )}

      {/* Real directories: companies, memory, etc. */}
      {directories.map((d) => renderDir(d, ""))}
    </aside>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(site\)/training/_components/workspace-tree.tsx
git commit -m "feat(training): workspace file tree component"
```

---

### Task 5: File editor + file viewer components

**Files:**
- Create: `src/app/(site)/training/_components/file-editor.tsx`
- Create: `src/app/(site)/training/_components/file-viewer.tsx`

**Context for implementer:** The editor loads a file from the bridge, shows it in a textarea, and saves edits back. The viewer shows read-only markdown with a Copy button. Both receive `path` as a prop from the parent layout.

- [ ] **Step 1: Create file-editor.tsx**

```typescript
"use client";
import { useEffect, useState, useCallback } from "react";

export function FileEditor({ path }: { path: string }) {
  const [content, setContent] = useState("");
  const [savedContent, setSavedContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/openclaw/workspace/file?path=${encodeURIComponent(path)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setContent(data.content);
          setSavedContent(data.content);
        }
      })
      .catch(() => setToast("Failed to load file"))
      .finally(() => setLoading(false));
  }, [path]);

  const hasChanges = content !== savedContent;

  const handleSave = useCallback(async () => {
    setSaving(true);
    setToast(null);
    try {
      const res = await fetch("/api/openclaw/workspace/file", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, content }),
      });
      const data = await res.json();
      if (data.ok) {
        setSavedContent(content);
        setToast("Saved. SCOTE will pick up this change on the next message.");
        setTimeout(() => setToast(null), 4000);
      } else {
        setToast(`Save failed: ${data.error}`);
      }
    } catch {
      setToast("Save failed: network error");
    } finally {
      setSaving(false);
    }
  }, [path, content]);

  // Ctrl+S / Cmd+S shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (hasChanges && !saving) handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [hasChanges, saving, handleSave]);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-sm text-text-3 italic">Loading…</div>;
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-1 font-mono">{path}</span>
          {hasChanges && (
            <span className="text-[0.65rem] text-warn-txt">● Unsaved</span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="bg-t1-bg text-[#f5f4f0] px-3 py-1 rounded text-xs disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {/* Editor */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 w-full p-4 font-mono text-sm text-text-1 bg-background resize-none outline-none"
        spellCheck={false}
      />

      {/* Toast */}
      {toast && (
        <div className="px-4 py-2 text-xs text-text-2 bg-surface-2 border-t border-border">
          {toast}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create file-viewer.tsx**

```typescript
"use client";
import { useEffect, useState } from "react";
import { AssistantMarkdown } from "../../analyst/_components/assistant-markdown";

export function FileViewer({ path }: { path: string }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/openclaw/workspace/file?path=${encodeURIComponent(path)}`)
      .then((r) => r.json())
      .then((data) => { if (data.ok) setContent(data.content); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [path]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-sm text-text-3 italic">Loading…</div>;
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-1 font-mono">{path}</span>
          <span className="text-[0.65rem] text-text-3 bg-surface-3 px-1.5 py-0.5 rounded">Read-only</span>
        </div>
        <button
          onClick={handleCopy}
          className="border border-border px-3 py-1 rounded text-xs text-text-2 hover:bg-surface-3 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Rendered markdown with dimmed background */}
      <div className="flex-1 overflow-y-auto p-4 bg-surface-2/50">
        <AssistantMarkdown content={content} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(site\)/training/_components/file-editor.tsx \
        src/app/\(site\)/training/_components/file-viewer.tsx
git commit -m "feat(training): file editor + read-only viewer components"
```

---

### Task 6: Training layout + page

**Files:**
- Create: `src/app/(site)/training/_components/training-layout.tsx`
- Create: `src/app/(site)/training/page.tsx`

**Context for implementer:** The training layout orchestrates the three panels. It holds state for which file is selected and whether it's read-only. The page component is a server component that does auth checks (admin-only, same as analyst page). The MessagePane is reused from analyst — pass `displayName="Configure SCOTE"` and `openclawSessionId="tbdc-configure"`.

- [ ] **Step 1: Create training-layout.tsx**

```typescript
"use client";
import { useState } from "react";
import { WorkspaceTree } from "./workspace-tree";
import { FileEditor } from "./file-editor";
import { FileViewer } from "./file-viewer";
import { MessagePane } from "../../analyst/_components/message-pane";

export function TrainingLayout({
  currentUserId,
  currentUserName,
}: {
  currentUserId: string;
  currentUserName: string;
}) {
  const [selected, setSelected] = useState<{
    path: string;
    readOnly: boolean;
  } | null>(null);

  return (
    <div className="flex h-[calc(100vh-60px)]">
      {/* Left: file tree */}
      <WorkspaceTree
        selectedPath={selected?.path ?? null}
        onSelect={(path, readOnly) => setSelected({ path, readOnly })}
      />

      {/* Center: editor or viewer */}
      {selected ? (
        selected.readOnly ? (
          <FileViewer key={selected.path} path={selected.path} />
        ) : (
          <FileEditor key={selected.path} path={selected.path} />
        )
      ) : (
        <div className="flex-1 flex items-center justify-center text-sm text-text-3 italic px-8 text-center">
          Select a file from the workspace to view or edit.
          <br />
          Identity files shape how SCOTE thinks and communicates.
          <br />
          Memory files are SCOTE&apos;s internal journal — browse them here.
        </div>
      )}

      {/* Right: chat */}
      <div className="w-[400px] flex-shrink-0 border-l border-border">
        <MessagePane
          key="tbdc-configure"
          openclawSessionId="tbdc-configure"
          displayName="Configure SCOTE"
          currentUserId={currentUserId}
          currentUserName={currentUserName}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create page.tsx**

```typescript
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
```

- [ ] **Step 3: Verify build**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(site\)/training/
git commit -m "feat(training): SCOTE Training page — three-panel workspace editor"
```

---

### Task 7: Update IDENTITY.md with SCOTE name

**Files:**
- Modify: `deploy/workspace/IDENTITY.md`

**Context for implementer:** Now that the agent has been named SCOTE, update the local workspace identity file to match.

- [ ] **Step 1: Update IDENTITY.md**

Replace the current content with:

```markdown
# IDENTITY.md

- **Name:** SCOTE
- **Creature:** TBDC's partnerships analyst — Synthetic Capital Outreach for Toronto Entrepreneurs
- **Vibe:** Direct, methodical, opinionated. Like a senior analyst who's done 200 investor intros and knows which ones were wasted.
- **Emoji:** 📊
```

- [ ] **Step 2: Update references in SOUL.md and USER.md**

In `deploy/workspace/SOUL.md`, if it references "TBDC Analyst", change to "SCOTE".

In `deploy/workspace/USER.md`, if it references "TBDC Analyst", change to "SCOTE".

In `deploy/workspace/AGENTS-TBDC-METHODOLOGY.md`, update the "Your role" section to reference SCOTE by name.

- [ ] **Step 3: Commit**

```bash
git add deploy/workspace/
git commit -m "feat(agent): rename agent identity to SCOTE across workspace files"
```

---

## Phase Dependency Graph

```
Task 1 (Bridge endpoints)  ──→ Task 4 (Workspace tree) ──→ Task 6 (Layout + page)
Task 2 (Extract markdown)  ──→ Task 5 (Editor + viewer) ──→ Task 6 (Layout + page)
Task 3 (Sidebar + seed)    ──→ Task 6 (Layout + page)
Task 7 (IDENTITY rename)   ──→ independent, can run anytime
```

Tasks 1, 2, 3 are independent and can run in parallel.
Tasks 4, 5 depend on Tasks 1 and 2 respectively, but are independent of each other.
Task 6 depends on Tasks 3, 4, and 5.
Task 7 is independent of all other tasks.

## Deployment Notes

After all tasks are committed:

1. **Deploy bridge:** Copy `deploy/openclaw-chat-bridge.mjs` to the gateway container and restart
2. **Run seed:** `npx prisma db seed` on the deployed database to create the `tbdc-configure` session
3. **Deploy web:** Rebuild and deploy `tbdc-web` container
4. **Deploy workspace files:** Copy updated IDENTITY.md (and any other changed workspace files) to the gateway workspace

## Rollback

Each task is independently reversible:
- Task 1: Remove the three endpoint blocks from the bridge
- Task 2: Inline AssistantMarkdown back into message-pane.tsx, revert SCOTE → Assistant
- Task 3: Revert sidebar labels, remove seed row
- Tasks 4-6: Delete the `/training` directory
- Task 7: Revert workspace file content
