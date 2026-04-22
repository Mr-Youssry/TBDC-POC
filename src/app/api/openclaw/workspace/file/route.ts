import { NextRequest } from "next/server";
import {
  isDummyOpenClawEnabled,
  readWorkspaceFile,
  writeWorkspaceFile,
} from "@/lib/mock-openclaw";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get("path");
  if (!path) {
    return Response.json(
      { ok: false, error: "Missing path" },
      { status: 400 },
    );
  }

  if (!isDummyOpenClawEnabled()) {
    return Response.json(
      { ok: false, error: "Workspace file access is not available in this environment" },
      { status: 404 },
    );
  }

  const file = readWorkspaceFile(path);
  if (!file) {
    return Response.json(
      { ok: false, error: "File not found" },
      { status: 404 },
    );
  }

  return Response.json({
    ok: true,
    content: file.content,
    readOnly: file.readOnly,
  });
}

export async function PUT(req: NextRequest) {
  if (!isDummyOpenClawEnabled()) {
    return Response.json(
      { ok: false, error: "Workspace file writes are not available in this environment" },
      { status: 404 },
    );
  }

  const body = await req.json().catch(() => null);
  const path = typeof body?.path === "string" ? body.path : "";
  const content = typeof body?.content === "string" ? body.content : "";

  if (!path) {
    return Response.json(
      { ok: false, error: "Missing path" },
      { status: 400 },
    );
  }

  const result = writeWorkspaceFile(path, content);
  if (!result.ok) {
    return Response.json(
      result,
      { status: result.error === "File not found" ? 404 : 400 },
    );
  }

  return Response.json(result);
}
