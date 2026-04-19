"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripJobWorker = void 0;
// Synchronous worker skeleton; can be swapped to a queue consumer.
class TripJobWorker {
    tripService;
    constructor(tripService) {
        this.tripService = tripService;
    }
    async runGenerate(origin, destinations, days) {
        // In production this could enqueue to a job system like BullMQ.
        return this.tripService.generateTrip(origin, destinations, days);
    }
}
exports.TripJobWorker = TripJobWorker;
