// Ported verbatim from docs/reference/tbdc_investor_matching_poc_v2.html `var INVESTORS`.
// Do not edit here — the reference HTML is the source of truth.

export type SeedInvestor = {
  name: string;
  type: string;
  stage: string;
  sectors: string;
  chequeSize: string;
  geography: string;
  leadOrFollow: string;
  deals12m: string;
  notablePortfolio: string;
  contactApproach: string;
};

export const INVESTORS: SeedInvestor[] = [
  { name: "Radical Ventures", type: "VC", stage: "Seed–Series A", sectors: "Enterprise AI, Deep Tech, Applied ML", chequeSize: "$2–15M CAD", geography: "Canada+US", leadOrFollow: "Lead", deals12m: "6–8", notablePortfolio: "Cohere, Ada, Layer 6", contactApproach: "Jordan Jacobs (Partner) — LinkedIn outreach or TBDC warm path" },
  { name: "Golden Ventures", type: "VC", stage: "Pre-seed–Seed", sectors: "B2B SaaS, Applied AI, Marketplace", chequeSize: "$500K–$2M CAD", geography: "Canada", leadOrFollow: "Lead", deals12m: "8–12", notablePortfolio: "Wealthsimple (early), Nudge, Drop", contactApproach: "Janet Bannister (GP) — LinkedIn or via Canadian VC network" },
  { name: "Panache Ventures", type: "VC", stage: "Pre-seed–Seed", sectors: "B2B SaaS, Deep Tech, Fintech", chequeSize: "$500K–$1.5M CAD", geography: "Canada", leadOrFollow: "Lead", deals12m: "10–15", notablePortfolio: "Voiceflow, Snapcommerce, Taloflow", contactApproach: "Julien Brault or Karam Nijjar — LinkedIn" },
  { name: "Portage Ventures", type: "VC", stage: "Seed–Series B", sectors: "FinTech, InsurTech, WealthTech", chequeSize: "$2–20M CAD", geography: "Canada+Global", leadOrFollow: "Lead", deals12m: "4–6", notablePortfolio: "Wealthsimple, Koho, Borrowell", contactApproach: "Adam Felesky (GP) — LinkedIn or InsurTech event circuit" },
  { name: "Impression Ventures", type: "VC", stage: "Seed–Series A", sectors: "InsurTech, FinTech", chequeSize: "$1–5M CAD", geography: "Canada+US", leadOrFollow: "Lead", deals12m: "3–5", notablePortfolio: "Breathe Life, Foxquilt", contactApproach: "Jason Barg (Partner) — LinkedIn" },
  { name: "Inovia Capital", type: "VC", stage: "Seed–Series B", sectors: "B2B SaaS, Marketplace, FinTech", chequeSize: "$2–20M CAD", geography: "Canada+Global", leadOrFollow: "Lead", deals12m: "6–10", notablePortfolio: "Lightspeed, Snaptravel, Breather", contactApproach: "Patrick Pichette or Dennis Kavelman — via TBDC warm path" },
  { name: "OMERS Ventures", type: "VC", stage: "Series A–B", sectors: "Enterprise SaaS, FinTech, Health", chequeSize: "$5–30M CAD", geography: "Canada+US+Europe", leadOrFollow: "Lead", deals12m: "4–6", notablePortfolio: "Shopify (early), Wave, Invest", contactApproach: "Jameel Khalfan — LinkedIn or via TBDC" },
  { name: "BDC Capital (IT)", type: "Government", stage: "Seed–Series B", sectors: "IT, SaaS, Enterprise Software", chequeSize: "$500K–$5M CAD", geography: "Canada only", leadOrFollow: "Follow", deals12m: "15–20", notablePortfolio: "Breather (co), Proposify", contactApproach: "Regional BDC advisor — via TBDC relationship (warm)" },
  { name: "BDC Capital (Cleantech)", type: "Government", stage: "Seed–Series B", sectors: "Cleantech, Energy, Sustainability", chequeSize: "$500K–$5M CAD", geography: "Canada only", leadOrFollow: "Follow", deals12m: "8–12", notablePortfolio: "Various cleantech cos", contactApproach: "BDC Cleantech Practice — via TBDC warm path" },
  { name: "MaRS IAF", type: "Government", stage: "Seed", sectors: "ICT, Cleantech, Life Sciences", chequeSize: "$500K–$1M CAD", geography: "Ontario", leadOrFollow: "Follow", deals12m: "12–18", notablePortfolio: "Various Ontario scale-ups", contactApproach: "Via MaRS relationship (TBDC has existing connection)" },
  { name: "Cycle Capital", type: "VC", stage: "Seed–Series B", sectors: "Cleantech, Energy Transition, EV", chequeSize: "$1–5M CAD", geography: "Canada", leadOrFollow: "Lead", deals12m: "4–6", notablePortfolio: "Enerkem, Axis Labs", contactApproach: "Andrée-Lise Méthot (Founder) — cleantech event circuit" },
  { name: "Greensoil Proptech", type: "VC", stage: "Seed–Series A", sectors: "PropTech, Cleantech, Smart Buildings", chequeSize: "$1–5M CAD", geography: "Canada+US", leadOrFollow: "Lead", deals12m: "4–6", notablePortfolio: "Lane, Measurabl", contactApproach: "Ben Zifkin — LinkedIn or Proptech Canada events" },
  { name: "Staircase Ventures", type: "VC", stage: "Pre-seed–Seed", sectors: "B2B SaaS, Fintech, AI", chequeSize: "$250K–$1M CAD", geography: "Canada", leadOrFollow: "Lead", deals12m: "8–12", notablePortfolio: "Various early-stage Canadian cos", contactApproach: "Partners via LinkedIn — TBDC may have warm path" },
  { name: "Georgian", type: "VC", stage: "Series B–C", sectors: "B2B Applied AI, Enterprise SaaS", chequeSize: "$20–80M CAD", geography: "Canada+US", leadOrFollow: "Lead", deals12m: "4–6", notablePortfolio: "Canvass, Veriday, Q4", contactApproach: "Simon Chong — LinkedIn (Series B+ only)" },
  { name: "Accel India", type: "VC", stage: "Seed–Series B", sectors: "FinTech, Consumer Tech, B2B SaaS", chequeSize: "$2–25M USD", geography: "India+Global", leadOrFollow: "Lead", deals12m: "10–15", notablePortfolio: "Flipkart, Freshworks, BrowserStack", contactApproach: "Anand Daniel (Partner) — LinkedIn or India VC circuit" },
  { name: "Peak XV (Sequoia India)", type: "VC", stage: "Seed–Series B", sectors: "Consumer Commerce, FinTech, SaaS", chequeSize: "$5–50M USD", geography: "India+SE Asia", leadOrFollow: "Lead", deals12m: "8–12", notablePortfolio: "Zomato, Meesho, Razorpay", contactApproach: "Rajan Anandan — LinkedIn" },
  { name: "Lightspeed India", type: "VC", stage: "Seed–Series B", sectors: "Consumer Tech, FinTech, B2B", chequeSize: "$2–20M USD", geography: "India+SE Asia+Global", leadOrFollow: "Lead", deals12m: "8–12", notablePortfolio: "Byju's, OYO, ShareChat", contactApproach: "Hemant Mohapatra — LinkedIn" },
  { name: "STV", type: "VC", stage: "Seed–Series B", sectors: "MENA SaaS, Logistics, FinTech", chequeSize: "$1–20M USD", geography: "GCC+MENA", leadOrFollow: "Lead", deals12m: "6–8", notablePortfolio: "Foodics, Lean, Baraka", contactApproach: "Ahmed Shagar or Kholoud AlMeshal — MENA VC circuit (Ahmed Korayem warm path possible)" },
  { name: "Wamda Capital", type: "VC", stage: "Seed–Series A", sectors: "MENA Enterprise SaaS, Tech", chequeSize: "$500K–$5M USD", geography: "MENA", leadOrFollow: "Follow", deals12m: "4–6", notablePortfolio: "Souq (early), Fetchr", contactApproach: "Via MENA network — Ahmed Korayem warm path possible" },
  { name: "Northzone", type: "VC", stage: "Seed–Series B", sectors: "SaaS, FinTech, Infrastructure, IoT", chequeSize: "$5–30M USD", geography: "Europe+NA", leadOrFollow: "Lead", deals12m: "6–8", notablePortfolio: "Spotify (early), Klarna, iZettle", contactApproach: "Pär-Jörgen Pärson — LinkedIn or European tech circuit" },
  { name: "Earlybird", type: "VC", stage: "Seed–Series A", sectors: "Deep Tech, Enterprise SaaS, Industrial", chequeSize: "$2–15M USD", geography: "Europe", leadOrFollow: "Lead", deals12m: "6–10", notablePortfolio: "UiPath (early), N26, Trigo", contactApproach: "Hendrik Brandis — LinkedIn" },
  { name: "EQT Ventures", type: "VC", stage: "Series A–B", sectors: "Nordic Deep Tech, SaaS, Climate", chequeSize: "$10–50M USD", geography: "Europe+Global", leadOrFollow: "Lead", deals12m: "4–6", notablePortfolio: "Ebury, Wolt, Peakon", contactApproach: "EQT Ventures team — LinkedIn or Nordic tech circuit" },
  { name: "Balderton Capital", type: "VC", stage: "Seed–Series B", sectors: "European SaaS, FinTech, Marketplaces", chequeSize: "$5–30M USD", geography: "Europe+Global", leadOrFollow: "Lead", deals12m: "6–10", notablePortfolio: "Revolut, Depop, Talend", contactApproach: "Daniel Waterhouse — LinkedIn" },
  { name: "MaRS ION", type: "Government", stage: "Seed", sectors: "CleanTech, Energy, Sustainability", chequeSize: "$500K–$1.5M CAD", geography: "Ontario", leadOrFollow: "Follow", deals12m: "6–10", notablePortfolio: "Various Ontario cleantech cos", contactApproach: "Via MaRS relationship (TBDC warm path)" },
];
