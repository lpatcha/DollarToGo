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

// 2. Get user's active and historical rides
export const getMyRides = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;

        const rides = await prisma.ride.findMany({
            where: { userId },
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
                driverProfile: {
                    select: { avgRating: true, vehicleMake: true, vehicleModel: true, totalRides: true }
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

        // Wrap in transaction: Assign ride, reject other drivers
        await prisma.$transaction(async (tx) => {
            await tx.rideRequest.updateMany({
                where: { rideId, status: RequestStatus.ACCEPTED },
                data: { status: RequestStatus.REJECTED },
            });

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
        if (!ride || ride.userId !== userId || ride.status !== RideStatus.PENDING) {
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

        await prisma.$transaction(async (tx) => {
            await tx.ride.update({
                where: { id: rideId },
                data: { status: RideStatus.CANCELLED },
            });

            await tx.rideRequest.updateMany({
                where: { rideId, status: RequestStatus.PENDING },
                data: { status: RequestStatus.REJECTED },
            });
        });

        res.status(200).json({ message: 'Ride cancelled successfully' });
    } catch (error) {
        console.error('Cancel ride error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
