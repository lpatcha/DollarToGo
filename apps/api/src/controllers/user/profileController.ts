import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getUserProfile, updateUserProfile } from '../../services/user/profileService';
import { hashPassword, comparePassword } from '../../utils/password';
import { sendEmail } from '../../utils/email';

const prisma = new PrismaClient();

export const getMe = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const user = await getUserProfile(userId);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const { passwordHash, ...userWithoutPassword } = user as any;
        res.status(200).json({ user: userWithoutPassword });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const user = await updateUserProfile(userId, req.body);
        const { passwordHash, ...userWithoutPassword } = user as any;
        res.status(200).json({ message: 'Profile updated successfully', user: userWithoutPassword });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const requestPasswordUpdate = async (req: Request, res: Response): Promise<void> => {
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

        await sendEmail(user.email, subject, text);

        res.status(200).json({ message: 'Verification code sent to email' });
    } catch (error) {
        console.error('Request password update error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updatePassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { oldPassword, newPassword, code } = req.body;

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        if (!oldPassword || !newPassword || !code) {
            res.status(400).json({ message: 'Missing required fields (oldPassword, newPassword, code)' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const isMatch = await comparePassword(oldPassword, user.passwordHash);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid old password' });
            return;
        }

        if (!user.resetCode || !user.resetCodeExpiresAt || user.resetCode !== code) {
            res.status(400).json({ message: 'Invalid verification code' });
            return;
        }

        if (user.resetCodeExpiresAt < new Date()) {
            res.status(400).json({ message: 'Verification code has expired' });
            return;
        }

        const passwordHash = await hashPassword(newPassword);

        await prisma.user.update({
            where: { id: userId },
            data: {
                passwordHash,
                resetCode: null,
                resetCodeExpiresAt: null,
            },
        });

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
