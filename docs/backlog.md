# Backlog

Open issues only. When an issue is resolved, **delete the row** — resolved work lives in [changelog.md](changelog.md), not here.

## BL-010 — File upload → OCR pipeline for pitch deck analysis

**Priority:** High | **Added:** 2026-04-11

The current upload modal saves files to the workspace, but non-text files (PDF, images) are stored raw — the agent can't read them. The proper flow requires:

1. Upload saves the raw file to workspace
2. File is passed to OpenClaw's media pipeline (z.ai GLM-4.5 has image/document understanding)
3. Media pipeline returns OCR/analysis text
4. Bridge saves the processed output as `{company}/pitch-deck.md` in workspace
5. Agent gets the structured content on future turns

**Investigation needed:** How does OpenClaw's native media attachment work via the gateway API? The Control UI supports drag-and-drop attachments — can the bridge use the same mechanism? Does the `openclaw agent` CLI support `--attachment` or similar flags?

**Blocked by:** Understanding OpenClaw's media pipeline API for programmatic file submission.

## BL-011 — Shared component library (design system)

**Priority:** Medium | **Added:** 2026-04-11

Action buttons, modals, and form elements are inconsistent across the app. A `TbdcButton` component was created as a first step, but the following still need standardization:

- Modal component (currently inline in upload-modal.tsx)
- Form inputs (text, textarea — currently using raw `<input>` with inline classes)
- Toast/notification component (currently inline in file-editor.tsx)
- Chip/badge component (used in channel sidebar, filter bars, header chips)

## BL-012 — Upload attachment on Configure SCOTE chat

**Priority:** Low | **Added:** 2026-04-11

The 📎 upload button only appears on company channels (`tbdc-co-*`). The Configure SCOTE chat (`tbdc-configure`) doesn't have it. Ahmed may want to upload reference documents when training SCOTE's identity. Consider adding upload to the training page's chat pane, saving files to the workspace root or a `training/` subfolder.
