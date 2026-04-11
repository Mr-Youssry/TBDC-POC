// HTTP bridge that wraps `openclaw agent -m ... --session-id ...` as a POST endpoint.
// Lives INSIDE the openclaw-gateway container so it has direct access to the
// openclaw.mjs CLI + all its plugin state + the ZAI_API_KEY env var.
//
// Listens on port 3020. Expects POST /chat with JSON body:
//   { "sessionId": "tbdc-general" | "tbdc-co-<id>" | "tbdc-inv-<id>",
//     "message":   "the user's chat message",
//     "actingUserId": "<nextauth user id>"  (required for audit trail) }
//
// Returns: { "ok": true, "reply": "<assistant text>" } on success,
//          { "ok": false, "error": "..." }            on failure.
//
// Why this exists instead of a pure WS protocol bridge: OpenClaw's WebSocket
// `connect` RPC has tightly coupled device-pairing + locality checks that
// silently drop frames from third-party WS clients, even from loopback inside
// the same container with valid Bearer auth. The `openclaw agent` CLI works
// around this by running a fully in-process runtime that shares config +
// plugin state with the daemon. This bridge simply HTTP-wraps that CLI.
//
// Scope: POC interview demo. No streaming, no auth on the bridge itself
// (Caddy gatekeeps via network). Assumes the caller is a trusted server-side
// (Next.js route handler) running in the same docker_rafiq-shared network.

import http from "node:http";
import { spawn } from "node:child_process";
import { promises as fsPromises } from "node:fs";
import { execFile } from "node:child_process";

const PORT = Number(process.env.BRIDGE_PORT ?? 3020);
const OPENCLAW_BIN = process.env.OPENCLAW_BIN ?? "/app/openclaw.mjs";
const MAX_MESSAGE_CHARS = 8000;
const TIMEOUT_MS = 120_000;

const server = http.createServer(async (req, res) => {
  // Lightweight request log so we can see what's happening from the host.
  console.log(`[bridge] ${req.method} ${req.url}`);

  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, pid: process.pid, ts: Date.now() }));
    return;
  }

  // GET /gateway-token — returns the current openclaw gateway auth token
  // by reading /state/openclaw.json. Used by the TBDC ClawAdmin instructions
  // page so the displayed token is always fresh, even if the operator rotates
  // it via `openclaw config set`. Trusted-server-side use only; the bridge
  // is not exposed publicly (Caddy gatekeeps which paths reach it).
  if (
    req.method === "GET" &&
    (req.url === "/gateway-token" || req.url === "/api/openclaw/gateway-token")
  ) {
    try {
      const cfg = JSON.parse(
        await import("node:fs").then((fs) =>
          fs.promises.readFile("/state/openclaw.json", "utf8"),
        ),
      );
      const token = cfg?.gateway?.auth?.token ?? null;
      if (!token) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            ok: false,
            error: "gateway.auth.token not set in /state/openclaw.json",
          }),
        );
        return;
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, token }));
      return;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: msg }));
      return;
    }
  }

  // GET /status — returns a health/config snapshot from openclaw.json + env.
  if (
    req.method === "GET" &&
    (req.url === "/status" || req.url === "/api/openclaw/status")
  ) {
    console.log("[bridge] GET /status");
    try {
      const cfg = JSON.parse(
        await fsPromises.readFile("/state/openclaw.json", "utf8"),
      );
      const apiKey = process.env.ZAI_API_KEY ?? "";
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          ok: true,
          gateway: {
            version: cfg?.meta?.lastTouchedVersion ?? null,
            lastTouchedAt: cfg?.meta?.lastTouchedAt ?? null,
            authMode: cfg?.gateway?.auth?.mode ?? null,
            model: cfg?.agents?.defaults?.model?.primary ?? null,
            trustedProxies: cfg?.gateway?.trustedProxies ?? null,
            dangerouslyDisableDeviceAuth:
              cfg?.gateway?.controlUi?.dangerouslyDisableDeviceAuth ?? null,
          },
          env: {
            ZAI_API_KEY: apiKey
              ? `${apiKey.slice(0, 8)}…(set)`
              : "(not set)",
            NODE_ENV: process.env.NODE_ENV ?? null,
          },
          bridgePid: process.pid,
          ts: Date.now(),
        }),
      );
      return;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: msg }));
      return;
    }
  }

  // GET /plugins — returns tbdc-db plugin metadata + `openclaw plugins inspect tbdc-db` output.
  if (
    req.method === "GET" &&
    (req.url === "/plugins" || req.url === "/api/openclaw/plugins")
  ) {
    console.log("[bridge] GET /plugins");
    try {
      const cfg = JSON.parse(
        await fsPromises.readFile("/state/openclaw.json", "utf8"),
      );
      const inspectOutput = await new Promise((resolve) => {
        execFile(
          "node",
          ["/app/openclaw.mjs", "--log-level", "silent", "plugins", "inspect", "tbdc-db"],
          { cwd: "/app", timeout: 10000, env: process.env },
          (_err, stdout) => {
            const filtered = (stdout ?? "")
              .split("\n")
              .filter((l) => !/^\[plugins?\]/.test(l.trim()))
              .join("\n")
              .trim();
            resolve(filtered);
          },
        );
      });
      const entry = cfg?.plugins?.entries?.["tbdc-db"] ?? {};
      const install = cfg?.plugins?.installs?.["tbdc-db"] ?? {};
      const totalLoaded = cfg?.plugins?.totalLoaded ?? null;
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          ok: true,
          custom: {
            id: "tbdc-db",
            enabled: entry.enabled ?? null,
            version: install.version ?? null,
            installedAt: install.installedAt ?? null,
            sourcePath: install.sourcePath ?? null,
            inspectOutput,
          },
          totalLoaded,
          ts: Date.now(),
        }),
      );
      return;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: msg }));
      return;
    }
  }

  // GET /config — returns full openclaw.json config with gateway.auth.token redacted.
  if (
    req.method === "GET" &&
    (req.url === "/config" || req.url === "/api/openclaw/config")
  ) {
    console.log("[bridge] GET /config");
    try {
      const cfg = JSON.parse(
        await fsPromises.readFile("/state/openclaw.json", "utf8"),
      );
      const rawToken = cfg?.gateway?.auth?.token ?? "";
      if (cfg?.gateway?.auth) {
        cfg.gateway.auth.token = rawToken
          ? `${rawToken.slice(0, 8)}…(redacted)`
          : "(not set)";
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

  // GET /history?sessionId=X — reads an OpenClaw session JSONL file and returns
  // the most recent 50 user/assistant messages. Returns empty array if the
  // session file doesn't exist yet (new sessions are fine).
  const historyUrlPath = (req.url ?? "").split("?")[0];
  if (
    req.method === "GET" &&
    (historyUrlPath === "/history" || historyUrlPath === "/api/openclaw/history")
  ) {
    const sessionId = new URL(req.url, "http://localhost").searchParams.get("sessionId") ?? "";
    console.log(`[bridge] GET /history sessionId=${sessionId || "(none)"}`);
    if (!sessionId) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "missing sessionId query param" }));
      return;
    }
    const filePath = `/state/agents/main/sessions/${sessionId}.jsonl`;
    try {
      const raw = await fsPromises.readFile(filePath, "utf8");
      const messages = raw
        .split("\n")
        .filter((line) => line.trim().length > 0)
        .map((line) => {
          try { return JSON.parse(line); } catch { return null; }
        })
        .filter((entry) => entry !== null && entry.type === "message")
        .filter((entry) => entry.message?.role === "user" || entry.message?.role === "assistant")
        .map((entry) => ({
          role: entry.message.role,
          content: (Array.isArray(entry.message.content) ? entry.message.content : [])
            .filter((block) => block.type === "text")
            .map((block) => block.text ?? "")
            .join("\n"),
          timestamp: entry.timestamp ?? null,
        }))
        .slice(-50);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, messages }));
      return;
    } catch (err) {
      if (err.code === "ENOENT") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, messages: [] }));
        return;
      }
      const msg = err instanceof Error ? err.message : String(err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: msg }));
      return;
    }
  }

  // POST /upload — saves text content to the agent workspace under
  // /home/node/.openclaw/workspace/companies/{companySlug}/{filename}.
  // Body: { companySlug, filename, content }. Max content size 500 KB.
  const uploadUrlPath = (req.url ?? "").split("?")[0];
  if (
    req.method === "POST" &&
    (uploadUrlPath === "/upload" || uploadUrlPath === "/api/openclaw/upload")
  ) {
    console.log("[bridge] POST /upload");
    let uploadBody = "";
    req.on("data", (chunk) => {
      uploadBody += chunk;
      if (uploadBody.length > 600_000) { req.destroy(); }
    });
    req.on("end", async () => {
      let payload;
      try {
        payload = JSON.parse(uploadBody);
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "invalid JSON body" }));
        return;
      }
      const { companySlug, filename, content } = payload ?? {};
      if (!companySlug || !filename || content === undefined || content === null) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "companySlug, filename, and content are required" }));
        return;
      }
      if (typeof content !== "string" || Buffer.byteLength(content, "utf8") > 500_000) {
        res.writeHead(413, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "content exceeds 500 KB limit" }));
        return;
      }
      // Security: reject path traversal attempts in either field.
      if (/[.]{2}|[/\\]/.test(String(companySlug)) || /[.]{2}|[/\\]/.test(String(filename))) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "companySlug and filename must not contain path separators or .." }));
        return;
      }
      const dir = `/home/node/.openclaw/workspace/companies/${companySlug}`;
      const filePath = `${dir}/${filename}`;
      try {
        await fsPromises.mkdir(dir, { recursive: true });
        await fsPromises.writeFile(filePath, content, "utf8");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, path: `companies/${companySlug}/${filename}` }));
        return;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: msg }));
        return;
      }
    });
    return;
  }

  // Accept both /chat and /api/openclaw/chat so the bridge doesn't require
  // Caddy to strip a prefix (Caddy's uri strip_prefix didn't take effect
  // reliably when stacked with reverse_proxy in this setup).
  const normalizedPath = (req.url ?? "").split("?")[0];
  const isChatEndpoint =
    normalizedPath === "/chat" || normalizedPath === "/api/openclaw/chat";
  if (req.method !== "POST" || !isChatEndpoint) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: "not found" }));
    return;
  }

  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
    if (body.length > 64_000) {
      req.destroy();
    }
  });
  req.on("end", async () => {
    let payload;
    try {
      payload = JSON.parse(body);
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "invalid JSON body" }));
      return;
    }

    const sessionId = String(payload.sessionId ?? "").trim();
    const message = String(payload.message ?? "").trim();
    const actingUserId = String(payload.actingUserId ?? "").trim();

    if (!sessionId) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "missing sessionId" }));
      return;
    }
    if (!message) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "missing message" }));
      return;
    }
    if (message.length > MAX_MESSAGE_CHARS) {
      res.writeHead(413, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          ok: false,
          error: `message exceeds ${MAX_MESSAGE_CHARS} char limit`,
        }),
      );
      return;
    }

    // Thread the actingUserId to the tbdc-db plugin write tools by appending
    // a short meta-instruction to the user message. The plugin's write tools
    // require actingUserId as an explicit parameter; the LLM will pick it up
    // from the context when it calls a write tool. Read tools ignore it.
    const envelopedMessage = actingUserId
      ? `${message}\n\n[context: if you call any tbdc-db write tool (update_match, update_company, update_investor, append_audit_note), pass actingUserId="${actingUserId}" as the actingUserId argument.]`
      : message;

    console.log(
      `[bridge] chat sessionId=${sessionId} user=${actingUserId || "(anon)"} msgLen=${message.length}`,
    );

    const args = [
      OPENCLAW_BIN,
      "--log-level",
      "silent",
      "agent",
      "-m",
      envelopedMessage,
      "--session-id",
      sessionId,
    ];

    const child = spawn("node", args, {
      cwd: "/app",
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, TIMEOUT_MS);

    child.stdout.on("data", (d) => {
      stdout += d.toString();
    });
    child.stderr.on("data", (d) => {
      stderr += d.toString();
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      const replyRaw = stdout.trimEnd();
      // `--log-level silent` suppresses most but not all log lines. Strip any
      // remaining bracketed `[plugins] ...` noise lines from the front.
      const reply = replyRaw
        .split("\n")
        .filter((line) => !/^\[plugins?\]/.test(line.trim()))
        .join("\n")
        .trim();

      if (timedOut) {
        console.log(`[bridge] timeout after ${TIMEOUT_MS}ms`);
        res.writeHead(504, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            ok: false,
            error: `agent turn timed out after ${TIMEOUT_MS}ms`,
          }),
        );
        return;
      }
      if (code !== 0) {
        console.log(`[bridge] non-zero exit code=${code} stderr=${stderr.slice(0, 500)}`);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            ok: false,
            error: `agent turn failed (exit ${code})`,
            stderr: stderr.slice(0, 2000),
            stdout: stdout.slice(0, 2000),
          }),
        );
        return;
      }
      console.log(`[bridge] ok replyLen=${reply.length}`);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, reply }));
    });
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[bridge] openclaw chat bridge listening on :${PORT}`);
});
