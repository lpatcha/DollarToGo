"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastRideToZipCode = void 0;
const client_1 = require("@prisma/client");
const socket_1 = require("../../utils/socket");
const prisma = new client_1.PrismaClient();
function calculateDistanceInMiles(lat1, lon1, lat2, lon2) {
    const R = 3958.8; // Earth's radius in miles
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
// Broadcast a new ride to all drivers in a zip code
const broadcastRideToZipCode = async (rideId, zipCode) => {
    try {
        const rideDetails = await prisma.ride.findUnique({
            where: { id: rideId },
            include: { user: { select: { firstName: true } } }
        });
        if (!rideDetails) {
            console.error('Ride details not found for broadcast');
            return;
        }
        const estimatedMiles = calculateDistanceInMiles(rideDetails.fromLat, rideDetails.fromLng, rideDetails.toLat, rideDetails.toLng);
        // 1. Find all drivers who are available and serve this zip code
        const availableDrivers = await prisma.driverProfile.findMany({
            where: {
                isAvailable: true,
                serviceZipCodes: {
                    contains: zipCode,
                },
            },
        });
        if (availableDrivers.length === 0) {
            console.log(`No available drivers found in zip code ${zipCode} for ride ${rideId}`);
            return;
        }
        // 2. Create a RideRequest record for each driver in DB
        const rideRequests = availableDrivers.map((driver) => ({
            rideId,
            driverId: driver.userId,
            estimatedMiles: estimatedMiles * 1.25, // Convert straight-line to rough road estimate
            status: 'PENDING',
        }));
        await prisma.rideRequest.createMany({
            data: rideRequests,
            skipDuplicates: true,
        });
        (0, socket_1.emitToZip)(zipCode, 'NEW_RIDE_BROADCAST', {
            rideId,
            from: rideDetails?.fromAddress,
            to: rideDetails?.toAddress,
            price: rideDetails?.price,
            riderName: rideDetails?.user?.firstName
        });
        console.log(`[Socket] Broadcasted ride ${rideId} to zip:${zipCode}`);
    }
    catch (error) {
        console.error('Error broadcasting ride:', error);
    }
};
exports.broadcastRideToZipCode = broadcastRideToZipCode;
