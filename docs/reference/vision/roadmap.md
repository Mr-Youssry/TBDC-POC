# SCOTE Platform — Product Roadmap

**Sequenced epics. Each one ships on top of the last. The database comes first — everything else queries it.**

*Ready4VC Inc. / GatheringX — 2026*

---

## The Build Order

```
Epic 1: Global Investor Graph          ← THE FOUNDATION (ship first)
  │     Crawlers + scrapers + API
  │     Neo4j graph database
  │     Relationship mapping
  │
  ├──► Epic 2: Query API + MCP          ← HOW PEOPLE ACCESS IT
  │     REST/GraphQL API
  │     MCP server for Claude/Cursor
  │     Flexible criteria queries
  │
  ├──► Epic 3: Feed Engine              ← WHAT KEEPS IT ALIVE
  │     Real-time event stream
  │     Heartbeat integration
  │     Push notifications
  │
  ├──► Epic 4: SCOTE for Cohorts v2     ← FIRST PAID PRODUCT
  │     Queries the graph (not local DB)
  │     Multi-tenant
  │     White-label
  │
  ├──► Epic 5: Warm Path Network        ← THE MOAT DEEPENS
  │     Contact list upload
  │     Connection matching
  │     Relationship scoring
  │
  ├──► Epic 6: SCOTE for Founders       ← MASS MARKET
  │     Personal AI analyst
  │     Queries the graph
  │     Pipeline tracking
  │
  └──► Epic 7: Mobile Feed App          ← DISTRIBUTION
        Personalized investor feed
        Push alerts
        Quick actions
```

---

## Epic 1: Global Investor Graph

**Ship target:** 8 weeks | **Prerequisite:** None — this is the foundation

### What it is

A master Neo4j graph database that continuously collects, normalizes, and connects data about investors, funds, partners, startups, rounds, and programs from every available source. This is not a static database — it runs crawlers and scrapers on a schedule, enriches records with API data, and builds relationships automatically.

### Why it ships first

Every other product is a view on top of this database. SCOTE for Cohorts currently has 171 investors in a local Postgres table — that's a seed, not a product. The graph replaces the local investor table with a queryable, continuously-updated, relationship-aware data layer that any product can query with whatever criteria they need.

### What's in the graph

**Nodes:**

| Node type | What it represents | Source |
|---|---|---|
| Investor | A firm (VC, Angel Network, Family Office, CVC, Government Program) | Crunchbase, PitchBook, manual seed |
| Fund | A specific fund vehicle (e.g., "Radical Ventures Fund III, $525M, 2025") | Crunchbase, SEC/SEDAR, news |
| Partner | An individual GP, Managing Director, or decision-maker | LinkedIn, Crunchbase, fund websites |
| Company | A startup that has received or is seeking investment | Crunchbase, PitchBook, program data |
| Round | A specific funding event (Series A, $10M, Jan 2026) | Crunchbase, PitchBook, press |
| Program | An incubator, accelerator, or government program | Manual seed, program websites |
| LP | A limited partner in a fund | SEC filings, PitchBook (where available) |

**Edges (relationships):**

| Edge | From → To | What it captures |
|---|---|---|
| MANAGES_FUND | Investor → Fund | Which firm runs which fund |
| PARTNER_AT | Partner → Investor | Which individual works at which firm, with role and dates |
| INVESTED_IN | Fund → Round | Which fund participated in which round |
| RAISED | Company → Round | Which company raised which round |
| GRADUATED_FROM | Company → Program | Which company went through which program |
| CO_INVESTED_WITH | Investor → Investor | Co-investment relationships (derived from shared rounds) |
| MOVED_TO | Partner → Investor | Career history — who moved where and when |
| LP_IN | LP → Fund | Who funded the fund (where available) |
| BOARD_SEAT | Partner → Company | Board relationships |

**Properties on nodes (examples):**

| Node | Key properties |
|---|---|
| Investor | type, geography, sector_thesis, stage_appetite, cheque_range, fund_phase, deal_velocity_12m, last_deal_date |
| Fund | size, vintage_year, deployment_status, remaining_capacity_estimate |
| Partner | name, title, linkedin_url, content_signals, thesis_keywords |
| Company | name, stage, sector, arr, geography, last_round_date, total_raised |

### Data collection architecture

```
┌──────────────────────────────────────────────────────┐
│                    Scheduler (cron)                    │
│                                                       │
│  Daily:   LinkedIn scraper (partner activity)         │
│  Daily:   News API crawler (fund announcements)       │
│  Weekly:  Crunchbase API sync (rounds, portfolios)    │
│  Weekly:  Fund website crawler (team pages, thesis)   │
│  Monthly: PitchBook API sync (deep fund data)         │
│  Monthly: SEC/SEDAR filing crawler (fund registrations)│
│  On-demand: Manual enrichment from program managers   │
└─────────────┬────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────┐
│  Normalization Pipeline  │
│                          │
│  Deduplicate entities    │
│  Resolve name variants   │
│  Merge cross-source data │
│  Compute derived edges   │
│  (co-investment, etc.)   │
└─────────────┬────────────┘
              │
              ▼
┌──────────────────────────┐
│  Neo4j Graph Database    │
│                          │
│  Nodes: ~50K initial     │
│  Edges: ~200K initial    │
│  Growth: ~5K nodes/month │
└──────────────────────────┘
```

### Crawlers and scrapers (Sprint breakdown)

**Sprint 1 (weeks 1-2): Core graph schema + seed data**
- [ ] Design Neo4j schema (node labels, edge types, property schemas)
- [ ] Seed graph from existing TBDC data (171 investors, 10 companies, 63 matches)
- [ ] Build the normalization pipeline skeleton (Python)
- [ ] Write import scripts for CSV/JSON → Neo4j
- [ ] Deploy Neo4j on the droplet (Docker container on rafiq-dev)

**Sprint 2 (weeks 3-4): Crunchbase integration**
- [ ] Crunchbase API client (Python, rate-limited, cached)
- [ ] Investor profile enrichment (portfolio, rounds, team)
- [ ] Company profile enrichment (funding history, metrics)
- [ ] Round data ingestion (amount, date, participants, lead)
- [ ] Co-investment edge derivation (shared rounds → COINVESTED_WITH)
- [ ] Weekly sync cron job

**Sprint 3 (weeks 5-6): LinkedIn + news crawlers**
- [ ] LinkedIn profile scraper (partner pages, limited to public data or Sales Navigator API)
- [ ] Content signal extractor (recent posts → thesis keywords, sector conviction)
- [ ] Deal velocity calculator (new investments in last 12 months)
- [ ] Fund phase inferencer (close date + deal velocity + content signals → phase estimate)
- [ ] News API crawler (TechCrunch, BetaKit, Axios Pro Rata)
- [ ] Fund announcement parser (NLP: extract fund name, size, close date from articles)
- [ ] Daily sync cron jobs

**Sprint 4 (weeks 7-8): Fund website crawler + SEC/SEDAR**
- [ ] Fund website team page scraper (partner names, titles, bios)
- [ ] Thesis page extractor (sector focus, stage, geography)
- [ ] SEC EDGAR filing crawler (Form D for US funds)
- [ ] SEDAR filing crawler (Canadian fund registrations)
- [ ] LP extraction where available (public pension fund disclosures)
- [ ] Monthly sync cron jobs
- [ ] Data quality dashboard (coverage metrics, freshness, gaps)

### Deliverable

A running Neo4j instance with ~50K nodes (investors, funds, partners, companies, rounds) and ~200K edges, updated daily from automated crawlers. Queryable via Cypher. No API yet — that's Epic 2.

---

## Epic 2: Query API + MCP Server

**Ship target:** 4 weeks | **Prerequisite:** Epic 1

### What it is

A REST/GraphQL API and an MCP server that lets any product — or any individual user with Claude/Cursor — query the Global Investor Graph with flexible criteria. This is how SCOTE (and everyone else) accesses the data.

### Why this architecture matters

The current TBDC POC has investors hardcoded in Postgres. When we ship the graph, SCOTE won't have its own investor database anymore — it will query the graph for investors that match the criteria for each company. This means:

- **Any matching methodology works.** A program that scores on 7 dimensions queries the graph differently than one that scores on 3. The graph doesn't impose a methodology — it provides the data. The methodology lives in SCOTE's AGENTS.md.
- **Queries are parametric.** "Find me active-deploying VCs in Canada that invest $2-5M in seed-stage SaaS companies with portfolio gaps in supply chain" is a Cypher query, not a feature request.
- **Results are fresh.** The graph is updated daily. A query today returns investors whose fund phase was verified this week, not six months ago.

### API design

**REST endpoints:**

```
GET  /v1/investors?sector=fintech&stage=seed&geography=canada&fund_phase=active
GET  /v1/investors/{id}
GET  /v1/investors/{id}/portfolio
GET  /v1/investors/{id}/portfolio_gaps?sector=supply-chain
GET  /v1/investors/{id}/co_investors
GET  /v1/investors/{id}/partners

GET  /v1/companies/{id}
GET  /v1/companies/{id}/rounds
GET  /v1/companies/{id}/warm_paths?through={user_connection_list_id}

GET  /v1/funds?status=active&vintage_after=2024&min_size=50M
GET  /v1/funds/{id}/deployment_status

GET  /v1/partners/{id}
GET  /v1/partners/{id}/career_history
GET  /v1/partners/{id}/content_signals

GET  /v1/search?q=AI+manufacturing+canada+series-a
POST /v1/match
     { company_profile: {...}, criteria: {...}, limit: 20 }

GET  /v1/feed?relevant_to=company:{id}&since=7d
GET  /v1/feed?relevant_to=investor:{id}&since=30d
```

**MCP server tools (for Claude Code / Cursor):**

```
search_investors(query, filters)     → structured investor results
get_investor_detail(id)              → full profile with portfolio
find_warm_paths(company_id, user_connections) → relationship paths
match_company(company_profile, criteria) → scored matches
get_feed(entity_id, since)           → recent events
```

### Sprint breakdown

**Sprint 5 (weeks 9-10): REST API**
- [ ] FastAPI (Python) or Express (Node) API layer over Neo4j
- [ ] Investor search with filters (sector, stage, geography, fund_phase, cheque_range)
- [ ] Company lookup and round history
- [ ] Partner profiles and career history
- [ ] Co-investment network queries
- [ ] Portfolio gap analysis endpoint
- [ ] Rate limiting, API key auth, usage tracking

**Sprint 6 (weeks 11-12): MCP Server + SCOTE integration**
- [ ] MCP server wrapping the REST API
- [ ] Claude Code / Cursor integration testing
- [ ] SCOTE plugin migration: replace local `list_investors` with graph API queries
- [ ] SCOTE AGENTS.md update: "when matching, query the Global Investor Graph instead of the local database"
- [ ] Documentation and examples

### Deliverable

A running API + MCP server. SCOTE queries the graph instead of its local investor table. Any Claude Code user can install the MCP plugin and search investors.

---

## Epic 3: Feed Engine

**Ship target:** 3 weeks | **Prerequisite:** Epic 1 + Epic 2

### What it is

A real-time event processing system that watches the graph for changes and generates a feed of relevant events for each entity (company, investor, program). The feed is what makes the graph alive — it's not just a snapshot, it's a stream of signals.

### How it works

```
Graph change detected (new edge, updated property)
        │
        ▼
  Event classifier
  "What happened?"
        │
        ├── Fund close announced          → notify programs with matched companies
        ├── Partner moved to new firm     → update coverage, flag orphaned relationships
        ├── New investment detected       → update deal velocity, check portfolio gaps
        ├── Company hit revenue milestone → trigger re-scoring for monitored matches
        ├── Fund phase changed            → unblock/block pending introductions
        └── Thesis signal detected        → surface to programs with sector alignment
        │
        ▼
  Relevance matcher
  "Who cares about this?"
        │
        ├── Programs monitoring this investor  → push to SCOTE heartbeat
        ├── Founders with this investor in pipeline  → push notification
        ├── VCs with co-investment relationship → portfolio alert
        └── API subscribers watching this entity → webhook
        │
        ▼
  Delivery
        ├── In-app feed (web + mobile)
        ├── SCOTE heartbeat integration
        ├── Webhook to subscriber endpoints
        ├── Email digest (daily/weekly)
        └── Push notification (mobile)
```

### Sprint breakdown

**Sprint 7 (weeks 13-14): Event detection + feed storage**
- [ ] Change detection layer on Neo4j (triggers on node/edge create/update)
- [ ] Event classification pipeline
- [ ] Feed storage (PostgreSQL or Redis stream)
- [ ] Relevance matching engine (who has subscribed to what)
- [ ] Feed API endpoint (`GET /v1/feed`)

**Sprint 8 (week 15): Delivery channels**
- [ ] SCOTE heartbeat feed integration (HEARTBEAT.md reads the feed)
- [ ] Webhook delivery for API subscribers
- [ ] Email digest generation (daily summary)
- [ ] Push notification infrastructure (for Epic 7 mobile app)

### Deliverable

SCOTE's heartbeat now checks the global feed — not just its local database. Programs get notified when an investor they matched goes from "fundraising" to "active." Founders get a push when their pipeline investor closes a new fund.

---

## Epic 4: SCOTE for Cohorts v2 (Multi-Tenant)

**Ship target:** 4 weeks | **Prerequisite:** Epic 2 (API)

### What it is

The current TBDC POC, but multi-tenant. Each program gets their own SCOTE instance with their own methodology, company data, and workspace — but they all query the shared Global Investor Graph.

### What changes from the POC

| POC (current) | v2 (multi-tenant) |
|---|---|
| 171 investors in local Postgres | Queries the Global Investor Graph API |
| Single OpenClaw gateway | One gateway per tenant (Docker containers) |
| Hardcoded TBDC methodology | Trainable per-program methodology |
| Manual deployment | Self-service onboarding |
| $10/month on shared droplet | Per-tenant pricing ($200-500/mo) |

### Sprint breakdown

**Sprint 9 (weeks 16-17): Tenant provisioning**
- [ ] Tenant database (who has an account, billing status, config)
- [ ] Automated gateway provisioning (create OpenClaw container, Postgres DB, workspace)
- [ ] Onboarding flow (sign up → configure methodology → import companies → go)
- [ ] Tenant isolation (separate Docker networks, separate DB schemas)

**Sprint 10 (weeks 18-19): Graph integration + billing**
- [ ] Replace local investor data with graph API queries
- [ ] Per-tenant API key for graph access
- [ ] Stripe integration for billing
- [ ] Usage tracking (queries, matches, storage)
- [ ] Admin dashboard for tenant management

### Deliverable

Second program deployed (not TBDC). Different methodology. Same infrastructure. Paying customer.

---

## Epic 5: Warm Path Network

**Ship target:** 4 weeks | **Prerequisite:** Epic 2 (API)

### What it is

Users upload their contact lists (LinkedIn connections, email contacts, CRM exports). The system matches their contacts against the Global Investor Graph and identifies warm paths — "You know Sarah Chen at Golden Ventures through your YC batchmate" — with a relationship score.

### Why this is the moat

Crunchbase tells you who invested in what. LinkedIn tells you who you know. Nobody tells you **who you know who knows an investor** — and scores the strength of that connection. This is the data that program managers carry in their heads and lose when they change jobs. We externalize it, make it queryable, and compound it across all users.

### How it works

1. **Upload contacts.** User imports LinkedIn connections CSV, Google Contacts, or CRM export.
2. **Match to graph.** System matches contacts against Partner and Investor nodes in the graph using name + company + title fuzzy matching.
3. **Build relationship paths.** For each matched contact, traverse the graph: contact → works_at → investor. Contact → co_invested_with → investor. Contact → graduated_from → program → other_alumni → works_at → investor.
4. **Score relationships.** Each path gets a strength score based on: directness (1st degree vs 2nd degree), recency (met last month vs 3 years ago), context (co-investor vs conference acquaintance).
5. **Store on portfolio.** Warm paths are recorded on the user's portfolio/company record. When SCOTE matches a company to an investor, it checks: "Does anyone in this program have a warm path to this investor?"

### Sprint breakdown

**Sprint 11 (weeks 20-21): Contact upload + matching**
- [ ] Contact import (LinkedIn CSV, Google Contacts, VCF, manual entry)
- [ ] Fuzzy matching engine (name + company + title → graph node resolution)
- [ ] Contact → Investor path discovery (Cypher traversal queries)
- [ ] Relationship strength scoring algorithm

**Sprint 12 (weeks 22-23): Portfolio integration**
- [ ] Warm path storage per company-investor pair
- [ ] SCOTE integration: warm path lookup during matching
- [ ] Warm path sharing across program team (program manager + associates)
- [ ] MCP tool: `find_warm_paths(company, investor)` → returns paths with scores
- [ ] Privacy controls (users choose what to share, what stays private)

### Deliverable

Ahmed uploads his 2,000 LinkedIn connections. The system finds 47 matches to graph nodes. 12 of those create warm paths to investors currently in Tier 1 matches. SCOTE's activation logic now says "Warm via Ahmed's LinkedIn connection to Jordan Jacobs (met at Collision 2025)" instead of "Cold."

---

## Epic 6: SCOTE for Founders

**Ship target:** 4 weeks | **Prerequisite:** Epic 2 (API) + Epic 5 (warm paths)

### What it is

A standalone product for individual entrepreneurs. Same AI analyst, same methodology engine, but designed for a founder managing their own fundraise — not a program manager managing a cohort.

### Key differences from the cohort version

| Cohort version | Founder version |
|---|---|
| 10-30 companies per instance | 1 company per user |
| Program manager operates SCOTE | Founder operates SCOTE directly |
| Methodology set by program | Methodology is default (our rubric) or customized |
| Investor data from program's curation | Investor data from Global Investor Graph |
| Warm paths from program team | Warm paths from founder's own contacts |

### Sprint breakdown

**Sprint 13 (weeks 24-25): Founder onboarding + matching**
- [ ] Sign-up flow (email, company name, one-minute intake form)
- [ ] Auto-build investability profile from intake answers
- [ ] Graph query: find matching investors based on profile
- [ ] Display matches with tier, activation logic, warm paths
- [ ] Pipeline tracker (drag-and-drop kanban or simple list)

**Sprint 14 (weeks 26-27): MCP + distribution**
- [ ] MCP plugin packaging for Claude Code marketplace
- [ ] Cursor plugin
- [ ] Product Hunt launch preparation
- [ ] Referral system (founder refers founder → both get premium features)
- [ ] Stripe billing (freemium + paid tiers)

### Deliverable

A founder signs up, describes their company in 60 seconds, and gets a scored investor list with activation logic — warm paths included if they uploaded contacts. Available as a web app or an MCP plugin.

---

## Epic 7: Mobile Feed App

**Ship target:** 4 weeks | **Prerequisite:** Epic 3 (feed engine)

### What it is

A mobile app (React Native or PWA) that shows a personalized feed from the Global Investor Graph. Investor events relevant to your pipeline, delivered where you consume information — between meetings, on the subway, before a call.

### Sprint breakdown

**Sprint 15 (weeks 28-29): Core feed app**
- [ ] React Native or PWA setup
- [ ] Auth (shared with web accounts)
- [ ] Personalized feed rendering (events relevant to user's companies/investors)
- [ ] Push notifications for high-signal events
- [ ] Quick actions: "Add to pipeline", "Share with team", "Dismiss"

**Sprint 16 (weeks 30-31): Social features**
- [ ] Share events with team members
- [ ] Comment on events ("I know this GP — I'll intro")
- [ ] Bookmark investors for later
- [ ] Weekly digest email generated from feed

### Deliverable

A mobile app that a program manager or founder opens 3 times a day to check: "What changed in my investor universe since this morning?"

---

## Summary Timeline

| Epic | Weeks | What ships | Revenue impact |
|---|---|---|---|
| 1. Global Investor Graph | 1-8 | Running graph database with 50K+ nodes, daily crawlers | Foundation — no direct revenue |
| 2. Query API + MCP | 9-12 | REST API + MCP server, SCOTE queries the graph | API subscriptions begin ($500-5K/mo) |
| 3. Feed Engine | 13-15 | Real-time event stream, heartbeat integration | Retention — keeps users engaged |
| 4. SCOTE for Cohorts v2 | 16-19 | Multi-tenant platform, second paying program | First cohort revenue ($200-500/mo per program) |
| 5. Warm Path Network | 20-23 | Contact matching, relationship scoring | Deepens moat — proprietary relationship data |
| 6. SCOTE for Founders | 24-27 | Consumer product, MCP plugin | Mass market ($29-99/mo per founder) |
| 7. Mobile Feed App | 28-31 | Mobile feed with push notifications | Engagement + retention |

**Total timeline: ~8 months from start to full product suite.**

**Total investment: ~$15K in API subscriptions + infrastructure. No enterprise sales team needed for Year 1 — the product sells itself to people who currently do this work in spreadsheets.**

---

## The Moat Sequence

1. **Epic 1 builds the data asset.** Collecting, normalizing, and connecting investor data from multiple sources is expensive and time-consuming. Once built, it's a barrier to entry.

2. **Epic 5 builds the network asset.** Every user who uploads contacts adds proprietary relationship data that no API provides. This compounds — the more users, the more warm paths, the more valuable the graph.

3. **Epic 4 builds the methodology asset.** Every program that trains SCOTE contributes a refined matching methodology. Over time, we learn which scoring dimensions actually predict successful introductions — data that no competitor has.

4. **These three assets reinforce each other.** Better data → better matches → more users → more relationship data → better warm paths → more valuable matches → more users. The flywheel spins.

Anyone can build the software. Nobody can replicate the compounding data + network + methodology advantage once it's running.
