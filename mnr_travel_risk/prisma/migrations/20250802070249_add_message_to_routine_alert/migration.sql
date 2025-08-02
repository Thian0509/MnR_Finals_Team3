/*
  Warnings:

  - Added the required column `message` to the `routine_alert` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."routine_alert" ADD COLUMN     "message" TEXT NOT NULL;
