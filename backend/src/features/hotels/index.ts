import { Router } from 'express';
import { Container } from '../../core/container';
import { IPlacesAdapter, IAIAdapter } from '../../domain/interfaces/adapters';
import { IHotelService } from '../../domain/interfaces/services';
import { HotelController } from './controller';
import { HotelService } from './service';
import { createHotelRoutes } from './routes';

export const registerHotelModule = (router: Router, container: Container) => {
  const placesAdapter = container.resolve<IPlacesAdapter>('PlacesAdapter');
  const aiAdapter = container.resolve<IAIAdapter>('AIAdapter');
  const hotelService: IHotelService = new HotelService(placesAdapter, aiAdapter);
  container.register<IHotelService>('HotelService', hotelService);
  const controller = new HotelController(hotelService);
  router.use('/hotels', createHotelRoutes(controller));
};

