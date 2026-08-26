import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { loginController, logoutController, meController, registerController } from '../controllers/authController';
const router = Router();
router.post('/register', registerController); router.post('/login', loginController); router.post('/logout', authenticate, logoutController); router.get('/me', authenticate, meController);
export default router;
