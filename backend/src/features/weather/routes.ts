import { Router } from 'express';
import { WeatherController } from './controller';

export const createWeatherRoutes = (controller: WeatherController): Router => {
  const router = Router();
  router.get('/:placeId', controller.get);
  return router;
};

