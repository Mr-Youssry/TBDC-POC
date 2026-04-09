"use client";

import { useState, useTransition } from "react";
import { addCompany, deleteCompany, toggleAcceptsIntros } from "./actions";

export function AddCompanyButton() {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => addCompany().then(() => {}))}
      className="px-3 py-1.5 text-[0.75rem] font-mono border border-border-2 rounded-[4px] bg-surface hover:bg-surface-2 disabled:opacity-60"
    >
      {pending ? "Adding…" : "+ add company"}
    </button>
  );
}

export function DeleteCompanyButton({ id, name }: { id: string; name: string }) {
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);
  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-[0.62rem] font-mono text-text-3 hover:text-[var(--t3txt)]"
        title={`Delete ${name}`}
      >
        ✕
      </button>
    );
  }
  return (
    <span className="flex items-center gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await deleteCompany(id);
            setConfirming(false);
          })
        }
        className="text-[0.62rem] font-mono text-[var(--t3txt)] font-bold"
      >
        confirm
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-[0.62rem] font-mono text-text-3"
      >
        cancel
      </button>
    </span>
  );
}

export function AcceptsIntrosToggle({
  id,
  initial,
  editable,
}: {
  id: string;
  initial: boolean;
  editable: boolean;
}) {
  const [accepts, setAccepts] = useState(initial);
  const [pending, start] = useTransition();

  if (!editable) {
    return accepts ? (
      <span className="inline-block font-mono text-[0.62rem] px-[7px] py-[2px] rounded-[4px] bg-[#e8f8ef] text-[#1a6a40] border border-[#50b080] font-bold">
        Open
      </span>
    ) : (
      <span className="inline-block font-mono text-[0.62rem] px-[7px] py-[2px] rounded-[4px] bg-warn text-warn-txt border border-warn-bdr font-bold">
        ⚠ Declined
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        const next = !accepts;
        setAccepts(next);
        start(async () => {
          const res = await toggleAcceptsIntros(id, next);
          if (!res.ok) setAccepts(!next);
        });
      }}
      className={
        accepts
          ? "inline-block font-mono text-[0.62rem] px-[7px] py-[2px] rounded-[4px] bg-[#e8f8ef] text-[#1a6a40] border border-[#50b080] font-bold cursor-pointer hover:opacity-80"
          : "inline-block font-mono text-[0.62rem] px-[7px] py-[2px] rounded-[4px] bg-warn text-warn-txt border border-warn-bdr font-bold cursor-pointer hover:opacity-80"
      }
    >
      {accepts ? "Open" : "⚠ Declined"}
    </button>
  );
}
