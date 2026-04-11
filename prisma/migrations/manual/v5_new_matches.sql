-- Re-import matches from tbdc_investor_matches.xlsx with full context
DELETE FROM "Match";
DELETE FROM "DoNotMatch";

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm07cqn6qmjcn7wte5jkziwwb', c.id, i.id, 1, 11, 0, 3, 3, 0, 2, 2, 1, 'Helge Seetzen (CEO) — LinkedIn. Note: studio model; primarily commercialises university IP. Limited open pipeline for external companies.', 'Raise size not stated. TandemLaunch (T1) flagged — hardware studio, verify fit.', 'Venture Studio / VC | Stage: Pre-seed–Seed | Cheque: $250K–$1M CAD | Geo: Canada+Global | Sectors: Deep Tech, Hardware, AI', '', 0
FROM "Company" c, "Investor" i
WHERE c.name = 'Fermi Dev' AND i.name = 'TandemLaunch';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmwgi9s3yb6sa44i2v8hdzqo3', c.id, i.id, 1, 10, 0, 3, 3, 0, 2, 1, 1, 'Jean-Sébastien Cournoyer (Managing Partner) — LinkedIn. Strong Quebec ecosystem ties.', '', 'VC | Stage: Pre-seed–Series A | Cheque: $500K–$5M CAD | Geo: Canada (Montreal focus) | Sectors: B2B SaaS, AI, Deep Tech, Marketplace', '', 1
FROM "Company" c, "Investor" i
WHERE c.name = 'Fermi Dev' AND i.name = 'Real Ventures';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmtyr58iid59j6m22e9j64jxp', c.id, i.id, 2, 9, 0, 3, 3, 0, 2, 0, 1, 'Julien Brault (Partner) or Karam Nijjar (Partner) — LinkedIn outreach. Panache is accessible cold.', '', 'VC | Stage: Pre-seed–Seed | Cheque: $500K–$1.5M CAD | Geo: Canada (coast-to-coast) | Sectors: B2B SaaS, Deep Tech, FinTech', '', 2
FROM "Company" c, "Investor" i
WHERE c.name = 'Fermi Dev' AND i.name = 'Panache Ventures';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm7a3zu4cqo26cv80yxcbkems', c.id, i.id, 2, 9, 0, 3, 3, 0, 2, 0, 1, 'Via angelone.ca. AIO member.', '', 'Angel Network | Stage: Pre-seed–Seed | Cheque: $250K–$1M CAD (syndicated) | Geo: Ontario (Hamilton-Burlington-Waterloo corridor) | Sectors: Tech, Advanced Manufacturing, B2B SaaS', '', 3
FROM "Company" c, "Investor" i
WHERE c.name = 'Fermi Dev' AND i.name = 'Angel One Investor Network';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmzxrmcoa8ift79joc21m29e8', c.id, i.id, 2, 9, 0, 2, 3, 0, 2, 1, 1, 'Vinod Khosla (Founder) — LinkedIn. khoslaventures.com. Strong cleantech + AI conviction; known for contrarian early bets.', '', 'VC | Stage: Seed–Series B | Cheque: $500K–$20M USD | Geo: US+Global | Sectors: AI, Deep Tech, Cleantech, HealthTech, FinTech', '', 4
FROM "Company" c, "Investor" i
WHERE c.name = 'Fermi Dev' AND i.name = 'Khosla Ventures';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmzgw74e12342rqqfmzzlzx95', c.id, i.id, 2, 8, 0, 2, 3, 0, 2, 0, 1, 'Jordan Jacobs (Managing Partner) — LinkedIn outreach or TBDC warm path. jordan@radical.vc (public)', '', 'VC | Stage: Seed–Series A | Cheque: $2–15M CAD | Geo: Canada+US | Sectors: Enterprise AI, Deep Tech, Applied ML', '', 5
FROM "Company" c, "Investor" i
WHERE c.name = 'Fermi Dev' AND i.name = 'Radical Ventures';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmdb17l471bxmpxfqxdktfcwt', c.id, i.id, 2, 8, 0, 3, 2, 0, 2, 0, 1, 'Janet Bannister (General Partner) — LinkedIn. janet@golden.ventures (public)', '', 'VC | Stage: Pre-seed–Seed | Cheque: $500K–$2M CAD | Geo: Canada | Sectors: B2B SaaS, Applied AI, Marketplace', '', 6
FROM "Company" c, "Investor" i
WHERE c.name = 'Fermi Dev' AND i.name = 'Golden Ventures';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmaw4thi20qslm4z4oejdkklj', c.id, i.id, 2, 8, 0, 3, 2, 0, 2, 0, 1, 'Kyle Pearce (Partner) — LinkedIn. Accessible via cold outreach.', '', 'VC | Stage: Pre-seed–Seed | Cheque: $250K–$1M CAD | Geo: Canada | Sectors: B2B SaaS, FinTech, AI', '', 7
FROM "Company" c, "Investor" i
WHERE c.name = 'Fermi Dev' AND i.name = 'Staircase Ventures';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmq04bywfteih2hpbf68g2tnk', c.id, i.id, 2, 8, 0, 3, 2, 0, 2, 0, 1, 'John Stokes (Partner) — LinkedIn. Ottawa-based; strong gov-tech and cybersecurity network.', '', 'VC | Stage: Pre-seed–Seed | Cheque: $250K–$1M CAD | Geo: Canada+US+Israel | Sectors: Enterprise SaaS, AI, Marketplace', '', 8
FROM "Company" c, "Investor" i
WHERE c.name = 'Fermi Dev' AND i.name = 'Mistral Venture Partners';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm5zcwrwjk23doh4euxld6zob', c.id, i.id, 2, 8, 0, 3, 2, 0, 2, 0, 1, 'Sid Paquette (Partner) or Adam Nanjee (Partner) — LinkedIn. Highly accessible; responsive to cold outreach.', '', 'VC | Stage: Pre-seed–Seed | Cheque: $250K–$1M CAD | Geo: Canada | Sectors: B2B SaaS, AI, Developer Tools', '', 9
FROM "Company" c, "Investor" i
WHERE c.name = 'Fermi Dev' AND i.name = 'Garage Capital';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmsj1u7e25ayiqt0rs4o64yf8', c.id, i.id, 2, 8, 0, 3, 2, 0, 2, 0, 1, 'Mike Sanderson (Managing Partner) — LinkedIn. Atlantic Canada specialist; $86M+ raised.', '', 'VC | Stage: Pre-seed–Series A | Cheque: $500K–$3M CAD | Geo: Atlantic Canada | Sectors: Enterprise SaaS, AI, Tech', '', 10
FROM "Company" c, "Investor" i
WHERE c.name = 'Fermi Dev' AND i.name = 'Build Ventures';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm2v9goblkfot6a13d0oho3pb', c.id, i.id, 2, 9, 0, 3, 3, 0, 2, 0, 1, 'Marcus Daniels (Founder & CEO) — LinkedIn. Note: venture studio model; deal flow is partially proprietary. External pitches accepted but studio pipeline takes priority.', 'Pre-revenue. Fin Capital + Portage may be too early — flag for post-launch.', 'Venture Studio / VC | Stage: Pre-seed–Seed | Cheque: $250K–$1.5M CAD | Geo: Canada | Sectors: B2B SaaS, FinTech, InsurTech', '', 0
FROM "Company" c, "Investor" i
WHERE c.name = 'Aibo Fintech' AND i.name = 'Highline Beta';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmav3wzvq2kx9vhxmk1blx2qb', c.id, i.id, 2, 9, 0, 2, 3, 0, 1, 2, 1, 'Logan Allin (Founder & Managing Partner) — LinkedIn. fincapital.co. Strong InsurTech thesis — relevant for Aibo Fintech.', '', 'VC | Stage: Seed–Series A | Cheque: $1M–$10M USD | Geo: US+Global | Sectors: FinTech, InsurTech, Embedded Finance', '', 1
FROM "Company" c, "Investor" i
WHERE c.name = 'Aibo Fintech' AND i.name = 'Fin Capital';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmcjle5krmzl7q573us4adgwn', c.id, i.id, 2, 8, 0, 3, 2, 0, 2, 0, 1, 'Julien Brault (Partner) or Karam Nijjar (Partner) — LinkedIn outreach. Panache is accessible cold.', '', 'VC | Stage: Pre-seed–Seed | Cheque: $500K–$1.5M CAD | Geo: Canada (coast-to-coast) | Sectors: B2B SaaS, Deep Tech, FinTech', '', 2
FROM "Company" c, "Investor" i
WHERE c.name = 'Aibo Fintech' AND i.name = 'Panache Ventures';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmtl8wrtpyytnl0rjkvaxifir', c.id, i.id, 2, 8, 0, 2, 3, 0, 2, 0, 1, 'Adam Felesky (Co-founder & Partner) — LinkedIn. Warm intro via TBDC strongly preferred.', '', 'VC | Stage: Seed–Series B | Cheque: $2–20M CAD | Geo: Canada+Global | Sectors: FinTech, InsurTech, WealthTech', '', 3
FROM "Company" c, "Investor" i
WHERE c.name = 'Aibo Fintech' AND i.name = 'Portage Ventures';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmdf155dqfut6vx6sdqjeevul', c.id, i.id, 2, 8, 0, 2, 3, 0, 2, 0, 1, 'Jason Barg (Partner) — LinkedIn. jason@impressionventures.com', '', 'VC | Stage: Seed–Series A | Cheque: $1–5M CAD | Geo: Canada+US | Sectors: InsurTech, FinTech', '', 4
FROM "Company" c, "Investor" i
WHERE c.name = 'Aibo Fintech' AND i.name = 'Impression Ventures';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmd12j97ddfr4dybw3q9urwp7', c.id, i.id, 2, 8, 0, 3, 2, 0, 2, 0, 1, 'Kyle Pearce (Partner) — LinkedIn. Accessible via cold outreach.', '', 'VC | Stage: Pre-seed–Seed | Cheque: $250K–$1M CAD | Geo: Canada | Sectors: B2B SaaS, FinTech, AI', '', 5
FROM "Company" c, "Investor" i
WHERE c.name = 'Aibo Fintech' AND i.name = 'Staircase Ventures';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmmay77ll9qruhnvb8iqazuee', c.id, i.id, 2, 8, 0, 2, 3, 0, 2, 0, 1, 'David Nault (Co-founder & Managing Partner) or Karim Gillani (Co-founder & Managing Partner) — LinkedIn.', '', 'VC | Stage: Seed–Series A | Cheque: $1–5M CAD | Geo: Canada+US | Sectors: FinTech, InsurTech, WealthTech', '', 6
FROM "Company" c, "Investor" i
WHERE c.name = 'Aibo Fintech' AND i.name = 'Luge Capital';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm8youu0iybbeiun81o8czard', c.id, i.id, 2, 8, 0, 2, 3, 0, 2, 0, 1, 'Nicolas Foisy (Co-founder & Partner) — LinkedIn. Diagram led first $80M ClimateTech fund close 2024.', '', 'VC | Stage: Seed–Series A | Cheque: $1–5M CAD | Geo: Canada (Montreal) | Sectors: FinTech, InsurTech, ClimateTech', '', 7
FROM "Company" c, "Investor" i
WHERE c.name = 'Aibo Fintech' AND i.name = 'Diagram Ventures';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm98g0di5v0kw7wqwl9c08xon', c.id, i.id, 2, 8, 0, 3, 1, 0, 2, 1, 1, 'Sheel Mohnot (Co-founder & GP) — LinkedIn. Jake Gibson (Co-founder & GP) — LinkedIn. btv.vc. Founded by NerdWallet co-founder. Highly accessible to cold outreach.', '', 'VC | Stage: Pre-seed–Seed | Cheque: $500K–$5M USD | Geo: US+Global | Sectors: FinTech, Financial Infrastructure, AI in Finance exclusively', '', 8
FROM "Company" c, "Investor" i
WHERE c.name = 'Aibo Fintech' AND i.name = 'Better Tomorrow Ventures (BTV)';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmo4uguhndhtwmpg1v5dy0w9c', c.id, i.id, 2, 9, 0, 3, 3, 0, 2, 0, 1, 'Jordan Jacobs (Managing Partner) — LinkedIn outreach or TBDC warm path. jordan@radical.vc (public)', 'India HQ. ARR not disclosed. US funds require warm intro.', 'VC | Stage: Seed–Series A | Cheque: $2–15M CAD | Geo: Canada+US | Sectors: Enterprise AI, Deep Tech, Applied ML', '', 0
FROM "Company" c, "Investor" i
WHERE c.name = 'Try and Buy' AND i.name = 'Radical Ventures';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmx6xk0niukdupqigwdo4muk8', c.id, i.id, 2, 9, 0, 3, 2, 0, 2, 1, 1, 'Rich Wong (General Partner — cloud/SaaS/AI) — LinkedIn. accel.com. Warm intro strongly preferred.', '', 'VC | Stage: Seed–Series B | Cheque: $1M–$30M USD | Geo: US+Europe+India | Sectors: Enterprise SaaS, AI, Cybersecurity, FinTech', '', 1
FROM "Company" c, "Investor" i
WHERE c.name = 'Try and Buy' AND i.name = 'Accel';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm0r4nvgrxmvdewc17tb3tlkk', c.id, i.id, 2, 9, 0, 3, 2, 0, 2, 1, 1, 'Mamoon Hamid (Partner — enterprise SaaS) — LinkedIn. kleinerperkins.com. Warm intro required.', '', 'VC | Stage: Seed–Series B | Cheque: $2M–$30M USD | Geo: US+Global | Sectors: Enterprise SaaS, AI, Climate, HealthTech', '', 2
FROM "Company" c, "Investor" i
WHERE c.name = 'Try and Buy' AND i.name = 'Kleiner Perkins';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmxtdv35rdn77kmnyxh3eyqnj', c.id, i.id, 2, 8, 0, 3, 2, 0, 2, 0, 1, 'Patrick Pichette (Partner) — TBDC warm path strongly preferred. Cold outreach rarely converts at Inovia.', '', 'VC | Stage: Seed–Series B | Cheque: $2–20M CAD | Geo: Canada+Global | Sectors: B2B SaaS, Marketplace, FinTech', '', 3
FROM "Company" c, "Investor" i
WHERE c.name = 'Try and Buy' AND i.name = 'Inovia Capital';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm9ed339ule99dynpr0q6fuqg', c.id, i.id, 2, 8, 0, 3, 2, 0, 1, 1, 1, 'Jean-Sébastien Cournoyer (Managing Partner) — LinkedIn. Strong Quebec ecosystem ties.', '', 'VC | Stage: Pre-seed–Series A | Cheque: $500K–$5M CAD | Geo: Canada (Montreal focus) | Sectors: B2B SaaS, AI, Deep Tech, Marketplace', '', 4
FROM "Company" c, "Investor" i
WHERE c.name = 'Try and Buy' AND i.name = 'Real Ventures';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmskqddh1xynsms44j4h9zrd1', c.id, i.id, 2, 8, 0, 3, 2, 0, 2, 0, 1, 'Gaurav Gupta (Partner — enterprise) — LinkedIn. lsvp.com. Warm intro strongly preferred.', '', 'VC | Stage: Seed–Series B | Cheque: $1M–$30M USD | Geo: US+India+Europe | Sectors: Enterprise SaaS, AI, FinTech, Consumer, HealthTech', '', 5
FROM "Company" c, "Investor" i
WHERE c.name = 'Try and Buy' AND i.name = 'Lightspeed Venture Partners';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm4ogelprapncn8b8rwwpg2iz', c.id, i.id, 2, 8, 0, 3, 1, 0, 2, 1, 1, 'Byron Deeter (Partner — cloud/AI) — LinkedIn. Talia Goldberg (Partner — enterprise/security) — LinkedIn. bvp.com. Warm intro or pitch via bvp.com/contact.', '', 'VC | Stage: Seed–Series B | Cheque: $2M–$30M USD (seed avg: $5.8M; Series A avg: $15.9M) | Geo: US+Global (Israel, India, Europe) | Sectors: Cloud/SaaS, AI, FinTech, HealthTech, Cybersecurity', '', 6
FROM "Company" c, "Investor" i
WHERE c.name = 'Try and Buy' AND i.name = 'Bessemer Venture Partners';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmi71oq0fy18c9123rvtrr8mm', c.id, i.id, 2, 8, 0, 3, 2, 0, 2, 0, 1, 'Hemant Taneja (Managing Director) — LinkedIn. generalcatalyst.com. Has backed Canadian cos.', '', 'VC | Stage: Seed–Series B | Cheque: $1M–$50M USD | Geo: US+Global | Sectors: Enterprise SaaS, AI, HealthTech, Climate', '', 7
FROM "Company" c, "Investor" i
WHERE c.name = 'Try and Buy' AND i.name = 'General Catalyst';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmyuqt1tmu23schmxjxeg4vqi', c.id, i.id, 2, 8, 0, 3, 1, 0, 2, 1, 1, 'Vinod Khosla (Founder) — LinkedIn. khoslaventures.com. Strong cleantech + AI conviction; known for contrarian early bets.', '', 'VC | Stage: Seed–Series B | Cheque: $500K–$20M USD | Geo: US+Global | Sectors: AI, Deep Tech, Cleantech, HealthTech, FinTech', '', 8
FROM "Company" c, "Investor" i
WHERE c.name = 'Try and Buy' AND i.name = 'Khosla Ventures';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmlsmx75hgmfzxjk06uinbrsf', c.id, i.id, 2, 8, 0, 3, 2, 0, 2, 0, 1, 'Rick Yang (General Partner — enterprise tech) — LinkedIn. nea.com. One of largest US VC firms; $25B AUM.', '', 'VC | Stage: Seed–Series B | Cheque: $1M–$30M USD | Geo: US+India | Sectors: Enterprise SaaS, HealthTech, AI, Developer Tools', '', 9
FROM "Company" c, "Investor" i
WHERE c.name = 'Try and Buy' AND i.name = 'New Enterprise Associates (NEA)';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmq3j683cwzrgmda8oc021iqs', c.id, i.id, 2, 8, 0, 3, 2, 0, 2, 0, 1, 'David Krane (CEO & Managing Partner) — LinkedIn. gv.com. Google resources and network advantage.', '', 'Corporate VC | Stage: Seed–Series B | Cheque: $1M–$30M USD | Geo: US+Global | Sectors: AI, Life Sciences, Enterprise SaaS, Cybersecurity', '', 10
FROM "Company" c, "Investor" i
WHERE c.name = 'Try and Buy' AND i.name = 'GV (Google Ventures)';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm4mzmwh0mb9o7ihylcl1bmuq', c.id, i.id, 2, 8, 0, 3, 2, 0, 2, 0, 1, 'John Somorjai (EVP) — LinkedIn. salesforce.com/ventures. Salesforce ecosystem advantage; portfolio receives Salesforce customer access.', '', 'Corporate VC | Stage: Seed–Series B | Cheque: $2M–$20M USD | Geo: US+Global | Sectors: Enterprise SaaS, AI, CRM-adjacent', '', 11
FROM "Company" c, "Investor" i
WHERE c.name = 'Try and Buy' AND i.name = 'Salesforce Ventures';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmyhk5etktzz2ftgh54lf2zzn', c.id, i.id, 1, 10, 0, 3, 3, 0, 2, 1, 1, 'Sheel Mohnot (Co-founder & GP) — LinkedIn. Jake Gibson (Co-founder & GP) — LinkedIn. btv.vc. Founded by NerdWallet co-founder. Highly accessible to cold outreach.', 'India primary market. BTV (T1) is exact thesis match.', 'VC | Stage: Pre-seed–Seed | Cheque: $500K–$5M USD | Geo: US+Global | Sectors: FinTech, Financial Infrastructure, AI in Finance exclusively', '', 0
FROM "Company" c, "Investor" i
WHERE c.name = 'Monk Trader' AND i.name = 'Better Tomorrow Ventures (BTV)';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmueeoaom7xstcem12ghg7c8e', c.id, i.id, 2, 9, 0, 3, 2, 0, 2, 1, 1, 'Jean-Sébastien Cournoyer (Managing Partner) — LinkedIn. Strong Quebec ecosystem ties.', '', 'VC | Stage: Pre-seed–Series A | Cheque: $500K–$5M CAD | Geo: Canada (Montreal focus) | Sectors: B2B SaaS, AI, Deep Tech, Marketplace', '', 1
FROM "Company" c, "Investor" i
WHERE c.name = 'Monk Trader' AND i.name = 'Real Ventures';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmjpytdvmxs44co6fwjrzz1i0', c.id, i.id, 2, 9, 0, 2, 3, 0, 2, 1, 1, 'Via RBC innovation team. Warm intro via TBDC strongly preferred. Focus on banking-adjacent FinTech.', '', 'Corporate VC | Stage: Seed–Series B | Cheque: $1–10M CAD | Geo: Canada | Sectors: FinTech, WealthTech, Open Banking', '', 2
FROM "Company" c, "Investor" i
WHERE c.name = 'Monk Trader' AND i.name = 'RBC Ventures';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmwxub9macwq39c7vgt16cd95', c.id, i.id, 2, 8, 0, 3, 2, 0, 2, 0, 1, 'Janet Bannister (General Partner) — LinkedIn. janet@golden.ventures (public)', '', 'VC | Stage: Pre-seed–Seed | Cheque: $500K–$2M CAD | Geo: Canada | Sectors: B2B SaaS, Applied AI, Marketplace', '', 3
FROM "Company" c, "Investor" i
WHERE c.name = 'Monk Trader' AND i.name = 'Golden Ventures';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmfap4ywdydx9lhiynnm5eopi', c.id, i.id, 2, 8, 0, 3, 2, 0, 2, 0, 1, 'Julien Brault (Partner) or Karam Nijjar (Partner) — LinkedIn outreach. Panache is accessible cold.', '', 'VC | Stage: Pre-seed–Seed | Cheque: $500K–$1.5M CAD | Geo: Canada (coast-to-coast) | Sectors: B2B SaaS, Deep Tech, FinTech', '', 4
FROM "Company" c, "Investor" i
WHERE c.name = 'Monk Trader' AND i.name = 'Panache Ventures';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmpulcslp4ph93pdj96kjqd9y', c.id, i.id, 2, 8, 0, 2, 3, 0, 2, 0, 1, 'Adam Felesky (Co-founder & Partner) — LinkedIn. Warm intro via TBDC strongly preferred.', '', 'VC | Stage: Seed–Series B | Cheque: $2–20M CAD | Geo: Canada+Global | Sectors: FinTech, InsurTech, WealthTech', '', 5
FROM "Company" c, "Investor" i
WHERE c.name = 'Monk Trader' AND i.name = 'Portage Ventures';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmmgbgdpltl5t76veok0bvsz2', c.id, i.id, 2, 8, 0, 2, 3, 0, 2, 0, 1, 'David Nault (Co-founder & Managing Partner) or Karim Gillani (Co-founder & Managing Partner) — LinkedIn.', '', 'VC | Stage: Seed–Series A | Cheque: $1–5M CAD | Geo: Canada+US | Sectors: FinTech, InsurTech, WealthTech', '', 6
FROM "Company" c, "Investor" i
WHERE c.name = 'Monk Trader' AND i.name = 'Luge Capital';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmia07cdgpgn7p4e3yjrdu9yh', c.id, i.id, 2, 8, 0, 3, 2, 0, 2, 0, 1, 'Marcus Daniels (Founder & CEO) — LinkedIn. Note: venture studio model; deal flow is partially proprietary. External pitches accepted but studio pipeline takes priority.', '', 'Venture Studio / VC | Stage: Pre-seed–Seed | Cheque: $250K–$1.5M CAD | Geo: Canada | Sectors: B2B SaaS, FinTech, InsurTech', '', 7
FROM "Company" c, "Investor" i
WHERE c.name = 'Monk Trader' AND i.name = 'Highline Beta';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm6s03x9l97vyl7r4egsvu6m9', c.id, i.id, 2, 8, 0, 2, 2, 0, 2, 1, 1, 'Via National Bank innovation team. Strong Quebec presence. Warm intro preferred.', '', 'Corporate VC | Stage: Seed–Series B | Cheque: $1–5M CAD | Geo: Canada (Quebec + national) | Sectors: FinTech, AI, Enterprise Tech', '', 8
FROM "Company" c, "Investor" i
WHERE c.name = 'Monk Trader' AND i.name = 'National Bank Venture Fund';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm7cdnga1968y7twrvzhajzjl', c.id, i.id, 2, 8, 0, 2, 2, 0, 2, 1, 1, 'Rich Wong (General Partner — cloud/SaaS/AI) — LinkedIn. accel.com. Warm intro strongly preferred.', '', 'VC | Stage: Seed–Series B | Cheque: $1M–$30M USD | Geo: US+Europe+India | Sectors: Enterprise SaaS, AI, Cybersecurity, FinTech', '', 9
FROM "Company" c, "Investor" i
WHERE c.name = 'Monk Trader' AND i.name = 'Accel';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmg7tas9hib25l8tivjzcdnmc', c.id, i.id, 2, 8, 0, 2, 2, 0, 2, 1, 1, 'Vinod Khosla (Founder) — LinkedIn. khoslaventures.com. Strong cleantech + AI conviction; known for contrarian early bets.', '', 'VC | Stage: Seed–Series B | Cheque: $500K–$20M USD | Geo: US+Global | Sectors: AI, Deep Tech, Cleantech, HealthTech, FinTech', '', 10
FROM "Company" c, "Investor" i
WHERE c.name = 'Monk Trader' AND i.name = 'Khosla Ventures';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm1bszhescd0ilbm447ct85qa', c.id, i.id, 2, 8, 0, 3, 1, 0, 2, 1, 1, 'Andrew Ng (Founder & Managing General Partner) — LinkedIn. aifund.ai. Strong AI conviction; accessible to technical founders.', '', 'VC | Stage: Pre-seed–Seed | Cheque: $1M–$10M USD | Geo: US+Global | Sectors: Applied AI, Machine Learning, AI infrastructure', '', 11
FROM "Company" c, "Investor" i
WHERE c.name = 'Monk Trader' AND i.name = 'AI Fund (Andrew Ng)';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cms9w7mcp8zz6lc0bkepw9p3q', c.id, i.id, 2, 8, 0, 3, 2, 0, 2, 0, 1, 'Karthik Reddy (Co-founder & Managing Partner) — LinkedIn. blume.vc. India''s leading early-stage VC.', '', 'VC | Stage: Pre-seed–Series A | Cheque: $250K–$3M USD | Geo: India | Sectors: AI, B2B SaaS, HealthTech, Deep Tech', '', 12
FROM "Company" c, "Investor" i
WHERE c.name = 'Monk Trader' AND i.name = 'Blume Ventures';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmhg15hbj6u22azug5qp4f2es', c.id, i.id, 1, 11, 0, 3, 3, 0, 2, 2, 1, 'Chris Caton (Managing Director) — LinkedIn. prologis.com/ventures. Relevant for Omniful (supply chain). Prologis is world''s largest industrial REIT.', 'GCC+India HQ. Prologis Ventures (T1) is perfect supply chain CVC match.', 'Corporate VC | Stage: Seed–Series B | Cheque: $2M–$20M USD | Geo: US+Global | Sectors: Supply Chain, Logistics Tech, Warehouse Tech', '', 0
FROM "Company" c, "Investor" i
WHERE c.name = 'Omniful' AND i.name = 'Prologis Ventures';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmnumvc71jqwmb3cwyarnb1c8', c.id, i.id, 2, 8, 0, 3, 1, 0, 2, 1, 1, 'Mamoon Hamid (Partner — enterprise SaaS) — LinkedIn. kleinerperkins.com. Warm intro required.', '', 'VC | Stage: Seed–Series B | Cheque: $2M–$30M USD | Geo: US+Global | Sectors: Enterprise SaaS, AI, Climate, HealthTech', '', 1
FROM "Company" c, "Investor" i
WHERE c.name = 'Omniful' AND i.name = 'Kleiner Perkins';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmnw9azofdskaq2edx6ug5jv5', c.id, i.id, 2, 8, 0, 3, 1, 0, 2, 1, 1, 'Jos White (General Partner) — LinkedIn. notionvc.com. European B2B SaaS specialist.', '', 'VC | Stage: Seed–Series B | Cheque: $1M–$15M USD | Geo: Europe+Global | Sectors: B2B SaaS, Cloud, Enterprise Software', '', 2
FROM "Company" c, "Investor" i
WHERE c.name = 'Omniful' AND i.name = 'Notion Capital';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmc48488gqu8kuvsv5ul0ly2p', c.id, i.id, 2, 8, 0, 3, 2, 0, 2, 0, 1, 'Noor Sweid (Founder & General Partner) — LinkedIn. globalventures.vc. Dubai-based.', '', 'VC | Stage: Seed–Series B | Cheque: $1M–$15M USD | Geo: MENA+Africa+Global | Sectors: FinTech, HealthTech, Logistics, E-commerce', '', 3
FROM "Company" c, "Investor" i
WHERE c.name = 'Omniful' AND i.name = 'Global Ventures';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm2217arkg49pkemo9inba1ku', c.id, i.id, 2, 9, 0, 2, 3, 0, 2, 1, 1, 'Andrée-Lise Méthot (Founder & Managing Partner) — cleantech conference circuit; LinkedIn.', 'Europe HQ, $2M CAD raise active. Canada CSA/UL cert pending.', 'VC | Stage: Seed–Series B | Cheque: $1–5M CAD | Geo: Canada | Sectors: Cleantech, Energy Transition, EV Tech', '', 0
FROM "Company" c, "Investor" i
WHERE c.name = 'Voltie' AND i.name = 'Cycle Capital';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmj98udnn5qiwnar9g61t3x57', c.id, i.id, 2, 9, 0, 2, 3, 0, 2, 1, 1, 'Carmichael Roberts (Business Lead & Investment Committee) — LinkedIn. Rodi Guidero (Managing Partner) — LinkedIn. breakthroughenergy.org. Bill Gates-backed; has Canadian portfolio.', '', 'VC | Stage: Seed–Series B | Cheque: $5M–$50M USD (Fund I: $1B; has invested in 10+ Canadian cos) | Geo: US+Global | Sectors: Deep Cleantech, Energy Transition, Industrial Decarbonization', '', 1
FROM "Company" c, "Investor" i
WHERE c.name = 'Voltie' AND i.name = 'Breakthrough Energy Ventures';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm0sjyqae0jv5owidpy6bwlqe', c.id, i.id, 2, 9, 0, 2, 3, 0, 1, 2, 1, 'Hans Kobler (Founder & Managing Partner) — LinkedIn. energyimpactpartners.com. Utility-backed cleantech fund.', '', 'VC | Stage: Seed–Series B | Cheque: $2M–$30M USD | Geo: US+Europe | Sectors: Cleantech, Energy Transition, Grid Technology', '', 2
FROM "Company" c, "Investor" i
WHERE c.name = 'Voltie' AND i.name = 'Energy Impact Partners (EIP)';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm8wwbnys2pq8snswa20hq5zi', c.id, i.id, 2, 8, 0, 2, 2, 0, 2, 1, 1, 'Annie Bérubé (Managing Partner) — LinkedIn. Federal government-backed mandate.', '', 'VC | Stage: Seed–Series B | Cheque: $1–5M CAD | Geo: Canada | Sectors: Cleantech, Climate Tech, Sustainability', '', 3
FROM "Company" c, "Investor" i
WHERE c.name = 'Voltie' AND i.name = 'Climate Innovation Capital';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmqp1o6sokvd4sfhxtp49cpww', c.id, i.id, 2, 8, 0, 2, 2, 0, 2, 1, 1, 'Via BDC Cleantech Practice team. TBDC warm path recommended.', '', 'Gov | Stage: Seed–Series B | Cheque: $500K–$5M CAD | Geo: Canada only | Sectors: Cleantech, Energy, Sustainability', '', 4
FROM "Company" c, "Investor" i
WHERE c.name = 'Voltie' AND i.name = 'BDC Capital (Cleantech)';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmdn1x18ea3phfqn06ti602ws', c.id, i.id, 2, 8, 0, 2, 2, 0, 1, 2, 1, 'Bethany Crystal (Partner) — LinkedIn. usv.com/climate. Separate climate allocation.', '', 'VC | Stage: Seed–Series A | Cheque: $2M–$10M USD | Geo: US+Global | Sectors: Climate, Sustainability, Energy', '', 5
FROM "Company" c, "Investor" i
WHERE c.name = 'Voltie' AND i.name = 'Union Square Ventures (USV) Climate';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmqfb9evou92hidoiueott4sk', c.id, i.id, 2, 8, 0, 3, 1, 0, 2, 1, 1, 'Via BDC-backed network. BDC regional advisor warm intro recommended.', 'Only 1 match — niche maritime IoT not well covered in fund DB.', 'VC | Stage: Seed–Series A | Cheque: $500K–$3M CAD | Geo: Canada | Sectors: B2B SaaS, Enterprise Software', '', 0
FROM "Company" c, "Investor" i
WHERE c.name = 'SaMMY PC' AND i.name = 'Avrio Ventures';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmppqq85lf766qaglv0ihzsfs', c.id, i.id, 2, 9, 0, 3, 3, 0, 2, 0, 1, 'Jordan Jacobs (Managing Partner) — LinkedIn outreach or TBDC warm path. jordan@radical.vc (public)', 'Verify if Series A closed (targeted Q4 2025) before outreach.', 'VC | Stage: Seed–Series A | Cheque: $2–15M CAD | Geo: Canada+US | Sectors: Enterprise AI, Deep Tech, Applied ML', '', 0
FROM "Company" c, "Investor" i
WHERE c.name = 'Quanscient' AND i.name = 'Radical Ventures';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmdnxkajhtkmq6mrwdnfpuxn6', c.id, i.id, 2, 9, 0, 3, 3, 0, 1, 1, 1, 'Jean-Sébastien Cournoyer (Managing Partner) — LinkedIn. Strong Quebec ecosystem ties.', '', 'VC | Stage: Pre-seed–Series A | Cheque: $500K–$5M CAD | Geo: Canada (Montreal focus) | Sectors: B2B SaaS, AI, Deep Tech, Marketplace', '', 1
FROM "Company" c, "Investor" i
WHERE c.name = 'Quanscient' AND i.name = 'Real Ventures';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmekm6wr7pqol2habjdbahct1', c.id, i.id, 2, 9, 0, 2, 3, 0, 2, 1, 1, 'Vinod Khosla (Founder) — LinkedIn. khoslaventures.com. Strong cleantech + AI conviction; known for contrarian early bets.', '', 'VC | Stage: Seed–Series B | Cheque: $500K–$20M USD | Geo: US+Global | Sectors: AI, Deep Tech, Cleantech, HealthTech, FinTech', '', 2
FROM "Company" c, "Investor" i
WHERE c.name = 'Quanscient' AND i.name = 'Khosla Ventures';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmxhvp87hs8twmxvmkyy80aas', c.id, i.id, 2, 8, 0, 2, 2, 0, 2, 1, 1, 'Rich Wong (General Partner — cloud/SaaS/AI) — LinkedIn. accel.com. Warm intro strongly preferred.', '', 'VC | Stage: Seed–Series B | Cheque: $1M–$30M USD | Geo: US+Europe+India | Sectors: Enterprise SaaS, AI, Cybersecurity, FinTech', '', 3
FROM "Company" c, "Investor" i
WHERE c.name = 'Quanscient' AND i.name = 'Accel';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmuvvo372n9qme2mabie34g46', c.id, i.id, 2, 8, 0, 2, 2, 0, 2, 1, 1, 'Mamoon Hamid (Partner — enterprise SaaS) — LinkedIn. kleinerperkins.com. Warm intro required.', '', 'VC | Stage: Seed–Series B | Cheque: $2M–$30M USD | Geo: US+Global | Sectors: Enterprise SaaS, AI, Climate, HealthTech', '', 4
FROM "Company" c, "Investor" i
WHERE c.name = 'Quanscient' AND i.name = 'Kleiner Perkins';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm4n5ho8zjypw18lu8eywsa6z', c.id, i.id, 2, 8, 0, 2, 3, 0, 2, 0, 1, 'Hiro Tamura (Partner) — LinkedIn. atomico.com. Founded by Skype co-founder Niklas Zennström.', '', 'VC | Stage: Series A–B | Cheque: $5M–$50M USD (raised $1.24B across two 2024 funds) | Geo: Europe+Global | Sectors: AI, FinTech, Enterprise SaaS, Sustainability, Deep Tech', '', 5
FROM "Company" c, "Investor" i
WHERE c.name = 'Quanscient' AND i.name = 'Atomico';

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm2myr0l19x36q3vzhcik8p6g', c.id, i.id, 2, 8, 0, 2, 3, 0, 2, 0, 1, 'Whitney Rockley (Co-founder & Managing Partner) — LinkedIn. IIoT specialist with deep industrial network.', 'Only 1 match — McRock is the one thesis-specific fund in DB.', 'VC | Stage: Seed–Series B | Cheque: $1–5M CAD | Geo: Canada+US | Sectors: Industrial IoT, OT Security, Industry 4.0', '', 0
FROM "Company" c, "Investor" i
WHERE c.name = 'VEMOCO' AND i.name = 'McRock Capital';
