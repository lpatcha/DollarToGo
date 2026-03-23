import { Router } from 'express';
import { createRide, getMyRides, getRideHistory, getAvailableDrivers, pickDriver, increasePrice, cancelRide, getRideDetails } from '../../controllers/user/rideController';
import { authenticate, requireRole } from '../../middleware/auth/authMiddleware';

const router = Router();

// Protect all ride routes
router.use(authenticate);

// Shared endpoints
router.get('/history', requireRole(['USER', 'DRIVER', 'ADMIN']), getRideHistory);
router.get('/:id', requireRole(['USER', 'DRIVER', 'ADMIN']), getRideDetails);

// User-exclusive endpoints
router.use(requireRole(['USER', 'ADMIN']));

// Standard Rider endpoints
router.post('/', createRide);
router.get('/my', getMyRides);

// Interactive Rider-to-Driver endpoints
router.get('/:id/drivers', getAvailableDrivers);
router.put('/:id/pick-driver', pickDriver);
router.put('/:id/increase-price', increasePrice);
router.put('/:id/cancel', cancelRide);

export default router;
