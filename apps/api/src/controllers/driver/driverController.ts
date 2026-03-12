import { Request, Response } from 'express';
import { PrismaClient, RequestStatus, RideStatus } from '@prisma/client';

const prisma = new PrismaClient();

// 1. Driver accepts a broadcasted RideRequest
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
        console.error('Get driver history error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
