import { Request, Response } from 'express';
import { IChatService } from '../../domain/interfaces/services';
import { ChatMessage } from '../../domain/models';

export class ChatAssistantController {
  constructor(private readonly chatService: IChatService) {}

  chat = async (req: Request, res: Response) => {
    const messages = req.body.messages as ChatMessage[];
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'messages array required' });
    }
    const reply = await this.chatService.converse(messages);
    res.json(reply);
  };
}

