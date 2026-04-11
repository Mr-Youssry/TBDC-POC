# SCOTE Platform Vision

**From a $10/month demo to the operating system for venture ecosystems.**

*Ahmed Korayem & Ahmed Youssry — Ready4VC Inc. / GatheringX — Toronto, 2026*

---

## What We Proved

In one week, we built a working AI-powered partnerships management system for the Toronto Business Development Centre. It costs $10/month to run. It has:

- An AI analyst (SCOTE) that internalized an 11-step investor matching methodology and applies it with judgment — not keyword matching
- A structured database of 10 portfolio companies, 171 investors, and 63 scored matches with activation logic
- A training interface where a non-technical partnerships manager can edit the agent's identity, methodology, and knowledge base — like configuring a new hire
- Persistent per-company chat sessions where context accumulates across conversations
- A workspace file system where the agent maintains company profiles, daily memory logs, and methodology documentation
- Full database administration capabilities — the agent can query, create tables, and modify the schema autonomously

The total infrastructure: one DigitalOcean droplet ($24/month, shared with other projects), one z.ai API subscription ($10/month for GLM-4.5), and an OpenClaw gateway (open source, free).

The insight is not the technology. The insight is that **every incubator, accelerator, VC firm, and angel network in the world does some version of this work — and none of them have tooling that matches how the work actually happens.**

---

## The Problem Space

### Who does cohort-to-investor matching today?

| Organization type | How many exist | How they match today | What breaks |
|---|---|---|---|
| **Incubators** (TBDC, DMZ, MaRS, Techstars, Y Combinator, 500 Global) | ~7,000 globally | Spreadsheets, CRM, gut feel, warm intros from program managers | Staff turnover loses institutional knowledge. Matching quality depends entirely on who's running the program. No methodology survives a personnel change. |
| **Accelerators** (Plug and Play, Founders Factory, Antler, SOSV) | ~3,000 globally | Demo day + investor database, sometimes with a matching algorithm | Algorithms match on sector+stage only (failure mode 1). No activation logic. Demo day is a shotgun approach — every company pitches to every investor. |
| **Angel networks** (AngelList, Golden Triangle, York Angels, Maple Leaf Angels) | ~400 in North America alone | Deal flow screening + member distribution | Members self-select which deals to review. Network managers have no scoring rubric. Good deals get passed over because the email subject line wasn't compelling. |
| **VC firms** (portfolio support teams) | ~5,000 with 3+ portfolio companies | Portfolio support leads make intros from their personal network | Intros are relationship-driven, not methodology-driven. The quality of support depends on the individual, not the firm. When the portfolio support lead leaves, the intro pipeline collapses. |
| **Government programs** (BDC, EDC, NRC IRAP, provincial programs) | ~200 in Canada, thousands globally | Mandate-driven eligibility checks + referral to private capital | Eligibility is checked; fit is not. A company that qualifies for IRAP funding may still be a terrible match for the specific reviewer's portfolio. |
| **Solo entrepreneurs** | Millions | LinkedIn, warm intros, cold outreach, prayer | No system. No methodology. No data. Every founder reinvents the wheel. The ones with networks raise; the ones without networks don't. This is the most broken part of the ecosystem. |

### The common failure

Every one of these organizations has investor data. Every one of them has company data. None of them have a **methodology layer** that connects the two with judgment, exclusion logic, activation protocols, and persistent institutional memory.

The methodology is always in someone's head. When that person leaves, the methodology leaves with them.

---

## The Vision: Three Products

### Product 1: SCOTE for Cohorts (B2B SaaS)

**What it is:** A white-labeled platform for incubators, accelerators, and program managers to manage investor-company matching with an AI analyst that internalizes their specific methodology.

**Who buys it:** Program directors at incubators and accelerators. The person who currently manages investor relationships in a spreadsheet and loses sleep before demo day.

**How it works:**

1. **Onboarding.** The program manager goes through a training conversation with SCOTE (like we built in the SCOTE Training page). They describe their methodology — or use ours as a starting point. SCOTE internalizes it into AGENTS.md.

2. **Company intake.** Each cohort company fills out a structured intake form. SCOTE builds their investability profile automatically. The six dimensions (capital type, stage, revenue, ask size, geography, founder profile) are populated from the form and enriched from public data.

3. **Investor database.** The program seeds their investor database — or connects to the shared Global Investor Graph (Product 3). SCOTE profiles each investor on the seven scoring dimensions.

4. **Matching.** SCOTE runs the methodology: route → gate → score → classify → activate. Every match has a tier, a warm path classification, pre-conditions, and a named next step. No match lists without activation logic.

5. **Pipeline management.** Matched companies move through the pipeline: not_started → outreach_sent → meeting_set → follow_up → term_sheet → closed. SCOTE monitors the pipeline via heartbeat and flags stale Tier 1 matches.

6. **Institutional memory.** When the program manager changes, the methodology stays. It's in the files. The new PM reads SOUL.md, AGENTS.md, the company profiles — and SCOTE is the same analyst it was before the transition. This is the killer feature: **the methodology outlives the person.**

**Pricing model:** Per-cohort subscription. $200-500/month per active cohort. Includes the AI analyst, the database, the matching engine, the training interface, and the pipeline tracker. Self-hosted option for organizations with data sovereignty requirements.

**Target customers (first 10):**
- TBDC Toronto (current client — the proof)
- DMZ at Toronto Metropolitan University
- MaRS Discovery District
- Communitech (Waterloo)
- Creative Destruction Lab (multi-campus)
- Plug and Play (global, but city-by-city deployment)
- Techstars (per-program deployment)
- Founders Factory (London + global)
- Antler (per-hub deployment)
- SOSV (per-program: HAX, IndieBio, Chinaccelerator)

---

### Product 2: SCOTE for Founders (B2C / Prosumer)

**What it is:** A personal AI analyst for individual entrepreneurs who are fundraising. SCOTE helps them identify the right investors, prepare for outreach, and manage their pipeline — without needing a program manager.

**Who buys it:** Founders who are raising capital and don't have an incubator's investor network. The person currently cold-emailing 200 VCs from a Crunchbase export.

**How it works:**

1. **Founder profile.** The founder describes their company through a structured conversation. SCOTE builds their investability profile.

2. **Investor discovery.** SCOTE queries the Global Investor Graph (Product 3) to find investors that match on all seven dimensions — not just sector and stage. It runs the full methodology: route, gate, score, classify.

3. **Outreach preparation.** For each Tier 1 and Tier 2 match, SCOTE writes a custom outreach strategy: who to contact, how to frame the ask, what pre-conditions need to be met, and what warm paths exist through the founder's network.

4. **Pipeline tracking.** The founder logs intro outcomes. SCOTE maintains the pipeline and suggests next actions. When an investor passes, SCOTE adjusts the strategy.

5. **MCP integration.** For technical founders who already use Claude or Claude Code — SCOTE exposes the investor database as an MCP server. The founder can query investor data, run matches, and check their pipeline from their existing AI workflow without switching tools.

**Pricing model:** Freemium. Free tier: 5 investor matches per month, basic scoring. Paid tier ($29/month): unlimited matches, full activation logic, pipeline tracking, MCP access. Premium tier ($99/month): includes Global Investor Graph data feed.

**Distribution channels:**
- Product Hunt launch
- Y Combinator's Startup School (free resource for founders)
- Angel network partnerships (co-branded version)
- MCP marketplace (Claude Code plugin)

---

### Product 3: The Global Investor Graph (Data Platform)

**What it is:** A continuously updated graph database of investors, startups, investment rounds, fund statuses, partner movements, and deal flow — built from API subscriptions, public data, and community contributions.

**Who buys it:** Products 1 and 2 (internal consumption), plus direct API access for venture ecosystem tools.

**How it works:**

1. **Data sources.**
   - Crunchbase API — company profiles, funding rounds, investor portfolios
   - PitchBook API — detailed deal data, fund sizes, LP relationships
   - LinkedIn Sales Navigator API — partner activity, deal velocity signals, fund phase indicators
   - News APIs (TechCrunch, BetaKit, The Logic, Axios Pro Rata) — fund announcements, partner moves, thesis shifts
   - SEC/SEDAR filings — fund registration, LP disclosures
   - Community contributions — program managers update fund statuses when they learn something from a meeting

2. **Graph structure.** Neo4j or similar graph database:
   - **Nodes:** Investors, Funds, Partners, Companies, Rounds, Programs, LPs
   - **Edges:** invested_in, partner_at, raised_from, graduated_from, co_invested_with, moved_to
   - **Properties:** fund_phase, last_deal_date, deal_velocity, sector_thesis, geographic_mandate, cheque_range

3. **Feed system.** The graph generates a real-time feed of events:
   - "Radical Ventures announced $525M Fund III close" → triggers fund_phase update for all Radical portfolio companies
   - "Jordan Jacobs posted about manufacturing AI on LinkedIn" → thesis signal captured
   - "Golden Ventures partner Sarah Chen moved to Version One" → partner_at edge updated, old fund's coverage gaps identified
   - "BDC Cleantech Practice announced new $200M allocation" → non-dilutive funding opportunity surfaced to eligible companies

4. **Heartbeat integration.** SCOTE's heartbeat checks the feed. When a relevant event occurs for a matched investor or company, SCOTE surfaces it: "Earlybird just closed their new fund — they were in fundraising-hold for Omniful. Re-score and consider activating."

5. **API access.** Third-party tools can query the graph:
   - `GET /investors?sector=fintech&stage=seed&geography=canada&fund_phase=active`
   - `GET /investors/{id}/portfolio_gaps`
   - `GET /companies/{id}/warm_paths?through=accelerator_alumni`
   - `GET /feed?relevant_to=company:{id}&since=7d`

**Pricing model:** API subscription. $500/month for startups, $2,000/month for programs, $5,000/month for enterprise (VC firms, corporate development). Data contribution discount: programs that contribute fund status updates get 50% off.

**Moat:** The graph gets better with every program that uses it. Each incubator that runs SCOTE for Cohorts contributes data about investor responsiveness, meeting outcomes, and deal conversion — data that no public API has. Over time, the graph knows not just who invests in what, but **who responds to warm intros, who ghosted after a meeting, and who actually deploys capital when they say they will.**

---

## Additional Product Ideas

### SCOTE for VCs (Portfolio Support)

**What it is:** A version of SCOTE that sits inside a VC firm's portfolio support function. Instead of matching companies to investors, it matches portfolio companies to customers, partners, and talent.

**Who buys it:** Portfolio support leads at VC firms with 20+ portfolio companies.

**Use cases:**
- "Which of our portfolio companies could be a customer for this new company we're evaluating?"
- "Company X needs a VP Engineering in Toronto. Do any of our portfolio alumni fit?"
- "Company Y is expanding to Europe. Which of our LPs have European distribution networks?"

### SCOTE for Angel Networks (Deal Flow Screening)

**What it is:** A version that helps angel network managers screen deal flow and match incoming companies to the right member investors based on their stated preferences, past investment patterns, and portfolio gaps.

**Difference from the cohort version:** Angel networks don't have cohorts — they have continuous deal flow. SCOTE would run as a triage system: company applies → SCOTE scores against member preferences → top matches surfaced to relevant members.

### The Feed App (Mobile)

**What it is:** A mobile app that surfaces the Global Investor Graph's feed to individual users — founders, program managers, VCs.

**What it shows:**
- Personalized feed of investor events relevant to your pipeline
- Fund close announcements, partner moves, thesis shifts
- Push notifications for time-sensitive events ("Investor X just opened their new fund — you had them on hold")
- Quick actions: "Add to pipeline", "Schedule intro", "Share with team"

**Why mobile:** Investor intelligence is consumed in moments — between meetings, on the subway, before a call. A mobile feed matches the consumption pattern better than a dashboard.

### MCP Marketplace Plugin

**What it is:** SCOTE's investor matching capability packaged as an MCP server that any AI coding assistant can query.

**How it works:** A founder using Claude Code or Cursor types: "Find me Series A VCs in Canada that invest in supply chain SaaS and have portfolio gaps in logistics." SCOTE's MCP server processes the query against the Global Investor Graph and returns structured results — right in the IDE.

**Distribution:** Claude Code MCP marketplace, Cursor plugin store, VS Code marketplace.

### Cohort Analytics Dashboard

**What it is:** A dashboard for program directors that shows aggregate matching performance across cohorts:
- Intro-to-meeting conversion rate by investor
- Average time from Tier 1 match to first meeting
- Fund phase accuracy (how often did our fund phase assessment predict actual deployment?)
- Methodology effectiveness (which scoring dimensions best predict successful introductions?)

**Why it matters:** No incubator currently measures matching performance. They measure outcomes (did the company raise?) but not process (was the right investor introduced at the right time?). This dashboard makes the methodology auditable and improvable.

### White-Label Investor Portal

**What it is:** A read-only portal for investors that shows them which companies in the current cohort match their thesis — pre-scored, pre-qualified, with activation logic already attached.

**How it works:** Instead of sending investors a PDF of all companies (the current approach), the program sends a personalized link. The investor sees only the companies that score Tier 1 or Tier 2 for their specific profile, with the reasoning visible.

**Why it matters:** Investors get better signal (fewer irrelevant companies). Programs get better conversion (the investor sees only matches worth their time). The methodology is transparent — investors can see why a company was matched to them.

---

## Revenue Model Summary

| Product | Customer | Pricing | Year 1 Target |
|---|---|---|---|
| SCOTE for Cohorts | Incubators, accelerators | $200-500/mo per cohort | 10 programs, $36K ARR |
| SCOTE for Founders | Individual entrepreneurs | $29-99/mo | 500 users, $120K ARR |
| Global Investor Graph API | Ecosystem tools, VCs | $500-5,000/mo | 20 subscribers, $240K ARR |
| Feed App (Mobile) | Founders, PMs, VCs | $9.99/mo | Part of founder subscription |
| MCP Plugin | Technical founders | Included in founder tier | Distribution channel, not revenue |
| Cohort Analytics | Program directors | Add-on to cohort product | $100/mo add-on |
| Investor Portal | Programs (for their investors) | Add-on to cohort product | $150/mo add-on |

**Year 1 total ARR target:** ~$400K from 10 programs + 500 individual users + 20 API subscribers.

---

## Technical Architecture (Target State)

```
                                    ┌─────────────────────┐
                                    │  Global Investor     │
                                    │  Graph (Neo4j)       │
                                    │  + Feed Engine       │
                                    └──────────┬──────────┘
                                               │
                          ┌────────────────────┤────────────────────┐
                          │                    │                    │
                ┌─────────▼──────────┐ ┌──────▼───────┐ ┌─────────▼──────────┐
                │ SCOTE for Cohorts  │ │ SCOTE for    │ │   Graph API        │
                │ (per-tenant)       │ │ Founders     │ │   (public)         │
                │                    │ │              │ │                    │
                │ OpenClaw Gateway   │ │ Shared       │ │ REST + GraphQL     │
                │ + Plugin           │ │ multi-tenant │ │ + MCP Server       │
                │ + Workspace        │ │ gateway      │ │                    │
                └─────────┬──────────┘ └──────┬───────┘ └────────────────────┘
                          │                    │
                ┌─────────▼──────────┐ ┌──────▼───────┐
                │ Tenant Postgres    │ │ Shared       │
                │ (per-program)      │ │ Postgres     │
                │                    │ │ (multi-tenant│
                │ Companies,         │ │  or per-user │
                │ Investors,         │ │  partitioned)│
                │ Matches,           │ │              │
                │ Pipeline           │ │              │
                └────────────────────┘ └──────────────┘
                          │
                ┌─────────▼──────────┐
                │ Feed System        │
                │                    │
                │ Crunchbase API     │
                │ PitchBook API      │
                │ LinkedIn API       │
                │ News APIs          │
                │ SEC/SEDAR filings  │
                │                    │
                │ Heartbeat →        │
                │ push to tenants    │
                └────────────────────┘
```

---

## What Makes This Defensible

1. **The methodology layer is the moat, not the technology.** Anyone can build a CRM. No one has built a system where the matching methodology is externalized, trainable, persistent, and transferable between program managers. We have.

2. **The Global Investor Graph gets better with use.** Every program that runs SCOTE contributes signal about investor behavior — who responds, who deploys, who ghosts. This data doesn't exist in Crunchbase or PitchBook. It's proprietary and compounds.

3. **Network effects between products.** Founders using SCOTE for Founders discover investors through the graph. Those investors get better deal flow because programs using SCOTE for Cohorts pre-qualify companies. The more programs that use it, the more valuable the graph becomes for founders, and vice versa.

4. **Single-tenant architecture prevents vendor lock-in concerns.** Each program can self-host their SCOTE instance. The data stays with them. The graph is opt-in. This removes the biggest objection incubators have to SaaS tools: "who owns the data?"

5. **$10/month proof point.** We can demonstrate the entire system running on minimal infrastructure. The sales conversation starts with: "Here's a working demo. It costs $10/month. What would you pay for this if it had your investor database?"

---

## Next Steps

### Immediate (next 2 weeks)
- Demo TBDC POC to Ahmed Korayem's network — collect feedback from 3-5 program managers
- Record a 5-minute Loom walkthrough showing the full flow: training → matching → pipeline → heartbeat
- Package the SCOTE Training page as the "onboarding experience" for new programs

### Short-term (next 90 days)
- Deploy second tenant (different program, different methodology) to prove multi-tenancy
- Build the investor portal (white-label) as the first expansion module
- Integrate Crunchbase API as the first data source for the Global Investor Graph
- Build the mobile feed prototype (React Native or PWA)

### Medium-term (6-12 months)
- Launch SCOTE for Founders as a standalone product
- Build the MCP plugin for Claude Code / Cursor integration
- Add PitchBook and LinkedIn data sources to the graph
- Launch cohort analytics dashboard
- First paying customers on both products

### Long-term (12-24 months)
- Global Investor Graph API public launch
- SCOTE for VCs (portfolio support variant)
- Angel network deal flow screening variant
- Series A fundraise for Ready4VC / GatheringX based on ARR + graph data asset

---

*The best matching system is not the one with the most data. It's the one with the best judgment. We built the judgment layer. Everything else is distribution.*
