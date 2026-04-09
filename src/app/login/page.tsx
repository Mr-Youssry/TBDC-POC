"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm border border-border rounded-[10px] bg-surface p-8">
        <div className="mb-6">
          <div className="text-[0.65rem] font-mono text-text-3 uppercase tracking-[0.06em] mb-2">
            TBDC POC — sign in
          </div>
          <h1 className="text-[1.4rem] tracking-[-0.02em]">
            Partnerships console
          </h1>
          <p className="text-[0.8rem] text-text-2 mt-1">
            Editors only. Logged-out visitors can browse all pages read-only.
          </p>
        </div>
        <form action={formAction} className="space-y-4">
          <label className="block">
            <span className="text-[0.65rem] font-mono text-text-2 uppercase tracking-[0.06em]">
              Email
            </span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 w-full px-3 py-2 text-sm border border-border rounded-[6px] bg-surface focus:outline-none focus:border-border-2"
            />
          </label>
          <label className="block">
            <span className="text-[0.65rem] font-mono text-text-2 uppercase tracking-[0.06em]">
              Password
            </span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 w-full px-3 py-2 text-sm border border-border rounded-[6px] bg-surface focus:outline-none focus:border-border-2"
            />
          </label>
          {state.error && (
            <p className="text-[0.78rem] text-[var(--t3txt)] bg-t3-bg border border-t3-bdr rounded-[6px] px-3 py-2">
              {state.error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full py-2.5 text-sm bg-[var(--text-1)] text-[var(--bg)] rounded-[6px] hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <div className="mt-6 text-[0.75rem] text-text-3">
          <Link href="/methodology" className="underline">
            ← back to public view
          </Link>
        </div>
      </div>
    </div>
  );
}
