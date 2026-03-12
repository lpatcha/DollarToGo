import { Router } from 'express';
import { createRide, getMyRides, getAvailableDrivers, pickDriver, increasePrice, cancelRide } from '../../controllers/user/rideController';
import { authenticate } from '../../middleware/authMiddleware';

const router = Router();

// Protect all ride routes
router.use(authenticate);

// Standard Rider endpoints
router.post('/', createRide);
router.get('/my', getMyRides);

// Interactive Rider-to-Driver endpoints
router.get('/:id/drivers', getAvailableDrivers);
router.put('/:id/pick-driver', pickDriver);
router.put('/:id/increase-price', increasePrice);
router.put('/:id/cancel', cancelRide);

export default router;
