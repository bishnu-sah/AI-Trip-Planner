import { ITripService } from '../domain/interfaces/services';
import { Place } from '../domain/models';

// Synchronous worker skeleton; can be swapped to a queue consumer.
export class TripJobWorker {
  constructor(private readonly tripService: ITripService) {}

  async runGenerate(origin: string, destinations: Place[], days: number) {
    // In production this could enqueue to a job system like BullMQ.
    return this.tripService.generateTrip(origin, destinations, days);
  }
}

