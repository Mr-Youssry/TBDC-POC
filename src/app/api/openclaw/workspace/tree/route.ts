import {
  isDummyOpenClawEnabled,
  listWorkspaceTree,
} from "@/lib/mock-openclaw";

export const runtime = "nodejs";

export async function GET() {
  if (isDummyOpenClawEnabled()) {
    return Response.json({ ok: true, tree: listWorkspaceTree() });
  }

  return Response.json(
    { ok: false, error: "Workspace tree is not available in this environment" },
    { status: 404 },
  );
}
