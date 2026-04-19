import { createApp } from '../bootstrap';
import { ITripService } from '../domain/interfaces/services';
import { Place } from '../domain/models';

const seed = async () => {
  const { container } = createApp();
  const tripService = container.resolve<ITripService>('TripService');

  const paris: Place = { id: 'paris', name: 'Paris', country: 'France', coordinates: { lat: 48.85, lng: 2.35 } };
  const rome: Place = { id: 'rome', name: 'Rome', country: 'Italy', coordinates: { lat: 41.9, lng: 12.5 } };

  await tripService.generateTrip('London', [paris, rome], 4);
  await tripService.generateTrip('Berlin', [rome], 2);

  console.log('Seed complete with demo trips in memory.');
};

seed();

