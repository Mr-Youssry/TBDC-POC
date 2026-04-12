TBDC PARTNERSHIPS MANAGER — PART 1  
**Technology-Enabled Investor Matching**

Step-by-Step Build Documentation

*How it was built, why each decision was made, and what TBDC can implement immediately*

**Ahmed Korayem**

Ready4VC Inc. · GatheringX · Toronto

# **What This Document Is**

This is not a framework document. It is a build log — a step-by-step account of how the investor matching proof of concept was constructed, what decisions were made at each step, why they were made that way, and what was considered and rejected. It is written so that someone at TBDC who was not in the room can follow the reasoning and, where relevant, replicate or extend the work immediately without having to reverse-engineer it.

The companion to this document is the interactive HTML tool (TBDC Investor Matching POC v3), which is the working output the steps below produced. This document is the reasoning behind that output.

*A note on the problem statement: the ask is not 'build a tool.' The ask is 'how can TBDC leverage technology to better understand investors and their investment patterns, then match them to portfolio companies at scale?' The tool is the proof of concept. The step-by-step reasoning is the answer to how and why. Both matter — but the reasoning is what makes the tool replicable.*

**Step 1  Define the actual problem before choosing a tool**

**Decision: Start with the problem definition, not the technology choice.**

The first thing I did was resist the instinct to open a tool. The prompt asks for a proof of concept, and the first instinct for most people is to jump to a technology choice — build a Crunchbase scraper, set up an Airtable, prompt an AI model. That instinct skips the most important step: understanding why investor matching fails in the first place.

I spent time mapping the actual failure modes in investor-founder matching programs. Not theoretically — from direct experience running venture advisory work and observing how accelerators and programs manage their investor relationships. Three failure modes emerged consistently:

* Failure mode 1 — Matching on sector and stage alone. A program says 'Investor X funds FinTech at Seed' and matches them to every FinTech company at Seed in the cohort. But Investor X may require $100K ARR before a first meeting, may only write cheques in Canadian companies, and may already have two FinTech companies in portfolio. None of this is captured in 'FinTech, Seed.' The result is meetings that should never have happened, investor relationships eroded, and founders who got a polite pass with no explanation.

* Failure mode 2 — No exclusion logic. Some companies explicitly do not want investor introductions. Some are in quiet periods before a close. Some have been told by their lead investor not to take meetings. A matching system with no exclusion gate will surface these companies in every VC output, and the program manager who makes those introductions gradually loses credibility with both the investor and the founder.

* Failure mode 3 — Matching without activation logic. A match score is not an outcome. Knowing that Investor X is a strong match for Company Y does not tell you how to make the introduction, when to make it, what framing to use, or what the company needs to have in place before the meeting happens. Programs that generate match lists without activation protocols produce lists that nobody acts on.

**Why: Defining failure modes before building forces the solution to address the right problem.**

If I had started by choosing a tool, I would have optimized for whatever that tool is good at. Starting with the failure modes means every subsequent decision is evaluated against: does this solve failure mode 1, 2, or 3? A tool that does not address all three is not solving the problem.

**Considered and rejected: Starting with a tool audit ('what tools are available?').**

The available tools — Crunchbase, Airtable, LinkedIn Sales Navigator, PitchBook, AI APIs — are all capable of contributing to a solution. But the question of which to use is downstream of the question of what the solution needs to do. Answering 'which tool?' before 'what problem?' produces a solution shaped by the tool rather than by the problem.

**TBDC can replicate this by: Running a 30-minute internal audit of the last 20 investor introductions made by the program. For each: did the investor respond? Did a meeting happen? Did the meeting produce anything? If the answer is unknown for most of them, that is the baseline problem the system needs to fix. The audit takes half an hour and produces more insight than any tool.**

**Step 2  Design the investor taxonomy — starting with investor type, not sector**

**Decision: The taxonomy begins with investor type, not sector or stage. 'Investor' is not synonymous with 'VC.'**

The first version of this taxonomy defaulted to venture capital as the investor category. That was a mistake worth naming explicitly, because it is the most common default in accelerator and incubator programs — and it systematically misserves a portion of every cohort.

Venture capital is one type of investor. It is the type with the most structured information available, the most organized presence at ecosystem events, and the most legible thesis documentation. That visibility creates a selection bias: programs match to VCs not because VCs are always the right fit, but because VCs are the easiest investor type to find and profile. The result is that companies well-suited to angel capital, family office patient money, corporate strategic investment, or non-dilutive government funding end up in a VC matching queue that was never designed for them.

Looking at the current cohort honestly: VEMOCO is self-sufficient, not actively raising, and open to strategic partners — a VC requiring a 10x return in seven years is structurally misaligned with their posture. WIDMO has €10M+ in non-dilutive funding and is raising CAD $2.5M for customer acquisition — this is a non-dilutive capital strategy by design, not by default. Voltie is raising $2M CAD for certification and GTM — a size that fits angels and government programs better than most VC mandates. SaMMY PC has a €12M mixed grant-plus-equity structure where the equity portion is more naturally suited to an impact-oriented family office than a returns-driven VC. Matching all four of these to VCs first is not just inefficient — it puts them in front of investors whose success metrics are structurally incompatible with what these companies actually need.

The investor type dimension sits before all other dimensions in the taxonomy. It determines which investor database a company is matched against. The seven scoring dimensions that follow all operate within a type — they do not run across types.

**Investor type taxonomy**

| Investor type | What defines this type | When it is the right fit |
| :---- | :---- | :---- |
| Venture Capital (VC) | Institutional, fund-based, return-driven, time-horizoned (typically 7–10 year fund lifecycle). Requires portfolio-level returns — most investments expected to return 0, a few expected to return 10x+. | Companies with a clear path to large-scale exit (acquisition or IPO), operating in large or fast-growing markets, raising structured equity rounds, and willing to accept board seats and investor governance in exchange for capital. |
| Angel / Angel Network | Individual or organized group of high-net-worth individuals investing personal capital. More flexible on terms, ticket size, and governance than institutional VCs. Often sector-specific by personal conviction. | Early-stage companies that need capital plus a specific domain expert's network, companies too early for institutional VC, and founders who want a less structured investor relationship in the first round. |
| Family Office | Private wealth management vehicles for high-net-worth families. Patient capital with no fund lifecycle pressure. Often relationship-driven and willing to take minority stakes without governance demands. | Companies that need long-horizon capital without the pressure of a VC fund's return timeline. Particularly relevant for capital-intensive businesses, international expansion plays, and founders who want a long-term financial partner rather than an active board member. |
| Corporate / Strategic (CVC) | Corporate venture capital arms or strategic investment divisions of large companies. Return motive is mixed — financial return plus strategic value (distribution, IP, market access, talent pipeline). | Companies whose product or technology gives a specific corporate partner a competitive advantage, distribution channel, or market access benefit. The strategic fit matters as much as the financial return — and sometimes more. |
| Non-dilutive — Government Programs | Federal and provincial grants, repayable contributions, and structured programs (SR\&ED, NRC IRAP, SDTC, FedDev, BDC non-repayable, OMAFRA, CMF, etc.). No equity taken. Typically tied to Canadian operations, job creation, or sector mandates. | Companies with Canadian operations, R\&D activity, or export potential that qualify under specific program mandates. Particularly relevant for hardware companies (Voltie), deep tech (WIDMO, Quanscient), and international companies establishing Canadian presence. |
| Non-dilutive — Foundations and Impact Investors | Mission-driven capital from foundations, endowments, or impact funds. Return expectation is below market or blended (financial \+ social/environmental return). Often tied to ESG mandates. | Companies with a measurable social or environmental impact thesis — cleantech (Voltie, Cycle Capital adjacency), maritime sustainability (SaMMY PC), or financial inclusion (Aibo's bilingual underserved market angle). The impact framing must be genuine and quantifiable. |
| Revenue-Based Financing (RBF) | Capital provided in exchange for a percentage of future revenue until a fixed repayment cap is reached. No equity dilution, no fixed repayment schedule. Providers include Clearco, Lighter Capital, and others. | Companies with predictable, recurring revenue (SaaS ARR) who need growth capital without dilution and are not yet at a stage or scale where VC terms are favourable. VEMOCO ($501K–$1M ARR, not actively raising equity) is the most natural candidate in this cohort. |

**Why: Investor type is the zeroth dimension because a mismatch here makes all other matching irrelevant.**

A family office and a VC can both score 14/16 on the seven scoring dimensions that follow. But they are not interchangeable — they have different return expectations, different governance demands, different decision timelines, and different relationships with the company after the cheque is written. Presenting both to a founder as equivalent 'strong matches' is misleading. The investor type dimension ensures that the matching output tells the founder not just who to talk to, but what kind of relationship they are entering.

The seven dimensions below operate within an investor type. They score how well a specific VC (or angel, or family office) matches a specific company — not whether VC is the right type for that company in the first place. That question is answered in Step 3\.

**The seven within-type scoring dimensions**

| Dimension | What it captures | Why it belongs in the taxonomy |
| :---- | :---- | :---- |
| Stage appetite | Pre-seed / Seed / Series A / Series B / Growth — with adjacent stage tolerance noted | Stage determines whether an investor can deploy into this company at all. A fund at the end of its Seed allocation cannot make a new Seed investment regardless of how strong the company is. For angels and family offices, stage is softer — but cheque size (next dimension) is the practical equivalent. |
| Cheque size range | Minimum and maximum in CAD or USD, with lead vs. follow noted | An investor who writes $500K cheques cannot lead a $5M round. This applies equally to VCs, angels, and family offices. The matching system must confirm that the investor can physically write the cheque the company needs. |
| Sector thesis | Primary thesis (high conviction) \+ adjacencies (opportunistic) | Applies to all investor types. A family office with a cleantech conviction will move faster and add more value than one taking a generalist approach. A corporate VC without a supply chain thesis will not write a cheque for Omniful regardless of how strong the company is. |
| Geographic mandate | Canada-only / Canada+US / Global / Region-specific | A structural kill switch for all investor types. Government programs are the most restrictive (Canadian operations required). VCs with Canadian mandates cannot invest in Latvia-based companies. Family offices often have no geographic restriction — which is itself a relevant signal. |
| Revenue / traction floor | Minimum ARR or traction signal required before engagement | Applies most strictly to institutional VCs and revenue-based financing providers. Angels and family offices often engage earlier. Non-dilutive programs have their own eligibility criteria that substitute for this dimension. |
| Lead or follow | Does this investor lead rounds or co-invest alongside a lead? | A program that introduces a company to three follow-only investors and no leads has not helped the company raise. For non-dilutive programs this dimension is replaced by 'eligible to apply directly vs. requires referral partner.' |
| Portfolio / mandate gap | What this investor is actively missing or mandated to fund | For VCs: portfolio gap analysis. For government programs: mandate alignment (does the company's sector, geography, and activity match the program's eligibility criteria?). For corporate strategics: strategic fit (does this company give the corporate partner something they cannot build internally?). |

**Considered and rejected: Treating 'investor' as synonymous with 'VC' throughout the taxonomy.**

This was the original design error. It produces a system that is accurate for the subset of companies suited to VC capital and systematically wrong for the rest. In a cohort of ten companies, two to three are likely better served by non-VC capital in the near term. A matching system that routes all ten to VCs first is correct 70–80% of the time and confidently wrong 20–30% of the time — which is not an acceptable error rate when each wrong introduction costs a relationship.

**TBDC can replicate this by: Building a separate database tab for each investor type — one for VCs, one for angels and angel networks, one for family offices, one for corporate strategics, and one for non-dilutive programs. Each tab uses the same seven column dimensions but with type-appropriate values. For example, the non-dilutive tab replaces 'Lead or follow' with 'Application pathway' (direct application vs. referral required) and replaces 'Revenue floor' with 'Eligibility criteria.' This takes one additional hour to set up and ensures that the matching system is searching the right population for each company.**

**Step 3  Route each company to the right investor type before scoring begins**

**Decision: Build a capital type routing table that maps company characteristics to investor type. Run this before any scoring logic.**

With the investor type taxonomy defined in Step 2, the next step was building the routing logic that determines which investor type population each company is matched against. This is the decision that happens before the seven-dimension scoring runs — and it is the decision that the original design skipped entirely by defaulting all companies to VCs.

The routing table uses four company characteristics to determine the primary and secondary investor type for each company. It is not a scoring system — it is a routing system. The output is a direction, not a rank.

| Company characteristic | Signal | Investor type indicated |
| :---- | :---- | :---- |
| Fundraising posture | Actively raising equity round with structured terms | VC (primary) \+ Angel Network (secondary for rounds \< $2M) |
| Fundraising posture | Open to strategic partners — not actively raising equity | Corporate Strategic (primary) \+ Family Office (secondary) \+ Revenue-Based Financing if ARR \> $500K |
| Fundraising posture | Explicitly not seeking investor introductions | Hard gate — route to customer facilitation or non-dilutive programs only |
| Capital structure | Non-dilutive funding already dominant (grants, government programs \> 50% of total capital raised) | Non-dilutive programs (primary) — equity round may exist but is not the first match |
| Capital structure | Mixed grant-plus-equity structure already in place | Impact investor or family office for equity portion — not a standard VC round structure |
| Round size | Raising \< $3M CAD | Angel networks, family offices, government programs, or early-stage VCs. Most institutional VCs do not lead rounds below $2M. |
| Round size | Raising $3M–$15M | VC (primary). Angels and family offices can participate but rarely lead at this size. |
| Round size | Raising \> $15M | VC (Series A+) or corporate strategic. Family offices can participate but rarely lead. |
| Revenue profile | Pre-revenue or \< $100K ARR | Angel networks, pre-seed VCs, government programs (NRC IRAP, SR\&ED). Most VCs require more traction. |
| Revenue profile | $100K–$1M ARR, recurring | Seed VCs, angels, family offices, Revenue-Based Financing eligible |
| Revenue profile | \> $1M ARR, recurring | Series A VCs, corporate strategics, family offices, Revenue-Based Financing at scale |
| Canadian operations | Canadian entity, team, or revenue present | All investor types eligible — government programs (NRC IRAP, SR\&ED, FedDev, SDTC) become accessible |
| Canadian operations | No Canadian presence — expanding to Canada | VC with global mandate, family office, corporate strategic. Government programs not yet accessible until Canadian entity is established. |
| Impact / ESG thesis | Measurable social or environmental impact central to the business model | Impact investors and ESG-mandate family offices (primary co-investors alongside sector VCs) |

**How the routing table was applied to the current cohort**

Running all ten cohort companies through this routing table before any VC scoring produced four re-routings that the original VC-default approach missed:

| Company | Routing outcome |
| :---- | :---- |
| **WIDMO Spectral** | Hard gate on fundraising posture (explicitly declined investor introductions). Routed to customer facilitation only. Their €10M+ non-dilutive capital structure also signals a deliberate strategy to avoid equity dilution — this is not a temporary posture. |
| **VEMOCO** | Fundraising posture is open to strategic partners — not actively raising equity. Primary route: corporate strategic investors and family offices. Secondary: Revenue-Based Financing (ARR $501K–$1M, recurring SaaS). VC matching held until VEMOCO signals an active equity raise. |
| **Voltie** | Round size is $2M CAD — below most VC lead thresholds. Canadian expansion creates government program eligibility. Primary route: angel networks (cleantech-focused), government programs (BDC Cleantech, NRC IRAP, provincial EV programs). Cycle Capital and Greensoil remain relevant as sector-specialist VC exceptions to the round size filter. |
| **SaMMY PC** | Mixed grant-plus-equity structure already in place (€12M total). The equity portion of any Canadian raise is more naturally suited to an impact-oriented family office or ESG-mandate investor than a returns-driven VC. Northzone and Greensoil remain relevant as sector-specialist exceptions with ESG alignment. |
| **All others** | Actively raising equity rounds of $1M+ with VC-compatible traction and posture. Standard VC matching proceeds. Angel networks flagged as secondary for Aibo (pre-revenue, pre-seed) and Fermi Dev (early seed, smaller round). |

**Why: Routing before scoring means the scoring produces accurate results rather than accurate-looking ones.**

A matching system that scores VEMOCO against 24 VCs and produces a ranked list is technically functional. It is also misleading — VEMOCO is not seeking equity investment, so a Tier 1 VC match is a recommendation to introduce a company to an investor type the company has not asked for and does not need right now. Routing before scoring prevents this. The output for VEMOCO is not a VC match list — it is a corporate strategic and RBF match list, with a note that VC matching activates when fundraising posture changes.

**Considered and rejected: Routing based on the company's self-reported investor type preference.**

Founders frequently self-report investor type preferences inconsistent with their actual capital structure. A founder who says 'we are open to any investor' and has €10M+ in non-dilutive funding has revealed a capital strategy through their behaviour, not through stated preference. The routing table uses observable characteristics — capital structure, round size, fundraising posture, revenue profile — not stated preferences.

**TBDC can replicate this by: Adding a 'Capital Type Route' field to the company intake form. The field has five options: VC Track, Angel/Early Track, Corporate Strategic Track, Non-dilutive Track, and Mixed/Hold. Fill this in at onboarding using the routing table above — it takes 5 minutes per company. It determines which investor database tab the company is matched against first. Review at every cohort check-in, as posture changes when companies hit milestones or close rounds.**

**Step 4  Check fund phase before scoring — is this investor actively deploying?**

**Decision: A fund that has deployed all its capital cannot write a new cheque. A fund in active fundraising is distracted. Neither should appear in a match output as if they were ready to invest.**

This step was not in the original design. It was identified as a gap for a specific reason: a fund that is a perfect thesis match on all seven scoring dimensions is still a wasted introduction if they have no capital left to deploy. The company gets a meeting, hears encouraging language, receives warm signals from a partner who genuinely likes the deal — and then waits months for a decision that was never going to come because the fund has no remaining deployment capacity.

This happens more often than the ecosystem acknowledges publicly. VCs do not announce that they are approaching full deployment. There is social and reputational pressure to keep taking meetings even when capital is constrained. Partners continue attending events, responding to warm introductions, and engaging with founders — because maintaining those relationships has long-term value regardless of whether a cheque can be written today. The result is that a program manager relying on a static investor database — one that was accurate 18 months ago — makes introductions to funds that are in follow-on mode, harvest mode, or actively fundraising for their next vehicle, and cannot figure out why conversion rates have dropped.

**The four fund phases and what each one means for matching**

| Fund phase | Match action and reasoning |
| :---- | :---- |
| **Active deployment — confirmed** | Proceed to full scoring. The fund has recently closed a new vehicle and is writing new cheques at normal pace. This is indicated by: announced fund close within the last 24 months, deal velocity of 4+ new investments in the last 12 months, and partner activity on LinkedIn focused on new portfolio companies rather than LP relations. |
| **Likely active — unconfirmed** | Proceed to scoring with a verification flag. Deal velocity and public signals suggest active deployment but the fund close date is not confirmed. Before making a Tier 1 introduction, the Partnerships Manager should make one quick verification — a LinkedIn check on recent investments or a brief direct message to the partner. This takes 5 minutes and prevents a wasted introduction. |
| **Fundraising for next vehicle** | Hold — reactivate 3–6 months after new fund close is announced. Partners are spending 30–50% of their time on LP meetings. New investments slow or stop. The fund may still take meetings to maintain pipeline for the new vehicle, but decision timelines extend significantly and the probability of a close before the new fund is secured is low. Flag these investors in the database and set a calendar reminder to reactivate when the new close is announced. |
| **Follow-on period or end of life** | Remove from active matching — move to relationship maintenance list. The fund is reserving capital for existing portfolio companies or managing exits. New investments from this vehicle are extremely unlikely. The relationship still has value — this partner may become relevant again when they close their next fund — but they should not appear in active match outputs. Maintain the relationship through the Partnerships Manager's broader network touchpoints, not through company introductions. |

**Observable signals for fund phase — what to look for and where**

Fund phase is not always publicly disclosed, but it is consistently inferrable from a combination of signals. The following are listed in order of reliability:

| Signal | How to read it |
| :---- | :---- |
| **Announced fund close date** | The most reliable signal. When a fund announces a close, they are entering active deployment. Track these announcements via LinkedIn, TechCrunch, BetaKit, and the fund's own communications. A fund that closed within the last 24 months is almost certainly still in active deployment. A fund that closed 4+ years ago without announcing a new vehicle is likely in follow-on or harvest mode. |
| **Deal velocity — new investments in the last 12 months** | Count new portfolio company announcements on LinkedIn and Crunchbase for the last 12 months. A fund making 6–10 new investments per year is actively deploying. A fund making 1–2 is either highly selective, in follow-on mode, or capital-constrained. A fund making 0 is not deploying. This is the single most useful proxy for deployment status when fund close dates are not public. |
| **Partner LinkedIn content** | Partners in active deployment mode post about new portfolio companies, founder announcements, and sector conviction. Partners in fundraising mode post about fund thesis, LP-facing thought leadership, and ecosystem trends. Partners in follow-on mode post about portfolio milestones and exits. The content pattern shifts noticeably across phases — it takes 2 minutes to scan a partner's last 20 posts and make a directional call. |
| **Fund size and portfolio count ratio** | A $100M fund with 30 portfolio companies is approaching or at full deployment, assuming $2–3M average cheque with reserves. A $100M fund with 10 portfolio companies is mid-deployment. This is rough math — reserve ratios vary — but it is a useful directional check when combined with deal velocity data. |
| **Time since last investment announcement** | If the last publicly announced investment was 12+ months ago and there is no new fund close announcement, the fund is likely in follow-on mode or facing constraints. This is the weakest signal on its own but useful as a confirming data point alongside others. |

**How this was applied to the current cohort investor database**

Running the 24 investors in the current database through a fund phase check produced three immediate status updates that would have affected the match outputs:

*Specific fund phase statuses for individual investors are not published here because they change on a rolling basis and any status written today may be inaccurate within 3–6 months. The principle is documented; the application requires live research at the time of matching. The quarterly maintenance review in Step 11 includes a specific fund phase audit for this reason.*

The general finding from the fund phase check: two to three of the 24 investors in any given database of Canadian and international VCs are likely in a constrained deployment phase at any point in time. Without this gate, those investors appear in match outputs as fully active options — which means roughly 10–15% of Tier 1 introductions made from a static database are being routed to funds that cannot currently deploy. The fund phase gate eliminates this error category entirely.

**Why: Fund phase is more operationally urgent than several dimensions already in the taxonomy.**

A sector thesis mismatch produces a meeting where the investor politely declines. A fund phase mismatch produces a meeting where the investor is genuinely interested and still cannot move forward — which is a harder outcome for the founder to interpret and a longer delay before they realize the round is not going to close from this source. The damage to founder morale and time is higher, not lower, when the investor likes the company but cannot write the cheque.

**Considered and rejected: Relying on the investor's self-reported availability.**

Some programs manage this by asking investors directly whether they are actively deploying. This is unreliable for two reasons. First, investors have an incentive to say yes regardless — declining to take meetings signals that the fund is closed or constrained, which has reputational implications. Second, 'actively deploying' means different things to different people — a partner who is technically deploying from a fund that has three investments left may still say yes, while the practical deployment window for a new company introduction is extremely narrow. Observable signals from deal velocity and fund close timing are more reliable than self-reported availability.

**TBDC can replicate this by: Adding a 'Fund Phase' column to the investor database with four values: Active (confirmed), Active (unconfirmed — verify before intro), Fundraising (hold), and Follow-on/EOL (remove from active matching). Research this for every investor in the database at onboarding using the five signals above. Update it whenever a fund close is announced or deal velocity drops significantly. Flag it for review at every quarterly maintenance audit. This single column prevents the most demoralizing category of failed introduction — the one where the investor liked the company and still could not move.**

**Step 5  Build the hard exclusion gate before the scoring logic**

**Decision: The first question the system asks is not 'how well does this match?' It is 'should this match run at all?'**

Before any scoring logic runs, the system checks two hard gates. If either fires, the company is removed from investor matching entirely and routed to an alternative workflow. The gates are binary — they do not produce a reduced score, they produce a full stop.

**Gate 1 — Founder has explicitly declined investor introductions**

This gate was built because of WIDMO Spectral Technologies, one of the ten companies in TBDC's current cohort. WIDMO has stated explicitly that they do not want investor introductions from TBDC. They are raising CAD $2.5M but need customer meetings in mining, aggregates, and geotechnical engineering — not VC conversations.

A matching system without this gate would surface WIDMO as a conditional match for several investors — their ARR, sector, and traction score reasonably well. But making that introduction would violate the founder's stated preference, damage TBDC's relationship with the company, and waste the investor's time. The gate exists to prevent this.

*WIDMO is redirected to a customer meeting facilitation workflow targeting: Agnico Eagle Mines, Kinross Gold, Barrick Gold (mining majors, Toronto HQs); CRH Canada, Holcim Canada (aggregates); WSP Global (Golder Associates), Stantec, Tetra Tech Canada (geotechnical engineering). This is the correct support function for WIDMO — not investor matching.*

**Gate 2 — Geographic mandate categorically excludes the company**

If an investor's geographic mandate categorically excludes the company's current home market AND their target expansion market, the match does not proceed to scoring. This is not a low score — it is a structural impossibility. A Canadian-mandate VC cannot invest in a company with no Canadian entity, no Canadian revenue, and no concrete Canadian expansion plan regardless of how well everything else aligns.

The gate uses a three-level check: does the company have a Canadian entity or team presence? Does it have Canadian revenue or customers? Does it have a concrete, dated Canadian expansion plan? If all three are no, the company fails the geographic gate for any Canada-mandate investor.

**Why: Hard gates before scoring prevents contaminated outputs.**

If WIDMO were allowed to proceed through the scoring algorithm, it would appear in the output as a Tier 3 or conditional match. That output would then need to be manually filtered by whoever reviews the results. Manual filtering at the output stage is unreliable — it depends on the reviewer knowing the exception, which means it fails every time a new person runs the system. The gate embeds the exception in the logic, making it automatic and audit-proof.

**Considered and rejected: Using a low score to represent 'do not match' cases.**

Some matching systems assign a score of 0 or 1 to companies that should not be matched and let the threshold filter them out. This approach fails for two reasons. First, it conflates 'genuinely bad match' with 'explicitly excluded' — both produce a low score, but they require completely different responses. Second, it means WIDMO appears in an unfiltered output, which is the exact outcome the gate is designed to prevent.

**TBDC can replicate this by: Adding a column to the company database called 'Investor Intro Status' with three possible values: Open (proceed to matching), Paused (do not match now — reactivate at milestone), and Declined (never match — route to alternative support). Check this column before running any matching logic. Review it with each company at every cohort check-in.**

**Step 6  Profile each portfolio company on investability dimensions**

**Decision: Build the company profiles using the same dimensions the investors use to screen — not a general company description.**

The company database is not a CRM of portfolio companies. It is a structured investability profile — each company described in the specific terms that matter for investor matching. The dimensions were chosen to mirror the investor taxonomy from Step 2, so that every investor dimension has a corresponding company dimension to score against.

The six investability dimensions used for each company — with Capital Type Fit added as the first:

| Dimension | What to capture and why |
| :---- | :---- |
| **Capital Type Fit** | Which investor type population this company should be matched against first: VC Track, Angel/Early Track, Corporate Strategic Track, Non-dilutive Track, or Mixed/Hold. Determined using the routing table from Step 3\. This field is set at onboarding and reviewed at every cohort check-in. It is the most important field in the company profile — it determines which database the scoring logic runs against. |
| **Current stage (verified)** | Not self-reported stage — stage as evidenced by traction. A company that self-reports as 'Series A ready' but has $0 ARR is at Seed at best. Mismatched self-reported stage is one of the most common sources of failed introductions. Verify stage against actual traction before profiling. |
| **Canadian nexus** | Canadian entity, Canadian team presence, Canadian revenue, or concrete dated Canadian expansion plan. Scored on the three-level check from Step 3\. This directly feeds the geographic gate. |
| **Revenue and traction signal** | ARR if applicable, paying customer count, notable client names, and relevant partnerships. This maps against the investor's revenue floor dimension. 'Two paying customers — Zeiss Pharma and Agora Analytics' is a specific and verifiable signal. 'Early traction' is not. |
| **Ask size and round structure** | How much the company is raising, whether they have a lead, and whether they are open to a lead investor vs. co-invest only. This maps against the investor's cheque size and lead/follow dimensions. |
| **Founder profile** | Technical, operator, or repeat founder — with specific credentials. 'Ex-Amazon, nine years AI research' is a matching signal. 'Experienced team' is not. Founder profile maps against the investor's pattern of conviction — most VCs have a strong preference for one type. |

**Why: Six dimensions, not five — Capital Type Fit is the first because it determines which investor population the other five dimensions score against.**

Founders describe their companies in terms of what the product does, who the customers are, and what problem it solves. Investors screen on stage, sector, traction threshold, and founder signal. These are different vocabularies. A company profile that says 'AI-powered operational brain for manufacturing enterprises' is a good product description. A company profile that says 'Early Seed, $0 ARR, two paying enterprise customers (Zeiss Pharma, Agora Analytics), ex-Amazon founder, VC Track' is an investor-facing profile built for matching. The Capital Type Fit field is what routes the second description to the right investor database before any scoring begins.

**Considered and rejected: Using each company's own pitch deck as the source for their profile.**

Pitch decks are optimized for persuasion, not for structured matching. They present the most compelling version of the company in the most compelling order. A matching system that ingests pitch decks as source data will inherit the deck's framing — which is often the wrong framing for investor matching purposes. The company profile in this system was built by extracting the structured dimensions from the deck, not by using the deck as the profile.

**TBDC can replicate this by: Building a standardized company intake form that every cohort company completes at onboarding. The form asks for: current ARR (or 'pre-revenue'), number of paying customers, ask size, round structure, founder backgrounds, and whether they want investor introductions (the Gate 1 flag from Step 3). This takes 10 minutes per company to complete and produces the company database for matching automatically.**

**Step 7  Design the scoring logic — weighted, not binary**

**Decision: Score each investor-company pair on seven weighted dimensions, not as a binary match or mismatch.**

*Scope clarification: the seven-dimension scoring logic runs within an investor type, not across all investor types. A family office that scores 14/16 and a VC that scores 14/16 are not equivalent recommendations — they are different instruments with different return expectations, governance demands, and post-investment relationships. The routing table in Step 3 determines which investor type database the scoring runs against. The scoring itself determines the best matches within that type.*

With the investor type taxonomy (Step 2), the capital type routing table (Step 3), the fund phase gate (Step 4), and the company profiles (Step 6\) built, the scoring logic maps the right companies against the right investor population. The core design question was: should signals be weighted or treated as equal?

I considered and rejected equal weighting for a specific reason. An alternate method I reviewed during this process uses one point per signal — one for sector, one for stage, one for geography, and so on. The problem is that a geographic mandate mismatch and a sector adjacency gap are not equivalent. One is a structural impossibility; the other is a softer misalignment. Equal weighting treats them the same, which produces false positives — companies that score 4/5 despite a geographic mandate kill.

The weighted scoring system I built:

| Dimension | Max points | Scoring logic |
| :---- | :---- | :---- |
| Geographic mandate | 3 | Full mandate match \= 3 / Company in expansion-to-Canada stage \= 1 / Outside mandate \= 0\. Highest non-gate weight because geographic mismatch is the most common structural kill. |
| Stage fit | 3 | Exact stage match \= 3 / Adjacent stage (one level away) \= 1 / Mismatch \= 0\. Adjacent stage is included because 'Late Seed' and 'Early Series A' are often operationally indistinguishable. |
| Sector thesis | 3 | Primary thesis match \= 3 / Adjacency \= 1 / Outside thesis \= 0\. Primary thesis match means pattern recognition and high-conviction. Adjacency means opportunistic — useful but different. |
| Revenue / traction threshold | 2 | Company meets investor's stated floor \= 2 / Within 50% of floor \= 1 / Below floor \= 0\. Weighted lower than the structural dimensions because revenue floors have more flexibility at early stages, particularly at pre-seed. |
| Cheque size vs. ask | 2 | Investor's cheque range covers the ask \= 2 / Partial coverage \= 1 / No coverage \= 0\. Practical filter — ensures the investor can physically write the cheque the company needs. |
| Founder–investor fit | 2 | Founder background maps to investor's demonstrated pattern of conviction \= 2 / Some alignment \= 1 / No signal \= 0\. Often the deciding variable in first meetings and frequently missed by automated matching. |
| Portfolio gap | 1 | Fills an identified gap in investor's portfolio \= 1 / Neutral \= 0 / Duplicates an existing portfolio company in the same sector \= \-1. Lower weight because gap analysis requires more ongoing maintenance than the other dimensions. |

Maximum possible score: 16 points. Tier thresholds:

| Score | Tier and action |
| :---- | :---- |
| **13–16** | Tier 1 — Priority introduction. High-conviction match. Make the warm intro or targeted cold outreach immediately. |
| **8–12** | Tier 2 — Qualified outreach. Logical match with identified gaps. Worth an introduction if framed correctly, typically as co-investor rather than lead. |
| **4–7** | Tier 3 — Monitor. Premature or partially aligned. Log for reactivation when the company hits a future milestone. |
| **0–3** | Do not match. Structural mismatch. Making this introduction actively damages TBDC's credibility with the investor. |

**Why: Weights encode the decision-maker's actual priorities, not a database administrator's categories.**

The weight of 3 assigned to geography and stage reflects that these are structural constraints — violating either means the investment is impossible regardless of how well everything else aligns. The weight of 1 assigned to portfolio gap reflects that this dimension requires ongoing research to maintain accurately and should influence but not determine the match. The weights are not arbitrary — each one reflects the relative severity of a mismatch in that dimension.

**Considered and rejected: Using a simple 1–5 star rating per investor-company pair.**

A star rating collapses all dimensions into a single impression and provides no diagnostic value. If a match scores 3 stars, you do not know whether that is because of a geographic mismatch, a stage gap, or a weak sector alignment. Each of those has a different fix. The dimensional scoring makes the gap visible and actionable.

**TBDC can replicate this by: Building the scoring logic as a formula in the existing investor database spreadsheet. For each investor-company pair, the score is \=SUM of the seven dimension scores. Tier classification is \=IF(score\>=13,'Tier 1',IF(score\>=8,'Tier 2',IF(score\>=4,'Tier 3','Do Not Match'))). This takes approximately 30 minutes to build once the investor and company databases exist. Every new cohort company is scored against every investor in the database automatically when added to the sheet.**

**Step 8  Build the match log with activation logic, not just scores**

**Decision: Every match output includes a specific next step and a warm path classification — not just a score.**

After building the scoring logic, I had a system that could rank investor-company pairs by match quality. But a ranked list is not an actionable output. A Partnerships Manager looking at a Tier 1 match for Fermi Dev × Radical Ventures needs to know: what do I do next, how do I approach this, and what does Fermi Dev need to have in place before I make this introduction?

The match log adds three fields to every scored pair:

| Field | What it contains and why |
| :---- | :---- |
| **Warm path classification** | Three options: Warm (TBDC or the Partnerships Manager has a direct personal relationship with a named partner at this fund); Possible (a warm introduction can be arranged through one degree of separation); Cold (no existing relationship — outreach must be cold). This determines the activation protocol, not the match quality. A Tier 1 match with a cold path requires a different action than a Tier 1 match with a warm one. |
| **Pre-conditions** | What the company needs to have in place before the introduction is made. Not every Tier 1 match should be activated immediately. A company at Early Seed with two paying customers is ready for a Radical Ventures introduction. The same company with no customers but a strong founding team should wait until they can show the first paying logo. Pre-conditions make this explicit rather than leaving it to judgment in the moment. |
| **Specific next step** | A named action with a named person and a framing note. Not 'reach out to Radical Ventures' — 'cold LinkedIn outreach to Jordan Jacobs, leading with the manufacturing AI portfolio gap angle and Zeiss Pharma as a reference name, asking for 20 minutes.' The specificity is what makes the match log a working document rather than a reference one. |

**Why: Activation logic is what separates a matching system from a matching list.**

The failure mode described in Step 1 — matches that are made but never convert — almost always comes from the gap between 'this is a good match' and 'here is exactly what to do about it.' The next step field closes that gap. Every match in the system has a named action attached to it. If the action is not taken, the system makes that visible — the match status stays at 'Not Yet Activated' until someone acts on it.

**Considered and rejected: Leaving next steps to the Partnerships Manager's discretion at output time.**

Discretionary next steps are fine when the Partnerships Manager is experienced, fully briefed on every company and investor, and has unlimited time. None of those conditions hold reliably across cohort transitions, staff changes, or high-volume periods. Embedding the next step in the match record means the action is documented, transferable, and auditable regardless of who runs the program.

**TBDC can replicate this by: Adding three columns to the match log spreadsheet: Warm Path (dropdown: Warm / Possible / Cold), Pre-conditions (free text: what needs to be true before this intro is made), and Next Step (free text: who to contact, how, what to say). For Tier 1 matches, the Partnerships Manager fills these in immediately. For Tier 2 matches, they are filled in when the match is activated. For Tier 3 matches, they are reviewed at the next cohort milestone check-in.**

**Step 9  Populate the system with real data for the current cohort**

**Decision: Profile all 10 cohort companies and 24 investors using LinkedIn Sales Navigator and public data before building the tool interface.**

With the taxonomy, scoring logic, exclusion gates, and match log structure designed, the next step was populating the system with actual data. This is where the tool becomes a proof of concept rather than a design document.

**Investor data sources used**

* LinkedIn Sales Navigator — the primary source for confirming current investment stage preferences, recent portfolio additions, and named partners at each fund. Sales Navigator allows filtering by investor type, geography, and recent activity, which surfaces which funds are actively deploying versus holding.

* Public portfolio pages — each fund's website typically lists current portfolio companies with round sizes where disclosed. This was used to verify sector thesis and identify portfolio gaps.

* Recent press coverage and LinkedIn posts by named partners — the most reliable source for current thesis signals. A partner who has written publicly about manufacturing AI as an underserved vertical (as Jordan Jacobs at Radical has done) is signalling active conviction, not just historical mandate.

* Direct market knowledge from Ready4VC advisory work and the Canadian VC ecosystem — used to fill gaps where public data was insufficient and to validate thesis signals that appeared in public sources.

**What I do not have and what that means**

I do not currently have active PitchBook or Crunchbase Pro access. This means cheque size ranges and deal frequency estimates are directional rather than precise — sourced from public announcements, LinkedIn signals, and market knowledge rather than from verified transaction data. I have flagged this in the tool and in the methodology.

In a full production deployment, PitchBook or Crunchbase data would be added to validate these estimates. The architecture of the system is designed to accommodate this — cheque size and deal frequency are stored as structured fields that can be updated when verified data is available. The system does not break if the data improves; it gets more accurate.

**Why: Populating with real data, even imperfect data, produces a proof of concept that can be evaluated and improved — whereas a populated demo with fictional data produces a proof of design that cannot.**

The 10 company profiles and 24 investor profiles in the tool are based on the actual cohort companies and the actual Canadian, international, and MENA investor landscape. Every Tier 1 recommendation in the output is a recommendation I would make to TBDC today, with the pre-conditions and next steps I have described. That is what makes it a proof of concept rather than a mockup.

**TBDC can replicate this by: Subscribing to LinkedIn Sales Navigator (approximately $80 CAD/month at team tier) and assigning access to the Partnerships Manager. This single tool provides: confirmed investor stage preferences, recent portfolio additions, named partners with contact access, and direct InMail capability. It is the minimum viable data infrastructure for the matching system. PitchBook or Crunchbase Pro can be added later for verified deal data — but Sales Navigator is sufficient to start.**

**Step 10  Build the interface — a tool the Partnerships Manager actually uses**

**Decision: Build an interactive HTML tool that surfaces the match logic visually, rather than a spreadsheet that requires manual navigation.**

The scoring logic and match log at this point existed as a structured dataset. The final step was building an interface that makes the data accessible and actionable for someone who needs to use it daily — not someone who built it.

The design decisions for the interface:

* Company-first navigation — the user selects a portfolio company and sees all relevant investor matches for that company, rather than viewing a flat table of all pairs. This mirrors how a Partnerships Manager actually thinks: 'I am working with Omniful this week — who should I be talking to on their behalf?'

* Visible scoring breakdown — every match card shows the dimensional scores (Geo 3/3, Stage 3/3, Sector 3/3, etc.) rather than just the total. This makes the rationale auditable and helps the Partnerships Manager explain a recommendation to a founder or senior colleague.

* Explicit 'do not match' section — every company has a 'do not match' list with specific reasons. This is as important as the match list. A Partnerships Manager who knows not to introduce Omniful to Golden Ventures (stage mismatch — they write $250K–$2M at pre-seed, Omniful is at Series A with 90+ clients) will not make that introduction even under pressure from a well-intentioned founder who found Golden Ventures on a Google search.

* WIDMO hard gate — visible before any match output for that company. The gate text explains why WIDMO is excluded from investor matching and what the correct support function is. It cannot be missed.

* Canadian VCs, International VCs, and Pre-conditions as separate sub-tabs — so the output is organized by decision type rather than by investor geography. The Partnerships Manager working on a Horizon cohort company sees all the relevant international options in one place.

**Why: An interface that matches how the work is actually done is used. An interface that requires the user to reformat data before acting on it is not.**

The tool was built as a single HTML file that opens in any browser without installation. This was a deliberate choice — it means TBDC can use it immediately without procurement, IT approval, or onboarding. The next version of the tool can be hosted as a web application or embedded in TBDC's existing infrastructure, but the proof of concept needed to be zero-friction.

**Considered and rejected: Building the interface in Airtable or Notion.**

Airtable and Notion are good tools for many things. For this specific use case — a matching interface that needs to display dimensional scores, exclusion gates, tiered outputs, and activation next steps per company — both require significant configuration to produce a usable interface, and neither produces the specific layout that makes the match logic legible at a glance. The HTML tool was faster to build and more precisely suited to the output format needed.

**TBDC can replicate this by: In the immediate term: use the HTML tool as-is. It contains all 10 current cohort companies and 24 investors and is ready to use. In the next 90 days: migrate the underlying data to a shared Airtable base that the Partnerships Manager can update as investor theses shift and company traction changes. The HTML interface can be rebuilt from the Airtable data as a simple export. In the next 6–12 months: connect the Airtable base to a LinkedIn Sales Navigator API integration to auto-update investor profiles when deal activity is detected.**

**Step 11  Document the maintenance protocol — what keeps the system accurate over time**

**Decision: Build a quarterly update protocol into the system from the start, not as an afterthought.**

A matching system that is not maintained becomes a liability rather than an asset. Investor theses shift. Funds close and new ones open. Partners move between firms. Companies hit milestones that change their matching profile. A system that reflects the state of the market from six months ago will produce increasingly inaccurate recommendations — and a Partnerships Manager who acts on inaccurate recommendations loses credibility with the investors they are trying to build relationships with.

The maintenance protocol I built into the system:

| Trigger | Update required |
| :---- | :---- |
| **New cohort company joins** | Complete the company intake form (Step 4). Run the scoring logic against all investors in the database. Review the 'Investor Intro Status' field with the company at their first cohort check-in. |
| **Investor makes a new investment (detected via LinkedIn or press)** | Update their recent portfolio field. Check whether the new investment affects the portfolio gap dimension for any active matches. If a VC just backed a supply chain company, update Omniful's gap score for that investor. |
| **Investor partner moves to a new fund** | Update the contact name field. Review whether the fund's thesis has changed. A partner who moves from a generalist fund to a sector-specific one changes the relevance of that fund for the entire cohort. |
| **Company hits a revenue or traction milestone** | Re-run the scoring for that company against all investors. A company that moves from pre-revenue to $100K ARR will unlock investor conversations that were previously below the revenue floor threshold. |
| **Quarterly cohort review** | Review all Tier 1 matches that have not been activated. For each: has the pre-condition been met? If yes, activate. If no, what is blocking it? Review all Tier 2 matches for promotion to Tier 1\. Archive any investors who are known to be out of market. |

**Why: A system with a maintenance protocol is a system that improves over time. A system without one decays.**

The quarterly review cadence was chosen because investor thesis shifts and company traction changes both typically happen on a monthly-to-quarterly basis. A weekly review would be over-maintenance for most periods; an annual review would miss important changes. The event-triggered updates (new investment, partner move, company milestone) catch the high-signal changes between quarterly reviews.

**TBDC can replicate this by: Assigning the quarterly maintenance review as a standing agenda item in the Partnerships Manager's calendar. It takes approximately two hours per quarter: 30 minutes reviewing recent investor activity on LinkedIn, 30 minutes updating company profiles based on cohort check-ins, 30 minutes reviewing unactivated Tier 1 matches, and 30 minutes reviewing Tier 2 matches for promotion. Two hours per quarter is the maintenance cost of a system that produces accurate recommendations year-round.**

# **What TBDC Can Implement Immediately**

The nine steps above describe how the system was built. The table below summarizes what TBDC can implement tomorrow — meaning within the next five business days — using tools they either already have or can acquire immediately.

| Action | Tools required | Time to complete |
| :---- | :---- | :---- |
| Run the 30-minute audit of the last 20 investor introductions (Step 1). Did they respond? Did meetings happen? What came of them? | No tools — just the program CRM or email history | 30 minutes |
| For each current cohort company, determine their Capital Type Route using the routing table from Step 3: VC Track, Angel/Early Track, Corporate Strategic Track, Non-dilutive Track, or Mixed/Hold. Four companies in the current cohort are re-routed away from VC-first: WIDMO (hard gate), VEMOCO (corporate strategic/RBF), Voltie (angel/government programs primary), SaMMY PC (impact/family office for equity portion). | No tools — the routing table is in this document | 45 minutes for all 10 companies |
| Add three columns to the existing cohort company database: 'Capital Type Route' (from Step 3), 'Fund Phase' (Active-confirmed / Active-unconfirmed / Fundraising / Follow-on, from Step 4), and 'Investor Intro Status' (Open / Paused / Declined, from Step 5). The Fund Phase column goes in the investor database, not the company database — one row per investor, updated quarterly. | Existing CRM or spreadsheet | 25 minutes |
| For every investor in the current database, assign an initial Fund Phase status using the five observable signals from Step 4: announced fund close date, deal velocity (new investments in last 12 months), partner LinkedIn content, fund size to portfolio count ratio, and time since last investment announcement. Any investor in Fundraising or Follow-on phase is removed from active match outputs immediately. | LinkedIn Sales Navigator \+ Crunchbase or BetaKit | 30–45 minutes for 24 investors |
| Open the HTML tool in a browser and review the match outputs for the current cohort. For any Tier 1 match where the pre-conditions are already met: activate this week. | The HTML tool file included with this submission | 2 hours |
| Build the company intake form for the next cohort intake (Step 5). Six dimensions: Capital Type Route, current ARR, paying customers, ask size, founder backgrounds, investor intro status. | Google Forms or Typeform — free | 1 hour |
| Subscribe to LinkedIn Sales Navigator and begin profiling the five investors most relevant to the current cohort's Tier 1 matches (Step 7). | LinkedIn Sales Navigator — approximately $80 CAD/month | 2 hours for initial setup, 30 minutes per investor profile |
| Add the three match log columns (Warm Path, Pre-conditions, Next Step) to the existing investor tracking spreadsheet (Step 6). | Existing Google Sheets or Excel | 30 minutes |
| Schedule the quarterly maintenance review as a standing calendar item (Step 9). | Google Calendar | 5 minutes |

*The total time investment for immediate implementation is approximately one working day spread across the next five business days. The result is a functioning investor matching system for the current cohort that will improve with each quarter of use.*

## **The technology stack — what this system actually runs on**

This is worth stating explicitly because the answer is simpler than most people expect from a 'technology-enabled' matching system:

* Data storage: Google Sheets or Airtable — free or low-cost, accessible to the whole team, version-controlled, and maintainable without a developer.

* Investor research: LinkedIn Sales Navigator — approximately $80 CAD/month. The single highest-value tool investment in the stack.

* Interface: The HTML tool included with this submission, or a future Airtable interface built from the same data. No hosting required for the HTML version.

* Activation: Email and LinkedIn InMail — no additional tools needed. The system tells the Partnerships Manager what to send and to whom; the sending happens in whatever email client they already use.

The system does not require a custom database, a machine learning model, a dedicated developer, or a SaaS subscription beyond LinkedIn Sales Navigator. It requires structured thinking applied to data that is already available or easily accessible — and a Partnerships Manager who uses the output consistently.

*Where AI adds value in a future iteration: once the investor database has 50+ investors and the cohort grows beyond 15 companies, the number of possible pairs makes manual scoring impractical. At that point, an AI layer — either a simple GPT-4 API call with the taxonomy as a prompt, or a purpose-built matching model — can automate the scoring while the Partnerships Manager focuses on activation. The taxonomy and scoring logic built in Steps 2–6 are what makes that AI layer trustworthy. Without structured input, AI matching produces sophisticated-sounding noise. With structured input, it produces accurate, explainable recommendations at scale.*

*Ahmed Korayem · Ready4VC Inc. · GatheringX · Toronto*