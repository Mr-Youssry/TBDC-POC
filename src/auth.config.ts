import type { NextAuthConfig } from "next-auth";

/**
 * Config shared between the edge-compatible proxy (proxy.ts) and the
 * full Node runtime auth at src/auth.ts. Keep this file free of Node-only
 * imports (no bcryptjs, no Prisma) — the edge middleware can't load them.
 */
const useDummyData = process.env.USE_DUMMY_DATA === "true";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [], // defined in src/auth.ts
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      if (isOnAdmin && useDummyData) return true;
      if (isOnAdmin) return isLoggedIn;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = (user as { id?: string }).id ?? token.sub;
        token.role = (user as { role?: string }).role ?? "admin";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = (token.id as string | undefined) ?? token.sub;
        (session.user as { role?: string }).role =
          (token.role as string | undefined) ?? "admin";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
