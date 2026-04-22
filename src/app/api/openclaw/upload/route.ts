import { NextRequest } from "next/server";
import {
  isDummyOpenClawEnabled,
  uploadWorkspaceFile,
} from "@/lib/mock-openclaw";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!isDummyOpenClawEnabled()) {
    return Response.json(
      { ok: false, error: "Workspace uploads are not available in this environment" },
      { status: 404 },
    );
  }

  const body = await req.json().catch(() => null);
  const companySlug = typeof body?.companySlug === "string" ? body.companySlug : "";
  const filename = typeof body?.filename === "string" ? body.filename : "";
  const content =
    typeof body?.content === "string" ? body.content : undefined;
  const contentBase64 =
    typeof body?.contentBase64 === "string" ? body.contentBase64 : undefined;

  if (!companySlug || !filename) {
    return Response.json(
      { ok: false, error: "Missing companySlug or filename" },
      { status: 400 },
    );
  }

  return Response.json(
    uploadWorkspaceFile({
      companySlug,
      content,
      contentBase64,
      filename,
    }),
  );
}
