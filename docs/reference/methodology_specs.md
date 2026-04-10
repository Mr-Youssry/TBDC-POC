**Investor Matching Methodology**

*Specification document for tbdc.ready4vc.com/methodology*

TBDC Surge Program  ·  Investor Relations Function

***This document is a specification for Claude Code. It contains the complete, final matching methodology to be implemented on the methodology tab at tbdc.ready4vc.com/methodology. Preserve the existing visual design, component structure, and layout. Replace only the content: hard gates, scoring table, score tiers, and all explanatory text.***

# **1\. Purpose of This Document**

This document specifies the complete revised investor matching methodology for the TBDC Surge Program. It is the authoritative source of truth for the methodology tab at tbdc.ready4vc.com/methodology.

The methodology has been revised from the version currently on the site. The following changes have been made:

* Hard gates expanded from two to three. Fund Activity is now a hard gate — not a scored dimension — because it is binary.

* Geography split into two distinct roles: jurisdiction-level exclusion (Gate 02\) and regional alignment within Canada (scored dimension, rank 05). These are intentionally separated because they do different work.

* Lead / Follow Fit added as a new scored dimension (rank 04, 2 pts). It was absent from the previous methodology. It is scored rather than filtered because the correct answer is context-dependent on the startup’s round structure.

* Sector & Thesis Fit expanded to a three-layer analysis: stated thesis, revealed preference, and portfolio gap. Portfolio gap is embedded here rather than treated as a standalone dimension.

* Revenue / Traction Threshold removed. It is structurally redundant with Stage Fit — if stage fit is correctly defined and enforced, a pre-revenue company never reaches an investor with a hard revenue floor. Redundant dimensions distort weighted scores.

* Maximum score recalibrated from 16 pts to 14 pts to reflect the removal and additions. Score tier thresholds updated accordingly.

* Warm path retained as an activation modifier. It does not affect score. This is correct and intentional.

# **2\. Hard Gates**

Hard gates run before scoring begins. If any gate fires, the investor-startup pair is eliminated from the match output entirely, regardless of what score they would have received. There are three gates.

| Gate | Trigger | Rationale & Implementation Note |
| :---- | :---- | :---- |
| **01 — Founder Opt-Out** | Company has explicitly declined investor introductions (WIDMO flag) | Non-negotiable. Remove from all VC matching and reroute to customer facilitation. Violating a founder’s stated preference destroys trust with the founder and TBDC’s relationship capital with the investor simultaneously. This gate is set by the company, not the IR function. |
| **02 — Geographic Jurisdiction** | Investor does not deploy in Canada at all | Eliminates investors whose geographic mandate categorically excludes Canada and all Canadian expansion markets. Note: regional preference within Canada (Ontario-focused, BC-focused, national) is NOT a hard gate — it carries into the scoring layer as a ranked dimension (Geographic Alignment, rank 05). Only country-level exclusions are handled here. |
| **03 — Fund Activity** | Investor is not currently deploying capital | Eliminates investors who are inactive, between funds, or fully deployed. This is treated as a gate rather than a scored dimension because it is binary — an investor is either writing cheques or they are not. There is no partial credit for fund cycle timing. A perfectly thesis-matched investor who is not deploying produces zero outcomes regardless of every other dimension. |

***Implementation note: the scoring algorithm must not run until all three gates have cleared. A company or investor that triggers any gate should never appear in the match output for that pair.***

# **3\. Scoring Dimensions**

## **3.1 Overview**

Seven dimensions are scored after the hard gates clear. Dimensions are ranked by importance — higher-ranked dimensions carry greater weight. The maximum possible score is 14 points.

Three dimensions (Lead/Follow Fit, Geographic Alignment, Strategic Value) do not appear in the hard gate layer. This is deliberate: their relevance is context-dependent or a matter of degree, not binary pass/fail. They are scored, not filtered.

## **3.2 Scoring Table**

| Rank | Dimension | Max pts | Scoring Logic & Rationale |
| :---- | :---- | :---- | :---- |
| **01** | **Stage Fit** | **3 pts** | Exact stage match \= 3 / Adjacent (one stage away) \= 1 / Mismatch \= 0\. Stage determines whether a VC can legally and structurally deploy from their current fund into this company. One degree of adjacency is permitted because some investors operate across two adjacent stages. Rationale for rank: stage mismatch is a near-structural kill — an investor whose fund strategy targets Series A should not receive a pre-seed introduction. |
| **02** | **Sector & Thesis Fit** | **3 pts** | Three-layer analysis — all three layers inform the final score:(1) Stated thesis: what the investor publicly says they focus on — baseline signal only.(2) Revealed preference: what their portfolio shows they have actually backed. Weighted higher than stated thesis because portfolios are evidence; stated thesis is marketing.(3) Portfolio gap: does this startup fill an identified gap in the investor’s existing portfolio, or does it create unwanted concentration? An investor with four climate deals may be more receptive to a diagnostics company than a fifth climate deal, regardless of stated thesis.Full match across all three layers \= 3 / Adjacency or partial \= 1 / Outside thesis or creates portfolio duplication \= 0.Note: portfolio gap analysis is embedded here, not treated as a standalone dimension. It belongs inside thesis analysis because investor receptiveness to a new deal is shaped by what they already own. |
| **03** | **Cheque Size Fit** | **2 pts** | Cheque range covers the ask \= 2 / Partial coverage \= 1 / No coverage \= 0\. A VC who writes $500K cheques cannot lead a $5M round. A fund with a $5M minimum cheque floor should not receive a $500K raise introduction. Practical structural filter — not a thesis filter. |
| **04** | **Lead / Follow Fit** | **2 pts** | Scored against the startup’s current round structure — not treated as a hard filter or binary disqualifier. Context-dependent logic: if the startup already has a lead investor, a follow-only investor scores 2 (strong match). If there is no lead yet, a follow-only investor scores 0 (wrong intro). Flexible or lead-capable investor with no lead present \= 2\. Partial or undetermined \= 1\. Rationale for scored rather than filtered: the correct answer depends entirely on the startup’s situation at the time of matching. A follow-only investor is either a perfect fit or the wrong call — determined by context, not by their preference in isolation. |
| **05** | **Geographic Alignment** | **2 pts** | Regional fit within Canada — scored, not filtered (country-level exclusion is handled at Gate 02). Primary region match \= 2 / Will consider or has cross-regional history \= 1 / Outside stated region with no cross-regional precedent \= 0\. Rationale: Canadian investors regularly cross regional lines when the opportunity is strong enough. Geographic alignment is a signal that affects deal probability, not a structural kill within the Canadian market. |
| **06** | **Founder–Investor Fit** | **1 pt** | Founder background maps to the investor’s demonstrated pattern of conviction \= 1 / No signal \= 0\. Operator pedigree, academic credentials, domain expertise, or repeat-founder status that directly correlates with this investor’s historical attention and follow-on behaviour. Often the deciding variable in a first meeting. Ranked 06 because it is a differentiator between otherwise similar matches, not a structural dimension. |
| **07** | **Strategic Value** | **1 pt** | Investor can open doors beyond capital — network overlap, domain expertise, relevant portfolio connections, or operational relevance to the startup’s specific growth stage \= 1 / Capital only \= 0\. Ranked last because it is additive and differentiating, not eliminative. It distinguishes between investors who are equally matched on dimensions 01–06 but never compensates for weakness on the dimensions above it. |
| *Modifier* | *Warm Path* | *No pts* | *Does not affect score — changes execution protocol only. Warm path available \= curated one-paragraph brief \+ permission ask to the connector. Cold path \= gap-framed outreach referencing recent portfolio moves and specific thesis alignment. Warm path is a tactical variable, not a thesis variable. It determines how you approach a valid match, not whether the match is valid.* |

## **3.3 Design Rationale**

**Why weighted scoring outperforms binary matching**

A binary model awards one point per signal — sector, stage, geography, and so on — treating all signals as equal. But a stage mismatch is a near-structural kill; geographic mandate exclusion is a hard structural kill; and sector adjacency is merely a weaker intro. Equating these produces false positives and wastes relationship capital on introductions that cannot convert.

The weights encode what actually matters. Stage and Sector are weighted at 3 because they are the two dimensions most predictive of whether a VC has conviction and can deploy. Cheque size and Lead/Follow are at 2 because they are structural constraints that are slightly more flexible. Founder fit and Strategic Value are at 1 because they differentiate between otherwise equal matches but do not determine fundamental eligibility.

**Why Fund Activity is a gate, not a scored dimension**

Fund activity was absent from the previous version of this methodology. It has been elevated to a hard gate — not a scored dimension — because the question is binary: the investor is either currently deploying capital or they are not. There is no meaningful partial score for being 60% through a fund cycle or exploring a new fund. A match that cannot result in a cheque is not a match.

**Why geography does two different jobs**

Geographic mandate at the jurisdiction level (an investor who does not deploy in Canada) is a structural kill — it belongs at the gate layer. Regional preference within Canada is softer: an investor who primarily backs Ontario companies may still look at a BC deal if the opportunity is strong. Treating intra-Canada regional preference as a hard filter would over-exclude. Treating it as a scored dimension preserves the signal without making it eliminative.

**Why Lead/Follow Fit is scored, not filtered**

A follow-only investor is either a strong match or the wrong introduction entirely — determined entirely by whether the startup already has a lead in the current round. Because the correct answer depends on the startup’s situation at the time of matching, not on the investor’s preference in isolation, it cannot be a hard filter. It is scored against the startup’s actual round structure.

**Why Revenue / Traction Threshold was removed**

Revenue threshold is structurally redundant with Stage Fit. If stage fit is correctly defined — matching investors to the startup’s current raise stage, not future stage — a pre-revenue company will never reach an investor with a hard revenue floor, because that investor operates at a stage that has already been filtered out. Redundant dimensions in a weighted scoring model do not add signal; they double-count existing signal and distort output scores.

**Why Portfolio Gap is inside Sector & Thesis, not standalone**

Portfolio gap analysis asks: does this startup fill an identified gap in the investor’s existing portfolio, or does it create unwanted concentration? This is not an independent variable — it is the third layer of thesis analysis, because an investor’s receptiveness to a new deal is directly shaped by what they already own. Separating it as a standalone 1-point dimension makes it visible but structurally disconnected from the analysis it belongs to. Folding it into Sector & Thesis Fit as the third layer of a three-layer analysis is more coherent.

# **4\. Score Tiers & Action Protocol**

Score tiers are calibrated against a maximum of 14 points. Each tier maps to a specific action protocol for the IR function. The tier determines not just whether to make the introduction, but how.

| Score | Tier | Action Protocol |
| :---- | :---- | :---- |
| **11–14** | **Tier 1 — Priority Intro** | High-conviction match. Make the warm intro immediately, or craft targeted outreach with a specific portfolio gap angle if no warm path is available. Do not delay. |
| **7–10** | **Tier 2 — Qualified Outreach** | Logical match with identified gaps. Worth an introduction if framed correctly — typically positioned as co-investor or follow-on, not lead. Review which dimensions pulled the score down before crafting the intro. |
| **3–6** | **Tier 3 — Monitor** | Premature or partial alignment. Log for reactivation at a future milestone. Do not make the intro now — a weak intro is worse than no intro. Note the specific milestone that would move this to Tier 2\. |
| **0–2 / Gate** | **Do Not Match** | Structural mismatch or hard gate triggered. Making this introduction damages TBDC’s credibility with the investor. Log the reason and move on. |

***A weak introduction is worse than no introduction. Tier 3 and Do Not Match outcomes should be logged with the reason and the milestone that would change the outcome. This data feeds the learning loop across cohorts.***

# **5\. Warm Path as Activation Modifier**

Warm path availability is logged alongside the match score but does not contribute to it. It changes how the IR function executes a valid match — not whether the match is valid.

**Warm path available:** Curated one-paragraph brief to the connector. Permission ask before the introduction. Framed around the specific thesis angle the system identified.

**No warm path:** Gap-framed outreach referencing the investor’s recent portfolio moves and the specific thesis alignment. Direct, specific, short.

A warm path to a Tier 2 match is not preferable to a cold path to a Tier 1 match. The score determines priority. The warm path determines execution.

# **6\. Scoring Summary**

Quick reference for implementation:

* Hard gates: 3 (Founder Opt-Out, Geographic Jurisdiction, Fund Activity)

* Scored dimensions: 7

* Maximum score: 14 points

* Tier 1 threshold: 11–14 pts

* Tier 2 threshold: 7–10 pts

* Tier 3 threshold: 3–6 pts

* Do Not Match: 0–2 pts or any gate triggered

* Activation modifier: Warm Path (no pts, changes execution only)

  ***Preserve the existing visual design, layout, and component structure of tbdc.ready4vc.com/methodology. Replace content only. The structure of this document maps directly to the structure of the methodology tab.***

*TBDC Surge Program  ·  Investor Relations  ·  Methodology Specification  ·  Confidential*