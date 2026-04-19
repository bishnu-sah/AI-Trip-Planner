import { Router } from 'express';
import { Container } from '../../core/container';
import { ITripDAO } from '../../domain/interfaces/dao';
import { IAIAdapter, IDistanceAdapter, IPlacesAdapter } from '../../domain/interfaces/adapters';
import { ITripService } from '../../domain/interfaces/services';
import { TripController } from './controller';
import { TripService } from './service';
import { createTripRoutes } from './routes';
import { createDiagnosticsRoutes } from './diagnostics';

export const registerTripModule = (router: Router, container: Container) => {
  const tripDao = container.resolve<ITripDAO>('TripDAO');
  const aiAdapter = container.resolve<IAIAdapter>('AIAdapter');
  const placesAdapter = container.resolve<IPlacesAdapter>('PlacesAdapter');
  const distanceAdapter = container.resolve<IDistanceAdapter>('DistanceAdapter');

  const tripService: ITripService = new TripService(
    tripDao,
    aiAdapter,
    placesAdapter,
    distanceAdapter
  );
  container.register<ITripService>('TripService', tripService);

  const controller = new TripController(tripService, placesAdapter);
  router.use('/trips', createTripRoutes(controller));
  
  // Add diagnostics route (no auth required for diagnostics)
  const diagnosticsRoutes = createDiagnosticsRoutes(container);
  router.use('/trips-diagnostics', diagnosticsRoutes);
};

