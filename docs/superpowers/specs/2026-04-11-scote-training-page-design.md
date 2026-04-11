# SCOTE Training Page — Design Spec

## Overview

A three-panel IDE-like page at `/training` where Ahmed Korayem can view and edit SCOTE's workspace files (identity, methodology, company profiles), browse memory logs, and chat with SCOTE about its configuration. Plus a rebrand of the existing Analyst page label from "Analyst" to "SCOTE."

**SCOTE** = **S**ynthetic **C**apital **O**utreach for **T**oronto **E**ntrepreneurs

## Problem

SCOTE's identity files (SOUL.md, IDENTITY.md, USER.md, AGENTS.md, HEARTBEAT.md, TOOLS.md) currently live on the OpenClaw gateway and can only be edited via SSH + docker exec. Ahmed Korayem — the non-technical product owner — cannot shape SCOTE's personality, methodology, or operator profile without developer assistance. There is also no way to have a focused conversation with SCOTE about its own identity and behavior, separate from the company-focused analyst workflow.

## Solution

### Page layout — three panels

```
┌─────────────────────────────────────────────────────────┐
│ Site Header (sticky)                                     │
├──────────┬──────────────────────────┬────────────────────┤
│ File     │ File Editor / Viewer     │ Configure SCOTE    │
│ Tree     │                          │ (chat)             │
│          │ SOUL.md                  │                    │
│ Identity │ ┌──────────────────────┐ │ ┌────────────────┐ │
│  SOUL.md │ │ raw markdown         │ │ │ message        │ │
│  IDENT…  │ │ textarea             │ │ │ history        │ │
│  USER.md │ │                      │ │ │                │ │
│  AGENTS… │ │                      │ │ │                │ │
│  HEART…  │ │                      │ │ │                │ │
│  TOOLS…  │ │                      │ │ │                │ │
│          │ └──────────────────────┘ │ │                │ │
│ Companies│        [Save]           │ ├────────────────┤ │
│  ▸ fermi │                          │ │ [message input]│ │
│  ▸ omnif…│                          │ └────────────────┘ │
│          │                          │                    │
│ Memory   │ (dimmed bg for           │                    │
│  MEMORY… │  read-only files)        │                    │
│  04-10…  │                          │                    │
│  04-11…  │                          │                    │
│ (220px)  │ (flex-1)                 │ (~400px)           │
└──────────┴──────────────────────────┴────────────────────┘
```

Primary sidebar auto-collapses on this page (same pattern as `/analyst` and `/match`).

### Left panel — Workspace File Tree (~220px)

A collapsible folder tree mirroring the gateway workspace at `/home/node/.openclaw/workspace/`.

**Three root sections:**

| Section | Default state | Editable? | Visual treatment |
|---------|--------------|-----------|-----------------|
| **Identity** | Expanded | Yes | Normal |
| **Companies** | Collapsed | Yes | Normal |
| **Memory** | Collapsed | Read-only | Dimmed text/icon to signal read-only |

**Identity section files:** SOUL.md, IDENTITY.md, USER.md, AGENTS.md, HEARTBEAT.md, TOOLS.md

**Companies section:** One expandable folder per company (e.g., `fermi-dev/`), each containing `profile.md` and any other files that accumulate (pitch-deck.md, research-notes.md).

**Memory section:** MEMORY.md at the top, then daily logs (`memory/2026-04-10.md`, etc.) sorted newest first. Entire section has dimmed styling to visually communicate read-only status.

**Interaction:** Click a file → loads in center panel. Selected file highlighted with the standard active style (`bg-[#e8e6e1]`, left border accent).

**Data source:** `GET /workspace/tree` bridge endpoint returns the tree structure as nested JSON.

### Center panel — File Editor / Viewer (flex-1)

**Header:** File path displayed as breadcrumb (e.g., `companies / omniful / profile.md`) + a status chip showing "Editable" or "Read-only".

**For editable files (identity + companies):**
- Raw markdown textarea, monospace font (`font-mono`), full height of the panel
- **Save** button (bottom-right or in the header bar)
- On save: `PUT /workspace/file` to bridge
- Success feedback: toast or inline message — "Saved. SCOTE will pick up this change on the next message."
- Unsaved changes: visual indicator (dot on tab/header, or "Unsaved changes" label)

**For read-only files (memory):**
- Rendered markdown (using the existing `AssistantMarkdown` renderer or similar)
- Dimmed background (`bg-surface-2` or `opacity-80`)
- **Copy** button instead of Save — copies raw markdown to clipboard
- Copy feedback: "Copied to clipboard" toast

**Empty state (no file selected):**
- Welcome message: "Select a file from the workspace to view or edit. Identity files shape how SCOTE thinks and communicates. Memory files are SCOTE's internal journal — browse them here."

### Right panel — Configure SCOTE Chat (~400px)

Reuses the existing `MessagePane` + `useOpenClawWs` hook from the analyst page.

**Session ID:** `tbdc-configure` — one continuous thread, persisted via OpenClaw's session JSONL.

**Header label:** "Configure SCOTE" (replaces the channel `displayName` in the MessagePane header).

**History:** Loads on mount from `/api/openclaw/history?sessionId=tbdc-configure` (existing endpoint).

**Behavior:** Identical to the analyst chat — Ahmed types a message, SCOTE responds. The difference is framing: this conversation is about SCOTE's identity, methodology, and behavior. Ahmed can paste content copied from memory files into the chat input.

**This session does NOT appear in the SCOTE (analyst) page's channel sidebar.** It is exclusive to the Training page.

**Agent name:** SCOTE replaces "Assistant" in message bubbles on both the Training page and the analyst (SCOTE) page. The `senderName` for assistant messages becomes "SCOTE" instead of "Assistant."

## Bridge endpoints (3 new)

All follow the existing dual-path pattern (`/endpoint` + `/api/openclaw/endpoint`). All use the existing `fsPromises` import. The frontend calls these directly via the Caddy passthrough (`/api/openclaw/workspace/tree`, `/api/openclaw/workspace/file`) — no Next.js route handler needed (same pattern as `/api/openclaw/history`).

### GET /workspace/tree

Returns the full directory tree of `/home/node/.openclaw/workspace/`.

**Response:**
```json
{
  "ok": true,
  "tree": [
    { "name": "SOUL.md", "type": "file", "readOnly": false },
    { "name": "IDENTITY.md", "type": "file", "readOnly": false },
    {
      "name": "memory",
      "type": "dir",
      "readOnly": true,
      "children": [
        { "name": "MEMORY.md", "type": "file", "readOnly": true },
        { "name": "2026-04-10.md", "type": "file", "readOnly": true }
      ]
    },
    {
      "name": "companies",
      "type": "dir",
      "readOnly": false,
      "children": [
        {
          "name": "omniful",
          "type": "dir",
          "readOnly": false,
          "children": [
            { "name": "profile.md", "type": "file", "readOnly": false }
          ]
        }
      ]
    }
  ]
}
```

**ReadOnly logic:** `path === "MEMORY.md" || path.startsWith("memory/")` → `readOnly: true`. Everything else is `readOnly: false`.

**Exclusions:** Skip `.git/`, `.openclaw/`, `state/`, `node_modules/`, and any dotfiles. Only return `.md` files.

**Frontend grouping:** The bridge returns the flat workspace tree. The client-side `workspace-tree.tsx` component groups root-level `.md` files (SOUL.md, IDENTITY.md, USER.md, AGENTS.md, HEARTBEAT.md, TOOLS.md) into a virtual "Identity" section. The `memory/` and `companies/` directories become their own collapsible sections.

### GET /workspace/file?path=SOUL.md

Reads a single file from the workspace.

**Path validation:** Reject if `path` contains `..`, starts with `/`, or contains `\`. Reject paths outside the workspace root.

**Response:**
```json
{
  "ok": true,
  "path": "SOUL.md",
  "content": "# SOUL.md - Who You Are\n...",
  "readOnly": false
}
```

**File not found:** Return `404` with `{ "ok": false, "error": "file not found" }`.

### PUT /workspace/file

Saves edited content to the workspace.

**Request body:**
```json
{
  "path": "SOUL.md",
  "content": "# SOUL.md - Who You Are\n\nUpdated content..."
}
```

**Validation:**
- Path traversal protection (reject `..`, `/` prefix, `\`)
- Reject writes to any path under `memory/` or to `MEMORY.md` — return `403` with `"memory files are read-only"`
- Content size limit: 500KB (same as `/upload`)

**Response:** `{ "ok": true, "path": "SOUL.md" }`

## Sidebar changes

1. **Rename "Analyst" → "SCOTE"** in the sidebar nav. Route stays `/analyst`. Icon stays the same (chart).
2. **Add "SCOTE Training"** → `/training` in the admin section, after "SCOTE" and before "Audit Log". New icon: a pencil-in-square or similar training/editing icon.
3. **Auto-collapse** primary sidebar on `/training` route (add to the `forceCollapsed` check in sidebar.tsx).

## Database seed

One new `ChatSession` row for the configure session. Add to the existing `upsertInitialChatSessions()` function in `prisma/seed.ts` using the same `prisma.chatSession.upsert()` pattern:

```typescript
await prisma.chatSession.upsert({
  where: { scopeType_scopeEntityId: { scopeType: "general", scopeEntityId: "__configure__" } },
  create: {
    scopeType: "general",
    scopeEntityId: "__configure__",
    openclawSessionId: "tbdc-configure",
    displayName: "Configure SCOTE",
  },
  update: {},
});
```

**Analyst page exclusion:** The analyst page's `prisma.chatSession.findMany()` currently has NO `where` clause — it returns all sessions. Add a filter to exclude the configure session: `where: { openclawSessionId: { not: "tbdc-configure" } }`. Without this, "Configure SCOTE" will appear in the analyst's channel sidebar.

## Agent naming

Replace "Assistant" with "SCOTE" in these exact locations:

**`use-openclaw-ws.ts`** (3 occurrences):
- History loading: `senderName: m.role === "assistant" ? "Assistant"` → `"SCOTE"` (line ~89)
- Live response: `senderName: "Assistant"` → `"SCOTE"` (line ~161)
- Error message: `"Assistant error:"` → `"SCOTE error:"` (line ~144)

**`message-pane.tsx`** (2 occurrences):
- In-flight banner: `"Assistant is thinking…"` → `"SCOTE is thinking…"` (line ~129)
- Placeholder text: `"Waiting for the Assistant to reply…"` → `"Waiting for SCOTE to reply…"` (line ~196)

## File structure (new files)

| File | Responsibility |
|------|---------------|
| `src/app/(site)/training/page.tsx` | Server component: auth guard, fetch configure session |
| `src/app/(site)/training/_components/workspace-tree.tsx` | Client component: file tree with collapsible folders |
| `src/app/(site)/training/_components/file-editor.tsx` | Client component: markdown textarea editor + save |
| `src/app/(site)/training/_components/file-viewer.tsx` | Client component: read-only rendered markdown + copy |
| `src/app/(site)/training/_components/training-layout.tsx` | Client component: three-panel layout orchestrator |

**Shared components (reused from analyst):** `MessagePane`, `useOpenClawWs`, `ToolCallPill`.

**Component extraction required:** `AssistantMarkdown` is currently a file-private function inside `message-pane.tsx`. Extract it into `src/app/(site)/analyst/_components/assistant-markdown.tsx` and export it, so both `MessagePane` and the training page's `file-viewer.tsx` can import it.

## What is NOT in scope

- Syntax highlighting or rich markdown editing (raw textarea is the POC approach)
- Diff view or version history for workspace files
- Creating new files from the UI (only editing existing ones)
- File deletion from the UI
- The BOOTSTRAP.md first-run flow (Ahmed can reference it manually in the chat)
- Streaming responses (same HTTP bridge pattern as analyst)
- Concurrent edit detection (last-write-wins is acceptable for single-user POC)
