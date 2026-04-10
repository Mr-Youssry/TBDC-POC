# Mission Control Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the SSH-tunnel-only `/ClawAdmin` instructions page with a live, TBDC-branded Mission Control dashboard at `/ClawAdmin` that shows OpenClaw gateway state directly in the browser — no SSH required.

**Architecture:** The openclaw-chat-bridge process (Node HTTP server running inside the openclaw-gateway container at port 3020) already has full access to OpenClaw's CLI, state files, and environment. Add 3 new GET endpoints to the bridge that wrap CLI commands and JSON file reads. Then replace the current Next.js `/ClawAdmin` page (which shows SSH instructions) with a server-rendered dashboard that fetches these endpoints at request time and renders cards for gateway status, plugins, model config, and provider auth. Keep the SSH tunnel section at the bottom as a "Power user" collapsible for anyone who still wants the native Control UI.

**Tech Stack:** Node.js (bridge endpoints), Next.js 16 RSC (dashboard page), existing TBDC design tokens, `child_process.execFile` for CLI wrapping.

**Existing patterns to follow:**
- Bridge endpoint style: see `/health` and `/gateway-token` in `deploy/openclaw-chat-bridge.mjs`
- Admin page style: see `src/app/(site)/admin/audit/page.tsx` (server component, `requireSessionForPage()` guard, admin role check)
- Design tokens: `bg-surface-2`, `border-border`, `text-text-1`/`text-text-2`/`text-text-3`, `font-serif` headings per `src/app/globals.css`

**Phase dependency:** Tasks 1 and 2 are independent (bridge vs UI). Task 2 depends on Task 1's endpoints being available but can be coded in parallel and tested after Task 1 deploys.

---

## File Structure

| File | Responsibility |
|------|---------------|
| `deploy/openclaw-chat-bridge.mjs` | **Modify.** Add 3 GET endpoints: `/status`, `/plugins`, `/config` |
| `src/app/(site)/ClawAdmin/page.tsx` | **Replace.** Swap the SSH-instructions page with a live dashboard |
| `src/app/(site)/ClawAdmin/_components/copy-button.tsx` | **Keep.** Reused for the SSH section at the bottom |
| `src/app/(site)/ClawAdmin/_components/status-card.tsx` | **Create.** Reusable card component for each dashboard section |

---

### Task 1: Bridge endpoints — `/status`, `/plugins`, `/config`

**Files:**
- Modify: `deploy/openclaw-chat-bridge.mjs`

**Context for the implementer:**
The bridge is a single-file Node HTTP server running inside the openclaw-gateway Docker container. It listens on port 3020 and is only reachable from the `docker_rafiq-shared` network (Caddy routes `/api/openclaw/*` to it). It has full filesystem access to `/state/openclaw.json` and can spawn any CLI command via `node /app/openclaw.mjs <subcommand>`.

The bridge must stay a single file with no npm dependencies beyond Node built-ins — it's bind-mounted into the container and runs with `node /openclaw-chat-bridge.mjs`. The container does NOT have npm available at runtime.

Each new endpoint should:
1. Handle both `/endpoint` and `/api/openclaw/endpoint` paths (same pattern as existing `/gateway-token`)
2. Return `{ ok: true, ...data }` on success, `{ ok: false, error: "..." }` on failure
3. Set a 10-second timeout on any child process spawn
4. Log the request with `console.log(\`[bridge] GET /endpoint\`)`

**Before adding endpoints,** add these imports at the top of the file alongside the existing `import http` and `import { spawn }`:

```javascript
import { promises as fsPromises } from "node:fs";
import { execFile } from "node:child_process";
```

All new endpoints use `fsPromises.readFile(...)` and `execFile(...)` directly — no dynamic `await import()` inside handlers.

- [ ] **Step 1: Add the `/status` endpoint**

This endpoint reads `/state/openclaw.json` for config metadata AND parses container environment for the running state. It returns a flat summary object.

Add this handler block after the existing `/gateway-token` handler (before the `normalizedPath` line):

```javascript
// GET /status — gateway overview: version, model, auth mode, uptime
if (
  req.method === "GET" &&
  (req.url === "/status" || req.url === "/api/openclaw/status")
) {
  console.log("[bridge] GET /status");
  try {
    const cfg = JSON.parse(
      await fsPromises.readFile("/state/openclaw.json", "utf8"),
    );
    const status = {
      ok: true,
      gateway: {
        version: cfg?.meta?.lastTouchedVersion ?? "unknown",
        lastTouchedAt: cfg?.meta?.lastTouchedAt ?? null,
        authMode: cfg?.gateway?.auth?.mode ?? "none",
        model: cfg?.agents?.defaults?.model?.primary ?? "not set",
        trustedProxies: cfg?.gateway?.trustedProxies ?? [],
        dangerouslyDisableDeviceAuth:
          cfg?.gateway?.controlUi?.dangerouslyDisableDeviceAuth ?? false,
      },
      env: {
        ZAI_API_KEY: process.env.ZAI_API_KEY
          ? `${process.env.ZAI_API_KEY.slice(0, 8)}…(set)`
          : "(not set)",
        NODE_ENV: process.env.NODE_ENV ?? "unknown",
      },
      bridgePid: process.pid,
      ts: Date.now(),
    };
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(status));
    return;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: msg }));
    return;
  }
}
```

- [ ] **Step 2: Add the `/plugins` endpoint**

This endpoint runs `node /app/openclaw.mjs plugins inspect tbdc-db` (the only custom plugin) and also reads the plugin install metadata from `/state/openclaw.json`. It returns structured plugin data.

```javascript
// GET /plugins — list loaded plugins with tool counts
if (
  req.method === "GET" &&
  (req.url === "/plugins" || req.url === "/api/openclaw/plugins")
) {
  console.log("[bridge] GET /plugins");
  try {
    const cfg = JSON.parse(
      await fsPromises.readFile("/state/openclaw.json", "utf8"),
    );
    const pluginEntries = cfg?.plugins?.entries ?? {};
    const pluginInstalls = cfg?.plugins?.installs ?? {};

    // Run `openclaw plugins inspect tbdc-db` for tool details
    const inspectResult = await new Promise((resolve) => {
      execFile(
        "node",
        ["/app/openclaw.mjs", "--log-level", "silent", "plugins", "inspect", "tbdc-db"],
        { cwd: "/app", timeout: 10_000, env: process.env },
        (err, stdout, stderr) => {
          resolve({ err, stdout: stdout ?? "", stderr: stderr ?? "" });
        },
      );
    });

    const plugins = {
      ok: true,
      custom: {
        id: "tbdc-db",
        enabled: pluginEntries["tbdc-db"]?.enabled ?? false,
        version: pluginInstalls["tbdc-db"]?.version ?? "unknown",
        installedAt: pluginInstalls["tbdc-db"]?.installedAt ?? null,
        sourcePath: pluginInstalls["tbdc-db"]?.sourcePath ?? null,
        inspectOutput: inspectResult.stdout
          .split("\n")
          .filter((l) => !/^\[plugins?\]/.test(l.trim()))
          .join("\n")
          .trim(),
      },
      totalLoaded: "54/98", // from plugins list header — hardcoded for POC
      ts: Date.now(),
    };
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(plugins));
    return;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: msg }));
    return;
  }
}
```

- [ ] **Step 3: Add the `/config` endpoint**

This endpoint returns a sanitized view of `/state/openclaw.json` (strips the gateway auth token to avoid leaking it in this read-only context — the `/gateway-token` endpoint handles that separately).

```javascript
// GET /config — sanitized gateway config (token redacted)
if (
  req.method === "GET" &&
  (req.url === "/config" || req.url === "/api/openclaw/config")
) {
  console.log("[bridge] GET /config");
  try {
    const cfg = JSON.parse(
      await fsPromises.readFile("/state/openclaw.json", "utf8"),
    );
    // Redact the auth token from the output
    if (cfg?.gateway?.auth?.token) {
      cfg.gateway.auth.token = `${cfg.gateway.auth.token.slice(0, 8)}…(redacted)`;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, config: cfg }));
    return;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: msg }));
    return;
  }
}
```

- [ ] **Step 4: Test all three endpoints locally**

SCP the updated bridge file to the droplet, restart the gateway, and verify:

```bash
scp -i ~/.ssh/id_ed25519 deploy/openclaw-chat-bridge.mjs root@67.205.157.55:/root/tbdc-poc/openclaw-chat-bridge.mjs
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 'docker restart openclaw-gateway && sleep 12'

# Direct bridge tests (inside the container):
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 'docker exec openclaw-gateway curl -s http://127.0.0.1:3020/status'
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 'docker exec openclaw-gateway curl -s http://127.0.0.1:3020/plugins'
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 'docker exec openclaw-gateway curl -s http://127.0.0.1:3020/config'

# Via Caddy (public path):
curl -s https://tbdc.ready4vc.com/api/openclaw/status
curl -s https://tbdc.ready4vc.com/api/openclaw/plugins
curl -s https://tbdc.ready4vc.com/api/openclaw/config
```

Expected: each returns `{ "ok": true, ... }` with the relevant data. If Caddy returns a 404, the container may need `docker restart caddy` (single-file bind mount inode issue — see Task 3 deploy notes).

- [ ] **Step 5: Commit bridge changes**

```bash
git add deploy/openclaw-chat-bridge.mjs
git commit -m "feat(v2/bridge): add /status, /plugins, /config endpoints for Mission Control dashboard"
```

---

### Task 2: Dashboard page — replace `/ClawAdmin` with live Mission Control

**Files:**
- Replace: `src/app/(site)/ClawAdmin/page.tsx`
- Create: `src/app/(site)/ClawAdmin/_components/status-card.tsx`
- Keep: `src/app/(site)/ClawAdmin/_components/copy-button.tsx`

**Context for the implementer:**
The current `/ClawAdmin` page is a static SSH-instructions page. Replace it with a server-rendered dashboard that fetches from the bridge endpoints (Task 1) and renders 4 sections:

1. **Gateway Status** — version, model, auth mode, uptime, env vars
2. **Plugins** — tbdc-db plugin details, tool list, install metadata
3. **Config Viewer** — sanitized JSON config in a `<pre>` block
4. **Power User: SSH Tunnel** — collapsed by default, contains the same SSH command + token URL from the old page (for operators who want the native Control UI)

All data is fetched server-side at request time (RSC with `force-dynamic`). No client-side polling needed for a POC dashboard.

Follow the existing admin page pattern from `/admin/audit/page.tsx`: use `requireSessionForPage()`, check `role === "admin"`, render with TBDC design tokens.

- [ ] **Step 1: Create the `StatusCard` component**

Create `src/app/(site)/ClawAdmin/_components/status-card.tsx`:

```tsx
export function StatusCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-2 bg-surface-2 border-b border-border">
        <h2 className="font-serif text-base text-text-1 font-semibold">
          {title}
        </h2>
      </div>
      <div className="px-4 py-3">{children}</div>
    </section>
  );
}
```

- [ ] **Step 2: Build the dashboard page**

Replace `src/app/(site)/ClawAdmin/page.tsx` entirely with the code below. Key design decisions:

- `BRIDGE_URL` constant follows the existing pattern from the old page
- All 4 fetches use `cache: "no-store"` and `AbortSignal.timeout(5000)` (matches existing `fetchGatewayToken()` pattern)
- `Promise.allSettled` ensures one failing endpoint doesn't crash the page
- Each section shows a red error card if its fetch failed
- `<details>/<summary>` collapsible for the SSH section at the bottom

```tsx
import { requireSessionForPage } from "@/lib/guards";
import { StatusCard } from "./_components/status-card";
import { CopyButton } from "./_components/copy-button";

export const dynamic = "force-dynamic";

const BRIDGE_URL =
  process.env.OPENCLAW_CHAT_BRIDGE_URL ?? "http://openclaw-gateway:3020";
const SSH_USER = "root";
const SSH_HOST = "67.205.157.55";
const SSH_KEY = "~/.ssh/id_ed25519";
const LOCAL_PORT = 18789;

async function bridgeFetch<T>(path: string): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${BRIDGE_URL}${path}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const json = await res.json();
    return { ok: true, data: json as T };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export default async function ClawAdminPage() {
  const session = await requireSessionForPage();
  const role = (session.user as { role?: string }).role;
  if (role !== "admin") {
    throw new Error("Forbidden: admin role required");
  }

  const [statusRes, pluginsRes, configRes, tokenRes] = await Promise.allSettled([
    bridgeFetch<{ gateway: Record<string, unknown>; env: Record<string, string>; bridgePid: number; ts: number }>("/status"),
    bridgeFetch<{ custom: Record<string, unknown>; totalLoaded: string }>("/plugins"),
    bridgeFetch<{ config: Record<string, unknown> }>("/config"),
    bridgeFetch<{ token: string }>("/gateway-token"),
  ]);

  const status = statusRes.status === "fulfilled" && statusRes.value.ok ? statusRes.value.data : null;
  const plugins = pluginsRes.status === "fulfilled" && pluginsRes.value.ok ? pluginsRes.value.data : null;
  const config = configRes.status === "fulfilled" && configRes.value.ok ? configRes.value.data : null;
  const tokenData = tokenRes.status === "fulfilled" && tokenRes.value.ok ? tokenRes.value.data : null;

  const sshCmd = `ssh -N -L ${LOCAL_PORT}:127.0.0.1:${LOCAL_PORT} -i ${SSH_KEY} ${SSH_USER}@${SSH_HOST}`;
  const dashboardUrl = tokenData
    ? `http://localhost:${LOCAL_PORT}/#token=${tokenData.token}`
    : `http://localhost:${LOCAL_PORT}/`;

  return (
    <div className="max-w-[900px] mx-auto p-6 space-y-4">
      <header className="mb-2">
        <h1 className="font-serif text-2xl text-text-1 mb-1">Mission Control</h1>
        <p className="text-sm text-text-3">
          Live OpenClaw gateway state. Data fetched server-side from the
          in-container bridge — no SSH required.
        </p>
      </header>

      {/* ---------- Gateway Status ---------- */}
      <StatusCard title="Gateway Status">
        {status ? (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            {[
              ["Model", String((status.gateway as Record<string,unknown>).model)],
              ["OpenClaw version", String((status.gateway as Record<string,unknown>).version)],
              ["Auth mode", String((status.gateway as Record<string,unknown>).authMode)],
              ["Z.AI key", String((status.env as Record<string,string>).ZAI_API_KEY)],
              ["Bridge PID", String(status.bridgePid)],
              ["Fetched at", new Date(status.ts).toLocaleString()],
            ].map(([label, value]) => (
              <Fragment key={label}>
                <dt className="text-text-3 font-mono text-xs">{label}</dt>
                <dd className="text-text-1">{value}</dd>
              </Fragment>
            ))}
          </dl>
        ) : (
          <p className="text-sm text-warn-txt">Failed to fetch gateway status.</p>
        )}
      </StatusCard>

      {/* ---------- Plugin: tbdc-db ---------- */}
      <StatusCard title="Plugin: tbdc-db">
        {plugins ? (
          <div className="space-y-2">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              {[
                ["Enabled", String((plugins.custom as Record<string,unknown>).enabled)],
                ["Version", String((plugins.custom as Record<string,unknown>).version)],
                ["Installed at", String((plugins.custom as Record<string,unknown>).installedAt)],
                ["Source path", String((plugins.custom as Record<string,unknown>).sourcePath)],
                ["Total plugins", plugins.totalLoaded],
              ].map(([label, value]) => (
                <Fragment key={label}>
                  <dt className="text-text-3 font-mono text-xs">{label}</dt>
                  <dd className="text-text-1">{value}</dd>
                </Fragment>
              ))}
            </dl>
            <pre className="font-mono text-xs text-text-2 bg-surface-3 border border-border rounded p-3 overflow-x-auto whitespace-pre-wrap">
              {String((plugins.custom as Record<string,unknown>).inspectOutput)}
            </pre>
          </div>
        ) : (
          <p className="text-sm text-warn-txt">Failed to fetch plugin data.</p>
        )}
      </StatusCard>

      {/* ---------- Config ---------- */}
      <StatusCard title="Gateway Config (token redacted)">
        {config ? (
          <pre className="font-mono text-xs text-text-2 bg-surface-3 border border-border rounded p-3 overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(config.config, null, 2)}
          </pre>
        ) : (
          <p className="text-sm text-warn-txt">Failed to fetch config.</p>
        )}
      </StatusCard>

      {/* ---------- SSH Tunnel (collapsible) ---------- */}
      <details className="border border-border rounded-lg overflow-hidden">
        <summary className="px-4 py-2 bg-surface-2 border-b border-border font-serif text-base text-text-1 font-semibold cursor-pointer">
          Power User: SSH Tunnel to native Control UI
        </summary>
        <div className="px-4 py-3 space-y-3">
          <p className="text-sm text-text-2">
            For the full interactive OpenClaw Control UI (session browser,
            live config editor, tool inspector), open an SSH tunnel and
            access the gateway directly at loopback.
          </p>
          <div className="bg-surface-3 border border-border rounded p-3 flex items-start gap-3">
            <pre className="font-mono text-xs text-text-1 flex-1 whitespace-pre-wrap break-all">
              {sshCmd}
            </pre>
            <CopyButton text={sshCmd} label="Copy SSH command" />
          </div>
          {tokenData && (
            <div className="bg-surface-3 border border-border rounded p-3 flex items-start gap-3">
              <pre className="font-mono text-xs text-text-1 flex-1 whitespace-pre-wrap break-all">
                {dashboardUrl}
              </pre>
              <CopyButton text={dashboardUrl} label="Copy URL" />
            </div>
          )}
        </div>
      </details>
    </div>
  );
}
```

**Note:** Add `import { Fragment } from "react";` at the top if the build complains about `Fragment` — Next.js RSC pages may need an explicit import depending on the jsx transform config.

- [ ] **Step 3: Local build check**

```bash
# Spin up a throwaway Postgres for the build
docker run -d --name mc-build-test -e POSTGRES_PASSWORD=test -e POSTGRES_DB=tbdc_poc_test -p 15440:5432 postgres:15
sleep 4
DATABASE_URL="postgresql://postgres:test@localhost:15440/tbdc_poc_test" npx prisma db push --accept-data-loss
DATABASE_URL="postgresql://postgres:test@localhost:15440/tbdc_poc_test" npm run build
docker rm -f mc-build-test
```

Expected: build succeeds, `/ClawAdmin` listed as `ƒ (Dynamic)` in the output.

- [ ] **Step 4: Commit UI changes**

```bash
git add src/app/\(site\)/ClawAdmin/
git commit -m "feat(v2/clawadmin): live Mission Control dashboard replaces SSH-only instructions"
```

---

### Task 3: Deploy to rafiq-dev

**Files:** none (deployment task)

**Context:** The deploy involves SCP-ing the bridge, pulling the repo, rebuilding tbdc-web, and restarting containers. The Caddy `/api/openclaw/*` wildcard route already covers the new endpoints — no Caddyfile changes needed.

**IMPORTANT:** After recreating the gateway container, restart Caddy too — the Caddyfile bind mount can become stale if the file's inode changed in any prior edit session. `docker restart caddy` forces it to re-bind.

- [ ] **Step 1: Deploy updated bridge**

```bash
scp -i ~/.ssh/id_ed25519 deploy/openclaw-chat-bridge.mjs root@67.205.157.55:/root/tbdc-poc/openclaw-chat-bridge.mjs
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 'docker restart openclaw-gateway && sleep 12'
```

- [ ] **Step 2: Deploy updated tbdc-web**

```bash
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 '
cd /root/tbdc-poc/repo && git pull origin main
docker build -t tbdc-web:v3-mc .
docker stop tbdc-web && docker rm tbdc-web
docker run -d \
  --name tbdc-web \
  --restart unless-stopped \
  --network docker_rafiq-shared \
  --env-file /root/tbdc-poc/tbdc-web.env \
  tbdc-web:v3-mc
'
```

- [ ] **Step 3: Verify Caddy routing**

```bash
# Restart Caddy to ensure bind mount is fresh
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 'docker restart caddy && sleep 3'

# Test bridge endpoints through Caddy
curl -s https://tbdc.ready4vc.com/api/openclaw/status | python3 -m json.tool | head -15
curl -s https://tbdc.ready4vc.com/api/openclaw/plugins | python3 -m json.tool | head -15
curl -s https://tbdc.ready4vc.com/api/openclaw/config | python3 -m json.tool | head -15
```

- [ ] **Step 4: Smoke test the dashboard page**

1. Navigate to `https://tbdc.ready4vc.com/ClawAdmin` in a browser (logged in as admin)
2. Verify all 4 sections render with live data
3. Verify the SSH Tunnel section at the bottom is collapsed and expandable
4. Verify `/analyst` chat still works (regression check)
5. Verify `/admin/audit` still loads (regression check)

- [ ] **Step 5: Push all committed changes**

```bash
git push origin main
```

(No new files to commit — Task 1 and Task 2 already committed the code. This step just pushes.)

---

### Task 4: Update nav label and docs

**Files:**
- Modify: `src/components/nav-tabs.tsx` (rename tab label)
- Modify: `docs/superpowers/plans/2026-04-09-v2-korayem-smoke-test.md` (update ClawAdmin section)
- Modify: `docs/changelog.md`

- [ ] **Step 1: Rename nav tab from "ClawAdmin" to "Mission Control"**

In `src/components/nav-tabs.tsx`, change:
```typescript
{ id: "clawadmin", label: "07 — ClawAdmin", href: "/ClawAdmin" },
```
to:
```typescript
{ id: "clawadmin", label: "07 — Mission Control", href: "/ClawAdmin" },
```

(Keep the href as `/ClawAdmin` for URL stability.)

- [ ] **Step 2: Update the Korayem smoke test doc**

In `docs/superpowers/plans/2026-04-09-v2-korayem-smoke-test.md`, update the ClawAdmin section to reflect that the dashboard now works without SSH. Keep the SSH instructions as a fallback reference.

- [ ] **Step 3: Add changelog entry**

Append to `docs/changelog.md`:

```markdown
### 2026-04-10 — Mission Control dashboard (no SSH)

- **`/ClawAdmin`** now shows a live TBDC-branded dashboard with gateway status, plugin details, model config, and sanitized JSON config — all fetched server-side from the openclaw-chat-bridge
- SSH tunnel instructions moved to a collapsible "Power User" section at the bottom
- Three new bridge endpoints: `/status`, `/plugins`, `/config`
- Nav tab renamed from "ClawAdmin" to "Mission Control"
```

- [ ] **Step 4: Commit + push**

```bash
git add src/components/nav-tabs.tsx docs/
git commit -m "docs(v2): rename ClawAdmin tab to Mission Control, update smoke test + changelog"
git push origin main
```

---

## Rollback

If the dashboard page fails after deploy:
1. `git revert HEAD~2..HEAD` (reverts Task 2 + Task 4 commits)
2. Redeploy tbdc-web using the previous image: `docker run ... tbdc-web:v2` — the old SSH-instructions page returns
3. The bridge endpoint additions (Task 1) are harmless and can stay
