import { Router } from 'express';
import { Container } from '../../core/container';
import { IAIAdapter } from '../../domain/interfaces/adapters';
import { PlacesController } from './places.controller';
import { createPlacesRoutes } from './places.routes';

export const registerPlacesModule = (router: Router, container: Container) => {
    const aiAdapter = container.resolve<IAIAdapter>('AIAdapter');
    const controller = new PlacesController(aiAdapter);
    router.use('/places', createPlacesRoutes(controller));
};
