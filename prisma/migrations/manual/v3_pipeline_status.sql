-- v3 Pipeline status enum + fields on Match

DO $$ BEGIN
  CREATE TYPE "PipelineStatus" AS ENUM (
    'not_started', 'researching', 'outreach_sent',
    'meeting_set', 'follow_up', 'closed_won', 'closed_pass'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Match"
  ADD COLUMN IF NOT EXISTS "pipelineStatus" "PipelineStatus" NOT NULL DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS "warmPathBonus" TEXT;

-- Seed warmPathBonus from v3 prototype data

UPDATE "Match" SET "warmPathBonus" =
  'My MENA network, combined with a shared Egyptian-Cairo background with Omniful''s CEO Mostafa Abolnasr, gives me a credible warm path to an STV introduction. STV is GCC''s most active Series A fund and Omniful is the strongest strategic fit in this cohort. I would approach this via the Arab tech community network — a shared-context introduction lands differently than a cold email from a Canadian accelerator.'
WHERE "companyId" IN (SELECT id FROM "Company" WHERE name = 'Omniful')
  AND "investorId" IN (SELECT id FROM "Investor" WHERE name = 'STV');

UPDATE "Match" SET "warmPathBonus" =
  'Wamda has MENA-network touchpoints I can access directly. This is a co-investor conversation rather than a round lead, but it adds GCC credibility to Omniful''s cap table that has value beyond the cheque size.'
WHERE "companyId" IN (SELECT id FROM "Company" WHERE name = 'Omniful')
  AND "investorId" IN (SELECT id FROM "Investor" WHERE name = 'Wamda Capital');

UPDATE "Match" SET "warmPathBonus" =
  'The Flipkart and Myntra reference customers are Accel India companies. An outreach framed around this shared ecosystem familiarity — ''you already trust the customers who trust Try and Buy'' — is a specific and plausible angle for a cold LinkedIn message to Anand Daniel. The conversion probability is real if the framing is precise.'
WHERE "companyId" IN (SELECT id FROM "Company" WHERE name = 'Try and Buy')
  AND "investorId" IN (SELECT id FROM "Investor" WHERE name = 'Accel India');

UPDATE "Match" SET "warmPathBonus" =
  'Earlybird''s deep tech fund thesis is well documented and Finnish deep tech is squarely in their mandate. A cold outreach to Hendrik Brandis referencing Bosch as a reference customer and the Canada GTM angle is a plausible conversion — I have done this type of outreach before with similar company profiles.'
WHERE "companyId" IN (SELECT id FROM "Company" WHERE name = 'Quanscient')
  AND "investorId" IN (SELECT id FROM "Investor" WHERE name = 'Earlybird');

UPDATE "Match" SET "warmPathBonus" =
  'Jordan Jacobs has written publicly about manufacturing as an underserved AI vertical in Canadian portfolios. A cold outreach that references this specific gap — framed around Zeiss Pharma and Agora Analytics as early paying customers — has a genuine conversion probability. I would not promise a meeting, but I would commit to a thoughtful approach.'
WHERE "companyId" IN (SELECT id FROM "Company" WHERE name = 'Fermi Dev')
  AND "investorId" IN (SELECT id FROM "Investor" WHERE name = 'Radical Ventures');
