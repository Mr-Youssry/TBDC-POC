// Minimal type shim for `openclaw/plugin-sdk/plugin-entry`.
//
// The real module is not installed via npm — the OpenClaw gateway resolves it
// at plugin-load time from its own bundled SDK. We only declare what this
// plugin actually uses. Signatures derived from:
//   - docs.openclaw.ai/plugins/building-plugins.md
//   - bundled SDK source at /app/dist/plugin-sdk/plugin-entry.js in the
//     probe container (see deploy/probe/FINDINGS.md §"Definitive findings").
//   - working probe plugin at deploy/probe/plugins/hello-world-db/index.js.

declare module "openclaw/plugin-sdk/plugin-entry" {
  export interface RegisterLogger {
    info?(msg: string, ...rest: unknown[]): void;
    debug?(msg: string, ...rest: unknown[]): void;
    warn?(msg: string, ...rest: unknown[]): void;
    error?(msg: string, ...rest: unknown[]): void;
  }

  export interface RegisterApi {
    config?: Record<string, unknown>;
    logger?: RegisterLogger;
    registerTool(tool: ToolDefinition): void;
  }

  export interface ToolContentItem {
    type: "text";
    text: string;
  }

  export interface ExecuteResult {
    content: ToolContentItem[];
    details?: { error?: boolean; [k: string]: unknown };
  }

  export interface ToolDefinition {
    name: string;
    label?: string;
    description: string;
    /**
     * Plain JSON Schema object. TypeBox is NOT required — see
     * deploy/probe/FINDINGS.md §"Tool definition shape".
     */
    parameters: Record<string, unknown>;
    execute(
      id: string,
      params: Record<string, unknown>,
    ): Promise<ExecuteResult>;
  }

  export interface PluginEntryInput {
    id: string;
    name: string;
    description: string;
    kind?: string;
    configSchema?: Record<string, unknown>;
    reload?: () => Promise<void> | void;
    register(api: RegisterApi): void | Promise<void>;
  }

  export function definePluginEntry(input: PluginEntryInput): unknown;
}
