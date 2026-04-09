# Local dev smoke test — <date of run>

> Template — to be filled in by the operator after running the full stack per `deploy/README-dev.md`. Leave boxes unchecked until each step has been verified on the actual running stack. Replace `<...>` placeholders with real observed output.

## Wiring verified

- [ ] Plugin built on host (`deploy/plugins/tbdc-db/dist/index.js` exists)
- [ ] Prisma client copy workaround applied (`deploy/plugins/tbdc-db/node_modules/.prisma/client/` populated — see README-dev.md "KNOWN ISSUE")
- [ ] `docker compose -f deploy/docker-compose-dev.yml up -d postgres` — Postgres container reports `(healthy)`
- [ ] `npx prisma migrate deploy` against dev DB — exit 0
- [ ] `npx prisma db seed` against dev DB — exit 0
- [ ] `tbdc_assistant` role created via `prisma/migrations/manual/v2_roles_and_grants.sql` — no errors
- [ ] `docker compose -f deploy/docker-compose-dev.yml up -d openclaw-gateway` — container starts
- [ ] Entrypoint log line `[entrypoint] installing tbdc-db plugin ...` observed
- [ ] Gateway log line `[gateway] [tbdc-db] ...` (plugin register fired) observed
- [ ] `openclaw plugins list` shows `tbdc-db | loaded`
- [ ] `curl -sI http://localhost:18789/` returns `HTTP/1.1 200 OK`
- [ ] Next.js `/analyst` page loads on the host
- [ ] Channel sidebar shows 35 channels (1 general + 10 companies + 24 investors)
- [ ] WebSocket handshake completes (no disconnected banner)
- [ ] Message from chat pane reaches the gateway (log entry visible)
- [ ] `tbdc-db` plugin tool invoked on message (log entry visible)
- [ ] Expected failure: LLM call fails with "ZAI_API_KEY not set" or equivalent

## Observed LLM error

```
<paste actual error text from `docker logs tbdc-dev-openclaw` — include timestamp and any stack trace>
```

## Conclusion

<Fill in after the run. Expected wording: "Everything wired correctly. End-to-end message flow reaches the LLM provider step. The only remaining blocker is the z.ai API key, which will be configured during the Korayem session.">

## Notes / surprises

<Any deviations from the expected path, plugin build quirks, Prisma client resolution issues, role permission errors, etc. Blank if the run was clean.>
