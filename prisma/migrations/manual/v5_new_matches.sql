-- Delete old matches and insert new ones from tbdc_investor_matches.xlsx
DELETE FROM "Match";
DELETE FROM "DoNotMatch";

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmidl3t01su5id7iztr87z30h', c.id, i.id, 1, 11, 0, 3, 3, 0, 2, 2, 1, '', '', '', '', 0
FROM "Company" c, "Investor" i
WHERE c.name = 'Fermi Dev' AND i.name = 'TandemLaunch'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Fermi Dev')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'TandemLaunch');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmz6ffdpkvzu630k4s5h0yjij', c.id, i.id, 1, 10, 0, 3, 3, 0, 2, 1, 1, '', '', '', '', 1
FROM "Company" c, "Investor" i
WHERE c.name = 'Fermi Dev' AND i.name = 'Real Ventures'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Fermi Dev')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Real Ventures');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmeapy44msuissys3q4htjifh', c.id, i.id, 2, 9, 0, 3, 3, 0, 2, 0, 1, '', '', '', '', 2
FROM "Company" c, "Investor" i
WHERE c.name = 'Fermi Dev' AND i.name = 'Panache Ventures'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Fermi Dev')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Panache Ventures');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm52lrovtbjb731mhvkx617ge', c.id, i.id, 2, 9, 0, 3, 3, 0, 2, 0, 1, '', '', '', '', 3
FROM "Company" c, "Investor" i
WHERE c.name = 'Fermi Dev' AND i.name = 'Angel One Investor Network'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Fermi Dev')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Angel One Investor Network');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmgo7zkm39uzj05xqb5s80btz', c.id, i.id, 2, 9, 0, 2, 3, 0, 2, 1, 1, '', '', '', '', 4
FROM "Company" c, "Investor" i
WHERE c.name = 'Fermi Dev' AND i.name = 'Khosla Ventures'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Fermi Dev')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Khosla Ventures');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm02oootzdk9pmvr80re7a0y4', c.id, i.id, 2, 8, 0, 2, 3, 0, 2, 0, 1, '', '', '', '', 5
FROM "Company" c, "Investor" i
WHERE c.name = 'Fermi Dev' AND i.name = 'Radical Ventures'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Fermi Dev')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Radical Ventures');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmxtjnxyev5wcthtie98p1dm6', c.id, i.id, 2, 8, 0, 3, 2, 0, 2, 0, 1, '', '', '', '', 6
FROM "Company" c, "Investor" i
WHERE c.name = 'Fermi Dev' AND i.name = 'Golden Ventures'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Fermi Dev')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Golden Ventures');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmfqxlf1nnru2wm9g4f52c68q', c.id, i.id, 2, 8, 0, 3, 2, 0, 2, 0, 1, '', '', '', '', 7
FROM "Company" c, "Investor" i
WHERE c.name = 'Fermi Dev' AND i.name = 'Staircase Ventures'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Fermi Dev')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Staircase Ventures');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmx6wge80tnw4pn3z4ldqg764', c.id, i.id, 2, 8, 0, 3, 2, 0, 2, 0, 1, '', '', '', '', 8
FROM "Company" c, "Investor" i
WHERE c.name = 'Fermi Dev' AND i.name = 'Mistral Venture Partners'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Fermi Dev')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Mistral Venture Partners');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmraw1jcy5aul7zuw5qc1a0n0', c.id, i.id, 2, 8, 0, 3, 2, 0, 2, 0, 1, '', '', '', '', 9
FROM "Company" c, "Investor" i
WHERE c.name = 'Fermi Dev' AND i.name = 'Garage Capital'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Fermi Dev')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Garage Capital');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmekelydks5ru16hcic3lbq93', c.id, i.id, 2, 8, 0, 3, 2, 0, 2, 0, 1, '', '', '', '', 10
FROM "Company" c, "Investor" i
WHERE c.name = 'Fermi Dev' AND i.name = 'Build Ventures'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Fermi Dev')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Build Ventures');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmfx9740cl2ac90vd0k75zy5c', c.id, i.id, 2, 9, 0, 3, 3, 0, 2, 0, 1, '', '', '', '', 0
FROM "Company" c, "Investor" i
WHERE c.name = 'Aibo Fintech' AND i.name = 'Highline Beta'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Aibo Fintech')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Highline Beta');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmwoe4e630iapqkqlasedwxqw', c.id, i.id, 2, 9, 0, 2, 3, 0, 1, 2, 1, '', '', '', '', 1
FROM "Company" c, "Investor" i
WHERE c.name = 'Aibo Fintech' AND i.name = 'Fin Capital'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Aibo Fintech')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Fin Capital');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmkpmz5wcvko9lz44vmxce0sb', c.id, i.id, 2, 8, 0, 3, 2, 0, 2, 0, 1, '', '', '', '', 2
FROM "Company" c, "Investor" i
WHERE c.name = 'Aibo Fintech' AND i.name = 'Panache Ventures'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Aibo Fintech')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Panache Ventures');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmos5zr1e4hovg6mv6yi632c0', c.id, i.id, 2, 8, 0, 2, 3, 0, 2, 0, 1, '', '', '', '', 3
FROM "Company" c, "Investor" i
WHERE c.name = 'Aibo Fintech' AND i.name = 'Portage Ventures'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Aibo Fintech')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Portage Ventures');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm22r87g7pf5b1v95mho9dgbb', c.id, i.id, 2, 8, 0, 2, 3, 0, 2, 0, 1, '', '', '', '', 4
FROM "Company" c, "Investor" i
WHERE c.name = 'Aibo Fintech' AND i.name = 'Impression Ventures'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Aibo Fintech')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Impression Ventures');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm4ctu13oicu3l13xqal0fn1o', c.id, i.id, 2, 8, 0, 3, 2, 0, 2, 0, 1, '', '', '', '', 5
FROM "Company" c, "Investor" i
WHERE c.name = 'Aibo Fintech' AND i.name = 'Staircase Ventures'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Aibo Fintech')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Staircase Ventures');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm876z5h2i1adqp231w3zo7n5', c.id, i.id, 2, 8, 0, 2, 3, 0, 2, 0, 1, '', '', '', '', 6
FROM "Company" c, "Investor" i
WHERE c.name = 'Aibo Fintech' AND i.name = 'Luge Capital'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Aibo Fintech')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Luge Capital');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm9c2zh89k4kwh2won3l4kqsy', c.id, i.id, 2, 8, 0, 2, 3, 0, 2, 0, 1, '', '', '', '', 7
FROM "Company" c, "Investor" i
WHERE c.name = 'Aibo Fintech' AND i.name = 'Diagram Ventures'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Aibo Fintech')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Diagram Ventures');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm35dsnadv30f18mm8w1syvjz', c.id, i.id, 2, 8, 0, 3, 1, 0, 2, 1, 1, '', '', '', '', 8
FROM "Company" c, "Investor" i
WHERE c.name = 'Aibo Fintech' AND i.name = 'Better Tomorrow Ventures (BTV)'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Aibo Fintech')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Better Tomorrow Ventures (BTV)');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmvvc6bwxjibpj0edb0uw5s9c', c.id, i.id, 2, 9, 0, 3, 3, 0, 2, 0, 1, '', '', '', '', 0
FROM "Company" c, "Investor" i
WHERE c.name = 'Try and Buy' AND i.name = 'Radical Ventures'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Try and Buy')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Radical Ventures');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmjdmf3l17xkw9fngb785i5od', c.id, i.id, 2, 9, 0, 3, 2, 0, 2, 1, 1, '', '', '', '', 1
FROM "Company" c, "Investor" i
WHERE c.name = 'Try and Buy' AND i.name = 'Accel'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Try and Buy')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Accel');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmgfe7venz4tiy5j4gl29h5dj', c.id, i.id, 2, 9, 0, 3, 2, 0, 2, 1, 1, '', '', '', '', 2
FROM "Company" c, "Investor" i
WHERE c.name = 'Try and Buy' AND i.name = 'Kleiner Perkins'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Try and Buy')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Kleiner Perkins');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm6fca2sxkeds1fuggny52lhz', c.id, i.id, 2, 8, 0, 3, 2, 0, 2, 0, 1, '', '', '', '', 3
FROM "Company" c, "Investor" i
WHERE c.name = 'Try and Buy' AND i.name = 'Inovia Capital'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Try and Buy')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Inovia Capital');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm79vvibfalgol526tu2y6d0a', c.id, i.id, 2, 8, 0, 3, 2, 0, 1, 1, 1, '', '', '', '', 4
FROM "Company" c, "Investor" i
WHERE c.name = 'Try and Buy' AND i.name = 'Real Ventures'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Try and Buy')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Real Ventures');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmyu8iwxcqaj3xaoo1kabipmc', c.id, i.id, 2, 8, 0, 3, 2, 0, 2, 0, 1, '', '', '', '', 5
FROM "Company" c, "Investor" i
WHERE c.name = 'Try and Buy' AND i.name = 'Lightspeed Venture Partners'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Try and Buy')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Lightspeed Venture Partners');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmiku6gtkqrpa2my2rxz1qmgl', c.id, i.id, 2, 8, 0, 3, 1, 0, 2, 1, 1, '', '', '', '', 6
FROM "Company" c, "Investor" i
WHERE c.name = 'Try and Buy' AND i.name = 'Bessemer Venture Partners'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Try and Buy')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Bessemer Venture Partners');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm0k8ehwmhv7k2jxy1w60oecq', c.id, i.id, 2, 8, 0, 3, 2, 0, 2, 0, 1, '', '', '', '', 7
FROM "Company" c, "Investor" i
WHERE c.name = 'Try and Buy' AND i.name = 'General Catalyst'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Try and Buy')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'General Catalyst');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm0c85s7hvhphrf1puiyrl57x', c.id, i.id, 2, 8, 0, 3, 1, 0, 2, 1, 1, '', '', '', '', 8
FROM "Company" c, "Investor" i
WHERE c.name = 'Try and Buy' AND i.name = 'Khosla Ventures'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Try and Buy')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Khosla Ventures');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm9pltq9kljjer6hq361wnzui', c.id, i.id, 2, 8, 0, 3, 2, 0, 2, 0, 1, '', '', '', '', 9
FROM "Company" c, "Investor" i
WHERE c.name = 'Try and Buy' AND i.name = 'New Enterprise Associates (NEA)'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Try and Buy')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'New Enterprise Associates (NEA)');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmxwk4etyqappfndo1nmm9p2c', c.id, i.id, 2, 8, 0, 3, 2, 0, 2, 0, 1, '', '', '', '', 10
FROM "Company" c, "Investor" i
WHERE c.name = 'Try and Buy' AND i.name = 'GV (Google Ventures)'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Try and Buy')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'GV (Google Ventures)');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm8aekjvz5x3rj24nj1i1laar', c.id, i.id, 2, 8, 0, 3, 2, 0, 2, 0, 1, '', '', '', '', 11
FROM "Company" c, "Investor" i
WHERE c.name = 'Try and Buy' AND i.name = 'Salesforce Ventures'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Try and Buy')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Salesforce Ventures');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmsxse0p1x9xnb8esi3sxwt6b', c.id, i.id, 1, 10, 0, 3, 3, 0, 2, 1, 1, '', '', '', '', 0
FROM "Company" c, "Investor" i
WHERE c.name = 'Monk Trader' AND i.name = 'Better Tomorrow Ventures (BTV)'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Monk Trader')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Better Tomorrow Ventures (BTV)');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmfu8pxuf7kvx75oxdggnpwep', c.id, i.id, 2, 9, 0, 3, 2, 0, 2, 1, 1, '', '', '', '', 1
FROM "Company" c, "Investor" i
WHERE c.name = 'Monk Trader' AND i.name = 'Real Ventures'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Monk Trader')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Real Ventures');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmh7h0r8uu66gjz1bb5bl4k60', c.id, i.id, 2, 9, 0, 2, 3, 0, 2, 1, 1, '', '', '', '', 2
FROM "Company" c, "Investor" i
WHERE c.name = 'Monk Trader' AND i.name = 'RBC Ventures'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Monk Trader')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'RBC Ventures');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmrxy1oqufoa1rz0jw4xr9jkl', c.id, i.id, 2, 8, 0, 3, 2, 0, 2, 0, 1, '', '', '', '', 3
FROM "Company" c, "Investor" i
WHERE c.name = 'Monk Trader' AND i.name = 'Golden Ventures'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Monk Trader')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Golden Ventures');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmiusd2o6wk4ooynt2na1sqps', c.id, i.id, 2, 8, 0, 3, 2, 0, 2, 0, 1, '', '', '', '', 4
FROM "Company" c, "Investor" i
WHERE c.name = 'Monk Trader' AND i.name = 'Panache Ventures'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Monk Trader')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Panache Ventures');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmjltsc412bi54kl0y22hijnc', c.id, i.id, 2, 8, 0, 2, 3, 0, 2, 0, 1, '', '', '', '', 5
FROM "Company" c, "Investor" i
WHERE c.name = 'Monk Trader' AND i.name = 'Portage Ventures'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Monk Trader')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Portage Ventures');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm4edd3eq372rvfjc4epss6d0', c.id, i.id, 2, 8, 0, 2, 3, 0, 2, 0, 1, '', '', '', '', 6
FROM "Company" c, "Investor" i
WHERE c.name = 'Monk Trader' AND i.name = 'Luge Capital'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Monk Trader')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Luge Capital');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm3qaeze4euzb7vtkkddmku5d', c.id, i.id, 2, 8, 0, 3, 2, 0, 2, 0, 1, '', '', '', '', 7
FROM "Company" c, "Investor" i
WHERE c.name = 'Monk Trader' AND i.name = 'Highline Beta'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Monk Trader')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Highline Beta');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm9a1zfp66avav6wz4luienbx', c.id, i.id, 2, 8, 0, 2, 2, 0, 2, 1, 1, '', '', '', '', 8
FROM "Company" c, "Investor" i
WHERE c.name = 'Monk Trader' AND i.name = 'National Bank Venture Fund'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Monk Trader')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'National Bank Venture Fund');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmw1udglppktvou1re2cn165s', c.id, i.id, 2, 8, 0, 2, 2, 0, 2, 1, 1, '', '', '', '', 9
FROM "Company" c, "Investor" i
WHERE c.name = 'Monk Trader' AND i.name = 'Accel'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Monk Trader')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Accel');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmm6w4auk17ravgu8r914sah6', c.id, i.id, 2, 8, 0, 2, 2, 0, 2, 1, 1, '', '', '', '', 10
FROM "Company" c, "Investor" i
WHERE c.name = 'Monk Trader' AND i.name = 'Khosla Ventures'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Monk Trader')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Khosla Ventures');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm1m74btdbfgm2m4qxl262d83', c.id, i.id, 2, 8, 0, 3, 1, 0, 2, 1, 1, '', '', '', '', 11
FROM "Company" c, "Investor" i
WHERE c.name = 'Monk Trader' AND i.name = 'AI Fund (Andrew Ng)'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Monk Trader')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'AI Fund (Andrew Ng)');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm585rd4mdcplc37s22v56hiw', c.id, i.id, 2, 8, 0, 3, 2, 0, 2, 0, 1, '', '', '', '', 12
FROM "Company" c, "Investor" i
WHERE c.name = 'Monk Trader' AND i.name = 'Blume Ventures'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Monk Trader')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Blume Ventures');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmtoo4tkufej1jb9vl7d2ilj5', c.id, i.id, 1, 11, 0, 3, 3, 0, 2, 2, 1, '', '', '', '', 0
FROM "Company" c, "Investor" i
WHERE c.name = 'Omniful' AND i.name = 'Prologis Ventures'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Omniful')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Prologis Ventures');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmdes2ct0bkg57mp3rqtzayqk', c.id, i.id, 2, 8, 0, 3, 1, 0, 2, 1, 1, '', '', '', '', 1
FROM "Company" c, "Investor" i
WHERE c.name = 'Omniful' AND i.name = 'Kleiner Perkins'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Omniful')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Kleiner Perkins');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm9nxjayjkshinrn3u8bzw5im', c.id, i.id, 2, 8, 0, 3, 1, 0, 2, 1, 1, '', '', '', '', 2
FROM "Company" c, "Investor" i
WHERE c.name = 'Omniful' AND i.name = 'Notion Capital'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Omniful')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Notion Capital');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm0lec5pebid2hxcybz9rec9u', c.id, i.id, 2, 8, 0, 3, 2, 0, 2, 0, 1, '', '', '', '', 3
FROM "Company" c, "Investor" i
WHERE c.name = 'Omniful' AND i.name = 'Global Ventures'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Omniful')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Global Ventures');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm556ofs0wvra8c8zg7zuszwf', c.id, i.id, 2, 9, 0, 2, 3, 0, 2, 1, 1, '', '', '', '', 0
FROM "Company" c, "Investor" i
WHERE c.name = 'Voltie' AND i.name = 'Cycle Capital'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Voltie')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Cycle Capital');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmge9ru1q6xxtjitp9grimhit', c.id, i.id, 2, 9, 0, 2, 3, 0, 2, 1, 1, '', '', '', '', 1
FROM "Company" c, "Investor" i
WHERE c.name = 'Voltie' AND i.name = 'Breakthrough Energy Ventures'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Voltie')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Breakthrough Energy Ventures');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm9ipdztr0e0p191jutri48ic', c.id, i.id, 2, 9, 0, 2, 3, 0, 1, 2, 1, '', '', '', '', 2
FROM "Company" c, "Investor" i
WHERE c.name = 'Voltie' AND i.name = 'Energy Impact Partners (EIP)'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Voltie')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Energy Impact Partners (EIP)');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmm4rm0z2ndggwivnrptvrtnd', c.id, i.id, 2, 8, 0, 2, 2, 0, 2, 1, 1, '', '', '', '', 3
FROM "Company" c, "Investor" i
WHERE c.name = 'Voltie' AND i.name = 'Climate Innovation Capital'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Voltie')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Climate Innovation Capital');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmfs7v1arq03d2cb9au9zcpzc', c.id, i.id, 2, 8, 0, 2, 2, 0, 2, 1, 1, '', '', '', '', 4
FROM "Company" c, "Investor" i
WHERE c.name = 'Voltie' AND i.name = 'BDC Capital (Cleantech)'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Voltie')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'BDC Capital (Cleantech)');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm9bbkvc7zfjlu8aierxrfn4j', c.id, i.id, 2, 8, 0, 2, 2, 0, 1, 2, 1, '', '', '', '', 5
FROM "Company" c, "Investor" i
WHERE c.name = 'Voltie' AND i.name = 'Union Square Ventures (USV) Climate'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Voltie')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Union Square Ventures (USV) Climate');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmx9cwi1pcg9k6skodzfw4iw7', c.id, i.id, 2, 8, 0, 3, 1, 0, 2, 1, 1, '', '', '', '', 0
FROM "Company" c, "Investor" i
WHERE c.name = 'SaMMY PC' AND i.name = 'Avrio Ventures'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'SaMMY PC')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Avrio Ventures');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cm05t5qks0m6janskxuteiy7r', c.id, i.id, 2, 9, 0, 3, 3, 0, 2, 0, 1, '', '', '', '', 0
FROM "Company" c, "Investor" i
WHERE c.name = 'Quanscient' AND i.name = 'Radical Ventures'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Quanscient')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Radical Ventures');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmu1vzbszi8n0kfoe1zubi0vi', c.id, i.id, 2, 9, 0, 3, 3, 0, 1, 1, 1, '', '', '', '', 1
FROM "Company" c, "Investor" i
WHERE c.name = 'Quanscient' AND i.name = 'Real Ventures'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Quanscient')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Real Ventures');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmsar2qp2gmtr9coe3m5nd5u0', c.id, i.id, 2, 9, 0, 2, 3, 0, 2, 1, 1, '', '', '', '', 2
FROM "Company" c, "Investor" i
WHERE c.name = 'Quanscient' AND i.name = 'Khosla Ventures'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Quanscient')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Khosla Ventures');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmed4mx80z7maoq6hledrfux9', c.id, i.id, 2, 8, 0, 2, 2, 0, 2, 1, 1, '', '', '', '', 3
FROM "Company" c, "Investor" i
WHERE c.name = 'Quanscient' AND i.name = 'Accel'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Quanscient')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Accel');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmbmnzrs4275dcmxwyfmadoup', c.id, i.id, 2, 8, 0, 2, 2, 0, 2, 1, 1, '', '', '', '', 4
FROM "Company" c, "Investor" i
WHERE c.name = 'Quanscient' AND i.name = 'Kleiner Perkins'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Quanscient')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Kleiner Perkins');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmx2qo7ou0pae500i688heuy3', c.id, i.id, 2, 8, 0, 2, 3, 0, 2, 0, 1, '', '', '', '', 5
FROM "Company" c, "Investor" i
WHERE c.name = 'Quanscient' AND i.name = 'Atomico'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'Quanscient')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'Atomico');

INSERT INTO "Match" (id, "companyId", "investorId", tier, score, "geoPts", "stagePts", "sectorPts", "revenuePts", "chequePts", "founderPts", "gapPts", "warmPath", "portfolioGap", rationale, "nextStep", "sortOrder")
SELECT 'cmhowduunmv6fvalk2a9pdhj8', c.id, i.id, 2, 8, 0, 2, 3, 0, 2, 0, 1, '', '', '', '', 0
FROM "Company" c, "Investor" i
WHERE c.name = 'VEMOCO' AND i.name = 'McRock Capital'
AND EXISTS (SELECT 1 FROM "Company" WHERE name = 'VEMOCO')
AND EXISTS (SELECT 1 FROM "Investor" WHERE name = 'McRock Capital');
