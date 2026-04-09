"use client";

import { useState, useTransition, type ReactNode } from "react";

type UpdateFn = (id: string, field: string, value: string) => Promise<{ ok: boolean; error?: string }>;

export function LongTextModal({
  id,
  field,
  label,
  initialValue,
  editable,
  update,
  children,
}: {
  id: string;
  field: string;
  label: string;
  initialValue: string;
  editable: boolean;
  update: UpdateFn;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!editable) {
    return <>{children}</>;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setValue(initialValue);
          setError(null);
          setOpen(true);
        }}
        className="text-left w-full hover:bg-surface-2 rounded-[4px] px-1 py-0.5 -mx-1 transition-colors cursor-text"
        title={`Edit ${label}`}
      >
        {children}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="bg-surface border border-border rounded-[10px] p-5 max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="font-mono text-[0.65rem] uppercase tracking-[0.06em] text-text-3 mb-2">
              Edit · {label}
            </div>
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={8}
              className="w-full border border-border rounded-[6px] p-3 text-[0.82rem] bg-background text-foreground focus:outline-none focus:border-border-2"
            />
            {error && (
              <p className="mt-2 text-[0.75rem] text-[var(--t3txt)]">{error}</p>
            )}
            <div className="flex gap-2 mt-4 justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-3 py-1.5 text-sm border border-border rounded-[6px] hover:bg-surface-2"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  startTransition(async () => {
                    const res = await update(id, field, value);
                    if (res.ok) {
                      setOpen(false);
                    } else {
                      setError(res.error ?? "Update failed");
                    }
                  });
                }}
                className="px-3 py-1.5 text-sm bg-[var(--text-1)] text-[var(--bg)] rounded-[6px] hover:opacity-90 disabled:opacity-60"
              >
                {isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
