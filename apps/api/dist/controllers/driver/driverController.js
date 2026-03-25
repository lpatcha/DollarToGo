"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrollBulkZipCodes = exports.enrollZipCode = exports.completeRide = exports.driverCancelRide = exports.acceptRideRequest = exports.getAssignedRideRequests = void 0;
const client_1 = require("@prisma/client");
const socket_1 = require("../../utils/socket");
const prisma = new client_1.PrismaClient();
// 1. Driver views pending ride requests assigned to them (based on zip code broadcast)
const getAssignedRideRequests = async (req, res) => {
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
                    in: [client_1.RequestStatus.PENDING, client_1.RequestStatus.ACCEPTED]
                },
                ride: {
                    status: {
                        in: [client_1.RideStatus.PENDING, client_1.RideStatus.ACCEPTED]
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
        // Separate ACCEPTED and PENDING requests
        const acceptedRequests = requests.filter(r => r.status === client_1.RequestStatus.ACCEPTED);
        const pendingRequests = requests.filter(r => r.status === client_1.RequestStatus.PENDING);
        // Sort pending requests by Equation: (Price ^ 1.5) / estimatedMiles
        pendingRequests.sort((a, b) => {
            const priceA = Number(a.ride.price) || 0;
            const milesA = a.estimatedMiles || 1; // Default to 1 to avoid div by zero
            const scoreA = Math.pow(priceA, 1.5) / milesA;
            const priceB = Number(b.ride.price) || 0;
            const milesB = b.estimatedMiles || 1;
            const scoreB = Math.pow(priceB, 1.5) / milesB;
            return scoreB - scoreA; // Highest score first
        });
        // If the driver has accepted a ride, prioritize showing that. 
        // Otherwise, show ONLY the top 1 most valuable pending request.
        let displayRequests = [];
        if (acceptedRequests.length > 0) {
            displayRequests = acceptedRequests;
        }
        else if (pendingRequests.length > 0) {
            displayRequests = [pendingRequests[0]];
        }
        res.status(200).json({ requests: displayRequests });
    }
    catch (error) {
        console.error('Get assigned ride requests error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAssignedRideRequests = getAssignedRideRequests;
// 2. Driver accepts a broadcasted RideRequest
const acceptRideRequest = async (req, res) => {
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
        if (rideRequest.status !== client_1.RequestStatus.PENDING) {
            res.status(400).json({ message: 'Ride request is no longer pending' });
            return;
        }
        if (rideRequest.ride.status !== client_1.RideStatus.PENDING) {
            res.status(400).json({ message: 'Ride has already been taken or cancelled' });
            return;
        }
        const updatedRequest = await prisma.rideRequest.update({
            where: { id: requestId },
            data: { status: client_1.RequestStatus.ACCEPTED }
        });
        // Notify the Rider that a driver is interested
        const driver = await prisma.user.findUnique({
            where: { id: driverId },
            select: { firstName: true, lastName: true, avgRating: true, totalRatingsCount: true, totalRides: true, driverProfile: true }
        });
        (0, socket_1.emitToUser)(rideRequest.ride.userId, 'DRIVER_INTERESTED', {
            rideId: rideRequest.rideId,
            driver: {
                id: driverId,
                name: `${driver?.firstName} ${driver?.lastName}`,
                firstName: driver?.firstName,
                lastName: driver?.lastName,
                avgRating: driver?.avgRating,
                totalRatingsCount: driver?.totalRatingsCount,
                totalRides: driver?.totalRides,
                rating: driver?.avgRating,
                vehicle: driver?.driverProfile ? `${driver.driverProfile.vehicleMake} ${driver.driverProfile.vehicleModel}` : 'Unknown Vehicle',
                driverProfile: driver?.driverProfile
            }
        });
        res.status(200).json({ message: 'Ride request accepted. Waiting for rider confirmation.', request: updatedRequest });
    }
    catch (error) {
        console.error('Accept ride request error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.acceptRideRequest = acceptRideRequest;
// 4. Driver cancels a ride that was accepted by the user
const driverCancelRide = async (req, res) => {
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
        if (ride.status === client_1.RideStatus.COMPLETED) {
            res.status(400).json({ message: 'Cannot cancel a completed ride' });
            return;
        }
        if (ride.status === client_1.RideStatus.CANCELLED) {
            res.status(400).json({ message: 'Ride is already cancelled' });
            return;
        }
        await prisma.$transaction(async (tx) => {
            // Cancel the ride
            await tx.ride.update({
                where: { id: rideId },
                data: { status: client_1.RideStatus.CANCELLED }
            });
            // Mark all related requests as REJECTED
            await tx.rideRequest.updateMany({
                where: {
                    rideId,
                    status: { in: [client_1.RequestStatus.PENDING, client_1.RequestStatus.ACCEPTED] }
                },
                data: { status: client_1.RequestStatus.REJECTED }
            });
        });
        // Notify the Rider that the driver cancelled
        (0, socket_1.emitToUser)(ride.userId, 'RIDE_CANCELLED', {
            rideId,
            message: 'Your driver has cancelled this ride. Please try booking again.'
        });
        res.status(200).json({ message: 'Ride cancelled successfully by driver' });
    }
    catch (error) {
        console.error('Driver cancel ride error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.driverCancelRide = driverCancelRide;
// 5. Driver marks a ride as completed and rates the rider
const completeRide = async (req, res) => {
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
        if (ride.status === client_1.RideStatus.COMPLETED) {
            res.status(400).json({ message: 'Ride is already completed' });
            return;
        }
        if (ride.status === client_1.RideStatus.CANCELLED) {
            res.status(400).json({ message: 'Cannot complete a cancelled ride' });
            return;
        }
        const result = await prisma.$transaction(async (tx) => {
            // 1. Mark ride as completed
            const updatedRide = await tx.ride.update({
                where: { id: rideId },
                data: {
                    status: client_1.RideStatus.COMPLETED,
                    completedAt: new Date()
                }
            });
            // 2. Create rating for the rider (User)
            await tx.rating.create({
                data: {
                    rideId,
                    ratedById: driverId,
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
                    totalRatingsCount: { increment: 1 },
                    totalRides: { increment: 1 }
                }
            });
            // 4. Update Driver's total completed rides count on User model
            await tx.user.update({
                where: { id: driverId },
                data: { totalRides: { increment: 1 } }
            });
            return updatedRide;
        });
        // Notify the Rider that the ride is complete (triggers the rating UI)
        (0, socket_1.emitToUser)(ride.userId, 'RIDE_COMPLETED', {
            rideId,
            message: 'Your ride is complete! Please take a moment to rate your driver.'
        });
        res.status(200).json({ message: 'Ride marked as completed and rider rated', ride: result });
    }
    catch (error) {
        console.error('Complete ride and rate error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.completeRide = completeRide;
// 6. Driver enrolls in a specific zip code to receive ride requests there
const enrollZipCode = async (req, res) => {
    try {
        const driverId = req.user?.userId;
        const { zipCode } = req.body;
        if (!zipCode || typeof zipCode !== 'string') {
            res.status(400).json({ message: 'Zip code is required' });
            return;
        }
        const profile = await prisma.driverProfile.findUnique({
            where: { userId: driverId }
        });
        if (!profile) {
            res.status(404).json({ message: 'Driver profile not found' });
            return;
        }
        // Handle comma-separated list
        const cleanZip = zipCode.trim();
        const existingZips = profile.serviceZipCodes
            ? profile.serviceZipCodes.split(',').map(z => z.trim()).filter(z => z.length > 0)
            : [];
        if (!existingZips.includes(cleanZip)) {
            existingZips.push(cleanZip);
        }
        const newServiceZipCodes = existingZips.join(',');
        // Update the driver's service area and global zipCode mapping natively
        const updatedProfile = await prisma.driverProfile.update({
            where: { userId: driverId },
            data: { serviceZipCodes: newServiceZipCodes }
        });
        await prisma.user.update({
            where: { id: driverId },
            data: { zipCode: cleanZip } // Global zip reflects latest added
        });
        res.status(200).json({
            message: 'Successfully enrolled in area',
            serviceZipCodes: updatedProfile.serviceZipCodes
        });
    }
    catch (error) {
        console.error('Enroll zip code error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.enrollZipCode = enrollZipCode;
// 7. Driver bulk enrolls in multiple state zip codes
const enrollBulkZipCodes = async (req, res) => {
    try {
        const driverId = req.user?.userId;
        const { zipCodes } = req.body; // Expected to be string[]
        if (!Array.isArray(zipCodes) || zipCodes.length === 0) {
            res.status(400).json({ message: 'Valid zipCodes array is required' });
            return;
        }
        const profile = await prisma.driverProfile.findUnique({
            where: { userId: driverId }
        });
        if (!profile) {
            res.status(404).json({ message: 'Driver profile not found' });
            return;
        }
        // Handle comma-separated list
        const existingZips = profile.serviceZipCodes
            ? profile.serviceZipCodes.split(',').map(z => z.trim()).filter(z => z.length > 0)
            : [];
        // Extract strictly new zip codes that don't exist yet
        const newUniqueZips = zipCodes
            .map(z => String(z).trim())
            .filter(z => z.length > 0 && !existingZips.includes(z));
        if (newUniqueZips.length === 0) {
            res.status(200).json({
                message: 'All provided zip codes are already enrolled',
                serviceZipCodes: profile.serviceZipCodes
            });
            return;
        }
        // Append the new batch safely
        existingZips.push(...newUniqueZips);
        const newServiceZipCodes = existingZips.join(',');
        const updatedProfile = await prisma.driverProfile.update({
            where: { userId: driverId },
            data: { serviceZipCodes: newServiceZipCodes }
        });
        res.status(200).json({
            message: `Successfully enrolled in ${newUniqueZips.length} new zip codes`,
            serviceZipCodes: updatedProfile.serviceZipCodes
        });
    }
    catch (error) {
        console.error('Bulk enroll zip code error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.enrollBulkZipCodes = enrollBulkZipCodes;
