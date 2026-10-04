import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';
import { loginSchema, changePasswordSchema, forgotPasswordSchema } from '../validators';

const router = Router();

router.post('/login', authLimiter, validateBody(loginSchema), AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', authenticate, AuthController.me);
router.post('/password/change', authenticate, validateBody(changePasswordSchema), AuthController.changePassword);
router.post('/password/forgot', validateBody(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/mfa/enroll', authenticate, AuthController.enrollMfa);
router.post('/mfa/verify', authenticate, AuthController.verifyMfa);

export default router;
