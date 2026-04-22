"use client";

import { useState, useTransition } from "react";
import { deleteUser } from "./actions";

export function DeleteUserButton({
  id,
  email,
  disabled,
}: {
  id: string;
  email: string;
  disabled?: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (disabled) {
    return (
      <span className="text-[0.65rem] font-mono text-text-3">(self)</span>
    );
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => {
          setError(null);
          setConfirming(true);
        }}
        className="text-[0.72rem] font-mono text-text-3 hover:text-[var(--t3txt)]"
        title={`Delete ${email}`}
      >
        delete
      </button>
    );
  }
  return (
    <span className="flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await deleteUser(id);
            if (res.ok) {
              setConfirming(false);
            } else {
              setError(res.error ?? "Failed");
            }
          })
        }
        className="text-[0.72rem] font-mono font-bold text-[var(--t3txt)]"
      >
        confirm
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-[0.72rem] font-mono text-text-3"
      >
        cancel
      </button>
      {error && <span className="text-[0.65rem] text-[var(--t3txt)]">{error}</span>}
    </span>
  );
}
