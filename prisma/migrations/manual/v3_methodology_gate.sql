-- v3: Add MethodologyGate table for hard gates (3 gates, spec revision 2026-04-10)
CREATE TABLE IF NOT EXISTS "MethodologyGate" (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  trigger TEXT NOT NULL,
  rationale TEXT NOT NULL,
  "sortOrder" INT NOT NULL DEFAULT 0,
  "updatedByUserId" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MethodologyGate_updatedByUserId_fkey"
    FOREIGN KEY ("updatedByUserId") REFERENCES "User"(id) ON DELETE SET NULL
);
