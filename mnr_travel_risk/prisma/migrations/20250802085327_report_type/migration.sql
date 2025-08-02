/*
  Warnings:

  - You are about to drop the column `riskLevel` on the `risk_report` table. All the data in the column will be lost.
  - You are about to drop the column `endCoordinates` on the `trip` table. All the data in the column will be lost.
  - You are about to drop the column `startCoordinates` on the `trip` table. All the data in the column will be lost.
  - You are about to drop the column `travelDistance` on the `trip` table. All the data in the column will be lost.
  - You are about to drop the column `travelMode` on the `trip` table. All the data in the column will be lost.
  - You are about to drop the column `travelTime` on the `trip` table. All the data in the column will be lost.
  - You are about to drop the column `travelType` on the `trip` table. All the data in the column will be lost.
  - You are about to drop the `routine_alert` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `riskType` to the `risk_report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departureTime` to the `trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `from` to the `trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `to` to the `trip` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."RiskType" AS ENUM ('SNOW', 'HAIL', 'RAIN', 'FOG', 'ICE', 'WIND', 'SANDY', 'BAD_GRAVEL', 'MUD', 'ROCK', 'DEBRIS', 'POTHLE', 'ROADWORK', 'POLICE', 'CLOSED_ROAD');

-- DropForeignKey
ALTER TABLE "public"."routine_alert" DROP CONSTRAINT "routine_alert_tripId_fkey";

-- AlterTable
ALTER TABLE "public"."risk_report" DROP COLUMN "riskLevel",
ADD COLUMN     "riskType" "public"."RiskType" NOT NULL;

-- AlterTable
ALTER TABLE "public"."trip" DROP COLUMN "endCoordinates",
DROP COLUMN "startCoordinates",
DROP COLUMN "travelDistance",
DROP COLUMN "travelMode",
DROP COLUMN "travelTime",
DROP COLUMN "travelType",
ADD COLUMN     "departureTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "from" TEXT NOT NULL,
ADD COLUMN     "notified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "to" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."routine_alert";

-- CreateIndex
CREATE INDEX "trip_notified_departureTime_idx" ON "public"."trip"("notified", "departureTime");
