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
      className="app-surface mb-6 grid grid-cols-1 items-end gap-3 p-4 md:grid-cols-[2fr_2fr_2fr_auto]"
    >
      <label className="block">
        <span className="block font-mono text-[0.62rem] uppercase tracking-[0.06em] text-text-3 mb-1">
          Email
        </span>
        <input
          name="email"
          type="email"
          required
          className="w-full rounded-[8px] border border-border bg-background px-3 py-2 text-[0.82rem]"
        />
      </label>
      <label className="block">
        <span className="block font-mono text-[0.62rem] uppercase tracking-[0.06em] text-text-3 mb-1">
          Name
        </span>
        <input
          name="name"
          required
          className="w-full rounded-[8px] border border-border bg-background px-3 py-2 text-[0.82rem]"
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
          className="w-full rounded-[8px] border border-border bg-background px-3 py-2 font-mono text-[0.82rem]"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full border border-primary bg-primary px-4 py-2 text-[0.82rem] font-medium whitespace-nowrap text-white hover:bg-[#eb2f77] disabled:opacity-60"
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
