import { Router } from 'express';
import { enrollZipCode, updateDriverProfileAction } from '../../controllers/driver/profileController';
import { authenticate, requireRole } from '../../middleware/authMiddleware';

const router = Router();

// Protect all driver routes
router.use(authenticate);
router.use(requireRole(['DRIVER', 'ADMIN']));

router.post('/enroll-zip', enrollZipCode);
router.put('/', updateDriverProfileAction);

export default router;
