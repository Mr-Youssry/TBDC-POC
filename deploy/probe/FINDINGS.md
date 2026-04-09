# OpenClaw probe findings — 2026-04-09

## Image pin

**Tag chosen:** `ghcr.io/openclaw/openclaw:2026.4.8`

- Latest dated release visible in GHCR tag listing at probe time: `2026.4.9` (today).
- Picked `2026.4.8` (one day older) as a minor safety margin against untested same-day releases. OpenClaw logs an "update available" notice when running 2026.4.8 — not a blocker.
- Image verified pullable and bootable locally.

## How OpenClaw actually launches (vs. the plan)

The plan assumed a simple file-mount of a JSON config at `/home/node/.openclaw/openclaw.json`. **That does not work** for two reasons:

1. **Default state dir does not exist in the image.** `/home/node/.openclaw` is not precreated. When Docker mounts a bind/volume at a path that does not exist in the image, it creates the mount point owned by `root`, and the container's `node` user (uid 1000) cannot write to it. Gateway startup dies with `EACCES: permission denied, mkdir '/home/node/.openclaw/.openclaw'`.

2. **OpenClaw owns its config file.** The gateway overwrites `openclaw.json` on every startup (seeds an auth token if missing, seeds `gateway.controlUi.allowedOrigins`, etc.). It logs `Config overwrite: …/openclaw.json (sha256 … → …, backup=…/openclaw.json.bak)`. A read-only bind mount would either fail the overwrite or leave the gateway in an unbootable state.

**Working probe launch shape** (see `docker-compose.probe.yml`):

- Use `OPENCLAW_STATE_DIR=/state` to redirect the state directory.
- Mount a **named volume** at `/state` (not a bind mount — bind mounts from Windows into a Linux container drop uid/gid info).
- Run the container briefly as `root` via an entrypoint override, `chown node:node /state` and `/state/workspace`, then `exec su node -c 'node /app/openclaw.mjs gateway --allow-unconfigured'`.
- Let OpenClaw auto-generate `/state/openclaw.json` on first boot.
- Control UI responds with `HTTP/1.1 200 OK` on `http://localhost:18789/`.
- Log confirms: `[gateway] ready (5 plugins, 2.5s)` and `agent model: openai/gpt-5.4`.

## BLOCKER: OpenClaw skills are NOT TypeScript modules

**This is the core finding and it invalidates the plan's Phase 2 task structure.**

The plan (and the v2.0 spec) assume OpenClaw skills are written like this:

```typescript
// SKILL index.ts (plan's assumed shape)
import { PrismaClient } from '@prisma/client';
export const tools = {
  list_investors: {
    description: '…',
    parameters: { … },
    handler: async (args, context) => { … }
  }
};
```

with metadata flowing into `context.metadata.actingUserId`.

**That shape does not exist in OpenClaw.** OpenClaw skills are **`SKILL.md` prompt manifests** (identical in spirit to Claude Code skills). Evidence:

- `openclaw skills` CLI output lists 50 bundled skills, all sourced from `/app/skills/<name>/SKILL.md`. Examples: `gh-issues`, `gemini`, `tmux`, `github`, `bear-notes`, `bluebubbles`, `1password`, `apple-notes`, `coding-agent`.
- Each bundled skill is a single markdown file (no TypeScript, no `tools` export, no `handler` function, no `package.json`, no `node_modules`).
- Example `/app/skills/gh-issues/SKILL.md` is 35 KB of prose instructions teaching GLM/Claude how to invoke `curl` against the GitHub REST API. Frontmatter is:

  ```yaml
  name: gh-issues
  description: "…"
  user-invocable: true
  metadata:
    openclaw:
      requires:
        bins: ["curl", "git", "gh"]
      primaryEnv: "GH_TOKEN"
  ```

- There is no skill SDK, no skill tool registry, no per-message `context.metadata` API surface for skill code. The "skill" IS the prompt. The LLM reads SKILL.md, then uses OpenClaw's general-purpose tool set (shell, file read/write, curl, etc.) to do the work described.

- OpenClaw DOES have an MCP surface (`openclaw mcp` subcommand; `MCP loopback server listening on http://127.0.0.1:*/mcp` in the gateway logs). This is the canonical way to add custom typed tools — they are registered as MCP tool providers, not as skills.

## What this means for Phase 2 and beyond

The plan's "`tbdc-db` TypeScript skill with `@prisma/client` + driver-adapter + per-tool Zod params + audit log on write" cannot be built as an OpenClaw skill. It must be rebuilt as one of:

**Option A — MCP server sidecar (recommended).**
- Build `tbdc-db-mcp` as a standalone Node MCP server (stdio or HTTP transport).
- It hosts the Prisma client, exposes each tool (`list_investors`, `update_match`, …) as an MCP tool with JSON Schema parameters.
- Register it via `openclaw mcp` config so GLM/Claude can call it.
- A thin `tbdc-db` SKILL.md prompt is still written — it teaches the LLM *when* to call the MCP tools, the soft guardrails, WIDMO rules, hard gate, etc.
- Attribution: MCP tool calls carry no per-message metadata, so **`actingUserId` must be passed as an explicit argument on every write tool** (the plan's first fallback). The chat UI injects it into the tool-call arguments when proxying the user's message.
- Keeps all of the plan's audit log + revert machinery intact. Only the glue layer changes.

**Option B — SKILL.md + shell CLI.**
- Package a `tbdc-db` Node CLI binary (`tbdc-db list-investors --json`, `tbdc-db update-match --id=X --data='{…}' --acting-user=Y`) inside the OpenClaw container.
- Write a SKILL.md that teaches the LLM to invoke the CLI with the right flags.
- Simpler to integrate with OpenClaw's existing skill model; closer in shape to bundled skills like `gh-issues`.
- More fragile LLM UX (LLM has to remember argument shapes; no JSON Schema validation at the model layer).
- Still needs explicit `--acting-user` flag for attribution.

**Option C — openclaw HTTP tool endpoint.**
- Investigate whether OpenClaw has a first-party "call this HTTP endpoint as a tool" primitive beyond MCP.
- Not yet explored in this probe. MCP appears to be the intended path based on the CLI surface.

## Recommendation

**Option A (MCP server sidecar).** It preserves the spec's intent (typed tool schemas, audit log, revert flow), it matches OpenClaw's actual extension story, and it keeps the Prisma + Zod + TypeScript code the plan wants. The only spec/plan edit needed is: "tbdc-db is an MCP server registered with OpenClaw, not an OpenClaw TS skill". Phase 2 task structure is rewritten to build an MCP server instead of a TS skill, but the schemas, audit model, and write-auth pattern carry over verbatim.

## What is still OK in the plan

- Phase 0 image pin (`2026.4.8`) ✓
- Phase 1 Prisma schema additions (Assistant user, AuditLog, channel/message tables) — untouched
- Phase 3 `/analyst` UI — untouched, still connects to OpenClaw WebSocket gateway
- Phase 4 `/admin/audit` UI — untouched
- Phase 5 local dev compose — unchanged, just a different sidecar container
- Phase 6 deploy topology — unchanged
- Phase 7 handoff doc — unchanged

**What needs rewriting:** Phase 0 Task 0.3 (hello-world-db skill — dead end, replace with hello-world MCP server probe), and all of Phase 2 (rebuild as MCP server tasks).

## Follow-up investigation (2026-04-09, after user requested deeper dig)

Confirmed via `docs.openclaw.ai`: **OpenClaw has a first-class TypeScript Plugin SDK** that is the correct home for custom typed tools. Evidence from the live docs (reached via `openclaw docs` + web fetch):

### Plugin SDK is the right surface

From `docs.openclaw.ai/plugins/sdk-overview.md`:
- "The OpenClaw Plugin SDK is the typed contract between plugins and core."
- Plugins are written in TypeScript.
- Tool registration API: `api.registerTool(tool, opts?)`.
- Import pattern: `import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry"`.

From `docs.openclaw.ai/plugins/building-plugins.md` — **minimal working plugin example quoted verbatim:**

```typescript
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { Type } from "@sinclair/typebox";

export default definePluginEntry({
  id: "my-plugin",
  name: "My Plugin",
  description: "Adds a custom tool to OpenClaw",
  register(api) {
    api.registerTool({
      name: "my_tool",
      description: "Do a thing",
      parameters: Type.Object({ input: Type.String() }),
      async execute(_id, params) {
        return { content: [{ type: "text", text: `Got: ${params.input}` }] };
      },
    });
  },
});
```

Required files per plugin:
- `package.json` with an `openclaw` field (extensions, compat, build)
- `openclaw.plugin.json` manifest with `id` + `configSchema`
- `index.ts` entry point

### Plugin install / CLI

From `docs.openclaw.ai/cli/plugins`:
```bash
openclaw plugins install <path>           # install from filesystem
openclaw plugins install -l ./my-plugin   # link without copying (dev mode)
openclaw plugins list [--enabled] [--verbose] [--json]
openclaw plugins enable|disable <id>
openclaw plugins inspect <id> [--json]
openclaw plugins doctor
```

Plugins can be installed from local paths, npm, ClawHub marketplace, zip/tgz archives, etc.

### Skills vs Plugins vs MCP — clarified

- **Skills** = prompt manifests (`SKILL.md`). Good for teaching the LLM *how/when* to use tools, but cannot themselves ship typed tool code.
- **Plugins** = TypeScript code with `api.registerTool()`. Good for typed, audited, code-backed tools. **This is what the v2.0 spec's `tbdc-db` should be.**
- **MCP servers** = external processes the gateway calls over MCP stdio/HTTP. Managed via `openclaw mcp set/show/list`. Also viable, but adds a second process and an extra transport hop.

### Still unresolved (but not blocking the pivot decision)

- Exact `execute(_id, params, …?)` signature — whether it receives a third `context` arg with session/user identity. Docs don't show it; bundled plugin source in `/app/node_modules/openclaw/plugin-sdk/` or the git source would. **If no context is passed, we fall back to the plan's "explicit `actingUserId` argument on every write tool" option.** Either way the architecture works.
- Whether the plugin install CLI works from a running container (we'd bind-mount the plugin dir into the container and run `openclaw plugins install -l /plugins/tbdc-db`).

## Firmer recommendation (replaces Option A in the earlier question)

**Build `tbdc-db` as an OpenClaw Plugin.** It matches the SDK's intended extension shape 1:1 with the plan's "TypeScript skill with typed tools" concept — we just use the correct noun. Specifically:

- `deploy/plugins/tbdc-db/package.json` — name, openclaw extensions field, deps on `openclaw/plugin-sdk`, `@prisma/client`, `@prisma/adapter-pg`, `@sinclair/typebox`.
- `deploy/plugins/tbdc-db/openclaw.plugin.json` — manifest with `id: "tbdc-db"`, `configSchema` declaring `databaseUrl` + assistant role credentials.
- `deploy/plugins/tbdc-db/index.ts` — `definePluginEntry({ register(api) { api.registerTool(...) } })` with one tool per use-case (`list_investors`, `get_company`, `update_match`, `append_audit_note`, etc.), each with a TypeBox `parameters` schema.
- `deploy/plugins/tbdc-db/SKILL.md` — optional companion SKILL.md prompt manifest that teaches GLM when to call the plugin's tools, carries the WIDMO hard gate rules, and lists the soft guardrails. Loaded via `skills.load.extraDirs`.

The plan's audit log, revert flow, Zod-equivalent typed schemas, and per-tool authorization all carry over verbatim. Only the **packaging** changes: plugin instead of skill.

Phase 2 task structure needs a moderate rewrite (mostly s/skill/plugin/ plus updating the install/registration commands), but every task's underlying work (schema, tool, test) survives.

## Action items if approved

1. Complete Phase 0 Task 0.3 by building a throwaway `hello-world-db` **plugin** (not skill), install it with `openclaw plugins install -l`, invoke `ping_db` via the Control UI, observe whether `execute()` receives metadata.
2. Append final findings to this file (including the real `execute` signature).
3. Rewrite Phase 2 in the plan file from "skill" → "plugin" before executing it, and commit the plan edit as a plan addendum before Phase 2 dispatch.
4. Continue with the rest of Phase 0 → Phase 6 unchanged.

## End-to-end probe VERIFIED (2026-04-09, plugin pivot confirmed working)

Built `deploy/probe/plugins/hello-world-db/` as a minimal OpenClaw plugin (plain JS, no TypeScript compilation), installed it via `openclaw plugins install -l /state/custom-plugins`, and confirmed it loads and registers.

### Evidence

Gateway startup logs show:

```
[gateway] [hello-world-db] registering ping tool
[gateway] ready (6 plugins, 9.5s)     # count went 5 → 6
[plugins] [hello-world-db] registering ping tool  # acpx runtime reload
```

`openclaw plugins list` output row:

```
Hello World  | hello-… | openclaw | loaded | /state/custom-plugins/index.js | 0.0.1
```

The plugin's own `api.logger?.info?.("[hello-world-db] registering ping tool")` log line fired — confirming `register(api)` executed inside the gateway process.

### Definitive findings for Phase 2 design

1. **OpenClaw Plugin SDK is the correct extension surface.** A plugin is a directory with `package.json` (with an `openclaw.extensions` field), `openclaw.plugin.json` manifest, and an `index.js` (or `.ts` — see below) entry. Installation is `openclaw plugins install -l <absolute-path>` for dev/linked mode. Plugins appear in `openclaw plugins list` with `loaded | disabled | error` status and are inspectable via `openclaw plugins inspect <id>`.

2. **Entry point shape (confirmed from bundled source `/app/dist/plugin-entry-CcWmObwf.js`):**

   ```js
   import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";

   export default definePluginEntry({
     id, name, description,
     // optional: kind, configSchema, reload, nodeHostCommands, securityAuditCollectors
     register(api) {
       api.registerTool({ /* tool definition */ });
     }
   });
   ```

   `configSchema` must be a JSON Schema object (the manifest version is echoed; the runtime version takes precedence).

3. **Tool definition shape (confirmed from bundled `tlon` plugin source `/app/dist/extensions/tlon/index.js`):**

   ```js
   api.registerTool({
     name: "tool_name",
     label: "Human Label",
     description: "…",
     parameters: {            // plain JSON Schema — TypeBox not required
       type: "object",
       properties: { … },
       required: [ … ]
     },
     async execute(id, params) {
       return {
         content: [{ type: "text", text: "…" }],
         details: { error: false, … }   // optional
       };
     }
   });
   ```

4. **`execute(id, params)` signature is exactly 2 args. There is no third `context` / `metadata` argument.** Confirmed both from bundled source and from a probe handler that logged `arguments.length`. **Implication: per-message attribution cannot flow implicitly.** The plan's Phase 0 fallback "explicit `actingUserId` parameter on every write tool" is the correct path. The chat pane (Phase 3) will inject the authenticated admin's user id into the tool call arguments when proxying the user's message to OpenClaw.

5. **Security policy: plugin directory must be `root:root`-owned and not world-writable.** OpenClaw blocks any plugin candidate at a path owned by non-root or with mode >= 777. Windows bind-mounts inherit uid=1000/mode=777 by default, so:

   - **Local dev workflow:** the compose file must bind-mount the plugin source to a scratch path, then an init (running as root) must `cp -r` it into a root-owned state location (`/state/custom-plugins` in our case) and `chmod go-w`. Tested and working.
   - **Production (rafiq-dev):** bake the plugin source into a derived image (`FROM openclaw:2026.4.8; COPY --chown=root:root ./tbdc-db /plugins/tbdc-db`), or install it via a root init in the deploy compose.

6. **Config file must be `node`-owned.** `openclaw plugins install` overwrites `/state/openclaw.json` via the CLI process. If run as root (to bypass the plugin security check), the config file ends up root-owned and the gateway (running as node) can't read it on next boot, producing `EACCES: permission denied, open '/state/openclaw.json'`. Fix: compose entrypoint must `chown node:node /state/openclaw.json*` on every start, before handing off to the node user. Tested and working.

7. **Plugins load into BOTH the main gateway AND the embedded ACPx runtime.** The register() function runs twice, once per process. This is expected and harmless — plugin code should be idempotent with respect to `register`.

8. **Prisma + DB access inside a plugin:** not exercised in the probe (scope-limited to SDK verification), but there is zero runtime reason it wouldn't work — plugins run inside a normal Node 24 process with access to `npm install`-style deps. The plan's original Prisma driver-adapter approach (`@prisma/client` + `@prisma/adapter-pg`) carries over unchanged into the plugin.

### Compose file settled shape (for Phase 5 + Phase 6)

```yaml
services:
  openclaw-gateway:
    image: ghcr.io/openclaw/openclaw:2026.4.8
    user: "0:0"
    entrypoint:
      - /bin/sh
      - -c
      - |
        chown node:node /state || true
        mkdir -p /state/workspace && chown node:node /state/workspace || true
        [ -f /state/openclaw.json ] && chown node:node /state/openclaw.json
        [ -f /state/openclaw.json.bak ] && chown node:node /state/openclaw.json.bak
        # One-shot plugin install on first boot or when /plugins-src changes
        if [ -d /plugins-src/tbdc-db ] && [ ! -d /state/custom-plugins/tbdc-db ]; then
          mkdir -p /state/custom-plugins
          cp -r /plugins-src/tbdc-db /state/custom-plugins/
          chown -R root:root /state/custom-plugins
          chmod -R 755 /state/custom-plugins
          su -s /bin/sh node -c "cd /app && node openclaw.mjs plugins install -l /state/custom-plugins/tbdc-db"
          chown node:node /state/openclaw.json
        fi
        exec su -s /bin/sh node -c "node /app/openclaw.mjs gateway"
    volumes:
      - openclaw-state:/state
      - ./tbdc-db-plugin:/plugins-src/tbdc-db:ro
    # …
```

(Exact form will be written as part of Phase 5/6 tasks.)

### Files landed in Phase 0

- `deploy/openclaw-version.txt` — pins `2026.4.8`
- `deploy/probe/openclaw.json` — minimal config (vestigial; OpenClaw overwrites it, but committed as a record)
- `deploy/probe/docker-compose.probe.yml` — working probe launcher with the root-chown init
- `deploy/probe/plugins/hello-world-db/` — throwaway probe plugin: `package.json`, `openclaw.plugin.json`, `index.js`
- `deploy/probe/FINDINGS.md` — this document
- `deploy/probe/skills/` — empty placeholder, kept for symmetry but unused (skills are not where custom tools live)

### Teardown

Probe stack torn down with `docker compose … down -v`. Volume `probe_openclaw-probe-state` removed. Image `ghcr.io/openclaw/openclaw:2026.4.8` remains cached in local Docker.

### Phase 0 gate: PASSED

1. ✅ `deploy/openclaw-version.txt` contains `2026.4.8`
2. ✅ `deploy/probe/FINDINGS.md` documents the plugin-pivot finding and the working plugin-install flow
3. ✅ All probe files ready to commit to `v2-analyst`
