import NextAuth from "next-auth";
import { authConfig } from "./src/auth.config";

// Edge-compatible proxy (Next 16 replacement for middleware.ts).
// Uses the lite authConfig (no Prisma, no bcrypt imports) so it can
// run on the edge.
export default NextAuth(authConfig).auth;

export const config = {
  // Match everything except Next internals + static files.
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
