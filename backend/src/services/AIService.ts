import { IAIAdapter } from '../domain/interfaces/adapters';
import { IAIService } from '../domain/interfaces/services';

export class AIService implements IAIService {
  constructor(private readonly adapter: IAIAdapter) {}

  complete(prompt: string): Promise<string> {
    return this.adapter.complete(prompt);
  }
}

