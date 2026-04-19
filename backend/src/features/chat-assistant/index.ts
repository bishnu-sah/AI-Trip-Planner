import { Router } from 'express';
import { Container } from '../../core/container';
import { IAIAdapter } from '../../domain/interfaces/adapters';
import { IChatService } from '../../domain/interfaces/services';
import { ChatAssistantController } from './controller';
import { ChatAssistantService } from './service';
import { createChatRoutes } from './routes';

export const registerChatModule = (router: Router, container: Container) => {
  const aiAdapter = container.resolve<IAIAdapter>('AIAdapter');
  const chatService: IChatService = new ChatAssistantService(aiAdapter);
  container.register<IChatService>('ChatService', chatService);
  const controller = new ChatAssistantController(chatService);
  router.use('/chat', createChatRoutes(controller));
};

