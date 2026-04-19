import { Router } from 'express';
import { HotelController } from './controller';

export const createHotelRoutes = (controller: HotelController): Router => {
  const router = Router();
  router.get('/sample', controller.sample);
  router.get('/', controller.recommend);
  return router;
};

