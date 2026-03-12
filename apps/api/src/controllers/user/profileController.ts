import { Request, Response } from 'express';
import { getUserProfile, updateUserProfile, updateUserPassword } from '../../services/user/profileService';

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

export const updatePassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            res.status(400).json({ message: 'Missing required password fields' });
            return;
        }

        const success = await updateUserPassword(userId, currentPassword, newPassword);

        if (!success) {
            res.status(401).json({ message: 'Incorrect current password or user not found' });
            return;
        }

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
