import { requireSessionForPage } from "@/lib/guards";
import { CopyButton } from "./_components/copy-button";

/**
 * v2.0 — /ClawAdmin
 *
 * Instructions page for opening OpenClaw's native Control UI ("Mission
 * Control") via SSH tunnel. We can't serve the Control UI through this
 * domain directly because OpenClaw's gateway WebSocket connect RPC
 * silently drops proxied connections (extensive testing in Phase 6 deploy
 * proved every workaround fails). The supported access pattern per the
 * `openclaw dashboard` CLI is an SSH tunnel that makes the connection
 * appear as loopback.
 *
 * This page renders an admin-only TBDC-branded walkthrough with the exact
 * SSH command, the localhost URL with the LIVE token (fetched fresh on
 * every request from the openclaw-gateway HTTP bridge), and copy buttons.
 */

export const dynamic = "force-dynamic";

const BRIDGE_URL =
  process.env.OPENCLAW_CHAT_BRIDGE_URL ?? "http://openclaw-gateway:3020";
const SSH_USER = "root";
const SSH_HOST = "67.205.157.55";
const SSH_KEY = "~/.ssh/id_ed25519";
const LOCAL_PORT = 18789;

async function fetchGatewayToken(): Promise<{
  ok: boolean;
  token?: string;
  error?: string;
}> {
  try {
    const res = await fetch(`${BRIDGE_URL}/gateway-token`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      return { ok: false, error: `bridge HTTP ${res.status}` };
    }
    return (await res.json()) as { ok: boolean; token?: string; error?: string };
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

  const tokenResult = await fetchGatewayToken();

  const sshCmd = `ssh -N -L ${LOCAL_PORT}:127.0.0.1:${LOCAL_PORT} -i ${SSH_KEY} ${SSH_USER}@${SSH_HOST}`;
  const dashboardUrl = tokenResult.ok
    ? `http://localhost:${LOCAL_PORT}/#token=${tokenResult.token}`
    : `http://localhost:${LOCAL_PORT}/`;

  return (
    <div className="max-w-[900px] mx-auto p-6 space-y-6">
      <header>
        <h1 className="font-serif text-2xl text-text-1 mb-1">
          OpenClaw Mission Control
        </h1>
        <p className="text-sm text-text-3">
          The native OpenClaw Control UI lives on the rafiq-dev droplet at
          loopback (<code className="font-mono text-xs">127.0.0.1:18789</code>).
          It cannot be served through this domain directly — OpenClaw&apos;s
          gateway treats reverse-proxied WebSocket connections as
          &quot;remote&quot; and silently drops them at the connect-RPC layer
          even with valid authentication. The supported access pattern is an
          SSH tunnel that makes your laptop appear as the gateway&apos;s own
          loopback.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-text-1">
          Step 1 — Open an SSH tunnel
        </h2>
        <p className="text-sm text-text-2">
          In a terminal on your laptop, run this command and leave it running
          for the duration of your Control UI session. It forwards your
          local <code className="font-mono text-xs">{LOCAL_PORT}</code> to
          the gateway&apos;s loopback port on the droplet.
        </p>
        <div className="bg-surface-3 border border-border rounded p-3 flex items-start gap-3">
          <pre className="font-mono text-xs text-text-1 flex-1 whitespace-pre-wrap break-all">
            {sshCmd}
          </pre>
          <CopyButton text={sshCmd} label="Copy SSH command" />
        </div>
        <p className="text-xs text-text-3">
          The command will appear to hang — that&apos;s correct. It&apos;s
          forwarding the port. Leave the terminal open. Use{" "}
          <kbd className="font-mono text-[10px] bg-surface-2 border border-border px-1 rounded">
            Ctrl+C
          </kbd>{" "}
          when you&apos;re done.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-text-1">
          Step 2 — Open the dashboard URL
        </h2>
        <p className="text-sm text-text-2">
          With the tunnel running, open this URL in a browser tab. The token
          is already embedded in the URL fragment so the Control UI
          authenticates automatically.
        </p>
        {tokenResult.ok ? (
          <div className="bg-surface-3 border border-border rounded p-3 flex items-start gap-3">
            <pre className="font-mono text-xs text-text-1 flex-1 whitespace-pre-wrap break-all">
              {dashboardUrl}
            </pre>
            <CopyButton text={dashboardUrl} label="Copy URL" />
          </div>
        ) : (
          <div className="bg-warn border border-warn-bdr rounded p-3 text-sm text-warn-txt">
            <p className="font-semibold mb-1">
              Couldn&apos;t fetch the live gateway token:
            </p>
            <p className="font-mono text-xs">{tokenResult.error}</p>
            <p className="mt-2 text-xs">
              The bridge at <code>{BRIDGE_URL}/gateway-token</code> is
              unreachable from this server. Check that the openclaw-gateway
              container is running and the bridge process is up.
            </p>
          </div>
        )}
        <p className="text-xs text-text-3">
          ⚠️ The token grants full Control UI access. Don&apos;t share this
          URL outside the team. If you need to rotate it, run{" "}
          <code className="font-mono">openclaw config set gateway.auth.token &lt;new&gt;</code>{" "}
          inside the gateway container, then refresh this page to see the new
          token.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-text-1">
          What you can do in Mission Control
        </h2>
        <ul className="text-sm text-text-2 list-disc list-outside pl-5 space-y-1">
          <li>
            Browse the live plugin list and inspect{" "}
            <code className="font-mono text-xs">tbdc-db</code>&apos;s registered
            tools (4 read + 4 write)
          </li>
          <li>Tail recent agent runs from the chat pane</li>
          <li>
            Edit the gateway config live (allowed origins, default model,
            agent defaults)
          </li>
          <li>
            View recent sessions, transcripts, and tool-call audit events
          </li>
          <li>
            Inspect provider health (z.ai usage, rate limits, last successful
            call)
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-text-1">
          Quick CLI alternative (no browser)
        </h2>
        <p className="text-sm text-text-2">
          If you don&apos;t need the visual UI, the same data is available via
          the OpenClaw CLI directly through SSH:
        </p>
        <pre className="font-mono text-xs text-text-1 bg-surface-3 border border-border rounded p-3 overflow-x-auto">
          {[
            "# Plugin list",
            `ssh -i ${SSH_KEY} ${SSH_USER}@${SSH_HOST} \\`,
            "  'docker exec openclaw-gateway sh -c \"cd /app && node openclaw.mjs plugins list\"'",
            "",
            "# Inspect tbdc-db",
            `ssh -i ${SSH_KEY} ${SSH_USER}@${SSH_HOST} \\`,
            "  'docker exec openclaw-gateway sh -c \"cd /app && node openclaw.mjs plugins inspect tbdc-db\"'",
            "",
            "# Live config",
            `ssh -i ${SSH_KEY} ${SSH_USER}@${SSH_HOST} \\`,
            "  'docker exec openclaw-gateway sh -c \"cat /state/openclaw.json\"'",
          ].join("\n")}
        </pre>
      </section>
    </div>
  );
}
