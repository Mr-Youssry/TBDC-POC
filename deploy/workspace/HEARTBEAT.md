# HEARTBEAT.md — Periodic Maintenance

Check the following on each heartbeat. Report only items that need attention.

## 1. Stale Tier 1 Matches
Use list_matches for each company. If any Tier 1 match has pipelineStatus "not_started" AND the match was created more than 7 days ago, flag it:
"⚠ {Company} × {Investor} is Tier 1 (score {X}/16) but pipeline status is still 'Not Started'. Consider activating."

## 2. Pipeline Stuck Items
Check for any match with pipelineStatus "outreach_sent" for more than 14 days without moving to "meeting_set" or "follow_up". Flag these for review.

## 3. Company Profile Gaps
Check if companies/*/profile.md exists for each company in the database. If any company is missing a profile, flag it.

## 4. Quick Summary
End with a one-line status: "{N} companies healthy, {M} items need attention."

If everything is fine, reply: HEARTBEAT_OK
