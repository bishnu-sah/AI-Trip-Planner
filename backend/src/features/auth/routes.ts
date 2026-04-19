import { Router } from 'express';
import { AuthController } from './controller';
import { authenticateToken } from '../../middleware/auth';

export const createAuthRoutes = (controller: AuthController): Router => {
  const router = Router();
  router.post('/register', controller.register);
  router.post('/login', controller.login);
  router.get('/me', authenticateToken, controller.me);
  router.put('/me', authenticateToken, controller.updateProfile);
  return router;
};

