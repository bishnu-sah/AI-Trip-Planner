import { Router } from 'express';
import { PlaceController } from './controller';

export const createPlaceRoutes = (controller: PlaceController): Router => {
  const router = Router();
  router.get('/search', controller.search);
  return router;
};

