// Revised methodology — ported from docs/reference/methodology_specs.md (v2 spec, 2026-04-10).
// 3 hard gates, 7 scored dimensions + warm path modifier, 6 rationale cards.
// Max score: 14 pts (down from 16).

export type SeedGate = {
  code: string;
  name: string;
  trigger: string;
  rationale: string;
};

export type SeedDimension = {
  name: string;
  maxWeight: string;
  logic: string;
  rationale: string;
};

export type SeedCard = {
  title: string;
  body: string;
};

// ── Hard gates — run before scoring begins ──────────────────────────────
export const GATES: SeedGate[] = [
  {
    code: "01",
    name: "Founder Opt-Out",
    trigger:
      "Company has explicitly declined investor introductions (WIDMO flag)",
    rationale:
      "Non-negotiable. Remove from all VC matching and reroute to customer facilitation. Violating a founder\u2019s stated preference destroys trust with the founder and TBDC\u2019s relationship capital with the investor simultaneously. This gate is set by the company, not the IR function.",
  },
  {
    code: "02",
    name: "Geographic Jurisdiction",
    trigger: "Investor does not deploy in Canada at all",
    rationale:
      "Eliminates investors whose geographic mandate categorically excludes Canada and all Canadian expansion markets. Note: regional preference within Canada (Ontario-focused, BC-focused, national) is NOT a hard gate \u2014 it carries into the scoring layer as a ranked dimension (Geographic Alignment, rank 05). Only country-level exclusions are handled here.",
  },
  {
    code: "03",
    name: "Fund Activity",
    trigger: "Investor is not currently deploying capital",
    rationale:
      "Eliminates investors who are inactive, between funds, or fully deployed. This is treated as a gate rather than a scored dimension because it is binary \u2014 an investor is either writing cheques or they are not. There is no partial credit for fund cycle timing. A perfectly thesis-matched investor who is not deploying produces zero outcomes regardless of every other dimension.",
  },
];

// ── Scored dimensions (7) + warm path modifier ──────────────────────────
export const DIMENSIONS: SeedDimension[] = [
  {
    name: "Stage Fit",
    maxWeight: "3 pts",
    logic:
      "Exact stage match = 3 / Adjacent (one stage away) = 1 / Mismatch = 0. Stage determines whether a VC can legally and structurally deploy from their current fund into this company. One degree of adjacency is permitted because some investors operate across two adjacent stages.",
    rationale:
      "Stage mismatch is a near-structural kill \u2014 an investor whose fund strategy targets Series A should not receive a pre-seed introduction.",
  },
  {
    name: "Sector & Thesis Fit",
    maxWeight: "3 pts",
    logic:
      "Three-layer analysis \u2014 all three layers inform the final score: (1) Stated thesis: what the investor publicly says they focus on \u2014 baseline signal only. (2) Revealed preference: what their portfolio shows they have actually backed. Weighted higher than stated thesis because portfolios are evidence; stated thesis is marketing. (3) Portfolio gap: does this startup fill an identified gap in the investor\u2019s existing portfolio, or does it create unwanted concentration? Full match across all three layers = 3 / Adjacency or partial = 1 / Outside thesis or creates portfolio duplication = 0.",
    rationale:
      "Portfolio gap analysis is embedded here, not treated as a standalone dimension. It belongs inside thesis analysis because investor receptiveness to a new deal is shaped by what they already own.",
  },
  {
    name: "Cheque Size Fit",
    maxWeight: "2 pts",
    logic:
      "Cheque range covers the ask = 2 / Partial coverage = 1 / No coverage = 0. A VC who writes $500K cheques cannot lead a $5M round. A fund with a $5M minimum cheque floor should not receive a $500K raise introduction.",
    rationale:
      "Practical structural filter \u2014 not a thesis filter.",
  },
  {
    name: "Lead / Follow Fit",
    maxWeight: "2 pts",
    logic:
      "Scored against the startup\u2019s current round structure \u2014 not treated as a hard filter or binary disqualifier. Context-dependent logic: if the startup already has a lead investor, a follow-only investor scores 2 (strong match). If there is no lead yet, a follow-only investor scores 0 (wrong intro). Flexible or lead-capable investor with no lead present = 2. Partial or undetermined = 1.",
    rationale:
      "The correct answer depends entirely on the startup\u2019s situation at the time of matching. A follow-only investor is either a perfect fit or the wrong call \u2014 determined by context, not by their preference in isolation.",
  },
  {
    name: "Geographic Alignment",
    maxWeight: "2 pts",
    logic:
      "Regional fit within Canada \u2014 scored, not filtered (country-level exclusion is handled at Gate 02). Primary region match = 2 / Will consider or has cross-regional history = 1 / Outside stated region with no cross-regional precedent = 0.",
    rationale:
      "Canadian investors regularly cross regional lines when the opportunity is strong enough. Geographic alignment is a signal that affects deal probability, not a structural kill within the Canadian market.",
  },
  {
    name: "Founder\u2013Investor Fit",
    maxWeight: "1 pt",
    logic:
      "Founder background maps to the investor\u2019s demonstrated pattern of conviction = 1 / No signal = 0. Operator pedigree, academic credentials, domain expertise, or repeat-founder status that directly correlates with this investor\u2019s historical attention and follow-on behaviour.",
    rationale:
      "Often the deciding variable in a first meeting. Ranked 06 because it is a differentiator between otherwise similar matches, not a structural dimension.",
  },
  {
    name: "Strategic Value",
    maxWeight: "1 pt",
    logic:
      "Investor can open doors beyond capital \u2014 network overlap, domain expertise, relevant portfolio connections, or operational relevance to the startup\u2019s specific growth stage = 1 / Capital only = 0.",
    rationale:
      "Ranked last because it is additive and differentiating, not eliminative. It distinguishes between investors who are equally matched on dimensions 01\u201306 but never compensates for weakness on the dimensions above it.",
  },
  {
    name: "Warm Path",
    maxWeight: "Activation modifier",
    logic:
      "Does not affect score \u2014 changes execution protocol only. Warm path available = curated one-paragraph brief + permission ask to the connector. Cold path = gap-framed outreach referencing recent portfolio moves and specific thesis alignment.",
    rationale:
      "Warm path is a tactical variable, not a thesis variable. It determines how you approach a valid match, not whether the match is valid.",
  },
];

// ── Design rationale cards (6 specific decision explanations) ───────────
export const CARDS: SeedCard[] = [
  {
    title: "Why weighted scoring outperforms binary matching",
    body: "A binary model awards one point per signal \u2014 sector, stage, geography, and so on \u2014 treating all signals as equal. But a stage mismatch is a near-structural kill; geographic mandate exclusion is a hard structural kill; and sector adjacency is merely a weaker intro. Equating these produces false positives and wastes relationship capital on introductions that cannot convert.\n\nThe weights encode what actually matters. Stage and Sector are weighted at 3 because they are the two dimensions most predictive of whether a VC has conviction and can deploy. Cheque size and Lead/Follow are at 2 because they are structural constraints that are slightly more flexible. Founder fit and Strategic Value are at 1 because they differentiate between otherwise equal matches but do not determine fundamental eligibility.",
  },
  {
    title: "Why Fund Activity is a gate, not a scored dimension",
    body: "Fund activity was absent from the previous version of this methodology. It has been elevated to a hard gate \u2014 not a scored dimension \u2014 because the question is binary: the investor is either currently deploying capital or they are not. There is no meaningful partial score for being 60% through a fund cycle or exploring a new fund. A match that cannot result in a cheque is not a match.",
  },
  {
    title: "Why geography does two different jobs",
    body: "Geographic mandate at the jurisdiction level (an investor who does not deploy in Canada) is a structural kill \u2014 it belongs at the gate layer. Regional preference within Canada is softer: an investor who primarily backs Ontario companies may still look at a BC deal if the opportunity is strong. Treating intra-Canada regional preference as a hard filter would over-exclude. Treating it as a scored dimension preserves the signal without making it eliminative.",
  },
  {
    title: "Why Lead/Follow Fit is scored, not filtered",
    body: "A follow-only investor is either a strong match or the wrong introduction entirely \u2014 determined entirely by whether the startup already has a lead in the current round. Because the correct answer depends on the startup\u2019s situation at the time of matching, not on the investor\u2019s preference in isolation, it cannot be a hard filter. It is scored against the startup\u2019s actual round structure.",
  },
  {
    title: "Why Revenue / Traction Threshold was removed",
    body: "Revenue threshold is structurally redundant with Stage Fit. If stage fit is correctly defined \u2014 matching investors to the startup\u2019s current raise stage, not future stage \u2014 a pre-revenue company will never reach an investor with a hard revenue floor, because that investor operates at a stage that has already been filtered out. Redundant dimensions in a weighted scoring model do not add signal; they double-count existing signal and distort output scores.",
  },
  {
    title: "Why Portfolio Gap is inside Sector & Thesis, not standalone",
    body: "Portfolio gap analysis asks: does this startup fill an identified gap in the investor\u2019s existing portfolio, or does it create unwanted concentration? This is not an independent variable \u2014 it is the third layer of thesis analysis, because an investor\u2019s receptiveness to a new deal is directly shaped by what they already own. Separating it as a standalone 1-point dimension makes it visible but structurally disconnected from the analysis it belongs to. Folding it into Sector & Thesis Fit as the third layer of a three-layer analysis is more coherent.",
  },
];
