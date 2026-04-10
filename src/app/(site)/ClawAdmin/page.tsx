import { Fragment } from "react";
import { requireSessionForPage } from "@/lib/guards";
import { StatusCard } from "./_components/status-card";
import { CopyButton } from "./_components/copy-button";
import { DownloadScriptButtons } from "./_components/download-script";

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

      {/* Gateway Status */}
      <StatusCard title="Gateway Status">
        {status ? (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            {([
              ["Model", String((status.gateway as Record<string,unknown>).model)],
              ["OpenClaw version", String((status.gateway as Record<string,unknown>).version)],
              ["Auth mode", String((status.gateway as Record<string,unknown>).authMode)],
              ["Z.AI key", String((status.env as Record<string,string>).ZAI_API_KEY)],
              ["Bridge PID", String(status.bridgePid)],
              ["Fetched at", new Date(status.ts).toLocaleString()],
            ] as [string, string][]).map(([label, value]) => (
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

      {/* Plugin: tbdc-db */}
      <StatusCard title="Plugin: tbdc-db">
        {plugins ? (
          <div className="space-y-2">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              {([
                ["Enabled", String((plugins.custom as Record<string,unknown>).enabled)],
                ["Version", String((plugins.custom as Record<string,unknown>).version)],
                ["Installed at", String((plugins.custom as Record<string,unknown>).installedAt)],
                ["Source path", String((plugins.custom as Record<string,unknown>).sourcePath)],
                ["Total plugins", plugins.totalLoaded],
              ] as [string, string][]).map(([label, value]) => (
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

      {/* Config */}
      <StatusCard title="Gateway Config (token redacted)">
        {config ? (
          <pre className="font-mono text-xs text-text-2 bg-surface-3 border border-border rounded p-3 overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(config.config, null, 2)}
          </pre>
        ) : (
          <p className="text-sm text-warn-txt">Failed to fetch config.</p>
        )}
      </StatusCard>

      {/* Native Control UI — one-click launcher */}
      <StatusCard title="Launch Native Control UI">
        <div className="space-y-3">
          <p className="text-sm text-text-2">
            Download and run this script to open the full interactive
            OpenClaw Control UI. It opens an SSH tunnel in the background
            and launches the dashboard in your browser automatically.
          </p>
          {tokenData ? (
            <>
              <DownloadScriptButtons token={tokenData.token} />
              <p className="text-xs text-text-3">
                Windows: double-click the .bat file. Mac/Linux: run{" "}
                <code className="font-mono bg-surface-3 px-1 rounded">
                  chmod +x tbdc-mission-control.sh && ./tbdc-mission-control.sh
                </code>
                . Keep the terminal open while using Mission Control.
              </p>
            </>
          ) : (
            <p className="text-sm text-warn-txt">
              Could not fetch the gateway token — download unavailable.
            </p>
          )}
        </div>
      </StatusCard>

      {/* Manual SSH commands (collapsible) */}
      <details className="border border-border rounded-lg overflow-hidden">
        <summary className="px-4 py-2 bg-surface-2 border-b border-border font-serif text-base text-text-1 font-semibold cursor-pointer">
          Manual: SSH commands (if the script doesn&apos;t work)
        </summary>
        <div className="px-4 py-3 space-y-3">
          <p className="text-sm text-text-2">
            Run these two commands manually if the download script
            doesn&apos;t work on your machine.
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
