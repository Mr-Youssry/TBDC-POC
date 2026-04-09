import type { ReactNode } from "react";

export function SecHead({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={[
        "font-mono text-[0.65rem] uppercase tracking-[0.08em] text-text-3 mb-3 mt-6 pb-1.5 border-b border-border first:mt-0",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
