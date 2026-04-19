import { IDistanceAdapter } from '../../domain/interfaces/adapters';

export class RealDistanceAdapter implements IDistanceAdapter {
  constructor(private readonly apiKey: string = process.env.DISTANCE_API_KEY || '') {}

  async estimateDays(count: number): Promise<number> {
    // TODO: perform real distance matrix call.
    console.warn('RealDistanceAdapter not implemented; defaulting to mock estimation.');
    return Math.max(1, Math.ceil(count / 2));
  }
}

