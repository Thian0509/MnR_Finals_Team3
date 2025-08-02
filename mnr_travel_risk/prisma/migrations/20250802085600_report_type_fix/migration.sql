/*
  Warnings:

  - The values [POTHLE] on the enum `RiskType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."RiskType_new" AS ENUM ('SNOW', 'HAIL', 'RAIN', 'FOG', 'ICE', 'WIND', 'SANDY', 'BAD_GRAVEL', 'MUD', 'ROCK', 'DEBRIS', 'POTHOLE', 'ROADWORK', 'POLICE', 'CLOSED_ROAD');
ALTER TABLE "public"."risk_report" ALTER COLUMN "riskType" TYPE "public"."RiskType_new" USING ("riskType"::text::"public"."RiskType_new");
ALTER TYPE "public"."RiskType" RENAME TO "RiskType_old";
ALTER TYPE "public"."RiskType_new" RENAME TO "RiskType";
DROP TYPE "public"."RiskType_old";
COMMIT;
