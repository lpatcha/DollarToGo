/*
  Warnings:

  - A unique constraint covering the columns `[ride_id,rated_by_id]` on the table `ratings` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "driver_profiles" ADD COLUMN     "rider_rated_rides_count" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "ratings_ride_id_rated_by_id_key" ON "ratings"("ride_id", "rated_by_id");
