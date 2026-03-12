import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const enrollDriverZipCode = async (driverId: string, zipCode: string) => {
    const profile = await prisma.driverProfile.findUnique({ where: { userId: driverId } });
    if (!profile) throw new Error('Driver profile not found');

    let currentZips = profile.serviceZipCodes.split(',').map(z => z.trim()).filter(z => z.length > 0);

    if (currentZips.includes(zipCode)) {
        throw new Error('Already enrolled in this zip code');
    }

    currentZips.push(zipCode);
    const newZipString = currentZips.join(', ');

    return prisma.driverProfile.update({
        where: { userId: driverId },
        data: { serviceZipCodes: newZipString }
    });
};

export const updateDriverProfile = async (driverId: string, data: any) => {
    const profile = await prisma.driverProfile.findUnique({ where: { userId: driverId } });
    if (!profile) throw new Error('Driver profile not found');

    return prisma.driverProfile.update({
        where: { userId: driverId },
        data: {
            ...(data.licenseNumber && { licenseNumber: data.licenseNumber }),
            ...(data.vehicleMake && { vehicleMake: data.vehicleMake }),
            ...(data.vehicleModel && { vehicleModel: data.vehicleModel }),
            ...(data.vehicleYear !== undefined && { vehicleYear: data.vehicleYear }),
            ...(data.vehicleColor && { vehicleColor: data.vehicleColor }),
            ...(data.licensePlate && { licensePlate: data.licensePlate }),
            ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
            ...(data.serviceZipCodes && { serviceZipCodes: data.serviceZipCodes }),
        }
    });
};
