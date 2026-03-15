import { Router } from 'express';
import { acceptRideRequest, getDriverHistory, getAssignedRideRequests, driverCancelRide, completeRide } from '../../controllers/driver/driverController';
import { authenticate, requireRole } from '../../middleware/auth/authMiddleware';

const router = Router();

// Protect all driver routes
router.use(authenticate);
router.use(requireRole(['DRIVER', 'ADMIN']));

// Core Driver Actions
router.get('/assigned-requests', getAssignedRideRequests);
router.post('/requests/:id/accept', acceptRideRequest);
router.put('/rides/:id/cancel', driverCancelRide);
router.put('/rides/:id/complete', completeRide);

// Consolidated Driver History & Earnings
router.get('/history', getDriverHistory);

export default router;
