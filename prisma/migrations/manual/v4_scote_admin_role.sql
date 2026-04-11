-- TBDC POC — Full-access role for SCOTE's database administration tools.
-- Run by hand on the droplet after creating the role.
-- Requires superuser (keycloak role). Safe to re-run.
--
-- Usage:
--   docker exec shared-postgres psql -U keycloak -d tbdc_poc -f /tmp/v4_scote_admin_role.sql
--
-- This role has FULL DDL + DML on the tbdc_poc database.
-- It is intentionally overpowered — SCOTE is being tested for autonomous
-- database management on a demo environment.

-- 1. Create role if it doesn't exist
SELECT 'CREATE ROLE tbdc_scote LOGIN'
WHERE NOT EXISTS (
  SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'tbdc_scote'
)
\gexec

ALTER ROLE tbdc_scote WITH LOGIN PASSWORD 'scote-admin-demo-2026';

-- 2. Grant full access to the tbdc_poc database
GRANT ALL PRIVILEGES ON DATABASE tbdc_poc TO tbdc_scote;

-- 3. Grant schema-level permissions (DDL: CREATE TABLE, ALTER, DROP)
GRANT ALL ON SCHEMA public TO tbdc_scote;

-- 4. Grant full DML on all existing tables, sequences, functions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tbdc_scote;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO tbdc_scote;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO tbdc_scote;

-- 5. Set default privileges so SCOTE also has access to future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO tbdc_scote;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO tbdc_scote;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO tbdc_scote;

-- 6. Allow SCOTE to create types (enums) — needed for ALTER TYPE
GRANT CREATE ON SCHEMA public TO tbdc_scote;
