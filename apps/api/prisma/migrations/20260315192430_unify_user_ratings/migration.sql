/*
  Warnings:

  - You are about to drop the column `avg_rating` on the `driver_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `rider_rated_rides_count` on the `driver_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `total_rides_as_rider` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "driver_profiles" DROP COLUMN "avg_rating",
DROP COLUMN "rider_rated_rides_count",
ADD COLUMN     "user_rated_rides_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "total_rides_as_rider",
ADD COLUMN     "total_ratings_count" INTEGER NOT NULL DEFAULT 0;
