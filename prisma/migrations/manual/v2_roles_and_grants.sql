-- TBDC POC v2.0 — Postgres roles and grants for the OpenClaw Assistant
-- Run by hand after `prisma db push` on the droplet.
-- Requires superuser. Safe to re-run (all statements use IF NOT EXISTS / CREATE OR REPLACE).
--
-- Usage:
--   psql -v TBDC_ASSISTANT_PASSWORD="'the-real-password'" -f v2_roles_and_grants.sql
--
-- The single-quotes around the password value above are required because
-- psql :varname substitution is a literal text replacement, not a parameter
-- binding — the quotes become part of the CREATE ROLE statement.

-- 1. Restricted role for the OpenClaw tbdc-db plugin.
--
-- Postgres has no CREATE ROLE IF NOT EXISTS. Workaround: build the CREATE
-- ROLE statement conditionally as a row, then feed it back to psql via
-- \gexec. This is a psql-only pattern — it won't run via pgAdmin, DBeaver,
-- or any other SQL runner. That's fine: we always run it from psql on deploy.
SELECT format('CREATE ROLE tbdc_assistant LOGIN PASSWORD %L', :'TBDC_ASSISTANT_PASSWORD')
WHERE NOT EXISTS (
  SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'tbdc_assistant'
)
\gexec

-- 2. Sanitized User view (excludes passwordHash)
CREATE OR REPLACE VIEW v_user_public AS
  SELECT id, name, email, role FROM "User";

-- 3. SELECT grants on content tables + AuditLog + ChatSession + sanitized User view
GRANT SELECT ON
  "Investor", "Company", "Match", "DoNotMatch",
  "CustomerTarget", "IndustryEvent",
  "MethodologyDimension", "MethodologyCard",
  "AuditLog", "ChatSession",
  v_user_public
TO tbdc_assistant;

-- 4. INSERT/UPDATE grants on writable tables (NO delete, NO direct User access)
GRANT INSERT, UPDATE ON
  "Investor", "Company", "Match", "DoNotMatch",
  "CustomerTarget", "IndustryEvent",
  "MethodologyDimension", "MethodologyCard",
  "AuditLog", "ChatSession"
TO tbdc_assistant;

-- 5. Sequence usage (Prisma uses cuid() strings so no sequences today,
--    but future migrations may add serial columns)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO tbdc_assistant;

-- 6. Default privileges for future tables created in this schema
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE ON TABLES TO tbdc_assistant;

-- 7. (Manual verification — uncomment during deploy to sanity-check access pattern)
-- SET ROLE tbdc_assistant;
-- SELECT "passwordHash" FROM "User" LIMIT 1;
-- -- Expected: ERROR: permission denied for table User
-- SELECT id, email, role FROM v_user_public LIMIT 1;
-- -- Expected: 1 row
-- RESET ROLE;
