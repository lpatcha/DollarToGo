import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword } from '../../utils/password';

const prisma = new PrismaClient();

export const getUserProfile = async (userId: string) => {
    return prisma.user.findUnique({
        where: { id: userId },
        include: { driverProfile: true },
    });
};

export const updateUserProfile = async (userId: string, data: any) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { driverProfile: true }
    });

    if (!user) {
        throw new Error('User not found');
    }

    const updateData: any = {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.phone && { phone: data.phone }),
        ...(data.city && { city: data.city }),
        ...(data.zipCode && { zipCode: data.zipCode }),
    };

    // If user is a driver and driverProfile data is provided, update it as well
    if (user.role === 'DRIVER' && data.driverProfile) {
        updateData.driverProfile = {
            update: {
                ...(data.driverProfile.licenseNumber && { licenseNumber: data.driverProfile.licenseNumber }),
                ...(data.driverProfile.vehicleMake && { vehicleMake: data.driverProfile.vehicleMake }),
                ...(data.driverProfile.vehicleModel && { vehicleModel: data.driverProfile.vehicleModel }),
                ...(data.driverProfile.vehicleYear !== undefined && { vehicleYear: data.driverProfile.vehicleYear }),
                ...(data.driverProfile.vehicleColor && { vehicleColor: data.driverProfile.vehicleColor }),
                ...(data.driverProfile.licensePlate && { licensePlate: data.driverProfile.licensePlate }),
                ...(data.driverProfile.isAvailable !== undefined && { isAvailable: data.driverProfile.isAvailable }),
                ...(data.driverProfile.serviceZipCodes && { serviceZipCodes: data.driverProfile.serviceZipCodes }),
            }
        };
    }

    return prisma.user.update({
        where: { id: userId },
        data: updateData,
        include: { driverProfile: true },
    });
};

export const updateUserPassword = async (userId: string, currentPassword: string, newPassword: string): Promise<boolean> => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return false;

    const isMatch = await comparePassword(currentPassword, user.passwordHash);
    if (!isMatch) return false;

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
    });

    return true;
};
