import { Router } from 'express';
import { acceptRideRequest, getDriverHistory } from '../../controllers/driver/driverController';
import { authenticate, requireRole } from '../../middleware/auth/authMiddleware';

const router = Router();

// Protect all driver routes
router.use(authenticate);
router.use(requireRole(['DRIVER', 'ADMIN']));

// Core Driver Actions
router.post('/requests/:id/accept', acceptRideRequest);

// Consolidated Driver History & Earnings
router.get('/history', getDriverHistory);

export default router;
