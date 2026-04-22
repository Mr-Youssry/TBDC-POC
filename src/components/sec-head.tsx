import type { ReactNode } from "react";

export function SecHead({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <div
      id={id}
      className={[
        "mb-4 mt-8 flex items-center gap-2 border-b border-border pb-2 first:mt-0",
        className ?? "",
      ].join(" ")}
    >
      <span className="h-2 w-2 rounded-full bg-primary/80" />
      <span className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-text-3">
        {children}
      </span>
    </div>
  );
}
