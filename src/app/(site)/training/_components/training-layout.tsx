"use client";
import { useCallback, useState } from "react";
import { WorkspaceTree } from "./workspace-tree";
import { FileEditor } from "./file-editor";
import { FileViewer } from "./file-viewer";
import { MessagePane } from "../../analyst/_components/message-pane";

export function TrainingLayout({
  currentUserId,
  currentUserName,
}: {
  currentUserId: string;
  currentUserName: string;
}) {
  const [selected, setSelected] = useState<{
    path: string;
    readOnly: boolean;
  } | null>(null);

  // Track which files have unsaved changes (keyed by path)
  const [dirtyFiles, setDirtyFiles] = useState<Set<string>>(new Set());

  // Cache unsaved editor content so switching files preserves edits
  const [contentCache, setContentCache] = useState<Record<string, string>>({});

  const onDirtyChange = useCallback((path: string, dirty: boolean) => {
    setDirtyFiles((prev) => {
      const next = new Set(prev);
      if (dirty) next.add(path);
      else next.delete(path);
      return next;
    });
  }, []);

  return (
    <div className="flex h-[calc(100vh-60px)]">
      {/* Left: file tree */}
      <WorkspaceTree
        selectedPath={selected?.path ?? null}
        dirtyFiles={dirtyFiles}
        onSelect={(path, readOnly) => setSelected({ path, readOnly })}
      />

      {/* Center: editor or viewer */}
      {selected ? (
        selected.readOnly ? (
          <FileViewer key={selected.path} path={selected.path} />
        ) : (
          <FileEditor
            key={selected.path}
            path={selected.path}
            onDirtyChange={onDirtyChange}
            cachedContent={contentCache[selected.path]}
            onContentChange={(p, content) => setContentCache(prev => ({ ...prev, [p]: content }))}
            onSaved={(p) => setContentCache(prev => { const next = { ...prev }; delete next[p]; return next; })}
          />
        )
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-sm text-text-3 italic px-8 text-center gap-1">
          <p>Select a file from the workspace to view or edit.</p>
          <p>Identity files shape how SCOTE thinks and communicates.</p>
          <p>Memory files are SCOTE&apos;s internal journal — browse them here.</p>
        </div>
      )}

      {/* Right: chat */}
      <div className="w-[400px] flex-shrink-0 border-l border-border">
        <MessagePane
          key="tbdc-configure"
          openclawSessionId="tbdc-configure"
          displayName="Configure SCOTE"
          currentUserId={currentUserId}
          currentUserName={currentUserName}
        />
      </div>
    </div>
  );
}
