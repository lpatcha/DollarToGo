import { Router } from 'express';
import { rateRide } from '../../controllers/rating/ratingController';
import { authenticate, requireRole } from '../../middleware/auth/authMiddleware';

const router = Router();
router.use(authenticate);
router.use(requireRole(['USER', 'ADMIN']));
// Rate a completed ride
router.post('/', rateRide);


export default router;
