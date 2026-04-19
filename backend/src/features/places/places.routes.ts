import { Router } from 'express';
import { PlacesController } from './places.controller';

export const createPlacesRoutes = (controller: PlacesController): Router => {
    const router = Router();
    router.get('/search', controller.searchPlaces);
    return router;
};
