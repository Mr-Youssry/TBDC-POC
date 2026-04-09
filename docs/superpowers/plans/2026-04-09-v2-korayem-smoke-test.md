# v2.0 Korayem smoke test — final commissioning

> **Who:** Ahmed Youssry + Ahmed Korayem, both present.
> **Where:** a laptop + the rafiq-dev droplet (SSH access required).
> **Prerequisite:** the v2.0 implementation plan Phases 0–6 are complete and everything is deployed. If you are reading this doc and Phase 6 hasn't landed yet, stop and finish Phase 6 first.
> **Time budget:** ~20 minutes end-to-end if nothing goes wrong.

## What's already live on https://tbdc.ready4vc.com

- [x] `openclaw-gateway` container running on the `docker_rafiq-shared` network, alongside `tbdc-web` and `shared-postgres`. Pinned to `ghcr.io/openclaw/openclaw:2026.4.8`.
- [x] `tbdc-db` custom OpenClaw Plugin installed and loaded with **4 read tools** (`list_investors`, `get_company`, `list_matches`, `get_methodology`) + **4 write tools** (`update_match`, `update_company`, `update_investor`, `append_audit_note`). Every write tool requires an explicit `actingUserId` argument and appends a row to `AuditLog`.
- [x] Prisma schema additions (`AuditLog`, `ChatSession`, `UserRole`/`AuditOp`/`ChatScopeType` enums, `updatedByUserId`+`updatedAt` on 8 content tables) pushed to the live `tbdc_poc` database via `prisma db push`.
- [x] Restricted `tbdc_assistant` Postgres role with SELECT on content tables + `v_user_public` view, INSERT/UPDATE on writable tables, **no access** to the `User` table (plugin reads assistant identity via `v_user_public` only).
- [x] Assistant user seeded: `assistant@tbdc.ready4vc.com`, role `assistant`, passwordHash=`!` (login blocked by the auth layer).
- [x] 35 `ChatSession` rows (1 general + 10 companies + 24 investors), each with a deterministic `openclawSessionId` (`tbdc-general`, `tbdc-co-<id>`, `tbdc-inv-<id>`).
- [x] Rafiq Caddyfile updated in-place. Current `tbdc.ready4vc.com` block handles:
  - `/ClawAdmin/*` → basic-auth-gated reverse_proxy to `openclaw-gateway:18789`
  - `/analyst/ws/socket` → reverse_proxy to `openclaw-gateway:18789`
  - everything else → `tbdc-web:3000`
- [x] `tbdc-web` rebuilt as `tbdc-web:v2` with the `/analyst` page, `/admin/audit` page, `/api/analyst/ws-token` token-mint endpoint, and the role-gated Analyst + Audit nav tabs.
- [x] All 8 smoke-test HTTP checks passing (`/login`, `/methodology`, `/investors` → 200; `/analyst`, `/admin/audit`, `/api/analyst/ws-token` → 307 redirect to login for anon; `/ClawAdmin/` → 401 without auth, 200 with).

## What's intentionally missing (this session fixes it)

- [ ] z.ai Coding Plan subscription
- [ ] `ZAI_API_KEY` value in `/root/tbdc-poc/openclaw.env` (currently `ZAI_API_KEY=`)
- [ ] First real chat message → tool call → Assistant response
- [ ] First end-to-end write → audit row → revert round-trip

## Credentials and paths (for this session)

Keep these handy but do NOT commit them. Ahmed has them; this doc lists only locations.

| Thing | Where |
|---|---|
| SSH to droplet | `ssh -i ~/.ssh/id_ed25519 root@67.205.157.55` |
| Repo clone on droplet | `/root/tbdc-poc/repo` (currently on `main`) |
| OpenClaw env file | `/root/tbdc-poc/openclaw.env` (600-perm, `ZAI_API_KEY=` is the line to edit) |
| tbdc-web env file | `/root/tbdc-poc/tbdc-web.env` (already has `OPENCLAW_SESSION_JWT_SECRET`, `OPENCLAW_INTERNAL_URL`, `ASSISTANT_USER_EMAIL`) |
| tbdc_assistant password | `/root/tbdc-poc/openclaw.env.tmp` (chmod 600; kept for rotation reference) |
| ClawAdmin basic-auth (username: `admin`) password | stored in `/root/tbdc-poc/openclaw.env` as `OPENCLAW_ADMIN_PLAINTEXT=` |
| Gateway init script | `/root/tbdc-poc/openclaw-init.sh` (chown + plugin install + drop to node) |
| Plugin source (bind-mounted into gateway) | `/root/tbdc-poc/repo/deploy/plugins/tbdc-db/` |
| Pre-deploy pg_dump backup | `/root/tbdc-poc/backups/pre-v2-20260409-185717.sql` (50 KB) |
| Pre-deploy Caddyfile backup | `/root/tbdc-poc/backups/Caddyfile.pre-v2-20260409-185717` |
| Bootstrap admin logins | `korayem@ready4vc.com`, `youssry@ready4vc.com` (password in 1Password / team vault) |

## Steps

### 1. Subscribe to z.ai Coding Plan and generate the API key

1. Visit https://z.ai and sign in (or sign up). Use whichever account will own the subscription — Korayem's or a shared ops account.
2. Subscribe to the **Coding Plan** (the tier that explicitly supports OpenClaw integration per `https://docs.z.ai/devpack/tool/openclaw`). Non-coding plans may not expose the models OpenClaw expects.
3. Generate an API key from the dashboard. Copy it.
4. **Record the key in the team password manager** — do NOT paste into a chat or email.

### 2. Inject the key into the droplet env

```bash
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55
nano /root/tbdc-poc/openclaw.env
# Find the line: ZAI_API_KEY=
# Paste the key after the = sign. No quotes, no trailing whitespace.
# Save + exit nano.
```

Confirm the line is set (masked):

```bash
grep ^ZAI_API_KEY= /root/tbdc-poc/openclaw.env | sed 's/=.*/=***/'
```

Expected: `ZAI_API_KEY=***`.

### 3. Restart the gateway

```bash
docker restart openclaw-gateway
sleep 10
docker logs openclaw-gateway --tail 60 2>&1 | grep -iE "(zai|provider|auth|ready|tbdc-db|error)"
```

Expected lines in the tail:

- `[gateway] ready (6 plugins, ~Xs)` — plugin count still 6
- `[plugins] [tbdc-db] assistant user resolved: assistant@tbdc.ready4vc.com → …`
- `[plugins] [tbdc-db] registered 4 read tools + 4 write tools`
- Either an explicit "z.ai provider loaded" line or no auth errors mentioning `zai`.

If you see `ZAI_API_KEY not set` or `401 Unauthorized from zai`, the key wasn't saved correctly — re-edit the env file, check for stray characters, and restart again.

### 4. First real chat message (read path)

1. Open https://tbdc.ready4vc.com/login in a browser.
2. Log in as `youssry@ready4vc.com` (or `korayem@ready4vc.com`).
3. Click the **05 — Analyst** tab in the nav (admin-only).
4. Click `# General` in the sidebar.
5. Type this question and hit Enter:

   > *"Which company in our portfolio has the fewest Tier 1 matches? Give me a one-sentence answer and name the company."*

Expected:
- Your message renders immediately with your name + timestamp.
- Within 2–10 seconds, the Assistant responds.
- At least one tool-call pill (`🔍 list_matches` or similar) appears inline.
- The answer names a specific company from the TBDC portfolio and cites the count.
- In the gateway logs (`docker logs openclaw-gateway --tail 40`) you should see a line per tool call.

### 5. First real write + audit + revert (write path)

1. In the same chat pane, switch to a company channel from the sidebar — pick any company you don't mind touching. Let's say `# Acme` (or whichever is visible first).
2. Type:

   > *"Please append one sentence to this company's top Tier-1 match rationale: 'Smoke test from the Korayem commissioning session.' Use the append_audit_note tool so it's easy to revert."*

3. Expected:
   - Assistant acknowledges and calls `append_audit_note` (or `update_match` if it picks the other tool — both are fine as long as an `AuditLog` row is produced).
   - An `✎ Updated …` write pill appears inline in the chat. Clicking it should navigate to `/admin/audit?entry=<auditId>` with the new row highlighted.

4. Open `/admin/audit` in a new tab. The top entry should be:
   - actor: `Assistant (on behalf of <your name>)`
   - tableName: `Match` (or whichever table the Assistant chose)
   - field: populated
   - a **Revert** button on the right

5. Click **Revert**, confirm the dialog. Expected:
   - The row fades (opacity-50) and shows "Reverted" under the diff.
   - A new row appears at the top of the list, attributed to you (not the Assistant), showing the reverse patch (newValue=the old text, oldValue=what the Assistant wrote).
   - Ask the Assistant in the same chat channel: *"Read me the current rationale for that match."* — it should return the original text, confirming the revert landed in the DB.

### 6. Rate-limit behavior check

Send 5–8 messages in quick succession in `# General`. If z.ai rate-limits you:

- Expected: a subtle warning banner under the channel header — "Assistant is queued by provider, response may be delayed".
- No hard errors. Messages eventually get answered.
- Once the rate limit passes, responses resume normally.

If you see a hard disconnect banner or the WebSocket drops, check `docker logs openclaw-gateway --tail 100` for the underlying error.

### 7. OpenClaw Control UI sanity check

1. Visit https://tbdc.ready4vc.com/ClawAdmin/ in a browser.
2. Basic-auth prompt: username `admin`, password from `/root/tbdc-poc/openclaw.env` (`OPENCLAW_ADMIN_PLAINTEXT=`).
3. Expected: the OpenClaw Control UI loads. You should be able to browse sessions, see the `tbdc-db` plugin in the plugin list, inspect recent agent turns from step 4/5.

### 8. Sign off

If steps 4, 5, 6, and 7 all pass, v2.0 is officially live and the interview portfolio is complete.

Add a short entry at the top of [docs/changelog.md](../../changelog.md):

```markdown
## <YYYY-MM-DD> — [smoke] v2.0 Korayem smoke test PASSED

- z.ai Coding Plan subscribed; API key injected into /root/tbdc-poc/openclaw.env; gateway restarted.
- First chat in #general answered correctly with ≥1 tool call in the pill rail.
- First write in a company channel produced an AuditLog row; revert round-tripped cleanly.
- Rate limit handling verified graceful (banner only, no disconnect).
- ClawAdmin Control UI accessible via basic auth.
- **v2.0 officially live at https://tbdc.ready4vc.com/analyst**
```

Commit, push. Done.

## If something fails

### z.ai auth fails after restart

- Double-check the key in the env file — no quotes, no trailing newline, no extra spaces.
- Check the z.ai dashboard for billing / plan status.
- Try `docker exec openclaw-gateway sh -c 'cd /app && node openclaw.mjs doctor'` — it may surface a specific provider config issue.
- Worst case: switch the primary model in OpenClaw's config to a cheaper z.ai tier via the Control UI at `/ClawAdmin/`, or via `docker exec openclaw-gateway sh -c 'cd /app && node openclaw.mjs config set ...'`.

### Chat loads but no response from Assistant

- `docker logs openclaw-gateway --tail 100 2>&1 | grep -iE "(error|tbdc-db|zai)"` — look for the tail of the last tool call.
- Verify the plugin is still loaded: `docker exec openclaw-gateway sh -c 'cd /app && node openclaw.mjs plugins list' | grep tbdc-db`. Expected: `loaded`.
- If the plugin is marked `error` or missing: `docker volume rm openclaw-state` (wipes plugin install), then `docker restart openclaw-gateway` to force fresh plugin install via the init script.

### Tool call fails with a DB error

- Verify the `tbdc_assistant` role still exists: `docker exec shared-postgres psql -U keycloak -d tbdc_poc -c '\du tbdc_assistant'`.
- Test the role can auth directly:
  ```bash
  PW=$(grep ^TBDC_ASSISTANT_PASSWORD= /root/tbdc-poc/openclaw.env.tmp | cut -d= -f2-)
  docker exec -e PGPASSWORD="$PW" shared-postgres psql -U tbdc_assistant -d tbdc_poc -c 'SELECT COUNT(*) FROM "Investor";'
  ```
  Expected: `24`.
- If the password was rotated: re-run `/root/tbdc-poc/repo/prisma/migrations/manual/v2_roles_and_grants.sql` with the new password, and update `TBDC_DATABASE_URL=` in `/root/tbdc-poc/openclaw.env` to match.

### WebSocket won't connect

- `docker logs caddy --tail 100` — look for `/analyst/ws/socket` failures.
- Verify the Caddy block routes the WS path to `openclaw-gateway:18789`, not to `tbdc-web`. The working block is in the backup at `/root/tbdc-poc/backups/Caddyfile.pre-v2-20260409-185717` (original v1) vs the current `/root/Rafiq-v1/docker/caddy/Caddyfile` (v2, what we want).
- If you need to reload: `docker exec caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile`.

### Revert button fails in the UI

- Open the browser DevTools Console and look for the server action's error response (`{ ok: false, error: "..." }`).
- Common causes: the original audit row's `oldValueJson` is `null` (revert refuses this case defensively — see [src/app/(site)/admin/audit/_actions.ts](../../../src/app/(site)/admin/audit/_actions.ts)), or the target row no longer exists.

### Full bailout (if v1 starts misbehaving)

v1 is untouched on disk. The only changes in the live system that could affect v1 are: (a) the Prisma schema was updated (additive), (b) the Caddy block was rewritten, (c) `tbdc-web` was rebuilt as `tbdc-web:v2`.

To fully roll back to v1:

```bash
# 1. Restore the original Caddy block
cp /root/tbdc-poc/backups/Caddyfile.pre-v2-20260409-185717 /root/Rafiq-v1/docker/caddy/Caddyfile
docker exec caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile

# 2. Stop the OpenClaw gateway
docker stop openclaw-gateway

# 3. Stop tbdc-web:v2 and bring back the v1 image (whichever image tag was
#    previously running — check `docker images tbdc-web` for the older tag,
#    probably :latest or the first :v1 build).
docker stop tbdc-web && docker rm tbdc-web
docker run -d \
  --name tbdc-web \
  --restart unless-stopped \
  --network docker_rafiq-shared \
  --env-file /root/tbdc-poc/tbdc-web.env \
  tbdc-web:<v1-tag>

# 4. (Optional) Restore the pre-v2 DB snapshot
docker exec -i shared-postgres psql -U keycloak -d tbdc_poc \
  < /root/tbdc-poc/backups/pre-v2-20260409-185717.sql
# NOTE: this wipes the assistant user, audit rows, and any test edits made
# during the smoke test. Only do this if v2 is irrecoverable.
```

After a rollback, the `/analyst` and `/admin/audit` pages will 404, the ClawAdmin route will 404, and v1 continues as before.

---

**End of handoff doc.** If the smoke test passes cleanly, delete the "What's intentionally missing" section from this file and commit the green state.
