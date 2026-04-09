// Ported verbatim from docs/reference/tbdc_investor_matching_poc_v2.html `var COMPANIES`.

export type SeedCompany = {
  name: string;
  cohort: string;
  stage: string;
  sector: string;
  arrTraction: string;
  askSize: string;
  homeMarket: string;
  targetMarket: string;
  founderProfile: string;
  acceptsInvestorIntros: boolean;
  gateNote?: string;
};

export const COMPANIES: SeedCompany[] = [
  { name: "Fermi Dev", cohort: "Pivot 1", stage: "Early Seed", sector: "Enterprise AI / Manufacturing", arrTraction: "2 paying customers — Zeiss Pharma, Agora Analytics", askSize: "$1–3M CAD", homeMarket: "Toronto", targetMarket: "Canada + India secondary", founderProfile: "Operator (ex-Amazon, 9yr AI research)", acceptsInvestorIntros: true },
  { name: "Aibo Fintech", cohort: "Pivot 1", stage: "Pre-seed", sector: "InsurTech / B2B2C", arrTraction: "Pre-revenue — 4 partners in discussion", askSize: "$500K–$2M CAD", homeMarket: "Ontario", targetMarket: "Ontario + New Brunswick", founderProfile: "Operator (IIM Bangalore, ex-Policybazaar, ex-RSA, ex-Kotak)", acceptsInvestorIntros: true },
  { name: "Try and Buy", cohort: "Pivot 1", stage: "Series A Ready", sector: "Fashion AI / Visual Commerce", arrTraction: "Amazon US, Flipkart, Myntra, Rakuten, Coupang as clients. 70+ patents.", askSize: "$5–15M USD", homeMarket: "India + USA", targetMarket: "Canada expansion", founderProfile: "Technical + Operator (Amazon Innovator 2020)", acceptsInvestorIntros: true },
  { name: "Monk Trader", cohort: "Pivot 1", stage: "Seed", sector: "FinTech / Investment OS", arrTraction: "16,000+ organic users. 12-broker white-label pipeline (UAE + Germany).", askSize: "$2–5M USD", homeMarket: "India", targetMarket: "Canada / US / EU", founderProfile: "Operator (ex-YES Securities President, built Angel Broking to 50M users)", acceptsInvestorIntros: true },
  { name: "Omniful", cohort: "Pivot 1", stage: "Series A", sector: "Supply Chain / OMS / SaaS", arrTraction: "90+ clients, 20 countries, 5.1M+ orders. Aramex 4-yr partnership.", askSize: "$5–15M USD", homeMarket: "GCC + India", targetMarket: "Canada Q1 2026", founderProfile: "Operator + Technical (Egyptian-Canadian, Cairo background)", acceptsInvestorIntros: true },
  { name: "Voltie", cohort: "Horizon 3", stage: "Seed", sector: "EV Charging / Cleantech / Hardware", arrTraction: "2,000+ EU deployments. 30+ resellers. 10x revenue growth 2023.", askSize: "$2M CAD", homeMarket: "Latvia (EU)", targetMarket: "Canada — condos, MURBs, hospitality", founderProfile: "Technical + Operator", acceptsInvestorIntros: true },
  { name: "SaMMY PC", cohort: "Horizon 3", stage: "Seed", sector: "Marina IoT / PropTech / Digital Twin", arrTraction: "40+ EU marina deployments. 8,000+ berth bookings projected 2025.", askSize: "€12M total (mixed grant + VC)", homeMarket: "Greece (EU)", targetMarket: "Ontario + East Coast Canada", founderProfile: "Technical (IoT + maritime domain)", acceptsInvestorIntros: true },
  { name: "Quanscient", cohort: "Horizon 3", stage: "Series A", sector: "Deep Tech / Engineering Simulation", arrTraction: "~€500K ARR. 15 enterprise clients incl. Bosch.", askSize: "Series A (amount undisclosed)", homeMarket: "Finland", targetMarket: "Canada as NA GTM base", founderProfile: "Technical (PhD-level physics + quantum computing)", acceptsInvestorIntros: true },
  { name: "VEMOCO", cohort: "Horizon 3", stage: "Seed–Series A", sector: "Fleet Telematics / SaaS", arrTraction: "$501K–$1M ARR. Tesco, Vodafone, Heineken, KFC (EU clients).", askSize: "Open to strategic — not actively raising", homeMarket: "Hungary + Toronto", targetMarket: "North America scale", founderProfile: "Operator (enterprise SaaS background)", acceptsInvestorIntros: true },
  {
    name: "WIDMO Spectral", cohort: "Horizon 3", stage: "Seed", sector: "Deep Tech / GPR / Mining",
    arrTraction: "$250K–$500K ARR. €10M+ non-dilutive funding.",
    askSize: "CAD $2.5M — customer meetings only",
    homeMarket: "Poland",
    targetMarket: "Canada — mining, aggregates, geotechnical",
    founderProfile: "Technical (deep tech, radar engineering)",
    acceptsInvestorIntros: false,
    gateNote:
      "WIDMO has stated clearly that they do not want investor introductions from TBDC. This is not a minor detail — it is the first thing any partnerships manager should register when reviewing this company. The system flags this gate before running any matching logic. WIDMO never appears in a VC match output. All support is redirected to customer meeting facilitation in mining, aggregates, and geotechnical engineering sectors.",
  },
];
