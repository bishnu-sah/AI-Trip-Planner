"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryTripDAO = void 0;
class InMemoryTripDAO {
    trips = [];
    constructor() {
        console.log('[InMemoryTripDAO] ========== InMemoryTripDAO INSTANCE CREATED ==========');
        console.log('[InMemoryTripDAO] ⚠️⚠️⚠️  WARNING: Using IN-MEMORY storage!');
        console.log('[InMemoryTripDAO] ⚠️⚠️⚠️  Trips will NOT persist across server restarts!');
        console.log('[InMemoryTripDAO] ⚠️⚠️⚠️  All trip data will be LOST when server restarts!');
    }
    async save(trip) {
        console.log('[InMemoryTripDAO] ⚠️  Saving trip to IN-MEMORY storage (will be lost on restart):', {
            id: trip.id,
            userId: trip.userId,
            title: trip.title
        });
        const existingIndex = this.trips.findIndex(t => t.id === trip.id);
        if (existingIndex >= 0) {
            this.trips[existingIndex] = trip;
        }
        else {
            this.trips.push(trip);
        }
        return trip;
    }
    async list(userId) {
        console.log('[InMemoryTripDAO] ⚠️  Listing trips from IN-MEMORY storage:', {
            totalTrips: this.trips.length,
            userId: userId || 'ALL (no filter)'
        });
        if (userId) {
            const filtered = this.trips.filter(t => t.userId === userId);
            console.log(`[InMemoryTripDAO] ⚠️  Found ${filtered.length} trips for userId: ${userId}`);
            return filtered;
        }
        console.log(`[InMemoryTripDAO] ⚠️  Returning ALL ${this.trips.length} trips (no userId filter)`);
        return [...this.trips];
    }
    async findById(id, userId) {
        const trip = this.trips.find(t => t.id === id);
        if (!trip)
            return null;
        // If userId is provided, ensure the trip belongs to that user
        if (userId && trip.userId !== userId) {
            return null;
        }
        return trip;
    }
    async delete(id, userId) {
        const index = this.trips.findIndex(t => {
            if (t.id !== id)
                return false;
            // If userId is provided, ensure the trip belongs to that user
            if (userId && t.userId !== userId)
                return false;
            return true;
        });
        if (index >= 0) {
            this.trips.splice(index, 1);
            return true;
        }
        return false;
    }
}
exports.InMemoryTripDAO = InMemoryTripDAO;
