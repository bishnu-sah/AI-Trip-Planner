import { Router } from 'express';
import { Container } from '../../core/container';
import { IWeatherAdapter } from '../../domain/interfaces/adapters';
import { IWeatherService } from '../../domain/interfaces/services';
import { WeatherController } from './controller';
import { WeatherService } from './service';
import { createWeatherRoutes } from './routes';

export const registerWeatherModule = (router: Router, container: Container) => {
  const weatherAdapter = container.resolve<IWeatherAdapter>('WeatherAdapter');
  const weatherService: IWeatherService = new WeatherService(weatherAdapter);
  container.register<IWeatherService>('WeatherService', weatherService);
  const controller = new WeatherController(weatherService);
  router.use('/weather', createWeatherRoutes(controller));
};

