import { Request, Response } from 'express';
import { PrismaClient, RideStatus, RequestStatus } from '@prisma/client';
import { broadcastRideToZipCode } from '../../services/user/rideService';

const prisma = new PrismaClient();

// 1. User creates a new ride
export const createRide = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { fromAddress, fromZip, fromLat, fromLng, toAddress, toZip, toLat, toLng, price } = req.body;

        if (!userId || !fromAddress || !fromZip || !toAddress || !price) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }

        const ride = await prisma.ride.create({
            data: {
                userId,
                fromAddress,
                fromZip,
                fromLat: fromLat || 0,
                fromLng: fromLng || 0,
                toAddress,
                toZip,
                toLat: toLat || 0,
                toLng: toLng || 0,
                price,
                status: RideStatus.PENDING,
            },
        });

        // Fire off async broadcast to drivers in the area
        broadcastRideToZipCode(ride.id, ride.fromZip);

        res.status(201).json({ ride, message: 'Ride created and broadcasted to local drivers' });
    } catch (error) {
        console.error('Create ride error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// 2. Get user's active rides (Pending and Accepted)
export const getMyRides = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;

        const rides = await prisma.ride.findMany({
            where: {
                userId,
                status: {
                    in: [RideStatus.PENDING, RideStatus.ACCEPTED]
                }
            },
            orderBy: { createdAt: 'desc' },
            include: {
                driver: {
                    select: { firstName: true, phone: true },
                },
            },
        });

        res.status(200).json({ rides });
    } catch (error) {
        console.error('Get rides error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// 2b. Get user's completed ride history with filtering and pagination
export const getRideHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { fromDate, toDate, page = '1', limit = '10', userId, driverId } = req.query;

        // Fallback to logged-in user if neither userId nor driverId is provided
        const authUserId = req.user?.userId;
        const role = req.user?.role;

        const pageNumber = parseInt(page as string, 10);
        const limitNumber = parseInt(limit as string, 10);
        const skip = (pageNumber - 1) * limitNumber;

        // Build the where clause for filtering
        const whereClause: any = {
            status: RideStatus.COMPLETED,
        };

        if (authUserId && role === 'DRIVER') {
            // Default to self if no specific ID filter is provided
            whereClause.driverId = authUserId;
        }
        else if (authUserId && role === 'USER') {
            whereClause.userId = authUserId;
        }

        if (userId && driverId) {
            whereClause.userId = userId as string;
            whereClause.driverId = driverId as string;
        }

        if (fromDate || toDate) {
            whereClause.completedAt = {};
            if (fromDate) {
                whereClause.completedAt.gte = new Date(fromDate as string);
            }
            if (toDate) {
                whereClause.completedAt.lte = new Date(toDate as string);
            }
        }

        const [rides, totalCount] = await Promise.all([
            prisma.ride.findMany({
                where: whereClause,
                orderBy: { completedAt: 'desc' },
                skip,
                take: limitNumber,
                include: {
                    driver: {
                        select: { firstName: true, phone: true },
                    },
                    user: {
                        select: { firstName: true, lastName: true }
                    }
                },
            }),
            prisma.ride.count({
                where: whereClause,
            }),
        ]);

        const totalPages = Math.ceil(totalCount / limitNumber);

        res.status(200).json({
            rides,
            pagination: {
                totalCount,
                totalPages,
                currentPage: pageNumber,
                limit: limitNumber,
            },
        });
    } catch (error) {
        console.error('Get ride history error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// 3. User views all drivers who accepted their pending ride
export const getAvailableDrivers = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const rideId = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];

        const ride = await prisma.ride.findUnique({ where: { id: rideId } });

        if (!ride || ride.userId !== userId) {
            res.status(404).json({ message: 'Ride not found or unauthorized' });
            return;
        }

        // Find all RideRequests for this ride that were ACCEPTED by a driver
        const acceptedRequests = await prisma.rideRequest.findMany({
            where: {
                rideId,
                status: RequestStatus.ACCEPTED,
            },
        });

        const acceptedDriverIds = acceptedRequests.map((req: any) => req.driverId);

        const drivers = await prisma.user.findMany({
            where: { id: { in: acceptedDriverIds } },
            select: {
                id: true,
                firstName: true,
                avgRating: true,
                driverProfile: {
                    select: { vehicleMake: true, vehicleModel: true, totalRides: true }
                }
            }
        });

        res.status(200).json({ drivers });
    } catch (error) {
        console.error('Get available drivers error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// 4. User picks their favorite driver from the accepted pool
export const pickDriver = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const rideId = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
        const { driverId } = req.body;

        const ride = await prisma.ride.findUnique({ where: { id: rideId } });
        if (!ride || ride.userId !== userId || ride.status !== RideStatus.PENDING) {
            res.status(400).json({ message: 'Invalid ride status or unauthorized' });
            return;
        }

        // Wrap in transaction: Assign ride, confirm chosen driver, reject all others
        await prisma.$transaction(async (tx) => {
            // 1. Reject all other drivers for this ride (both Pending and Accepted)
            await tx.rideRequest.updateMany({
                where: {
                    rideId,
                    driverId: { not: driverId },
                    status: { in: [RequestStatus.PENDING, RequestStatus.ACCEPTED] }
                },
                data: { status: RequestStatus.REJECTED },
            });

            // 2. Ensure chosen driver's specific request is marked as ACCEPTED
            await tx.rideRequest.updateMany({
                where: { rideId, driverId },
                data: { status: RequestStatus.ACCEPTED },
            });

            // 3. Update the main ride record
            await tx.ride.update({
                where: { id: rideId },
                data: {
                    driverId,
                    status: RideStatus.ACCEPTED,
                    acceptedAt: new Date(),
                },
            });
        });

        res.status(200).json({ message: 'Driver selected successfully' });
    } catch (error) {
        console.error('Pick driver error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// 5. User increases price to attract more drivers
export const increasePrice = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const rideId = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
        const { newPrice } = req.body;

        const ride = await prisma.ride.findUnique({ where: { id: rideId } });
        if (!ride || ride.userId !== userId || ride.status == RideStatus.COMPLETED || ride.status == RideStatus.CANCELLED) {
            res.status(400).json({ message: 'Invalid ride status or unauthorized' });
            return;
        }

        if (newPrice <= Number(ride.price)) {
            res.status(400).json({ message: 'New price must be higher than old price' });
            return;
        }

        const updatedRide = await prisma.ride.update({
            where: { id: rideId },
            data: { price: newPrice },
        });

        broadcastRideToZipCode(rideId, updatedRide.fromZip);

        res.status(200).json({ ride: updatedRide, message: 'Price increased and rebroadcasted' });
    } catch (error) {
        console.error('Increase price error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// 6. User cancels their ride entirely
export const cancelRide = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const rideId = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];

        const ride = await prisma.ride.findUnique({ where: { id: rideId } });
        if (!ride || ride.userId !== userId) {
            res.status(404).json({ message: 'Ride not found or unauthorized' });
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
            await tx.ride.update({
                where: { id: rideId },
                data: { status: RideStatus.CANCELLED },
            });

            await tx.rideRequest.updateMany({
                where: {
                    rideId,
                    status: { in: [RequestStatus.PENDING, RequestStatus.ACCEPTED] }
                },
                data: { status: RequestStatus.REJECTED },
            });
        });

        res.status(200).json({ message: 'Ride cancelled successfully' });
    } catch (error) {
        console.error('Cancel ride error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// 7. Get single ride details (Authorized for Rider, Driver, or Admin)
export const getRideDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const authUserId = req.user?.userId;
        const role = req.user?.role;
        const rideId = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];

        const ride = await prisma.ride.findUnique({
            where: { id: rideId },
            include: {
                user: {
                    select: { firstName: true, lastName: true, phone: true, email: true }
                },
                driver: {
                    select: { firstName: true, lastName: true, phone: true }
                },
                ratings: true
            }
        });

        if (!ride) {
            res.status(404).json({ message: 'Ride not found' });
            return;
        }

        // Authorization check: Admin can see all, others only if they are part of the ride
        const isAdmin = role === 'ADMIN' || role === 'admin'; // handling potential case difference
        const isRider = ride.userId === authUserId;
        const isDriver = ride.driverId === authUserId;

        if (!isAdmin && !isRider && !isDriver) {
            res.status(403).json({ message: 'Forbidden: You do not have access to this ride details' });
            return;
        }

        res.status(200).json({ ride });
    } catch (error) {
        console.error('Get ride details error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
