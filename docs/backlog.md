# Backlog

Open issues only. When an issue is resolved, **delete the row** — resolved work lives in [changelog.md](changelog.md), not here.

| ID     | Title                                     | Description                                                                                                                                                                                              | Priority |
| ------ | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| BL-001 | Turbopack dev crash on Windows            | `npm run dev` with Turbopack fails with `STATUS_DLL_INIT_FAILED 0xc0000142` when spawning the PostCSS loader subprocess. Worked around by using `next dev --webpack`. Revisit after future Next.js updates to see if Turbopack dev works again; Node/Windows combo sensitive. | Low      |
| BL-003 | Visual parity not yet spot-checked by dev | The design token port compiles clean and renders on `http://localhost:3001`, but a visual side-by-side against `reference/tbdc_investor_matching_poc_v2.html` has not been confirmed by the user yet. Any color/typography drift should be fixed before building real pages. | Medium   |
| BL-004 | Port 3000 collision on local machine      | Something unrelated to TBDC is holding port 3000 on Ahmed's machine (PID rotates). Dev server falls back to 3001. Not blocking, just confusing — identify the culprit and document it or move TBDC's dev port explicitly. | Low      |
