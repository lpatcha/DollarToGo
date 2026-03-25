"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserPassword = exports.updateUserProfile = exports.getUserProfile = void 0;
const client_1 = require("@prisma/client");
const password_1 = require("../../utils/password");
const prisma = new client_1.PrismaClient();
const getUserProfile = async (userId) => {
    return prisma.user.findUnique({
        where: { id: userId },
        include: { driverProfile: true },
    });
};
exports.getUserProfile = getUserProfile;
const updateUserProfile = async (userId, data) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { driverProfile: true }
    });
    if (!user) {
        throw new Error('User not found');
    }
    const updateData = {
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
exports.updateUserProfile = updateUserProfile;
const updateUserPassword = async (userId, currentPassword, newPassword) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user)
        return false;
    const isMatch = await (0, password_1.comparePassword)(currentPassword, user.passwordHash);
    if (!isMatch)
        return false;
    const passwordHash = await (0, password_1.hashPassword)(newPassword);
    await prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
    });
    return true;
};
exports.updateUserPassword = updateUserPassword;
