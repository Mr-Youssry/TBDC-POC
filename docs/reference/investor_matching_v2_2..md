**Investor Intelligence at Scale**

A Technology-Enabled Proof of Concept for Startup-to-Investor Matching

POC uploaded on tbdc.ready4vc.com

The thought process is explained behind every step here to be able to follow the logic I operated with to arrive at the POC. The first thing I did was resist the instinct to open a tool. The prompt asks for a proof of concept, and the first instinct for most people is to jump to a technology choice, build a Crunchbase scraper, set up an Airtable, prompt an AI model. The problem with this instinct is that it skips the most important step: understanding why investor matching fails in the first place. I spent time mapping the actual failure modes in investor-founder matching programs. Not theoretically, but arranged some calls and relied on some direct experience running venture advisory work and observing how accelerators and programs manage their investor relationships. *Why?* because if I had started by choosing a tool, I would have optimized for whatever that tool is good at. Starting with the problem definition and failure modes means every subsequent decision is evaluated against: does this solve failure mode 1, 2, or 3? A tool that does not address all three is not solving the problem.

# **1\. The Problem**

The conventional approach to investor matching in accelerator programs relies on personal relationships, memory, and manual outreach. Three failure modes also emerged consistently. This creates three structural problems that compound as the program scales:

* Relationship dependency: Intros are limited to investors the IR manager knows personally, a ceiling that doesn’t scale with cohort size or investor universe growth. Relationship warmth is necessary but is both not scalable and not sufficient for a good match. 

* Recency and proximity bias: Investors who are top-of-mind or frequently contacted get most introductions, regardless of fit. Qualified investors outside the personal network are systematically overlooked.

* No institutional learning: Every pass, every accepted meeting, every conversion disappears when the IR/team member moves on. There is no compounding intelligence and the learning is stored in someone’s head. This means that without institutional memory, the organization starts from scratch every time or relies on handover notes which don’t always capture all the learning.

The result: an accelerator with 20 to 30 high-potential startups produces a fraction of the introductions it could, to a fraction of the investors it should be reaching. 

The second aspect here to consider is the failure modes when the intros are made

• Failure mode 1: Matching on sector and stage alone. An IR says “Sanaga Ventures funds MedTech at Seed” and matches them to every MedTech company at Seed in the cohort. But Sanaga Ventures may be only writing cheques in Canadian companies, and may already have two FinTech companies in portfolio. None of this is captured in 'FinTech, Seed.' The result is meetings that should never have happened, investor relationships eroded on the long-term, and founders who got a polite pass with no explanation which dilutes the value of the program.

• Failure mode 2: Having no exclusion logic. Some companies explicitly do not want investor introductions. Some are in quiet periods before a close. Some have been told by their lead investor not to take meetings. A matching system with no exclusion gate will surface these companies in every VC output, and the program manager who makes those introductions gradually loses credibility with both the investor and the founder.

• Failure mode 3: Matching without activation logic. A match score is not an outcome. Knowing that Investor X is a strong match for Company Y does not tell you how to make the introduction, when to make it, what framing to use, or what the company needs to have in place before the meeting happens. Programs that generate match lists without activation protocols produce lists that nobody acts on.

What I also considered but didn’t move forward with was starting with a tool audit to answer the question: “what tools are available?” The available tools including Crunchbase, Airtable, LinkedIn Sales Navigator, PitchBook, AI APIs, are all capable of contributing to a solution. But the question of which to use is downstream of the question of what the solution needs to do. Answering which tool before what problem produces a solution shaped by the tool rather than by the problem.

What I would do at TBDC: Run a 30-minute internal audit of the last 20 investor introductions made by the program. For each I will gather data around: did the investor respond? Did a meeting happen? Did the meeting produce anything? What is the feedback from the founders and the investors? The data gathered forms the baseline problem the system needs to fix.

# **2\. Building Investors Classification Criteria and Reframing the Relationship**

The conventional model assumes relationships are the prerequisite for deal flow: build the relationship first, then send the deals. However, a consistent, high-quality introductions are what earn investor trust over time. The relationship is the output of good matching as much as it is viewed as a prerequisite for it. An investor who receives three precisely thesis-aligned introductions from TBDC over two cohorts will prioritize TBDC’s deal flow. Not because TBDC asked for it, but because TBDC earned it through precision. Sending imprecise intros to mismatched investors erodes that trust. A systematic matching engine inverts the dynamic by ensuring that every intro is defensible, every recommendation is auditable, and the machine learns so quality compounds across cohorts.

To achieve this level of understanding, I need depth of understanding and information about each and every investor captured in step 4\.

# 

# **3\. The Vision**

## **A 6-Step Matching Workflow**

The matching engine is a structured six-step workflow that transforms unstructured pitch decks and investor lists into high-precision, thesis-aligned introductions at scale, with full IR oversight at every decision point.

* Step 1: Startup submits a structured profile

* Step 2: Investor universe is queried

* Step 3: Matching engine scores and ranks

* Step 4: IR manager reviews the shortlist

* Step 5: Warm, thesis-aligned intros are made

* Step 6: Outcome is logged, the system learns and improves

Each step is detailed in Sections 5 and 6\. The workflow is designed so that the system handles scale and the IR manager handles judgment. 

# **4\. Investor Universe Mapping**

Every investor in the matching pool is profiled across seven dimensions. These are divided into:

1. Mandatory fields, which must be complete before an investor enters the matching pool

2. Additional fields used in weighted scoring.

   

Why this step and why multiple dimensions? 

Because the failure modes require it.

Most programs use two dimensions: sector and stage. That produces plausible matches. This classification produces useful ones. The distinction is that every dimension above maps directly to one of the three failure modes identified in Step 1\. Geographic mandate and lead/follow address failure mode 1 (over-matching on insufficient criteria). The exclusion gate in Step 3 addresses failure mode 2\. The activation protocol addresses failure mode 3\.

## **Mandatory/Qualifying Fields**

These five fields act as hard filters. An investor missing any of these fields is excluded from matching until the data is sourced. This is because incomplete data is worse than no data since it might produce confident wrong answers.

* **Investor Type**: VC / Family Office / Angel / Angel Network / Corporate Strategic VCs. This is noted because types of investors come with different cheque size expectations and different decision-making timelines.

* **Geography**: Hard filter applies at the jurisdiction level only. Investors who do not deploy in Canada at all are excluded from the matching pool. Regional preference within Canada Ontario-focused, BC-focused, national, is recorded in the investor profile and carried into the scoring layer as a ranked dimension, but does not disqualify an investor at the filter stage. Canadian investors regularly cross regional lines when the opportunity is strong enough. What we are proposing here is globally validated startups who are expanding into the North American market. Unless they are clearly mandated to invest in a certain province, they will potentially take a call with a startup in a different region.

* **Fund Activity**: Is the investor currently deploying capital? What stage of fund cycle are they in? This is frequently the hardest field to source, and the most important. A perfectly-matched inactive investor is a wasted introduction.

* **Stage Preference**: Matched against the startup’s current raise stage, not projected future stage. An investor focused on Series B should not receive a pre-seed intro.

* **Cheque Size Range**: Minimum and maximum. A $500K raise should not go to a fund with a $5M minimum cheque floor, and should not go to an angel whose maximum is $25K.

## **Additional Fields**

These two fields are used in weighted scoring after the hard filters are applied. They differentiate between eligible investors and rank them by fit quality.

* Sector & Thesis Focus: Both stated thesis and revealed preference (portfolio). Revealed preference is weighted higher, stated thesis is marketing; portfolio is evidence. Will also look at portfolio gap and who the investor didn’t fund yet.

* Lead vs. Follow Preference: Whether an investor leads or follows rounds is not a binary disqualifier, it is context-dependent on the startup’s current round structure. If the startup already has a lead investor, a follow-only investor is a strong match. If there is no lead yet, a follow-only investor is the wrong introduction. Because the correct answer depends on the startup’s situation at the time of matching, lead/follow preference is carried into the scoring layer as a ranked dimension rather than applied as a hard filter here.

# **5\. Workflow Steps 1–3: Input to Match**

## **Step 1: Startup Submits a Structured Profile**

**What:** A standardized intake form is completed by each startup entering the matching process. Fields include: sector, stage, raise size, traction metrics, geography, business model, and a one-line problem statement.

**Why:** Unstructured pitch decks cannot be matched at scale. Every startup in the cohort needs to be expressed in comparable, machine-readable terms. The intake form imposes that structure without burdening the startup, it is a 10-minute form, not a full deck review.

## **Step 2: Investor Universe Is Queried**

**What:** Hard filters are applied across four dimensions: investor type, fund activity, stage preference, and cheque size range. Geography is also filtered at this stage, but only at the jurisdiction level, investors who do not deploy outside the startup’s region are filtered out. Regional preference within Canada is not a hard filter; it carries into the scoring stage. Any investor who does not pass all hard filters is excluded before scoring begins.

**Why:** This reduces the investor pool from 300+ to 20–30 genuinely eligible candidates before any ranking occurs. Filtering first is efficient: it means the scoring engine only evaluates investors who could plausibly invest. It also eliminates noise from the shortlist the IR director reviews.

## **Step 3: Matching Engine Scores and Ranks**

**What:** Each eligible investor is scored across all seven ranked dimensions. The output is a weighted shortlist with a fit score and one-line rationale per investor, ordered from highest to lowest match quality.

**Why:** A human IR director can hold approximately 20 investors in active memory at any time. The matching engine evaluates hundreds simultaneously, without recency bias, relationship bias, or memory limitations, and it makes the reasoning transparent so IR can audit and override any recommendation.

# **6\. Workflow Steps 4–6: Review to Learning**

## **Step 4: Partnership Manager/IR Manager Reviews the Shortlist**

**What:** The IR receives the ranked shortlist and reviews each recommendation. Overrides are applied where warranted: cold relationships, known conflicts, recent passes, or context the system does not have. The director approves the final list before any introductions are made.

**Why:** The system ranks by data. The IR knows things data does not, relationship history, recent conversations, investor mood. Human judgment is the quality gate, not the bottleneck. With a pre-ranked, pre-rationale’d shortlist, this review takes 15–20 minutes rather than 2–3 hours. In the next iteration, the warm intro activator is added to make this process easier.

## **Step 5: Warm, Thesis-Aligned Intro Is Made**

**What:** The IR sends a targeted introduction to each approved investor. Each intro is framed around why this specific startup matches this specific investor’s thesis, using the rationale the matching engine generated.

**Why:** An introduction from TBDC framed around investor thesis converts significantly better than a cold founder email. The system gives IR the language to make every intro feel personalized at scale, without IR having to construct the rationale from scratch for each investor across each cohort startup.

## **Step 6: Outcome Is Logged, The System Learns**

**What:** Every introduction outcome is recorded: accepted meeting, passed, invested. These signals feed back into investor profiles and update the matching model.

**Why:** This is the step most programs skip, and it is the most valuable. Every pass is a data point about what this investor will not fund. Every conversion is a data point about what actually predicts investment. TBDC’s investor intelligence compounds with every cohort. After three to four cohorts, this becomes a proprietary competitive advantage no other Canadian accelerator has.

# **7\. The Matching Layer**

## **7 Ranked Dimensions with Weighted Scoring**

The matching engine scores each eligible investor across seven dimensions. Dimensions are ranked by importance, higher-ranked dimensions carry greater weight in the final score. This table defines each dimension and the rationale for its weighting. Note that three of the seven dimensions (Lead/Follow Fit, Geographic Alignment, and Strategic Value) do not appear in the non-negotiable filter layer: they are scoring dimensions, not eliminators, because their relevance is context-dependent or a matter of degree rather than binary pass/fail.

| Rank | Dimension | Why It’s Weighted This Way |
| :---- | :---- | :---- |
| **01** | **Fund Activity** | A perfectly-matched investor not currently writing cheques is a wasted introduction. This is the first filter because relevance without readiness produces no outcome. |
| **02** | **Stage Fit** | Historical deal stage versus where the startup is today. An investor whose portfolio reflects Series A activity should not receive a pre-seed introduction. |
| **03** | **Cheque Size Fit** | Is the raise size within the investor’s minimum and maximum range? A $500K raise should not go to a fund with a $5M minimum cheque floor, and should not go to an angel whose maximum is $25K. |
| **04** | **Sector & Thesis Fit** | Three-layer analysis: (1) stated thesis — what the investor says they focus on; (2) revealed preference — what their portfolio shows they have actually backed, which is weighted higher than stated thesis; (3) portfolio gap — whether this startup fills a gap in their existing portfolio or creates unwanted concentration. An investor with four climate investments may be more receptive to a diagnostics startup than a fifth climate deal, regardless of their stated thesis. |
| **05** | **Lead / Follow Fit** | Whether an investor leads or follows rounds is context-dependent on the startup’s situation, not a binary disqualifier. If the startup already has a lead, a follow-only investor is a strong match. If there is no lead yet, a follow-only investor is the wrong call. This dimension is scored against the startup’s current round structure, not treated as a hard filter. |
| **306** | **Geographic Alignment** | Scored, not filtered. Country-level exclusions (investors who do not deploy in Canada at all) are handled in the hard filter stage. Within Canada, regional proximity is a softer signal: an investor whose primary focus is Ontario scores higher for an Ontario-based startup than for one in BC, but is not excluded. Canadian investors regularly cross regional lines when the opportunity is strong enough. |
| **07** | **Strategic Value** | Can this investor open doors beyond capital? Network overlap, domain expertise, and operational relevance to the startup’s specific sector or growth stage. This dimension is ranked last because it is additive — it differentiates between investors who are otherwise equally matched on dimensions 01–06, but it never compensates for a weak match on the dimensions above it. |

Weighting note: Fund Activity is ranked first because a perfect thesis match to an inactive fund produces zero outcomes, it is the gate every other dimension depends on. Lead/Follow Fit (05) is ranked above Geographic Alignment (06) because it is more determinative: a structural mismatch between an investor’s lead/follow preference and the startup’s round structure will block a deal regardless of how close the geography is. Geographic Alignment is ranked above Strategic Value because proximity to the investor’s primary region is a measurable signal with real effect on deal probability; Strategic Value is ranked last because it is additive and differentiating, not eliminative.

# **8\. The Proof of Concept: 3-Week Plan**

The POC is three weeks, not six. The scope has three discrete, well-defined tasks that fit cleanly into three weeks. A six-week timeline would introduce unnecessary delay without improving the output. The POC is designed to answer one question: does the system produce better-than-human shortlists, faster?

| Week | Focus | Key Activities | Success Criteria |
| :---- | :---- | :---- | :---- |
| **1** | **Build the Investor Database** | Seed 80–100 investors from existing TBDC contacts and public sources (LinkedIn, Crunchbase). Tag each investor across all 7 profile dimensions. Identify data gaps — fund activity status is often the hardest field to source. | 80–100 investors fully tagged across all 7 dimensions. Data gaps identified and flagged. |
| **2** | **Build the Matching Model & Run First Matches** | Build scoring model in Airtable or Google Sheets using weighted formula across 5 ranked dimensions. Run matching against 3–5 startups from the current Surge cohort. Generate ranked shortlists and one-line rationales per startup. | Ranked shortlist generated for each of the 3–5 test startups, with fit score and rationale per investor. |
| **3** | **Test with IR Team & Measure Output Quality** | IR director reviews each shortlist and rates suggestions (strong fit / weak fit / wrong). Compare system shortlist to what IR would have suggested manually. Document what the model got wrong and why — this defines v2 improvements. | ≥70% of system suggestions rated ‘strong fit’ by IR. 3 startups each receive 8–12 qualified investor introductions. |

## **Success Criteria**

* Primary: ≥70% of system-generated suggestions rated ‘strong fit’ by the IR director

* Secondary: 3 Surge cohort startups each receive 8–12 qualified investor introductions within 3 weeks

* Tertiary: Model’s errors documented and categorised to define v2 improvement priorities

# **9\. Why It Scales: The Flywheel**

The system’s value is not linear — it compounds. Each cohort improves the next. This is the flywheel logic:

* Every introduction outcome (converted or passed) updates investor profiles with real signal

* Updated profiles improve match quality in subsequent cohorts without additional manual effort

* After 3–4 cohorts, TBDC’s investor intelligence database becomes genuinely proprietary: a depth of investor behaviour data no other Canadian accelerator has

* Investors who consistently receive high-quality, thesis-aligned introductions from TBDC begin prioritising TBDC deal flow

* Priority access from investors generates better outcomes for founders, which attracts higher-quality startups to the Surge program

  ***Precision earns trust. Trust earns priority access. Priority access compounds.***

# **10\. Tools, Team & Build Path**

## **POC Stack (Weeks 1–3)**

Designed for speed and zero engineering dependency. All POC tools are no-code or low-code:

* Airtable or Notion: Investor database and profile management

* Google Sheets: Scoring model — weighted formula across 7 ranked dimensions

* PitchBook / Crunchbase: Data sourcing for investor profiles

* OpenAI API: Rationale generation for investor fit explanations

* Zapier / Make: Workflow automation between database and scoring model

## **Full Build Stack (Months 2–5)**

Once the POC validates match quality, the system graduates to a production architecture:

* Custom web application: Hosted matching interface for IR and startup intake

* Vector database (Pinecone): Semantic matching layer beyond structured scoring

* CRM integration (Affinity or HubSpot): Native investor relationship tracking

* ML pipeline & model retraining: Automated learning from outcome signals

* Investor portal: Structured interface for outcome logging by IR team

## **Team Requirements**

POC stage requires no data science team and no engineering budget:

* 1 IR Lead: Owns the program, reviews shortlists, logs outcomes, drives investor outreach

* 1 Part-Time Developer or Technical Analyst: Builds and maintains the scoring model and database structure

This is a two-person POC. The constraint is data quality, not engineering complexity.

# **11\. The Bottom Line**

The TBDC Surge Program has a high-quality cohort, an established brand with Canadian investors, and an IR function that is already doing the work. The gap is not capability — it is infrastructure.

This proof of concept closes that gap in three weeks, with two people, using tools TBDC likely already has access to. It does not require a technology budget, a data science hire, or a new vendor relationship.

What it produces:

* A ranked, rationale’d investor shortlist for every Surge cohort startup — generated in minutes, not hours

* An introduction quality standard that makes TBDC’s outreach more precise and more credible with investors

* A compounding institutional asset: investor intelligence that grows more valuable with every cohort

The ask is straightforward: three weeks to run the POC, measure the output, and decide whether to build.

*If the system produces shortlists that the IR director rates as strong-fit at 70% or above, the case for a full build is self-evident. That’s the test. Three weeks is enough to run it.*

*TBDC Surge Program  ·  Investor Relations  ·  Confidential*