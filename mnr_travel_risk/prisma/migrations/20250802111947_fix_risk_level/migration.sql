/*
  Warnings:

  - You are about to drop the column `riskLevel` on the `risk` table. All the data in the column will be lost.
  - Added the required column `risklevel` to the `risk` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."risk" DROP COLUMN "riskLevel",
ADD COLUMN     "risklevel" INTEGER NOT NULL;
