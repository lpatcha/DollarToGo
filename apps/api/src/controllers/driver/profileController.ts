import { Request, Response } from 'express';
import { enrollDriverZipCode, updateDriverProfile } from '../../services/driver/profileService';

export const enrollZipCode = async (req: Request, res: Response): Promise<void> => {
    try {
        const driverId = req.user?.userId;
        const { zipCode } = req.body;

        if (!driverId || !zipCode) {
            res.status(400).json({ message: 'Missing zip code' });
            return;
        }

        const updatedProfile = await enrollDriverZipCode(driverId, zipCode);
        res.status(200).json({ message: 'Successfully enrolled in new zip code', profile: updatedProfile });
    } catch (error: any) {
        console.error('Enroll zip code error:', error);

        if (error.message === 'Already enrolled in this zip code' || error.message === 'Driver profile not found') {
            res.status(400).json({ message: error.message });
            return;
        }

        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateDriverProfileAction = async (req: Request, res: Response): Promise<void> => {
    try {
        const driverId = req.user?.userId;
        if (!driverId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const updatedProfile = await updateDriverProfile(driverId, req.body);
        res.status(200).json({ message: 'Driver profile updated successfully', profile: updatedProfile });
    } catch (error: any) {
        console.error('Update driver profile error:', error);

        if (error.message === 'Driver profile not found') {
            res.status(404).json({ message: error.message });
            return;
        }

        res.status(500).json({ message: 'Internal server error' });
    }
};
