import type { Session } from "next-auth";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

// `auth()` is overloaded (server component vs. middleware). Call the
// RSC overload explicitly by treating it as a zero-arg async fn.
const getAuth = auth as unknown as () => Promise<Session | null>;

export type AppSession = Session | null;

export async function getSession(): Promise<AppSession> {
  return getAuth();
}

export async function isLoggedIn(): Promise<boolean> {
  const session = await getAuth();
  return !!session?.user;
}

/** Server action / RSC guard: throws if caller is not an admin. */
export async function requireAdmin(): Promise<Session> {
  const session = await getAuth();
  if (!session?.user) {
    throw new Error("Not authenticated");
  }
  const role = (session.user as { role?: string }).role;
  if (role !== "admin") {
    throw new Error("Forbidden: admin role required");
  }
  return session;
}

/** Page guard: redirects unauthenticated visitors to /login. */
export async function requireSessionForPage(): Promise<Session> {
  const session = await getAuth();
  if (!session?.user) redirect("/login");
  return session;
}
