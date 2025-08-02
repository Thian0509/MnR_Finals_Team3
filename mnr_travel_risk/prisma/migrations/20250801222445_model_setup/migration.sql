/*
  Warnings:

  - You are about to drop the column `latitude` on the `user_profile` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `user_profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."user_profile" DROP COLUMN "latitude",
DROP COLUMN "longitude";

-- CreateTable
CREATE TABLE "public"."trip" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startCoordinates" JSONB NOT NULL,
    "endCoordinates" JSONB NOT NULL,
    "travelTime" INTEGER NOT NULL,
    "travelDistance" INTEGER NOT NULL,
    "travelMode" TEXT NOT NULL,
    "travelType" TEXT NOT NULL,

    CONSTRAINT "trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."risk" (
    "id" TEXT NOT NULL,
    "coordinates" JSONB NOT NULL,
    "riskLevel" INTEGER NOT NULL,
    "riskDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "risk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."risk_report" (
    "id" TEXT NOT NULL,
    "coordinates" JSONB NOT NULL,
    "riskLevel" INTEGER NOT NULL,
    "riskDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "risk_report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."routine_alert" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "arrivalTime" TIMESTAMP(3) NOT NULL,
    "cronString" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routine_alert_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."trip" ADD CONSTRAINT "trip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."routine_alert" ADD CONSTRAINT "routine_alert_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "public"."trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
