import { COMPANIES } from "../../prisma/data/companies";

type HistoryRole = "assistant" | "user";

export type MockHistoryMessage = {
  content: string;
  role: HistoryRole;
  timestamp: string;
};

export type WorkspaceTreeNode = {
  children?: WorkspaceTreeNode[];
  name: string;
  readOnly?: boolean;
  type: "dir" | "file";
};

type WorkspaceFile = {
  content: string;
  readOnly: boolean;
};

type MockOpenClawState = {
  files: Record<string, WorkspaceFile>;
  histories: Record<string, MockHistoryMessage[]>;
};

const globalForMockOpenClaw = globalThis as typeof globalThis & {
  __tbdcMockOpenClaw?: MockOpenClawState;
};

export function isDummyOpenClawEnabled() {
  return process.env.USE_DUMMY_DATA === "true";
}

export function listMockHistory(sessionId: string): MockHistoryMessage[] {
  return [...getState().histories[sessionId] ?? []];
}

export function appendMockConversation(
  sessionId: string,
  userMessage: string,
  assistantReply: string,
) {
  const history = getHistoryBucket(sessionId);
  history.push(createHistoryMessage("user", userMessage));
  history.push(createHistoryMessage("assistant", assistantReply));
}

export function buildMockReply(sessionId: string, message: string) {
  const topic = getSessionTopic(sessionId);
  const trimmed = message.trim();
  const excerpt = trimmed.length > 180 ? `${trimmed.slice(0, 177)}...` : trimmed;
  return [
    `Dummy mode is active for ${topic}.`,
    ``,
    `The seeded portfolio and investor data are available throughout the UI, but the live OpenClaw bridge is not connected in this local setup.`,
    `I captured your prompt locally: "${excerpt}"`,
    ``,
    `Use the Activation Playbook, Match Output, and Pipeline tabs for realistic seeded workflows. Any training-page edits stay in memory until the dev server restarts.`,
  ].join("\n");
}

export function listWorkspaceTree(): WorkspaceTreeNode[] {
  return buildTree(Object.entries(getState().files));
}

export function readWorkspaceFile(path: string) {
  return getState().files[path] ?? null;
}

export function writeWorkspaceFile(path: string, content: string) {
  const file = getState().files[path];
  if (!file) return { error: "File not found", ok: false as const };
  if (file.readOnly) return { error: "File is read-only", ok: false as const };
  file.content = content;
  return { ok: true as const };
}

export function uploadWorkspaceFile(args: {
  companySlug: string;
  content?: string;
  contentBase64?: string;
  filename: string;
}) {
  const path = `companies/${args.companySlug}/${args.filename}`;
  getState().files[path] = {
    content: resolveUploadContent(args),
    readOnly: false,
  };
  return { ok: true as const, path };
}

function getState() {
  if (!globalForMockOpenClaw.__tbdcMockOpenClaw) {
    globalForMockOpenClaw.__tbdcMockOpenClaw = {
      files: buildWorkspaceFiles(),
      histories: buildHistories(),
    };
  }
  return globalForMockOpenClaw.__tbdcMockOpenClaw;
}

function buildWorkspaceFiles() {
  const files: Record<string, WorkspaceFile> = {
    "SOUL.md": {
      content: [
        "# SCOTE Identity",
        "",
        "You are the Toronto Business Development Centre's partnerships operating partner.",
        "Stay concise, use the seeded database as the source of truth, and explain investor-fit tradeoffs plainly.",
      ].join("\n"),
      readOnly: false,
    },
    "STYLE.md": {
      content: [
        "# Communication Style",
        "",
        "- Lead with the recommendation.",
        "- Cite investor thesis, stage, and cheque fit before extras.",
        "- Avoid generic fundraising language.",
      ].join("\n"),
      readOnly: false,
    },
    "VOICE.md": {
      content: [
        "# Voice",
        "",
        "Direct, calm, and operator-oriented. Prioritize clarity over hype.",
      ].join("\n"),
      readOnly: false,
    },
    "memory/2026-04-22.md": {
      content: [
        "# Memory Snapshot",
        "",
        "Dummy mode is enabled locally.",
        "Use the app tabs to inspect the seeded TBDC portfolio and investor data.",
      ].join("\n"),
      readOnly: true,
    },
  };

  for (const company of COMPANIES) {
    const slug = slugify(company.name);
    files[`companies/${slug}/company-profile.md`] = {
      content: buildCompanyProfile(company),
      readOnly: false,
    };
    files[`companies/${slug}/notes.md`] = {
      content: [
        `# ${company.name} Notes`,
        "",
        `Stage: ${company.stage}`,
        `Sector: ${company.sector}`,
        `Ask: ${company.askSize}`,
      ].join("\n"),
      readOnly: false,
    };
  }

  return files;
}

function buildHistories() {
  return {
    "tbdc-configure": [
      createHistoryMessage(
        "assistant",
        "Dummy mode is active. Training-page workspace edits will stay in memory until the dev server restarts.",
      ),
    ],
    "tbdc-general": [
      createHistoryMessage(
        "assistant",
        "Dummy mode is active. The UI is wired to seeded portfolio and investor data, but the live OpenClaw bridge is not connected.",
      ),
    ],
  } satisfies Record<string, MockHistoryMessage[]>;
}

function buildTree(entries: Array<[string, WorkspaceFile]>) {
  const root = new Map<string, WorkspaceTreeNode>();
  for (const [path, file] of entries) {
    insertPath(root, path.split("/"), file.readOnly);
  }
  return sortNodes([...root.values()]);
}

function insertPath(
  bucket: Map<string, WorkspaceTreeNode>,
  parts: string[],
  readOnly: boolean,
) {
  const [head, ...tail] = parts;
  if (!head) return;
  const existing = bucket.get(head);
  if (tail.length === 0) {
    bucket.set(head, { name: head, readOnly, type: "file" });
    return;
  }
  const node =
    existing && existing.type === "dir"
      ? existing
      : { children: [], name: head, readOnly, type: "dir" as const };
  const childMap = new Map((node.children ?? []).map((child) => [child.name, child]));
  insertPath(childMap, tail, readOnly);
  node.children = sortNodes([...childMap.values()]);
  bucket.set(head, node);
}

function sortNodes(nodes: WorkspaceTreeNode[]) {
  return [...nodes].sort((left, right) => {
    if (left.type !== right.type) return left.type === "file" ? -1 : 1;
    return left.name.localeCompare(right.name);
  });
}

function resolveUploadContent(args: {
  content?: string;
  contentBase64?: string;
  filename: string;
}) {
  if (args.content) return args.content;
  if (!args.contentBase64) return "";
  return [
    `# Uploaded Asset`,
    "",
    `Original filename: ${args.filename}`,
    "Binary uploads are stored as placeholders in dummy mode.",
    `Base64 bytes: ${args.contentBase64.length}`,
  ].join("\n");
}

function getHistoryBucket(sessionId: string) {
  const state = getState();
  if (!state.histories[sessionId]) {
    state.histories[sessionId] = [];
  }
  return state.histories[sessionId];
}

function createHistoryMessage(role: HistoryRole, content: string): MockHistoryMessage {
  return {
    content,
    role,
    timestamp: new Date().toISOString(),
  };
}

function getSessionTopic(sessionId: string) {
  if (sessionId === "tbdc-configure") return "SCOTE Training";
  if (sessionId === "tbdc-general") return "General";
  if (sessionId.startsWith("tbdc-co-")) return "a company channel";
  if (sessionId.startsWith("tbdc-inv-")) return "an investor channel";
  return "this channel";
}

function slugify(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

function buildCompanyProfile(company: (typeof COMPANIES)[number]) {
  return [
    `# ${company.name}`,
    "",
    `- Cohort: ${company.cohort}`,
    `- Stage: ${company.stage}`,
    `- Sector: ${company.sector}`,
    `- Traction: ${company.arrTraction}`,
    `- Ask: ${company.askSize}`,
    `- Home market: ${company.homeMarket}`,
    `- Target market: ${company.targetMarket}`,
    `- Founder profile: ${company.founderProfile}`,
  ].join("\n");
}
