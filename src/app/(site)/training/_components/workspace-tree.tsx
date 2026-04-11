"use client";
import { useEffect, useState } from "react";

const FileIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-3.5 h-3.5 flex-shrink-0">
    <path d="M4 1h5l4 4v10H4V1z" /><path d="M9 1v4h4" />
  </svg>
);

const FolderIcon = ({ open }: { open: boolean }) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-3.5 h-3.5 flex-shrink-0">
    {open ? (
      <path d="M2 4h4l1.5-2H14v10H2V4z M2 6h12" />
    ) : (
      <path d="M2 3h4l2 2h6v9H2V3z" />
    )}
  </svg>
);

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
          "w-full text-left px-3 py-1.5 text-[0.78rem] rounded transition-colors flex items-center gap-1.5",
          active
            ? "bg-[#e8e6e1] text-text-1 font-semibold border-l-[3px] border-l-t1-txt"
            : dimmed
              ? "text-text-3/60 hover:bg-surface-2 hover:text-text-3"
              : "text-text-2 hover:bg-surface-2 hover:text-text-1",
        ].join(" ")}
        title={fullPath}
      >
        <FileIcon />
        <span className="truncate">{node.name}</span>
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
          <FolderIcon open={isOpen} />
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
        <FolderIcon open={expanded.__identity__} />
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
