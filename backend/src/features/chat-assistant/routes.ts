import { Router } from 'express';
import { ChatAssistantController } from './controller';

export const createChatRoutes = (controller: ChatAssistantController): Router => {
  const router = Router();
  router.post('/chat', controller.chat);
  return router;
};

