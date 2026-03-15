-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avg_rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "total_rides_as_rider" INTEGER NOT NULL DEFAULT 0;
