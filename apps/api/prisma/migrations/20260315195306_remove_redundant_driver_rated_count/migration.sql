/*
  Warnings:

  - You are about to drop the column `user_rated_rides_count` on the `driver_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "driver_profiles" DROP COLUMN "user_rated_rides_count";
