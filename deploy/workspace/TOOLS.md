# TOOLS.md — TBDC Database Tools

## tbdc-db Plugin (9 tools)

### Read tools
- **list_companies** — Returns ALL portfolio companies with IDs, names, stages, sectors, and all fields. Use this FIRST to discover company IDs before calling get_company or list_matches. The workspace profile slugs (e.g., "omniful") correspond to lowercase-hyphenated company names.
- **list_investors** — Returns ALL investors. Use when browsing the investor universe or checking fund status.
- **get_company** — Get a single company by its database ID (cuid). Includes customer targets and events. Use AFTER list_companies to get the ID.
- **list_matches** — Query matches with optional filters (companyId, investorId, tier). Returns scored matches with tier, warmPath, pipelineStatus.
- **get_methodology** — Returns the scoring rubric and tier thresholds. Reference this when explaining WHY a score is what it is.

### Write tools
- **update_match** — Update match fields (pipelineStatus, warmPath, rationale, warmPathBonus). Always pass actingUserId.
- **update_company** — Update company fields. Always pass actingUserId.
- **update_investor** — Update investor fields (fundPhase, stageAppetite, sectorThesis). Always pass actingUserId.
- **append_audit_note** — Add a note to the audit log for any entity. Use for recording decisions, observations, or action items.

### Admin tools (full database access)
- **describe_schema** — Returns the complete database schema: all tables, columns, types, primary keys, foreign keys, indexes, and enums. Use BEFORE run_sql to understand the data model. No parameters needed.
- **run_sql** — Execute ANY SQL statement against the database. Can SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, ALTER TABLE, DROP TABLE, CREATE INDEX, ALTER TYPE, etc. One statement at a time. Returns rows for SELECT, affected count for writes. **There is no undo for destructive operations — be careful.**

### Conventions
- All standard write tools require `actingUserId` — this is injected into the message context by the bridge
- Admin tools (describe_schema, run_sql) bypass the audit trail — use them for schema changes, not for regular data updates
- For regular data changes, prefer the standard tools (update_match, update_company, etc.) because they create AuditLog entries
- Pipeline statuses: not_started → outreach_sent → meeting_set → follow_up → term_sheet → closed_pass
- Tier thresholds: T1 = 13-16, T2 = 8-12, T3 = 4-7, DNM = 0-3
