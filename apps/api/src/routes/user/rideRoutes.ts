import { Router } from 'express';
import { createRide, getMyRides, getRideHistory, getAvailableDrivers, pickDriver, increasePrice, cancelRide, getRideDetails } from '../../controllers/user/rideController';
import { authenticate, requireRole } from '../../middleware/auth/authMiddleware';

const router = Router();

// Protect all ride routes
router.use(authenticate);

// ----------------------------------------------------
// STATIC ROUTES
// ----------------------------------------------------

// Shared history endpoint
router.get('/history', requireRole(['USER', 'DRIVER', 'ADMIN']), getRideHistory);

// User-exclusive base endpoints
router.post('/', requireRole(['USER', 'ADMIN']), createRide);
router.get('/my', requireRole(['USER', 'ADMIN']), getMyRides);


// ----------------------------------------------------
// DYNAMIC ROUTES (With `/:id`)
// ----------------------------------------------------

// User-exclusive interactive endpoints
router.get('/:id/drivers', requireRole(['USER', 'ADMIN']), getAvailableDrivers);
router.put('/:id/pick-driver', requireRole(['USER', 'ADMIN']), pickDriver);
router.put('/:id/increase-price', requireRole(['USER', 'ADMIN']), increasePrice);
router.put('/:id/cancel', requireRole(['USER', 'ADMIN']), cancelRide);

// Shared wildcard detail endpoint (Must be DEAD LAST to avoid shadowing)
router.get('/:id', requireRole(['USER', 'DRIVER', 'ADMIN']), getRideDetails);

export default router;
