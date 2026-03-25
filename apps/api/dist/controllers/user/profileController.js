"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePassword = exports.requestPasswordUpdate = exports.updateProfile = exports.getMe = void 0;
const client_1 = require("@prisma/client");
const profileService_1 = require("../../services/user/profileService");
const password_1 = require("../../utils/password");
const email_1 = require("../../utils/email");
const prisma = new client_1.PrismaClient();
const getMe = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const user = await (0, profileService_1.getUserProfile)(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const safeProfile = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            role: user.role,
        };
        if (user.role === 'DRIVER' && user.driverProfile) {
            safeProfile.driverProfile = {
                vehicleMake: user.driverProfile.vehicleMake,
                vehicleModel: user.driverProfile.vehicleModel,
                vehicleYear: user.driverProfile.vehicleYear,
                licensePlate: user.driverProfile.licensePlate,
                serviceZipCodes: user.driverProfile.serviceZipCodes,
            };
        }
        res.status(200).json({ user: safeProfile });
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getMe = getMe;
const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const user = await (0, profileService_1.updateUserProfile)(userId, req.body);
        const safeProfile = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            role: user.role,
        };
        if (user.role === 'DRIVER' && user.driverProfile) {
            safeProfile.driverProfile = {
                vehicleMake: user.driverProfile.vehicleMake,
                vehicleModel: user.driverProfile.vehicleModel,
                vehicleYear: user.driverProfile.vehicleYear,
                licensePlate: user.driverProfile.licensePlate,
                serviceZipCodes: user.driverProfile.serviceZipCodes,
            };
        }
        res.status(200).json({ message: 'Profile updated successfully', user: safeProfile });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateProfile = updateProfile;
const requestPasswordUpdate = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await prisma.user.update({
            where: { id: userId },
            data: {
                resetCode: code,
                resetCodeExpiresAt: expiresAt,
            },
        });
        const subject = 'Your Password Update Verification Code';
        const text = `Hi ${user.firstName},\n\nYou requested a password update. Please use the following 6-digit code to complete the process:\n\n${code}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.`;
        await (0, email_1.sendEmail)(user.email, subject, text);
        res.status(200).json({ message: 'Verification code sent to email' });
    }
    catch (error) {
        console.error('Request password update error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.requestPasswordUpdate = requestPasswordUpdate;
const updatePassword = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { oldPassword, newPassword } = req.body;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        if (!oldPassword || !newPassword) {
            res.status(400).json({ message: 'Missing required fields (oldPassword, newPassword)' });
            return;
        }
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const isMatch = await (0, password_1.comparePassword)(oldPassword, user.passwordHash);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid old password' });
            return;
        }
        const passwordHash = await (0, password_1.hashPassword)(newPassword);
        await prisma.user.update({
            where: { id: userId },
            data: {
                passwordHash,
                resetCode: null,
                resetCodeExpiresAt: null,
            },
        });
        res.status(200).json({ message: 'Password updated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updatePassword = updatePassword;
