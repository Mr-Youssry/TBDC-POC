"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";

type UpdateFn = (id: string, field: string, value: string) => Promise<{ ok: boolean; error?: string }>;

export function EditableCell({
  id,
  field,
  initialValue,
  editable,
  update,
  options,
  display,
  inputType = "text",
  ariaLabel,
}: {
  id: string;
  field: string;
  initialValue: string;
  editable: boolean;
  update: UpdateFn;
  options?: { label: string; value: string }[];
  display?: ReactNode;
  inputType?: "text" | "number";
  ariaLabel?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLInputElement | HTMLSelectElement | null>(null);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      if (ref.current instanceof HTMLInputElement) {
        ref.current.select();
      }
    }
  }, [editing]);

  const commit = () => {
    if (value === initialValue) {
      setEditing(false);
      return;
    }
    startTransition(async () => {
      const res = await update(id, field, value);
      if (res.ok) {
        setEditing(false);
        setError(null);
      } else {
        setError(res.error ?? "Update failed");
      }
    });
  };

  if (!editable) {
    return <>{display ?? initialValue}</>;
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setValue(initialValue);
          setError(null);
          setEditing(true);
        }}
        aria-label={ariaLabel ?? `Edit ${field}`}
        className="text-left hover:bg-surface-2 rounded-[4px] px-1 py-0.5 -mx-1 transition-colors w-full cursor-text"
      >
        {display ?? initialValue}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {options ? (
        <select
          ref={(el) => {
            ref.current = el;
          }}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setEditing(false);
          }}
          disabled={isPending}
          className="border border-border-2 rounded-[4px] px-1.5 py-0.5 text-[0.78rem] bg-surface"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          ref={(el) => {
            ref.current = el;
          }}
          type={inputType}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setEditing(false);
          }}
          disabled={isPending}
          className="border border-border-2 rounded-[4px] px-1.5 py-0.5 text-[0.78rem] bg-surface w-full"
        />
      )}
      {error && <span className="text-[0.68rem] text-[var(--t3txt)]">{error}</span>}
    </div>
  );
}
