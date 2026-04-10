-- v4: Add region + confidence columns to Investor table
ALTER TABLE "Investor" ADD COLUMN IF NOT EXISTS "region" TEXT NOT NULL DEFAULT 'Canada';
ALTER TABLE "Investor" ADD COLUMN IF NOT EXISTS "confidence" TEXT NOT NULL DEFAULT 'Medium';
