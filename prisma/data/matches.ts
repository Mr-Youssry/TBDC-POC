// Ported verbatim from docs/reference/tbdc_investor_matching_poc_v2.html `var MATCHES`.
// `companyIndex` corresponds to the order in COMPANIES (0-indexed).

export type SeedScoredMatch = {
  investor: string;
  score: number;
  geo: number;
  stage: number;
  sector: number;
  revenue: number;
  cheque: number;
  founder: number;
  gap: number;
  warmPath: string;
  portfolioGap: string;
  rationale: string;
  nextStep: string;
};

export type SeedDoNotMatch = {
  // Either an investor name that exists in INVESTORS, or a descriptive label
  // (used for grouped entries like "Golden/Panache/Staircase")
  label: string;
  reason: string;
};

export type SeedCustomerTarget = {
  name: string;
  targetType: string;
  hq: string;
  description: string;
};

export type SeedMatchBlock = {
  companyIndex: number;
  widmo?: boolean;
  tier1?: SeedScoredMatch[];
  tier2?: SeedScoredMatch[];
  doNotMatch?: SeedDoNotMatch[];
  customerTargets?: SeedCustomerTarget[];
  events?: string[];
};

export const MATCH_BLOCKS: SeedMatchBlock[] = [
  {
    companyIndex: 0,
    tier1: [
      { investor: "Radical Ventures", score: 14, geo: 3, stage: 3, sector: 3, revenue: 2, cheque: 2, founder: 1, gap: 0, warmPath: "Cold — strong thesis case", portfolioGap: "No manufacturing AI in CA VC portfolios", rationale: "Purpose-built AI thesis with deep tech conviction. Manufacturing AI is an identified portfolio gap across Canadian VC. Two paying enterprise customers (Zeiss Pharma, Agora Analytics) is sufficient traction for a first conversation at Early Seed. Vaibhav's Amazon + UC pedigree + 9yr AI research directly hits Radical's founder quality signals.", nextStep: "Research Jordan Jacobs' recent LinkedIn posts for thesis signals. Send a one-paragraph brief positioning Fermi as the manufacturing AI gap in Canadian portfolios — not as a general AI play." },
      { investor: "Golden Ventures", score: 13, geo: 3, stage: 3, sector: 3, revenue: 2, cheque: 2, founder: 1, gap: -1, warmPath: "Cold", portfolioGap: "Applied AI in industrial verticals — active gap", rationale: "B2B SaaS and applied AI is their core thesis. Early Seed is their sweet spot. Zeiss + Agora Analytics as paying enterprise customers signals the sales motion Golden responds to. Janet Bannister has written publicly about enterprise AI conviction.", nextStep: "Frame the outreach around the paying customer logos, not the technology. Golden backs GTM traction over technical novelty." },
      { investor: "Panache Ventures", score: 13, geo: 3, stage: 3, sector: 3, revenue: 2, cheque: 2, founder: 1, gap: -1, warmPath: "Cold", portfolioGap: "Limited manufacturing exposure — differentiated", rationale: "Strong B2B SaaS and deep tech mandate. Canadian-first with appetite for enterprise AI. The Amazon + 9yr AI research pedigree hits their founder quality signals precisely. Manufacturing as a vertical is underrepresented in their portfolio — differentiated positioning.", nextStep: "Cold LinkedIn outreach to Julien Brault or Karam Nijjar. Lead with Vaibhav's background before the company description." },
    ],
    tier2: [
      { investor: "BDC Capital (IT)", score: 10, geo: 3, stage: 2, sector: 2, revenue: 1, cheque: 2, founder: 1, gap: -1, warmPath: "Warm via TBDC", portfolioGap: "Broad mandate — follows well", rationale: "Best approached after a Tier 1 lead is anchored. BDC follows well and the TBDC relationship is the warm path. Activate after Radical or Golden engagement is established — BDC's co-invest signal strengthens the round narrative.", nextStep: "Leverage TBDC advisor relationship. Don't approach as a lead ask — position as co-invest once Tier 1 interest is confirmed." },
      { investor: "MaRS IAF", score: 9, geo: 2, stage: 2, sector: 2, revenue: 2, cheque: 1, founder: 1, gap: -1, warmPath: "Warm via TBDC", portfolioGap: "ICT/AI mandate covers this", rationale: "Small cheque but strategic — MaRS programming access and follow-on network is the real value. Best as bridge or co-invest. Ontario geography limits the full score.", nextStep: "TBDC warm intro to MaRS IAF via existing relationship. Frame as program participation + bridge capital, not as a lead round conversation." },
    ],
    doNotMatch: [
      { label: "Georgian", reason: "Series B+ only with $20M+ cheques. Fermi is 3–4 years from their threshold. A premature intro burns a future warm relationship — the cost is asymmetric." },
      { label: "OMERS Ventures", reason: "Series A minimum, enterprise ARR required at a meaningful scale. Same timing logic as Georgian." },
      { label: "Portage Ventures", reason: "FinTech and InsurTech exclusive thesis. Manufacturing AI has zero overlap — this meeting signals poor judgment to the VC." },
    ],
  },
  {
    companyIndex: 1,
    tier1: [
      { investor: "Portage Ventures", score: 14, geo: 3, stage: 2, sector: 3, revenue: 2, cheque: 2, founder: 2, gap: 0, warmPath: "Cold", portfolioGap: "Bilingual B2B2C insurance distribution — underexplored", rationale: "InsurTech is Portage's primary vertical. The bilingual Ontario/NB angle and B2B2C distribution model is differentiated from direct-to-consumer plays they see constantly. IIM Bangalore + Policybazaar + RSA + Kotak pedigree is exactly the founder signal Portage responds to — multi-jurisdiction operator experience is rare.", nextStep: "Frame as a distribution infrastructure play, not an insurance app. Lead with the partner pipeline (2 insurance + 2 financial) and founder pedigree before product description." },
      { investor: "Impression Ventures", score: 13, geo: 3, stage: 3, sector: 3, revenue: 1, cheque: 2, founder: 2, gap: -1, warmPath: "Cold", portfolioGap: "InsurTech mandate — pre-revenue OK at pre-seed", rationale: "Impression has invested in InsurTech at pre-revenue stage before. The multi-firm operator pedigree (Policybazaar, Kotak, RSA) is a compelling signal. First meeting is highly warranted — pre-revenue is not a disqualifier at this stage for Impression.", nextStep: "Cold LinkedIn outreach to Jason Barg. Lead with the founder backgrounds and the B2B2C distribution model — not the product feature set." },
    ],
    tier2: [
      { investor: "Golden Ventures", score: 10, geo: 3, stage: 3, sector: 1, revenue: 1, cheque: 2, founder: 1, gap: 0, warmPath: "Cold", portfolioGap: "B2B SaaS adjacent — not core InsurTech", rationale: "Pre-revenue OK and Canadian focus fits. InsurTech is not their primary thesis — approach only if Portage and Impression don't move. Frame as 'financial infrastructure SaaS' to map to their lens.", nextStep: "Hold until Portage and Impression responses are in. If neither moves within 3 weeks, approach Golden with the financial infrastructure framing." },
      { investor: "Staircase Ventures", score: 9, geo: 3, stage: 3, sector: 1, revenue: 1, cheque: 1, founder: 1, gap: 0, warmPath: "Cold", portfolioGap: "Early stage, pre-revenue friendly", rationale: "Small cheque but early-stage friendly. Best as bridge or co-investor, not a strategic lead. Portage and Impression should go first.", nextStep: "Low priority. Approach only as part of a round syndication conversation once a lead is confirmed." },
    ],
    doNotMatch: [
      { label: "OMERS Ventures", reason: "Pre-revenue at pre-seed is categorically outside OMERS mandate. They require ARR and demonstrated PMF at Series A minimum." },
      { label: "Georgian", reason: "Significantly premature. Georgian's requirements are 3+ stages ahead of where Aibo is today." },
      { label: "Cycle Capital", reason: "Cleantech-focused fund. No InsurTech or FinTech thesis relevance — a meeting wastes both parties' time." },
    ],
  },
  {
    companyIndex: 2,
    tier1: [
      { investor: "Inovia Capital", score: 14, geo: 2, stage: 3, sector: 3, revenue: 2, cheque: 2, founder: 2, gap: 0, warmPath: "Possible via TBDC", portfolioGap: "No visual commerce or fashion AI in portfolio", rationale: "Series A mandate and global portfolio appetite. Amazon Innovator of Year + 70+ patents is highly differentiated — this isn't a GenAI fashion play, it's a simulation AI company with a defensible moat. Canada expansion is the TBDC leverage point to make this a Canadian VC conversation.", nextStep: "TBDC warm path to Inovia. Frame the Canada expansion as the narrative hook — without it, a Canadian VC has limited mandate to lead a US/India-primary company." },
      { investor: "Accel India", score: 14, geo: 2, stage: 3, sector: 3, revenue: 2, cheque: 2, founder: 2, gap: 0, warmPath: "Cold — shared customer ecosystem hook", portfolioGap: "Fashion tech underrepresented in Accel India portfolio", rationale: "Flipkart and Myntra are reference customers Accel knows intimately from their own portfolio. Frame the outreach around shared ecosystem familiarity — this is a warm conversation waiting to happen if positioned correctly. Simulation AI (not GenAI) + 70+ patents is the moat story.", nextStep: "Research Anand Daniel's recent commentary on commerce AI. Cold outreach referencing Flipkart/Myntra as shared ecosystem touchpoints." },
      { investor: "Peak XV (Sequoia India)", score: 13, geo: 2, stage: 3, sector: 3, revenue: 2, cheque: 2, founder: 2, gap: 0, warmPath: "Cold", portfolioGap: "Consumer commerce AI is an active thesis", rationale: "Flipkart and Myntra are Peak XV portfolio adjacencies — the reference customer hook works here too. The simulation-not-GenAI framing is a differentiated defensibility story for their diligence process.", nextStep: "Parallel cold outreach to Peak XV alongside Accel — do not sequence, run simultaneously." },
    ],
    tier2: [
      { investor: "Lightspeed India", score: 12, geo: 2, stage: 3, sector: 2, revenue: 2, cheque: 2, founder: 2, gap: -1, warmPath: "Cold", portfolioGap: "Consumer commerce — active vertical", rationale: "Strong India franchise with consumer tech appetite. Lower conviction than Accel/Sequoia for this specific deal profile but worth parallel outreach.", nextStep: "Run simultaneously with Accel and Peak XV outreach. Same framing — customer logo hook + moat story." },
      { investor: "OMERS Ventures", score: 10, geo: 1, stage: 3, sector: 1, revenue: 2, cheque: 2, founder: 1, gap: 0, warmPath: "Possible via TBDC", portfolioGap: "Enterprise software — retail tech adjacent", rationale: "Stage match works but OMERS is primarily B2B enterprise. Canada expansion is the required framing angle. Without it, a Canadian mandate VC has limited basis to lead a US/India-primary company.", nextStep: "Only approach after India-facing VCs are engaged. Requires Canada expansion timeline to be concrete and credible." },
    ],
    doNotMatch: [
      { label: "Portage Ventures", reason: "FinTech and InsurTech exclusive. Fashion AI has no thesis overlap — this meeting damages TBDC's VC relationship quality." },
      { label: "Radical Ventures", reason: "Pure AI/ML research thesis. Simulation-based fashion tech doesn't fit their academic-origin deep tech investment lens." },
      { label: "Panache / Golden / Staircase", reason: "Stage mismatch. These VCs write $250K–$1.5M at pre-seed. Try and Buy at Series A with Amazon and Flipkart has outgrown their mandate entirely." },
    ],
  },
  {
    companyIndex: 3,
    tier1: [
      { investor: "Portage Ventures", score: 14, geo: 2, stage: 2, sector: 3, revenue: 2, cheque: 2, founder: 2, gap: 0, warmPath: "Cold", portfolioGap: "White-label broker model for retail investment — novel angle", rationale: "Fintech core thesis. White-label broker distribution is the structural angle Portage responds to — this isn't a retail investment app, it's a B2B2C infrastructure play. Founder's 50M-user Angel Broking track record is a credibility signal that commands attention in any room.", nextStep: "Frame as financial infrastructure, not investment tooling. Lead with the 12-broker white-label pipeline and the founder's track record at scale." },
      { investor: "Accel India", score: 13, geo: 2, stage: 2, sector: 3, revenue: 2, cheque: 2, founder: 2, gap: 0, warmPath: "Cold", portfolioGap: "B2B2C fintech infrastructure — active thesis", rationale: "Accel India has backed fintech infrastructure at Seed. 16K organic users + 12-broker pipeline is meaningful early distribution proof. India-to-Canada expansion follows their standard playbook for backed companies.", nextStep: "Cold outreach to Anand Daniel. Lead with organic traction and the B2B2C broker distribution model." },
    ],
    tier2: [
      { investor: "Impression Ventures", score: 11, geo: 3, stage: 2, sector: 2, revenue: 2, cheque: 2, founder: 1, gap: 0, warmPath: "Cold", portfolioGap: "Fintech mandate — investment tools adjacent", rationale: "FinTech mandate fits. Retail investing is adjacent to their core InsurTech focus. Worth a conversation if Portage doesn't move or as a co-investor to fill the round.", nextStep: "Approach as potential co-investor once Portage engagement is established." },
      { investor: "Inovia Capital", score: 10, geo: 2, stage: 2, sector: 2, revenue: 2, cheque: 2, founder: 1, gap: -1, warmPath: "Possible via TBDC", portfolioGap: "Marketplace/fintech overlap", rationale: "Global portfolio appetite fits. Frame as 'financial infrastructure SaaS' — the B2B2C white-label angle is the investor-friendly framing. Canada expansion is the hook.", nextStep: "TBDC warm path if available. Frame the Canada expansion as the primary narrative." },
    ],
    doNotMatch: [
      { label: "Radical Ventures", reason: "AI/ML deep tech thesis. Monk Trader uses AI as a feature, not as the scientific differentiation Radical requires. Wrong investor identity for this company." },
      { label: "Cycle Capital / Greensoil Proptech", reason: "Cleantech and PropTech focus. No thesis overlap with retail investment tooling whatsoever." },
      { label: "Georgian", reason: "Stage and ARR requirements not met. B2B applied AI lens doesn't map to B2B2C retail investing at 16K users." },
    ],
  },
  {
    companyIndex: 4,
    tier1: [
      { investor: "STV", score: 16, geo: 3, stage: 3, sector: 3, revenue: 2, cheque: 2, founder: 2, gap: 1, warmPath: "Possible — Ahmed MENA network", portfolioGap: "Supply chain + logistics infrastructure — GCC-native", rationale: "GCC-native supply chain SaaS replacing SAP/Oracle/Manhattan is STV's natural territory. Aramex as a 4-year partner is a tier-1 GCC logistics reference. Strongest strategic fit of any investor in this cohort. The personal connection between Ahmed Korayem and Mostafa Abolnasr (CEO, Egyptian-Canadian background) is an additional warm path amplifier for the STV outreach.", nextStep: "Ahmed to leverage MENA network for a warm STV intro. If direct STV relationship doesn't exist, route via MENA VC network or Arab tech community connections." },
      { investor: "OMERS Ventures", score: 14, geo: 2, stage: 3, sector: 3, revenue: 2, cheque: 2, founder: 2, gap: 0, warmPath: "Possible via TBDC", portfolioGap: "Enterprise B2B SaaS — no supply chain OMS", rationale: "Series A with significant enterprise revenue and Canada Q1 2026 expansion is exactly OMERS' entry profile. The Canadian expansion is the hook — without it this conversation doesn't happen. 90+ clients across 20 countries is a compelling scale signal for enterprise SaaS investors.", nextStep: "TBDC warm path to OMERS. Frame the Canada Q1 2026 expansion as primary — OMERS needs a Canadian nexus to lead." },
      { investor: "Inovia Capital", score: 13, geo: 2, stage: 3, sector: 3, revenue: 2, cheque: 2, founder: 2, gap: 0, warmPath: "Possible via TBDC", portfolioGap: "B2B SaaS at Series A — no logistics/OMS play", rationale: "Strong Series A profile with enterprise revenue. Canada Q1 2026 expansion is credible. Inovia's global portfolio appetite supports a GCC-origin company with genuine North American ambition.", nextStep: "TBDC warm path alongside OMERS approach. Inovia can be positioned as co-lead or follow-on." },
    ],
    tier2: [
      { investor: "Wamda Capital", score: 11, geo: 2, stage: 2, sector: 3, revenue: 2, cheque: 1, founder: 2, gap: 0, warmPath: "Possible — Ahmed MENA network", portfolioGap: "MENA focus + enterprise SaaS interest", rationale: "MENA-focused with enterprise SaaS appetite. Cheque size ($500K–$5M) is smaller than the round likely needs — position as co-investor or strategic follow-on rather than lead. Ahmed's MENA network is the warm path.", nextStep: "Ahmed MENA network approach. Position as strategic co-investor, not round lead. Good for GCC-credibility optics alongside a Canadian lead." },
    ],
    doNotMatch: [
      { label: "Golden / Panache / Staircase", reason: "Pre-seed/Seed focused with $250K–$2M cheques. Omniful at Series A with 90+ clients has outgrown their mandate by 3 stages. Introducing now signals TBDC doesn't read the room." },
      { label: "Portage Ventures", reason: "FinTech and InsurTech exclusive. Supply chain OMS has zero thesis overlap regardless of SaaS delivery model." },
      { label: "Cycle Capital", reason: "Cleantech focus. No alignment with supply chain SaaS regardless of operational efficiency framing." },
    ],
  },
  {
    companyIndex: 5,
    tier1: [
      { investor: "Cycle Capital", score: 15, geo: 3, stage: 3, sector: 3, revenue: 2, cheque: 2, founder: 1, gap: 1, warmPath: "Cold", portfolioGap: "EV infrastructure for MURBs — underexplored in Canada", rationale: "Dedicated cleantech fund with EV infrastructure thesis. MURB and condo market is a Canadian-specific opportunity they understand intuitively — it maps directly to their thesis around built environment decarbonization. EU traction with 2,000+ deployed units de-risks the product significantly. The $2M CAD ask is within their range.", nextStep: "Cold outreach to Andrée-Lise Méthot or Cycle Capital partners via cleantech event circuit. Frame around MURB market as a uniquely Canadian policy-driven opportunity." },
      { investor: "Greensoil Proptech", score: 14, geo: 3, stage: 3, sector: 3, revenue: 2, cheque: 2, founder: 1, gap: 1, warmPath: "Cold", portfolioGap: "Cleantech-proptech intersection — smart building EV charging", rationale: "PropTech + cleantech intersection is the MURB/condo EV charging story precisely. Greensoil's Canadian real estate network is a direct distribution advantage for Voltie's target market — they can open doors to condo developers and property managers that would take Voltie years to access independently.", nextStep: "Cold outreach to Ben Zifkin. Lead with the MURB market framing and Greensoil's ability to accelerate distribution — not just capital." },
    ],
    tier2: [
      { investor: "BDC Capital (Cleantech)", score: 11, geo: 3, stage: 2, sector: 3, revenue: 2, cheque: 2, founder: 1, gap: -1, warmPath: "Warm via TBDC", portfolioGap: "Cleantech practice mandate — EV hardware included", rationale: "BDC has cleantech exposure and Canada-first mandate. The $2M CAD ask is within range. Hardware is harder for the IT Venture Fund — approach the Cleantech Practice specifically.", nextStep: "TBDC warm path to BDC Cleantech Practice. Best as co-invest once Cycle or Greensoil engagement is established." },
      { investor: "MaRS IAF", score: 9, geo: 2, stage: 2, sector: 2, revenue: 2, cheque: 1, founder: 1, gap: -1, warmPath: "Warm via TBDC", portfolioGap: "Cleantech mandate includes EV", rationale: "Small cheque but strategic — opens Ontario government and utility relationships relevant to MURB adoption. Best as bridge or co-invest alongside Cycle.", nextStep: "TBDC warm intro to MaRS IAF. Position as program participation + bridge capital, not round lead." },
    ],
    doNotMatch: [
      { label: "Portage / Impression Ventures", reason: "FinTech and InsurTech focus. No thesis relevance to EV hardware infrastructure regardless of software components." },
      { label: "Radical Ventures", reason: "AI/ML deep tech thesis. Voltie's hardware-software EV product doesn't fit their research-origin lens." },
      { label: "Georgian", reason: "Requires significant ARR at Series B+. Voltie is raising $2M CAD for Canadian GTM — years from Georgian's entry threshold." },
    ],
  },
  {
    companyIndex: 6,
    tier1: [
      { investor: "Greensoil Proptech", score: 14, geo: 2, stage: 2, sector: 3, revenue: 2, cheque: 2, founder: 1, gap: 1, warmPath: "Cold", portfolioGap: "Marina/waterfront proptech — no comparable in Canadian VC", rationale: "PropTech mandate with smart infrastructure interest. Marina management is a logical extension of their smart building thesis. Ontario waterfront markets (Toronto, Kingston, Owen Sound, Collingwood) are a natural entry. 40+ EU deployments with an EU grant de-risks the technology significantly.", nextStep: "Cold outreach to Ben Zifkin. Frame as waterfront infrastructure PropTech with EU validation, not as a niche marina software product." },
      { investor: "Northzone", score: 13, geo: 2, stage: 2, sector: 3, revenue: 2, cheque: 2, founder: 1, gap: 0, warmPath: "Cold", portfolioGap: "European IoT / smart infrastructure", rationale: "Northzone understands infrastructure IoT and is comfortable with European companies expanding to North America. The EU grant validation and 40+ deployment track record de-risks the product. Niche market is the hesitation — a qualified introduction is warranted.", nextStep: "Cold outreach via LinkedIn. Lead with EU validation and IoT infrastructure angle. Be honest about niche market size — don't oversell TAM." },
    ],
    tier2: [
      { investor: "BDC Capital (IT)", score: 10, geo: 3, stage: 2, sector: 1, revenue: 2, cheque: 2, founder: 1, gap: 0, warmPath: "Warm via TBDC", portfolioGap: "Broad mandate — IoT infrastructure adjacent", rationale: "Canada expansion hook for BDC. EU grant reduces perceived risk. Niche market (marinas) is a harder sell — frame around digital infrastructure for waterfront tourism industry, not marina-specific software.", nextStep: "TBDC warm intro. Frame as waterfront infrastructure play with EU grant validation." },
      { investor: "Balderton Capital", score: 9, geo: 1, stage: 2, sector: 1, revenue: 2, cheque: 2, founder: 1, gap: 0, warmPath: "Cold", portfolioGap: "European tech — defensible niche with ESG angle", rationale: "European company, Balderton mandate. Maritime ESG is a credible framing angle given global port sustainability trends. Niche sector is the hesitation — moderate expectations.", nextStep: "Lower priority cold outreach. ESG angle is the hook. Expect low conversion probability." },
    ],
    doNotMatch: [
      { label: "Portage / Impression Ventures", reason: "FinTech and InsurTech thesis. Marina management IoT has no intersection with either fund's mandate." },
      { label: "Radical Ventures", reason: "AI/ML deep tech thesis. SaMMY's IoT + digital twin product doesn't fit Radical's research-origin model." },
      { label: "Accel India / Peak XV", reason: "India-market focused funds. SaMMY has no India presence or roadmap — geographic mandate eliminates these entirely." },
    ],
  },
  {
    companyIndex: 7,
    tier1: [
      { investor: "Radical Ventures", score: 15, geo: 2, stage: 3, sector: 3, revenue: 2, cheque: 2, founder: 2, gap: 1, warmPath: "Cold — strong thesis match", portfolioGap: "Physics-based AI simulation — no comparable in Canadian VC", rationale: "Purpose-built AI deep tech thesis. Multiphysics simulation with quantum modules is the kind of technical moat Radical looks for — this is deeper than applied AI, it's research-origin software. Bosch as a reference customer is a tier-1 signal that the technology works at scale. Canada GTM is the Canadian mandate hook.", nextStep: "Cold outreach to Jordan Jacobs. Lead with Bosch reference and the physics/quantum differentiation — not the SaaS wrapper. Radical responds to scientific moat, not market size." },
      { investor: "Earlybird", score: 15, geo: 3, stage: 3, sector: 3, revenue: 2, cheque: 2, founder: 2, gap: 1, warmPath: "Cold", portfolioGap: "European deep tech — engineering simulation underexplored", rationale: "Earlybird's deep tech fund is purpose-built for European companies exactly like Quanscient. Engineering simulation for aerospace/automotive/semiconductor is a known industrial priority. Finnish origin is squarely in-market. The Series A closing timeline creates some urgency.", nextStep: "Cold LinkedIn outreach to Hendrik Brandis. Emphasize the EU origin, industrial customer base (Bosch), and Series A traction." },
      { investor: "EQT Ventures", score: 14, geo: 2, stage: 3, sector: 3, revenue: 2, cheque: 2, founder: 2, gap: 0, warmPath: "Cold", portfolioGap: "Nordic deep tech B2B SaaS — scientific moat", rationale: "Nordic origin, Series A, B2B enterprise SaaS with deep tech moat. EQT Ventures actively backs Finnish deep tech companies. Canada GTM adds a credible North American growth chapter to a strong European base.", nextStep: "Cold outreach via LinkedIn or Nordic tech circuit. Finnish origin is the EQT hook. Canada GTM is the growth story." },
    ],
    tier2: [
      { investor: "OMERS Ventures", score: 12, geo: 2, stage: 3, sector: 2, revenue: 2, cheque: 2, founder: 2, gap: 0, warmPath: "Warm via TBDC", portfolioGap: "Enterprise B2B SaaS — no engineering simulation play", rationale: "Series A with enterprise revenue and Bosch reference. OMERS' enterprise SaaS appetite fits. Canada GTM is the entry hook — position as a Canadian-expansion play, not a Finnish company investment.", nextStep: "TBDC warm path. Frame as a Canada GTM investment opportunity. Bosch reference is the credibility anchor." },
    ],
    doNotMatch: [
      { label: "Portage / Impression Ventures", reason: "FinTech and InsurTech focus. Engineering simulation has zero thesis overlap regardless of the AI component." },
      { label: "Golden / Panache / Staircase", reason: "Stage mismatch — these VCs write $250K–$1.5M at pre-seed. Quanscient closing a Series A with Bosch as a client is categorically outside their mandate." },
      { label: "Accel India", reason: "India-market focus. Quanscient's customers and GTM are Europe and North America — no India angle exists." },
    ],
  },
  {
    companyIndex: 8,
    tier1: [
      { investor: "Inovia Capital", score: 13, geo: 3, stage: 2, sector: 3, revenue: 2, cheque: 2, founder: 1, gap: 1, warmPath: "Possible via TBDC", portfolioGap: "Fleet/logistics SaaS with European validation — underrepresented", rationale: "SaaS, Canadian presence (Toronto pilot), meaningful ARR, and blue-chip EU clients. Tesco/Vodafone/Heineken logos de-risk the product significantly. VEMOCO isn't actively raising — a strategic conversation with Inovia may naturally evolve into an investment discussion when the time is right.", nextStep: "TBDC warm intro framed as a strategic conversation, not a fundraise meeting. VEMOCO's posture means you lead with partnership and network value, not the investment ask." },
      { investor: "Northzone", score: 12, geo: 2, stage: 2, sector: 3, revenue: 2, cheque: 2, founder: 1, gap: 0, warmPath: "Cold", portfolioGap: "European SaaS with logistics and fleet adjacency", rationale: "Northzone understands European SaaS and enterprise logistics. Hungary + Toronto is a credible European-to-North America bridge story. EU client logos (Tesco, Vodafone, Heineken, KFC) are names Northzone knows and trusts.", nextStep: "Cold LinkedIn outreach to Northzone partners. Frame as an EU SaaS company with proven enterprise logos expanding to North America." },
    ],
    tier2: [
      { investor: "OMERS Ventures", score: 11, geo: 3, stage: 2, sector: 2, revenue: 2, cheque: 2, founder: 1, gap: 0, warmPath: "Possible via TBDC", portfolioGap: "Enterprise B2B SaaS — no fleet telematics play", rationale: "ARR is at the lower end of OMERS' threshold but EU client logos are compelling. Approach once VEMOCO has a clearer fundraising posture — investor conversations on their terms go better than a push.", nextStep: "Hold until VEMOCO signals active fundraising. Then TBDC warm path to OMERS." },
      { investor: "BDC Capital (IT)", score: 11, geo: 3, stage: 2, sector: 2, revenue: 2, cheque: 2, founder: 1, gap: 0, warmPath: "Warm via TBDC", portfolioGap: "SaaS with Canadian presence and Sourcewell approval", rationale: "BDC's existing Sourcewell/Canoe vendor approval for VEMOCO is an existing relationship. This is the first call to make — a BDC relationship de-risks the company for other Canadian VCs.", nextStep: "Leverage TBDC-BDC relationship. First priority call — Sourcewell approval is the warm path anchor." },
    ],
    doNotMatch: [
      { label: "Portage / Impression Ventures", reason: "FinTech and InsurTech exclusive thesis. Fleet telematics has no overlap whatsoever." },
      { label: "Radical Ventures", reason: "AI/ML deep tech thesis. VEMOCO's telematics SaaS is applied software, not research-origin AI — wrong investor identity." },
      { label: "Accel India / Peak XV", reason: "India-market focus. VEMOCO has no India presence or roadmap — geographic mandate eliminates these entirely." },
    ],
  },
  {
    companyIndex: 9,
    widmo: true,
    customerTargets: [
      { name: "Agnico Eagle Mines", targetType: "Mining", hq: "Toronto", description: "Canada's largest gold producer. Active exploration programs globally. GPR subsurface mapping is directly applicable to site investigation workflows. Toronto HQ makes this a first-priority meeting." },
      { name: "Kinross Gold", targetType: "Mining", hq: "Toronto", description: "Major gold producer with global operations. Toronto HQ accessible. Strong GPR use case in site investigation and exploration programs." },
      { name: "Barrick Gold", targetType: "Mining", hq: "Toronto", description: "Global mining giant with deep exploration budgets. One of the highest-value potential customer meetings TBDC can facilitate — connects WIDMO to tier-1 global mining operations." },
      { name: "CRH Canada", targetType: "Aggregates", hq: "Toronto", description: "Major aggregates and construction materials player. GPR for subsurface aggregate characterization is a direct application of WIDMO's technology." },
      { name: "Holcim Canada", targetType: "Aggregates", hq: "Mississauga", description: "European-origin aggregates company — familiarity with European technology partners reduces adoption friction. WIDMO's Polish origin may be an asset." },
      { name: "WSP Global (Golder Associates)", targetType: "Geotechnical", hq: "Montreal", description: "World's largest geotechnical consulting firm. Highest strategic relevance — WSP would both use GPR in their practice and recommend WIDMO to their mining clients. A WSP relationship unlocks dozens of downstream opportunities." },
      { name: "Stantec", targetType: "Geotechnical", hq: "Edmonton", description: "Major Canadian engineering firm with active geotechnical practice. GPR fits directly into their site characterization and subsurface investigation methodology." },
      { name: "Tetra Tech Canada", targetType: "Geotechnical", hq: "Vancouver", description: "Environmental and geotechnical consulting — active in mining and resource projects with direct GPR applicability at multiple project phases." },
    ],
    events: [
      "PDAC 2026 (attended — follow up now on contacts made)",
      "CIM Convention 2026",
      "Mines and Money Toronto",
    ],
  },
];
