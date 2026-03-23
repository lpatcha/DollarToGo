/*
  Warnings:

  - You are about to drop the column `total_rides` on the `driver_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "driver_profiles" DROP COLUMN "total_rides";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "total_rides" INTEGER NOT NULL DEFAULT 0;
