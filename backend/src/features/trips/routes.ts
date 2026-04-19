import { Router } from 'express';
import { TripController } from './controller';
import { authenticateToken } from '../../middleware/auth';

export const createTripRoutes = (controller: TripController): Router => {
  const router = Router();

  // All trip routes require authentication
  router.use(authenticateToken);

  router.post('/generate', controller.generate);
  router.get('/', controller.list);
  router.get('/:id', controller.getById);
  router.post('/save', controller.save);
  router.get('/:id/estimate-budget', controller.estimateBudget);
  router.delete('/:id', controller.delete);
  return router;
};

