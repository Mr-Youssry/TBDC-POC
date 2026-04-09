# Local dev for TBDC POC v2.0

Brings up Postgres + OpenClaw gateway locally via `deploy/docker-compose-dev.yml`. The Next.js app runs on the **host** via `npm run dev` (not in compose) and connects to both. This mirrors the deploy topology on rafiq-dev (Phase 6).

## Expected end state for Phase 5

Message send from the `/analyst` chat pane reaches the gateway, the gateway routes the tool call to the `tbdc-db` plugin, and the plugin queries Postgres successfully — but the final LLM call fails because `ZAI_API_KEY` is empty. That failure is the success signal for Phase 5: wiring is proven and only the model-provider credential is missing. See `deploy/SMOKE-DEV.md` for the recorded smoke-test output.

## Prerequisites

- Docker Desktop running
- Node 20+, `npm` on the host
- v1 Prisma schema + v2 additions present in `prisma/schema.prisma`
- Repo-root `node_modules` installed (`npm install` at the repo root) — the plugin build below relies on the repo-root Prisma toolchain

## One-time: build the tbdc-db plugin

The gateway container cannot run `npm install` or `prisma generate` — it has no access to the Prisma schema, no Node toolchain targeted at the plugin, and a root-owned plugin directory by the time it gets there. Everything must be prepared on the host before `docker compose up`.

```bash
cd deploy/plugins/tbdc-db
npm install
npm run build         # runs `prisma:generate` + `tsc -p tsconfig.json`
```

The `npm run build` script is already defined in the plugin's `package.json`:

```
"prisma:generate": "prisma generate --schema=../../../prisma/schema.prisma",
"build":           "npm run prisma:generate && tsc -p tsconfig.json"
```

### KNOWN ISSUE — Prisma 7 client output path (must read before first boot)

Prisma 7 generates the runtime client (the part with model-specific typings and queries) by walking upward from the schema file to find the **nearest `node_modules`** directory, and writes into `<nearest>/node_modules/.prisma/client/`. With this repo's layout (schema at `prisma/schema.prisma`, the plugin at `deploy/plugins/tbdc-db/`), the nearest ancestor is the **repo root's `node_modules`** — not the plugin's local `node_modules`. At runtime, `@prisma/client` inside the plugin does `require('.prisma/client/default')` and Node resolves that from the plugin's local `node_modules/.prisma/client/` — which is empty, so plugin registration will throw.

**Workaround (run after every `npm run build` in the plugin directory, until a cleaner fix lands):**

```bash
# From repo root — copy the generated Prisma client into the plugin's local node_modules
rm -rf deploy/plugins/tbdc-db/node_modules/.prisma
cp -r node_modules/.prisma deploy/plugins/tbdc-db/node_modules/.prisma
```

This has been verified locally — post-copy the plugin's `node_modules/.prisma/client/` contains the generated `client.js`, `default.js`, `index.d.ts`, etc.

A cleaner long-term fix is to either:
1. Add `output = "../../deploy/plugins/tbdc-db/node_modules/.prisma/client"` to the `generator client` block in `prisma/schema.prisma` (but this affects the main app's Prisma Client too — not acceptable), OR
2. Give the plugin its own `prisma/schema.prisma` copy (duplicates schema — violates "single source of truth"), OR
3. Move the plugin to a workspace layout where its `node_modules` is a sibling of the schema (larger refactor).

Tracked as an open item for Phase 6 — for now, the copy step is documented and manual.

## Bring the stack up

```bash
# From repo root
cd deploy
docker compose -f docker-compose-dev.yml up -d postgres
```

Wait for Postgres to report healthy (`docker ps` should show `tbdc-dev-pg` with `(healthy)`).

### Apply Prisma migrations and seed

```bash
# From repo root, still in the terminal above
cd ..
export DATABASE_URL="postgresql://postgres:devpw@localhost:15432/tbdc_poc_dev"
npx prisma migrate deploy
npx prisma db seed
```

### Create the `tbdc_assistant` Postgres role

This is the role the `tbdc-db` plugin connects as — read access to most tables, write access to a narrow allowlist, no access to the `User` table. The manual SQL lives at `prisma/migrations/manual/v2_roles_and_grants.sql` and must be run via `psql` (it uses `\gexec`).

```bash
PGPASSWORD=devpw psql -h localhost -p 15432 -U postgres -d tbdc_poc_dev \
  -v TBDC_ASSISTANT_PASSWORD="'devpw'" \
  -f prisma/migrations/manual/v2_roles_and_grants.sql
```

The single quotes around `'devpw'` are required — `psql -v` is a literal text substitution, so the quotes become part of the generated `CREATE ROLE` statement.

### Start the OpenClaw gateway

```bash
cd deploy
docker compose -f docker-compose-dev.yml up -d openclaw-gateway
docker logs -f tbdc-dev-openclaw
```

Expected log entries:

- `[entrypoint] installing tbdc-db plugin from /plugins-src into /state/custom-plugins`
- `[gateway] [tbdc-db] ...` (plugin register log line)
- `[gateway] ready (N plugins, ...)` — `N` should be 6 if only tbdc-db was added (5 built-ins + tbdc-db)

If you see `[entrypoint] WARNING: /plugins-src/tbdc-db/dist missing`, stop and go run `npm run build` in the plugin directory.

### Verify plugin is loaded

```bash
docker exec -it tbdc-dev-openclaw su -s /bin/sh node -c "cd /app && node openclaw.mjs plugins list"
```

Expected row: `TBDC DB | tbdc-db | openclaw | loaded | /state/custom-plugins/tbdc-db/dist/index.js | 0.1.0`.

### Verify Control UI

```bash
curl -sI http://localhost:18789/
```

Expected: `HTTP/1.1 200 OK`.

## Run the Next.js app (separate terminal)

From the repo root:

```bash
# Application DB URL (full access — superuser role)
export DATABASE_URL="postgresql://postgres:devpw@localhost:15432/tbdc_poc_dev"

# OpenClaw session broker
export OPENCLAW_SESSION_JWT_SECRET="dev-secret-32-bytes-minimum-xxxxxxxxxxxx"
export OPENCLAW_INTERNAL_URL="http://localhost:18789"
export ASSISTANT_USER_EMAIL="assistant@tbdc.ready4vc.com"

# NextAuth
export AUTH_SECRET="dev-auth-secret-32-bytes-xxxxxxxxxxxxxxx"
export AUTH_TRUST_HOST="true"
export BOOTSTRAP_ADMIN_EMAILS="korayem@ready4vc.com,youssry@ready4vc.com"
export BOOTSTRAP_ADMIN_PASSWORD="POC@ready4vc"

npm run dev
```

Open http://localhost:3000 (or 3001 if 3000 is taken on your machine), log in as a bootstrap admin, navigate to `/analyst`. The channel sidebar will load. The WebSocket will connect to the local OpenClaw. Sending a message will hit the plugin's tool (verifiable in `docker logs tbdc-dev-openclaw`), but the LLM response will fail with a "no API key" error. That is the expected stop point. Record the exact error in `deploy/SMOKE-DEV.md`.

## Teardown

```bash
cd deploy
docker compose -f docker-compose-dev.yml down -v
```

`-v` removes the named volumes (`tbdc-dev-pg` and `tbdc-dev-openclaw-state`) so the next bring-up is a clean slate — including forcing the plugin install init to re-run.

## Common gotchas

- **Plugin init only runs once per volume.** The entrypoint checks `[ ! -d /state/custom-plugins/tbdc-db ]` and skips install on subsequent boots. After editing the plugin source + rebuilding, either `docker compose down -v` to wipe the state volume, or `docker exec` into the container and manually `rm -rf /state/custom-plugins/tbdc-db` then restart.
- **Do not pre-write `dev-openclaw.json`.** Earlier plan drafts mounted a pre-written config at `/home/node/.openclaw/openclaw.json`. That path doesn't exist in the image and the gateway overwrites its config on every boot anyway — the mount approach is broken. This compose uses `OPENCLAW_STATE_DIR=/state` + `--allow-unconfigured` semantics so the gateway auto-generates its config.
- **Windows bind-mount uid/gid.** The `./plugins/tbdc-db` bind mount on Windows defaults to uid=1000 / mode=777 which OpenClaw rejects for plugin directories. That's why the entrypoint copies the plugin into the state volume and chowns the copy to `root:root` mode `755` before running `plugins install`.
- **Port 18789 collision.** If another OpenClaw instance is already running locally (e.g. the Phase 0 probe container), stop it first or change the published port in this compose file.
