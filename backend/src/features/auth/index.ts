import { Router } from 'express';
import { Container } from '../../core/container';
import { IAuthService } from '../../domain/interfaces/services';
import { AuthController } from './controller';
import { AuthService } from './service';
import { createAuthRoutes } from './routes';

export const registerAuthModule = (router: Router, container: Container) => {
  const authService: IAuthService = new AuthService();
  container.register<IAuthService>('AuthService', authService);

  const controller = new AuthController(authService);
  router.use('/auth', createAuthRoutes(controller));
};

