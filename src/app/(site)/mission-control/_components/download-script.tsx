"use client";

/**
 * Generates and downloads a one-click script that:
 * 1. Opens an SSH tunnel to the openclaw-gateway loopback port
 * 2. Opens the Control UI in the default browser with the token pre-filled
 * 3. Waits for the user to press a key / Ctrl+C, then closes the tunnel
 *
 * The token is baked into the script at download time (passed as a prop
 * from the server component that fetched it from the bridge).
 */

function windowsBat(token: string): string {
  return `@echo off
title TBDC Mission Control — SSH Tunnel
echo.
echo  ==========================================
echo   TBDC Mission Control — SSH Tunnel
echo  ==========================================
echo.
echo  Opening SSH tunnel to rafiq-dev...
echo  (Keep this window open while using Mission Control)
echo.

start "" "http://localhost:18789/#token=${token}"

ssh -N -L 18789:127.0.0.1:18789 -i "%USERPROFILE%\\.ssh\\id_ed25519" root@67.205.157.55

echo.
echo  Tunnel closed. You can close this window.
pause
`;
}

function macLinuxSh(token: string): string {
  return `#!/bin/bash
# TBDC Mission Control — SSH Tunnel
# Run this script, leave it open, use Mission Control in your browser.
# Press Ctrl+C when done.

echo ""
echo "  =========================================="
echo "   TBDC Mission Control — SSH Tunnel"
echo "  =========================================="
echo ""
echo "  Opening SSH tunnel to rafiq-dev..."
echo "  (Press Ctrl+C to close the tunnel when done)"
echo ""

# Open browser after a short delay to let the tunnel establish
(sleep 2 && open "http://localhost:18789/#token=${token}" 2>/dev/null || xdg-open "http://localhost:18789/#token=${token}" 2>/dev/null) &

ssh -N -L 18789:127.0.0.1:18789 -i ~/.ssh/id_ed25519 root@67.205.157.55

echo ""
echo "  Tunnel closed."
`;
}

function download(filename: string, content: string) {
  const blob = new Blob([content], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function DownloadScriptButtons({ token }: { token: string }) {
  return (
    <div className="flex gap-2 flex-wrap">
      <button
        type="button"
        onClick={() => download("tbdc-mission-control.bat", windowsBat(token))}
        className="px-3 py-1.5 text-xs rounded border border-border bg-surface-2 text-text-2 hover:bg-surface hover:text-text-1 transition-colors"
      >
        Download for Windows (.bat)
      </button>
      <button
        type="button"
        onClick={() => download("tbdc-mission-control.sh", macLinuxSh(token))}
        className="px-3 py-1.5 text-xs rounded border border-border bg-surface-2 text-text-2 hover:bg-surface hover:text-text-1 transition-colors"
      >
        Download for Mac / Linux (.sh)
      </button>
    </div>
  );
}
