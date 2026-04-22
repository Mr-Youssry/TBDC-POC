"use client";

import { useActionState } from "react";
import Link from "next/link";
import Image from "next/image";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-6xl items-center gap-6 lg:grid-cols-[minmax(0,1.1fr)_420px]">
        <div className="app-hero hidden lg:block">
          <div className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-text-3">
            TBDC Capital Console
          </div>
          <h1 className="app-page-title mt-3">Investor matching, with calmer operating surfaces.</h1>
          <p className="app-page-copy">
            The console now uses the same search-led, action-first visual language across activation,
            investor discovery, company profiles, match work, and pipeline execution.
          </p>
          <div className="app-stat-grid mt-6">
            <div className="app-stat-card">
              <span className="app-stat-card__label">Operate</span>
              <strong className="app-stat-card__value">Activation</strong>
              <span className="app-stat-card__copy">Prioritize intros, follow-up, and reactivation without table fatigue.</span>
            </div>
            <div className="app-stat-card">
              <span className="app-stat-card__label">Reference</span>
              <strong className="app-stat-card__value">Investors + Companies</strong>
              <span className="app-stat-card__copy">Keep the source database visible, but stop making it the only thing users see.</span>
            </div>
          </div>
        </div>

        <div className="app-surface mx-auto w-full max-w-sm p-8">
          <div className="mb-4 flex flex-col items-center">
            <Image src="/tbdc-logo.png" alt="TBDC" width={52} height={52} className="mb-3 rounded-xl border border-border bg-white p-1 shadow-sm" />
            <p className="text-[0.72rem] font-mono uppercase tracking-[0.12em] text-text-3">
              TBDC Capital Console
            </p>
          </div>
          <div className="mb-6">
            <div className="mb-2 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-text-3">
              Sign in
            </div>
            <h1 className="text-[1.7rem] font-semibold tracking-[-0.04em] text-text-1">
              Partnerships console
            </h1>
            <p className="mt-2 text-[0.84rem] leading-6 text-text-2">
              Editors only. Logged-out visitors can still browse the product in read-only mode.
            </p>
          </div>
          <form action={formAction} className="space-y-4">
            <label className="block">
              <span className="text-[0.65rem] font-mono text-text-2 uppercase tracking-[0.12em]">
                Email
              </span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 w-full rounded-[8px] border border-border bg-surface-2 px-3 py-2.5 text-sm focus:border-primary/24 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-[0.65rem] font-mono text-text-2 uppercase tracking-[0.12em]">
                Password
              </span>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 w-full rounded-[8px] border border-border bg-surface-2 px-3 py-2.5 text-sm focus:border-primary/24 focus:outline-none"
              />
            </label>
            {state.error && (
              <p className="rounded-[8px] border border-t3-bdr bg-t3-bg px-3 py-2 text-[0.78rem] text-[var(--t3txt)]">
                {state.error}
              </p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-[8px] bg-primary py-2.5 text-sm font-medium text-white hover:bg-[#eb2f77] disabled:opacity-60"
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
    </div>
  );
}
