import { Router } from 'express';
import { register, login, logout, forgotPassword, resetPassword, activateAccount, resendActivation } from '../../controllers/auth/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/activate', activateAccount);
router.post('/resend-activation', resendActivation);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
