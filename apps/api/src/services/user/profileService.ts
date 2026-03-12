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
    return prisma.user.update({
        where: { id: userId },
        data: {
            ...(data.firstName && { firstName: data.firstName }),
            ...(data.lastName && { lastName: data.lastName }),
            ...(data.phone && { phone: data.phone }),
            ...(data.city && { city: data.city }),
            ...(data.zipCode && { zipCode: data.zipCode }),
        },
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
