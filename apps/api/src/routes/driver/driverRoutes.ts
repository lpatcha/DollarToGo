import { Router } from 'express';
import { acceptRideRequest, getAssignedRideRequests, driverCancelRide, completeRide, enrollZipCode, enrollBulkZipCodes } from '../../controllers/driver/driverController';
import { authenticate, requireRole } from '../../middleware/auth/authMiddleware';

const router = Router();

// Protect all driver routes
router.use(authenticate);
router.use(requireRole(['DRIVER', 'ADMIN']));

// Core Driver Actions
router.post('/enroll-zip', enrollZipCode);
router.post('/enroll-bulk-zips', enrollBulkZipCodes);
router.get('/assigned-requests', getAssignedRideRequests);
router.post('/requests/:id/accept', acceptRideRequest);
router.put('/rides/:id/cancel', driverCancelRide);
router.put('/rides/:id/complete', completeRide);


export default router;
