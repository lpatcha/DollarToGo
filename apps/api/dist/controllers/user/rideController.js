"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRideDetails = exports.cancelRide = exports.increasePrice = exports.pickDriver = exports.getAvailableDrivers = exports.getRideHistory = exports.getMyRides = exports.createRide = void 0;
const client_1 = require("@prisma/client");
const rideService_1 = require("../../services/user/rideService");
const socket_1 = require("../../utils/socket");
const prisma = new client_1.PrismaClient();
// 1. User creates a new ride
const createRide = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { fromAddress, fromZip, fromLat, fromLng, toAddress, toZip, toLat, toLng, price } = req.body;
        if (!userId || !fromAddress || !fromZip || !toAddress || !price) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }
        // Check if user already has an active ride
        const activeRide = await prisma.ride.findFirst({
            where: {
                userId,
                status: {
                    notIn: [client_1.RideStatus.COMPLETED, client_1.RideStatus.CANCELLED]
                }
            }
        });
        if (activeRide) {
            res.status(400).json({ message: 'You already have an active ride request.' });
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
                status: client_1.RideStatus.PENDING,
            },
        });
        // Fire off async broadcast to drivers in the area
        (0, rideService_1.broadcastRideToZipCode)(ride.id, ride.fromZip);
        res.status(201).json({ ride, message: 'Ride created and broadcasted to local drivers' });
    }
    catch (error) {
        console.error('Create ride error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createRide = createRide;
// 2. Get user's active rides (Pending and Accepted)
const getMyRides = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const rides = await prisma.ride.findMany({
            where: {
                userId,
                status: {
                    in: [client_1.RideStatus.PENDING, client_1.RideStatus.ACCEPTED]
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
    }
    catch (error) {
        console.error('Get rides error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getMyRides = getMyRides;
// 2b. Get user's completed ride history with filtering and pagination
const getRideHistory = async (req, res) => {
    try {
        const { fromDate, toDate, page = '1', limit = '10', userId, driverId } = req.query;
        // Fallback to logged-in user if neither userId nor driverId is provided
        const authUserId = req.user?.userId;
        const role = req.user?.role;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;
        // Build the where clause for filtering
        const whereClause = {
            status: client_1.RideStatus.COMPLETED,
        };
        if (authUserId && role === 'DRIVER') {
            // Default to self if no specific ID filter is provided
            whereClause.driverId = authUserId;
        }
        else if (authUserId && role === 'USER') {
            whereClause.userId = authUserId;
        }
        if (userId && driverId) {
            whereClause.userId = userId;
            whereClause.driverId = driverId;
        }
        if (fromDate || toDate) {
            whereClause.completedAt = {};
            if (fromDate) {
                // Force strict UTC parsing to match raw SQL boundaries
                whereClause.completedAt.gte = new Date(`${fromDate}T00:00:00.000Z`);
            }
            if (toDate) {
                whereClause.completedAt.lte = new Date(`${toDate}T23:59:59.999Z`);
            }
        }
        const [rawRides, totalCount, totalSpentAgg] = await Promise.all([
            prisma.ride.findMany({
                where: whereClause,
                orderBy: { createdAt: 'desc' }, // fallback to createdAt if completedAt is null for cancelled
                skip,
                take: limitNumber,
                include: {
                    driver: {
                        select: { firstName: true, phone: true },
                    },
                    user: {
                        select: { firstName: true, lastName: true }
                    },
                    _count: {
                        select: { ratings: true }
                    }
                },
            }),
            prisma.ride.count({
                where: whereClause,
            }),
            prisma.ride.aggregate({
                where: { ...whereClause, status: client_1.RideStatus.COMPLETED },
                _sum: { price: true }
            })
        ]);
        const totalPages = Math.ceil(totalCount / limitNumber);
        const rides = rawRides.map(ride => {
            const notRated = ride._count.ratings < 2;
            const { _count, ...rideData } = ride;
            return {
                ...rideData,
                notRated
            };
        });
        res.status(200).json({
            rides,
            pagination: {
                totalCount,
                totalSpent: Number(totalSpentAgg._sum.price || 0),
                totalPages,
                currentPage: pageNumber,
                limit: limitNumber,
            },
        });
    }
    catch (error) {
        console.error('Get ride history error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getRideHistory = getRideHistory;
// 3. User views all drivers who accepted their pending ride
const getAvailableDrivers = async (req, res) => {
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
                status: client_1.RequestStatus.ACCEPTED,
            },
        });
        const acceptedDriverIds = acceptedRequests.map((req) => req.driverId);
        const drivers = await prisma.user.findMany({
            where: { id: { in: acceptedDriverIds } },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                avgRating: true,
                totalRatingsCount: true,
                totalRides: true,
                driverProfile: {
                    select: { vehicleMake: true, vehicleModel: true }
                }
            }
        });
        res.status(200).json({ drivers });
    }
    catch (error) {
        console.error('Get available drivers error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAvailableDrivers = getAvailableDrivers;
// 4. User picks their favorite driver from the accepted pool
const pickDriver = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const rideId = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
        const { driverId } = req.body;
        const ride = await prisma.ride.findUnique({ where: { id: rideId } });
        if (!ride || ride.userId !== userId || ride.status !== client_1.RideStatus.PENDING) {
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
                    status: { in: [client_1.RequestStatus.PENDING, client_1.RequestStatus.ACCEPTED] }
                },
                data: { status: client_1.RequestStatus.REJECTED },
            });
            // 2. Ensure chosen driver's specific request is marked as ACCEPTED
            await tx.rideRequest.updateMany({
                where: { rideId, driverId },
                data: { status: client_1.RequestStatus.ACCEPTED },
            });
            // 3. Update the main ride record
            await tx.ride.update({
                where: { id: rideId },
                data: {
                    driverId,
                    status: client_1.RideStatus.ACCEPTED,
                    acceptedAt: new Date(),
                },
            });
        });
        // Socket Notifications
        // 1. Notify the chosen driver
        (0, socket_1.emitToUser)(driverId, 'RIDE_CONFIRMED', {
            rideId,
            message: 'You have been picked for the ride! Please start heading to the location.'
        });
        // 2. Notify all other drivers in the zip that the ride is no longer available
        (0, socket_1.emitToZip)(ride.fromZip, 'RIDE_UNAVAILABLE', {
            rideId,
            message: 'This ride has been taken by another driver.'
        });
        res.status(200).json({ message: 'Driver selected successfully' });
    }
    catch (error) {
        console.error('Pick driver error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.pickDriver = pickDriver;
// 5. User increases price to attract more drivers
const increasePrice = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const rideId = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
        const { newPrice } = req.body;
        const ride = await prisma.ride.findUnique({ where: { id: rideId } });
        if (!ride || ride.userId !== userId || ride.status == client_1.RideStatus.COMPLETED || ride.status == client_1.RideStatus.CANCELLED) {
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
        (0, rideService_1.broadcastRideToZipCode)(rideId, updatedRide.fromZip);
        // Also emit a specific update event so active drivers can update their UI price immediately
        (0, socket_1.emitToZip)(updatedRide.fromZip, 'RIDE_PRICE_UPDATED', {
            rideId,
            newPrice
        });
        res.status(200).json({ ride: updatedRide, message: 'Price increased and rebroadcasted' });
    }
    catch (error) {
        console.error('Increase price error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.increasePrice = increasePrice;
// 6. User cancels their ride entirely
const cancelRide = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const rideId = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
        const ride = await prisma.ride.findUnique({ where: { id: rideId } });
        if (!ride || ride.userId !== userId) {
            res.status(404).json({ message: 'Ride not found or unauthorized' });
            return;
        }
        if (ride.status === client_1.RideStatus.COMPLETED) {
            res.status(400).json({ message: 'Cannot cancel a completed ride' });
            return;
        }
        if (ride.status === client_1.RideStatus.CANCELLED) {
            res.status(400).json({ message: 'Ride is already cancelled' });
            return;
        }
        await prisma.$transaction(async (tx) => {
            await tx.ride.update({
                where: { id: rideId },
                data: { status: client_1.RideStatus.CANCELLED },
            });
            await tx.rideRequest.updateMany({
                where: {
                    rideId,
                    status: { in: [client_1.RequestStatus.PENDING, client_1.RequestStatus.ACCEPTED] }
                },
                data: { status: client_1.RequestStatus.REJECTED },
            });
        });
        // Notify the driver if one was already assigned
        if (ride.driverId) {
            (0, socket_1.emitToUser)(ride.driverId, 'RIDE_CANCELLED', {
                rideId,
                message: 'The rider has cancelled this ride.'
            });
        }
        // Notify all drivers in the zip (so it disappears from their pending list)
        (0, socket_1.emitToZip)(ride.fromZip, 'RIDE_UNAVAILABLE', {
            rideId,
            message: 'Ride cancelled by user.'
        });
        res.status(200).json({ message: 'Ride cancelled successfully' });
    }
    catch (error) {
        console.error('Cancel ride error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.cancelRide = cancelRide;
// 7. Get single ride details (Authorized for Rider, Driver, or Admin)
const getRideDetails = async (req, res) => {
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
    }
    catch (error) {
        console.error('Get ride details error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getRideDetails = getRideDetails;
