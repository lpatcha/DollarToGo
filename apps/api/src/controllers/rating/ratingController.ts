import { Request, Response } from 'express';
import { PrismaClient, RideStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Rate a ride
 * This endpoint allows ONLY Users (Riders) to rate their experience with a Driver
 * after a ride is COMPLETED.
 */
export const rateRide = async (req: Request, res: Response): Promise<void> => {
    try {
        const authUserId = req.user?.userId;
        const { rideId, score, comment } = req.body;

        if (!rideId || !score) {
            res.status(400).json({ message: 'Missing rideId or score' });
            return;
        }

        if (score < 1 || score > 5) {
            res.status(400).json({ message: 'Score must be between 1 and 5' });
            return;
        }

        // 1. Fetch the ride to check status and participants
        const ride = await prisma.ride.findUnique({
            where: { id: rideId },
            include: {
                user: true,
                driver: true
            }
        });

        if (!ride) {
            res.status(404).json({ message: 'Ride not found' });
            return;
        }

        if (ride.status !== RideStatus.COMPLETED) {
            res.status(400).json({ message: 'Can only rate completed rides' });
            return;
        }

        // 2. Identify the target of the rating (Only Rider can rate Driver here)
        if (ride.userId !== authUserId) {
            res.status(403).json({ message: 'Only the rider who booked this ride can submit a rating here' });
            return;
        }

        if (!ride.driverId) {
            res.status(400).json({ message: 'Cannot rate a ride with no assigned driver' });
            return;
        }

        const ratedUserId = ride.driverId;

        // 3. Check if this specific user has already rated this ride
        const existingRating = await prisma.rating.findFirst({
            where: {
                rideId,
                ratedById: authUserId
            }
        });

        if (existingRating) {
            res.status(400).json({ message: 'You have already rated this ride' });
            return;
        }

        // 4. Create the rating and update average score in a transaction
        const rating = await prisma.$transaction(async (tx) => {
            const newRating = await tx.rating.create({
                data: {
                    rideId,
                    ratedById: authUserId as string,
                    ratedUserId,
                    score,
                    comment
                }
            });

            // 2. Always update the User's global average rating
            const allRatings = await tx.rating.findMany({
                where: { ratedUserId }
            });
            
            const avgRating = allRatings.reduce((sum, r) => sum + r.score, 0) / allRatings.length;

            await tx.user.update({
                where: { id: ratedUserId },
                data: { 
                    avgRating: avgRating,
                    totalRatingsCount: { increment: 1 }
                }
            });

            return newRating;
        });

        res.status(201).json({ message: 'Rating submitted successfully', rating });
    } catch (error) {
        console.error('Rate ride error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
