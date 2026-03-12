import { Router } from 'express';
import { getMe, updateProfile, updatePassword } from '../../controllers/user/profileController';
import { authenticate } from '../../middleware/authMiddleware';

const router = Router();

// Protect all profile routes
router.use(authenticate);

router.get('/', getMe);
router.put('/', updateProfile);
router.put('/password', updatePassword);

export default router;
