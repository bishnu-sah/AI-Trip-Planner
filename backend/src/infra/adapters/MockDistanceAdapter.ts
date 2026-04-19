import { IDistanceAdapter } from '../../domain/interfaces/adapters';

export class MockDistanceAdapter implements IDistanceAdapter {
  async estimateDays(count: number): Promise<number> {
    return Math.max(1, Math.ceil(count / 3));
  }
}

