"use client";

import { useActionState, useEffect, useRef } from "react";
import { inviteUser, type InviteState } from "./actions";

const initial: InviteState = {};

export function InviteForm() {
  const [state, action, pending] = useActionState(inviteUser, initial);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (state.ok && formRef.current) formRef.current.reset();
  }, [state.ok]);

  return (
    <form
      ref={formRef}
      action={action}
      className="border border-border rounded-[10px] bg-surface p-4 mb-6 grid grid-cols-1 md:grid-cols-[2fr_2fr_2fr_auto] gap-3 items-end"
    >
      <label className="block">
        <span className="block font-mono text-[0.62rem] uppercase tracking-[0.06em] text-text-3 mb-1">
          Email
        </span>
        <input
          name="email"
          type="email"
          required
          className="w-full px-2 py-1.5 text-[0.82rem] border border-border rounded-[4px] bg-background"
        />
      </label>
      <label className="block">
        <span className="block font-mono text-[0.62rem] uppercase tracking-[0.06em] text-text-3 mb-1">
          Name
        </span>
        <input
          name="name"
          required
          className="w-full px-2 py-1.5 text-[0.82rem] border border-border rounded-[4px] bg-background"
        />
      </label>
      <label className="block">
        <span className="block font-mono text-[0.62rem] uppercase tracking-[0.06em] text-text-3 mb-1">
          Temp password
        </span>
        <input
          name="password"
          type="text"
          required
          minLength={8}
          className="w-full px-2 py-1.5 text-[0.82rem] border border-border rounded-[4px] bg-background font-mono"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="px-3 py-1.5 text-[0.82rem] font-mono border border-border-2 rounded-[4px] bg-[var(--text-1)] text-[var(--bg)] hover:opacity-90 disabled:opacity-60 whitespace-nowrap"
      >
        {pending ? "Inviting…" : "Invite admin"}
      </button>
      {state.error && (
        <div className="md:col-span-4 text-[0.75rem] text-[var(--t3txt)]">{state.error}</div>
      )}
      {state.ok && (
        <div className="md:col-span-4 text-[0.75rem] text-[var(--t1txt)]">
          User invited. Share the temp password out-of-band.
        </div>
      )}
    </form>
  );
}
