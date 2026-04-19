import { Router } from 'express';
import { Container } from '../../core/container';
import { IPlacesAdapter } from '../../domain/interfaces/adapters';
import { IPlaceService } from '../../domain/interfaces/services';
import { PlaceController } from './controller';
import { PlaceService } from './service';
import { createPlaceRoutes } from './routes';

export const registerPlaceModule = (router: Router, container: Container) => {
  const placesAdapter = container.resolve<IPlacesAdapter>('PlacesAdapter');
  const placeService: IPlaceService = new PlaceService(placesAdapter);
  container.register<IPlaceService>('PlaceService', placeService);
  const controller = new PlaceController(placeService);
  router.use('/places', createPlaceRoutes(controller));
};

