# TOOLS.md — TBDC Database Tools

## tbdc-db Plugin (8 tools)

### Read tools
- **list_investors** — Query investors with optional filters (stage, sector, geography). Returns paginated results. Use this FIRST when asked about investor options.
- **get_company** — Get full company profile by ID. Includes investability dimensions, match counts, pipeline status.
- **list_matches** — Query matches with optional filters (companyId, investorId, tier). Returns scored matches with tier, warmPath, pipelineStatus.
- **get_methodology** — Returns the scoring rubric and tier thresholds. Reference this when explaining WHY a score is what it is.

### Write tools
- **update_match** — Update match fields (pipelineStatus, warmPath, rationale, warmPathBonus). Always pass actingUserId.
- **update_company** — Update company fields. Always pass actingUserId.
- **update_investor** — Update investor fields (fundPhase, stageAppetite, sectorThesis). Always pass actingUserId.
- **append_audit_note** — Add a note to the audit log for any entity. Use for recording decisions, observations, or action items.

### Conventions
- All write tools require `actingUserId` — this is injected into the message context by the bridge
- Pipeline statuses: not_started → outreach_sent → meeting_set → follow_up → term_sheet → closed_pass
- Tier thresholds: T1 = 13-16, T2 = 8-12, T3 = 4-7, DNM = 0-3
