import { IAIAdapter } from '../../domain/interfaces/adapters';
import { IChatService } from '../../domain/interfaces/services';
import { ChatMessage } from '../../domain/models';

export class ChatAssistantService implements IChatService {
  constructor(private readonly aiAdapter: IAIAdapter) {}

  async converse(messages: ChatMessage[]): Promise<ChatMessage> {
    return this.aiAdapter.chat(messages);
  }
}

