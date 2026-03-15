import { Request, Response } from 'express';
import { PrismaClient, RequestStatus, RideStatus } from '@prisma/client';

const prisma = new PrismaClient();

// 1. Driver views pending ride requests assigned to them (based on zip code broadcast)
export const getAssignedRideRequests = async (req: Request, res: Response): Promise<void> => {
    try {
        const driverId = req.user?.userId;

        if (!driverId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const requests = await prisma.rideRequest.findMany({
            where: {
                driverId,
                status: {
                    in: [RequestStatus.PENDING, RequestStatus.ACCEPTED]
                },
                ride: {
                    status: {
                        in: [RideStatus.PENDING, RideStatus.ACCEPTED]
                    }
                }
            },
            include: {
                ride: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                phone: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json({ requests });
    } catch (error) {
        console.error('Get assigned ride requests error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// 2. Driver accepts a broadcasted RideRequest
export const acceptRideRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const driverId = req.user?.userId;
        const requestId = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];

        const rideRequest = await prisma.rideRequest.findUnique({
            where: { id: requestId },
            include: { ride: true }
        });

        if (!rideRequest || rideRequest.driverId !== driverId) {
            res.status(404).json({ message: 'Ride request not found or unauthorized' });
            return;
        }

        if (rideRequest.status !== RequestStatus.PENDING) {
            res.status(400).json({ message: 'Ride request is no longer pending' });
            return;
        }

        if (rideRequest.ride.status !== RideStatus.PENDING) {
            res.status(400).json({ message: 'Ride has already been taken or cancelled' });
            return;
        }

        const updatedRequest = await prisma.rideRequest.update({
            where: { id: requestId },
            data: { status: RequestStatus.ACCEPTED }
        });

        res.status(200).json({ message: 'Ride request accepted. Waiting for rider confirmation.', request: updatedRequest });
    } catch (error) {
        console.error('Accept ride request error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// 2. Driver views their ride history and total earnings for a filtered period
export const getDriverHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const driverId = req.user?.userId;

        // Pagination logic
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const startDate = req.query.startDate ? new Date(req.query.startDate as string) : oneWeekAgo;
        const endDate = req.query.endDate ? new Date(req.query.endDate as string) : now;

        const whereClause = {
            driverId,
            status: RideStatus.COMPLETED,
            createdAt: {
                gte: startDate,
                lte: endDate,
            }
        };

        const [rides, totalCount, aggregations] = await Promise.all([
            prisma.ride.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.ride.count({ where: whereClause }),
            prisma.ride.aggregate({
                where: whereClause,
                _sum: {
                    price: true
                }
            })
        ]);

        const totalEarnings = aggregations._sum.price || 0;
        const totalPages = Math.ceil(totalCount / limit);

        res.status(200).json({
            period: {
                start: startDate,
                end: endDate
            },
            earnings: Number(totalEarnings),
            pagination: {
                totalRides: totalCount,
                totalPages,
                currentPage: page,
                limit
            },
            rides
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// 4. Driver cancels a ride that was accepted by the user
export const driverCancelRide = async (req: Request, res: Response): Promise<void> => {
    try {
        const driverId = req.user?.userId;
        const rideId = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];

        const ride = await prisma.ride.findUnique({
            where: { id: rideId }
        });

        if (!ride || ride.driverId !== driverId) {
            res.status(404).json({ message: 'Ride not found or you are not the assigned driver' });
            return;
        }

        if (ride.status === RideStatus.COMPLETED) {
            res.status(400).json({ message: 'Cannot cancel a completed ride' });
            return;
        }

        if (ride.status === RideStatus.CANCELLED) {
            res.status(400).json({ message: 'Ride is already cancelled' });
            return;
        }

        await prisma.$transaction(async (tx) => {
            // Cancel the ride
            await tx.ride.update({
                where: { id: rideId },
                data: { status: RideStatus.CANCELLED }
            });

            // Mark all related requests as REJECTED
            await tx.rideRequest.updateMany({
                where: { 
                    rideId,
                    status: { in: [RequestStatus.PENDING, RequestStatus.ACCEPTED] }
                },
                data: { status: RequestStatus.REJECTED }
            });
        });

        res.status(200).json({ message: 'Ride cancelled successfully by driver' });
    } catch (error) {
        console.error('Driver cancel ride error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// 5. Driver marks a ride as completed and rates the rider
export const completeRide = async (req: Request, res: Response): Promise<void> => {
    try {
        const driverId = req.user?.userId;
        const rideId = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
        const { score, comment } = req.body;

        if (!score || score < 1 || score > 5) {
            res.status(400).json({ message: 'A rating score between 1 and 5 is required to complete the ride' });
            return;
        }

        const ride = await prisma.ride.findUnique({
            where: { id: rideId }
        });

        if (!ride || ride.driverId !== driverId) {
            res.status(404).json({ message: 'Ride not found or you are not the assigned driver' });
            return;
        }

        if (ride.status === RideStatus.COMPLETED) {
            res.status(400).json({ message: 'Ride is already completed' });
            return;
        }

        if (ride.status === RideStatus.CANCELLED) {
            res.status(400).json({ message: 'Cannot complete a cancelled ride' });
            return;
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Mark ride as completed
            const updatedRide = await tx.ride.update({
                where: { id: rideId },
                data: { 
                    status: RideStatus.COMPLETED,
                    completedAt: new Date()
                }
            });

            // 2. Create rating for the rider (User)
            await tx.rating.create({
                data: {
                    rideId,
                    ratedById: driverId as string,
                    ratedUserId: ride.userId,
                    score,
                    comment
                }
            });

            // 3. Update Rider's average rating
            const allRatings = await tx.rating.findMany({
                where: { ratedUserId: ride.userId }
            });
            
            const avgRating = allRatings.reduce((sum, r) => sum + r.score, 0) / allRatings.length;

            await tx.user.update({
                where: { id: ride.userId },
                data: { 
                    avgRating: avgRating,
                    totalRatingsCount: { increment: 1 }
                }
            });

            // 4. Update Driver's total completed rides count
            await tx.driverProfile.update({
                where: { userId: driverId as string },
                data: { totalRides: { increment: 1 } }
            });

            return updatedRide;
        });

        res.status(200).json({ message: 'Ride marked as completed and rider rated', ride: result });
    } catch (error) {
        console.error('Complete ride and rate error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
