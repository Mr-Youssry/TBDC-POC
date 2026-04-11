"use client";
import { useEffect, useState } from "react";

type TreeNode = {
  name: string;
  type: "file" | "dir";
  readOnly?: boolean;
  children?: TreeNode[];
};

export function WorkspaceTree({
  selectedPath,
  onSelect,
}: {
  selectedPath: string | null;
  onSelect: (path: string, readOnly: boolean) => void;
}) {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    __identity__: true,
    companies: false,
    memory: false,
  });

  useEffect(() => {
    fetch("/api/openclaw/workspace/tree")
      .then((r) => r.json())
      .then((data) => { if (data.ok) setTree(data.tree); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = (key: string) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  // Any root-level file is an identity file; directories are their own sections
  const identityFiles = tree.filter((n) => n.type === "file");
  const directories = tree.filter((n) => n.type === "dir");

  const renderFile = (node: TreeNode, pathPrefix: string) => {
    const fullPath = pathPrefix ? `${pathPrefix}/${node.name}` : node.name;
    const active = selectedPath === fullPath;
    const dimmed = node.readOnly;
    return (
      <button
        key={fullPath}
        onClick={() => onSelect(fullPath, !!node.readOnly)}
        className={[
          "w-full text-left px-3 py-1.5 text-[0.78rem] rounded transition-colors truncate",
          active
            ? "bg-[#e8e6e1] text-text-1 font-semibold border-l-[3px] border-l-t1-txt"
            : dimmed
              ? "text-text-3/60 hover:bg-surface-2 hover:text-text-3"
              : "text-text-2 hover:bg-surface-2 hover:text-text-1",
        ].join(" ")}
        title={fullPath}
      >
        {node.name}
      </button>
    );
  };

  const renderDir = (node: TreeNode, pathPrefix: string) => {
    const key = pathPrefix ? `${pathPrefix}/${node.name}` : node.name;
    const isOpen = expanded[key] ?? false;
    const dimmed = node.readOnly;
    return (
      <div key={key}>
        <button
          onClick={() => toggle(key)}
          className={[
            "flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-1 mt-3",
            dimmed ? "text-text-3/50" : "text-text-3",
          ].join(" ")}
        >
          <span className="text-[0.6rem]">{isOpen ? "▾" : "▸"}</span>
          {node.name}
          {dimmed && <span className="text-[0.55rem] normal-case tracking-normal font-normal ml-1">(read-only)</span>}
        </button>
        {isOpen && node.children && (
          <div className="pl-2 space-y-0.5">
            {node.children.map((child) =>
              child.type === "dir"
                ? renderDir(child, key)
                : renderFile(child, key)
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <aside className="w-[220px] flex-shrink-0 border-r border-border bg-surface p-3">
        <p className="text-xs text-text-3 italic">Loading workspace…</p>
      </aside>
    );
  }

  return (
    <aside className="w-[220px] flex-shrink-0 border-r border-border bg-surface p-3 overflow-y-auto">
      {/* Identity section (virtual group of root .md files) */}
      <button
        onClick={() => toggle("__identity__")}
        className="flex items-center gap-1.5 text-xs font-semibold text-text-3 uppercase tracking-wider mb-1"
      >
        <span className="text-[0.6rem]">{expanded.__identity__ ? "▾" : "▸"}</span>
        Identity
      </button>
      {expanded.__identity__ && (
        <div className="pl-2 space-y-0.5">
          {identityFiles.map((f) => renderFile(f, ""))}
        </div>
      )}

      {/* Real directories: companies, memory, etc. */}
      {directories.map((d) => renderDir(d, ""))}
    </aside>
  );
}
