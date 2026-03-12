import { Router } from 'express';
import { getMe, updateProfile, updatePassword, requestPasswordUpdate } from '../../controllers/user/profileController';
import { authenticate } from '../../middleware/auth/authMiddleware';

const router = Router();

// Protect all profile routes
router.use(authenticate);

router.get('/', getMe);
router.put('/', updateProfile);
router.post('/request-password-update', requestPasswordUpdate);
router.put('/password', updatePassword);

export default router;
