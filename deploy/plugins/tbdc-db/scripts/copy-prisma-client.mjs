// Copies the Prisma-generated client from the repo-root node_modules/.prisma
// into this plugin's own node_modules/.prisma so that the plugin can be
// bind-mounted standalone into the OpenClaw container at runtime.
//
// Why: Prisma 7's `prisma generate` walks upward from the schema location
// and writes the generated runtime into the nearest ancestor node_modules.
// Because `prisma/schema.prisma` lives at the repo root, generation lands in
// `<repo>/node_modules/.prisma/client/`, NOT in this plugin's own
// `node_modules/.prisma/`. At runtime, Node resolves `.prisma/client` by
// walking upward from the plugin's own node_modules — but inside the
// Docker container where only this directory is bind-mounted, the repo-root
// node_modules isn't present, so the plugin crashes with MODULE_NOT_FOUND.
//
// This script fixes that by copying the generated `.prisma` directory into
// the plugin-local `node_modules/.prisma/`, making the plugin self-contained.
// Runs as a `postprisma:generate` npm script so it fires automatically after
// every `npm run prisma:generate` (directly or via `npm run build`).

import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(pluginRoot, "..", "..", "..");

const src = path.join(repoRoot, "node_modules", ".prisma");
const dest = path.join(pluginRoot, "node_modules", ".prisma");

if (!existsSync(src)) {
  console.error(`[copy-prisma-client] source not found: ${src}`);
  console.error(
    "Run `npx prisma generate --schema=prisma/schema.prisma` at the repo root first,",
  );
  console.error(
    "or run this plugin's `npm run prisma:generate` (which generates to the repo-root",
  );
  console.error(
    "location, then triggers this copy script via the postprisma:generate hook).",
  );
  process.exit(1);
}

if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
mkdirSync(path.dirname(dest), { recursive: true });
cpSync(src, dest, { recursive: true });
console.log(`[copy-prisma-client] copied: ${src} -> ${dest}`);
