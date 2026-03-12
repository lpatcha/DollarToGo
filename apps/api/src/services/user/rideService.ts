import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Placeholder for actual widespread WebSocket broadcasting
// This will be replaced with actual socket.io logic in Sprint 3
export const broadcastRideToZipCode = async (rideId: string, zipCode: string): Promise<void> => {
    try {
        // 1. Find all drivers who are available and serve this zip code
        // We use a simple contains check for now (assuming comma-separated list like "10001, 10002")
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

        // 2. Create a RideRequest record for each driver
        const rideRequests = availableDrivers.map((driver: any) => ({
            rideId,
            driverId: driver.userId,
            status: 'PENDING' as const,
        }));

        await prisma.rideRequest.createMany({
            data: rideRequests,
            skipDuplicates: true,
        });

        console.log(`[Socket.IO Mock] Broadcasted ride ${rideId} to ${availableDrivers.length} drivers in ${zipCode}`);
    } catch (error) {
        console.error('Error broadcasting ride:', error);
    }
};
