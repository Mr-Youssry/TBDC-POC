"use client";

import { useTransition, useState } from "react";
import { deleteInvestor, addInvestor } from "./actions";

export function AddInvestorButton() {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => addInvestor().then(() => {}))}
      className="px-3 py-1.5 text-[0.75rem] font-mono border border-border-2 rounded-[4px] bg-surface hover:bg-surface-2 disabled:opacity-60"
    >
      {pending ? "Adding…" : "+ add investor"}
    </button>
  );
}

export function DeleteInvestorButton({ id, name }: { id: string; name: string }) {
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
            await deleteInvestor(id);
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
