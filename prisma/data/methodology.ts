// Ported verbatim from reference/tbdc_investor_matching_poc_v2.html Methodology page.

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

export const DIMENSIONS: SeedDimension[] = [
  {
    name: "Hard gate — investor exclusion",
    maxWeight: "KILLS MATCH",
    logic: "Company explicitly declined investor intros → removed from all VC matching, rerouted to customer facilitation",
    rationale: "Non-negotiable. Violating a founder's stated preference destroys trust and TBDC's relationship capital simultaneously.",
  },
  {
    name: "Geographic mandate",
    maxWeight: "3 pts",
    logic: "Full mandate match = 3 / Partial (e.g. expanding to Canada) = 1 / Outside mandate = 0",
    rationale: "A geographic mismatch is a structural kill — it overrides sector and stage alignment. Weighted highest after the hard gate.",
  },
  {
    name: "Stage fit",
    maxWeight: "3 pts",
    logic: "Exact stage match = 3 / Adjacent (one stage away) = 1 / Mismatch = 0",
    rationale: "Stage determines whether a VC can legally deploy from their fund into this company. Non-negotiable but has one degree of adjacency.",
  },
  {
    name: "Sector thesis",
    maxWeight: "3 pts",
    logic: "Primary thesis match = 3 / Adjacency = 1 / Outside thesis = 0",
    rationale: "Sector mismatch means no conviction — and conviction drives follow-on. Adjacency is worth an intro, not a lead.",
  },
  {
    name: "Revenue / traction threshold",
    maxWeight: "2 pts",
    logic: "Meets investor floor = 2 / Near floor (within 50%) = 1 / Below floor = 0",
    rationale: "Revenue requirements are often stated but rarely enforced strictly at pre-seed. Weighted lower than structural dimensions.",
  },
  {
    name: "Cheque size vs. ask",
    maxWeight: "2 pts",
    logic: "Cheque range covers the ask = 2 / Partial coverage = 1 / No coverage = 0",
    rationale: "A VC who writes $500K cheques cannot lead a $5M round. Practical filter, not a thesis filter.",
  },
  {
    name: "Founder–investor fit",
    maxWeight: "2 pts",
    logic: "Founder background maps to VC's pattern of conviction = 2 / Some alignment = 1 / No signal = 0",
    rationale: "Often the deciding variable in first meetings. Operator pedigree, academic credentials, or repeat-founder status directly correlate with VC attention.",
  },
  {
    name: "Portfolio gap (no duplicate)",
    maxWeight: "1 pt",
    logic: "Fills identified gap = 1 / Duplicates existing portfolio = 0",
    rationale: "A VC who already has a supply chain company won't back another — and you need to know this before making the intro.",
  },
  {
    name: "Warm path available",
    maxWeight: "Activation modifier",
    logic: "Does not change score — changes activation sequence (warm intro vs. cold outreach vs. hold)",
    rationale: "Warm path is a tactical variable, not a thesis variable. It determines how you approach a valid match, not whether the match is valid.",
  },
];

export const CARDS: SeedCard[] = [
  {
    title: "The problem with 1-point-per-signal",
    body: "The alternate method awards one point for sector, one for stage, one for geography, and so on — treating all signals as equal. But a geographic mandate mismatch is a structural kill; an investor who funds only Canadian companies cannot invest in a Latvian hardware startup regardless of sector alignment. Equating that with a sector adjacency gap produces false positives and wastes relationship capital on introductions that will never convert.",
  },
  {
    title: "What the weights encode",
    body: "Geography and stage are weighted at 3 because they are structural constraints — violating either means the VC literally cannot make the investment from their current fund. Sector is also 3 because thesis mismatch means no conviction, and without conviction a VC won't follow on. Revenue, cheque size, and founder fit are weighted at 2 or 1 because they have more flexibility — a pre-revenue company can still get a pre-seed meeting with the right founder pedigree.",
  },
  {
    title: "Hard gates before scoring",
    body: "The scoring algorithm runs only after hard exclusion gates clear. Two gates: (1) has the company explicitly declined investor introductions? (WIDMO) and (2) does the investor's geographic mandate categorically exclude this company's home and expansion markets? If either gate fires, the company never appears in the investor's match output — regardless of score. This is what separates a partnerships manager from a pattern-matcher.",
  },
  {
    title: "Warm path as activation modifier",
    body: "The alternate method doesn't distinguish between a cold intro and a warm one. This matters enormously for conversion rates. A warm intro from TBDC to Radical Ventures lands differently than a cold email. The system logs warm path availability separately from score — it doesn't inflate the match quality, but it does change the activation protocol: warm paths get a curated one-paragraph brief and a permission ask; cold paths get a gap-framed outreach referencing recent portfolio moves.",
  },
];
