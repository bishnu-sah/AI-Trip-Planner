"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDBTripDAO = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// Don't import TripDAO at top level - load it lazily to avoid any module load issues
// Helper to verify MongoDB connection
const verifyMongoConnection = () => {
    const state = Number(mongoose_1.default.connection.readyState);
    // 1 = connected, see mongoose docs
    if (state !== 1) {
        const stateNames = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting',
        };
        const errorMsg = `MongoDB is not connected. Current state: ${stateNames[state] || 'unknown'} (${state})`;
        console.error(`[MongoDBTripDAO] ${errorMsg}`);
        throw new Error(errorMsg);
    }
};
// Lazy load TripModel to avoid circular dependencies and initialization issues
let TripModel;
let ITripDocument;
const getTripModel = () => {
    if (!TripModel) {
        try {
            // Check if mongoose is available
            if (typeof mongoose_1.default === 'undefined' || !mongoose_1.default.connection) {
                throw new Error('Mongoose is not available');
            }
            // Check if MongoDB is connected before trying to load model
            const mongoState = Number(mongoose_1.default.connection.readyState);
            // 1 = connected
            if (mongoState !== 1) {
                throw new Error(`MongoDB not connected (state: ${mongoState})`);
            }
            // Lazy load TripDAO module - this avoids any module load time issues
            let tripDAO;
            try {
                // Try to require the module
                tripDAO = require('./TripDAO');
            }
            catch (reqError) {
                throw new Error(`Failed to require TripDAO module: ${reqError?.message || 'Unknown error'}`);
            }
            if (!tripDAO) {
                throw new Error('TripDAO module is null or undefined');
            }
            // Check if getTripModel function exists
            if (!tripDAO || typeof tripDAO.getTripModel !== 'function') {
                throw new Error('getTripModel function not found in TripDAO module');
            }
            // Call getTripModel to get the model (lazy-loaded)
            // This will only work if MongoDB is connected
            try {
                TripModel = tripDAO.getTripModel();
            }
            catch (modelError) {
                throw new Error(`Failed to get TripModel: ${modelError?.message}`);
            }
            ITripDocument = tripDAO.ITripDocument;
            if (!TripModel) {
                throw new Error('TripModel is null or undefined after getTripModel() call');
            }
            console.log('[MongoDBTripDAO] TripModel loaded successfully');
        }
        catch (error) {
            console.error('[MongoDBTripDAO] Error loading TripModel:', error?.message);
            if (error?.stack) {
                console.error('[MongoDBTripDAO] Stack (first 800 chars):');
                console.error(error.stack.substring(0, 800));
            }
            throw new Error(`Failed to load TripModel: ${error?.message}`);
        }
    }
    return { TripModel, ITripDocument };
};
class MongoDBTripDAO {
    constructor() {
        // Constructor is safe - no model loading here
        // Model will be loaded lazily when methods are called
        console.log('[MongoDBTripDAO] ========== MongoDBTripDAO INSTANCE CREATED ==========');
        console.log('[MongoDBTripDAO] This DAO will save trips to MongoDB');
        console.log('[MongoDBTripDAO] Trips WILL persist across server restarts');
        console.log('[MongoDBTripDAO] MongoDB connection state:', mongoose_1.default.connection.readyState);
    }
    async save(trip) {
        try {
            // Verify MongoDB is connected BEFORE getting model
            verifyMongoConnection();
            const { TripModel } = getTripModel();
            console.log('[MongoDBTripDAO] Saving trip to MongoDB:', {
                tripId: trip.id,
                userId: trip.userId || 'MISSING - trip will not be retrievable by user!',
                title: trip.title,
                daysCount: trip.days?.length
            });
            if (!trip.userId) {
                console.error('[MongoDBTripDAO] ⚠️⚠️⚠️  CRITICAL WARNING: Trip is being saved WITHOUT userId!');
                console.error('[MongoDBTripDAO] This trip will NOT be retrievable when user logs in!');
                console.error('[MongoDBTripDAO] Trip will be saved but user will not see it in their dashboard!');
            }
            // Check if trip already exists (by _id or tripId)
            // Only use findById if trip.id is a valid ObjectId format (24 hex chars)
            let existingTrip = null;
            if (trip.id && /^[0-9a-fA-F]{24}$/.test(trip.id)) {
                // trip.id is a valid ObjectId format, try findById
                existingTrip = await TripModel.findById(trip.id);
            }
            // If not found by _id, try tripId field
            if (!existingTrip) {
                existingTrip = await TripModel.findOne({ tripId: trip.id });
            }
            // Also check by userId + tripId combination for better matching
            if (!existingTrip && trip.userId) {
                existingTrip = await TripModel.findOne({ userId: trip.userId, tripId: trip.id });
            }
            if (existingTrip) {
                // Update existing trip
                console.log('[MongoDBTripDAO] Updating existing trip:', existingTrip._id);
                existingTrip.title = trip.title;
                existingTrip.travelerName = trip.travelerName;
                existingTrip.status = trip.status;
                existingTrip.days = trip.days;
                if (!existingTrip.tripId) {
                    existingTrip.tripId = trip.id;
                }
                // Update userId if provided
                if (trip.userId) {
                    existingTrip.userId = trip.userId;
                }
                const updated = await existingTrip.save();
                console.log('[MongoDBTripDAO] ✅ Trip updated in MongoDB:', {
                    _id: updated._id,
                    tripId: updated.tripId,
                    userId: updated.userId,
                    title: updated.title
                });
                console.log('[MongoDBTripDAO] ✅ Trip will persist across server restarts');
                const mapped = this.mapToTrip(updated);
                mapped.id = trip.id; // Preserve original UUID
                return mapped;
            }
            else {
                // Create new trip
                const tripData = {
                    title: trip.title,
                    travelerName: trip.travelerName,
                    status: trip.status,
                    days: trip.days
                };
                // Add userId if provided (required for persistence)
                if (trip.userId) {
                    tripData.userId = trip.userId;
                }
                else {
                    console.warn('[MongoDBTripDAO] ⚠️  Warning: Saving trip without userId - may not be retrievable by user');
                }
                // Try to use trip.id as _id if it's a valid ObjectId format, otherwise store it in a custom field
                if (trip.id && /^[0-9a-fA-F]{24}$/.test(trip.id)) {
                    tripData._id = trip.id;
                }
                else {
                    // Store UUID in a custom field and let MongoDB generate _id
                    tripData.tripId = trip.id;
                }
                const newTrip = new TripModel(tripData);
                const saved = await newTrip.save();
                console.log('[MongoDBTripDAO] ✅ Trip saved to MongoDB:', {
                    _id: saved._id,
                    tripId: saved.tripId,
                    userId: saved.userId,
                    title: saved.title,
                    daysCount: saved.days?.length || 0
                });
                console.log('[MongoDBTripDAO] ✅ Trip will persist across server restarts');
                console.log('[MongoDBTripDAO] ✅ To verify: Restart server and check /api/trips-diagnostics/status');
                // Verify the trip was actually saved by querying it back
                try {
                    const verifyQuery = trip.userId ? { userId: trip.userId, tripId: trip.id } : { tripId: trip.id };
                    const verified = await TripModel.findOne(verifyQuery);
                    if (verified) {
                        console.log('[MongoDBTripDAO] ✅ Verification: Trip confirmed in MongoDB database');
                    }
                    else {
                        console.error('[MongoDBTripDAO] ❌ Verification FAILED: Trip not found in MongoDB after save!');
                    }
                }
                catch (verifyError) {
                    console.warn('[MongoDBTripDAO] Could not verify trip save:', verifyError?.message);
                }
                // Return with the original trip.id
                const mapped = this.mapToTrip(saved);
                mapped.id = trip.id; // Preserve original UUID
                console.log('[MongoDBTripDAO] ✅ Returning mapped trip with id:', mapped.id, 'userId:', mapped.userId);
                return mapped;
            }
        }
        catch (error) {
            console.error('[MongoDBTripDAO] ❌ Error saving trip:', error);
            console.error('[MongoDBTripDAO] Error details:', {
                message: error?.message,
                stack: error?.stack,
                mongoState: mongoose_1.default.connection.readyState
            });
            throw error;
        }
    }
    async list(userId) {
        try {
            // Verify MongoDB is connected BEFORE getting model
            verifyMongoConnection();
            const { TripModel } = getTripModel();
            // Filter by userId if provided, otherwise return all trips
            const query = userId ? { userId } : {};
            console.log('[MongoDBTripDAO] ========== LIST TRIPS FROM MONGODB ==========');
            console.log('[MongoDBTripDAO] Query:', JSON.stringify(query));
            console.log('[MongoDBTripDAO] userId parameter:', userId);
            console.log('[MongoDBTripDAO] userId type:', typeof userId);
            console.log('[MongoDBTripDAO] MongoDB connection state:', mongoose_1.default.connection.readyState);
            // First, let's see how many total trips exist (for debugging)
            const totalTrips = await TripModel.countDocuments({});
            console.log(`[MongoDBTripDAO] Total trips in database: ${totalTrips}`);
            if (userId) {
                const userTripsCount = await TripModel.countDocuments({ userId });
                console.log(`[MongoDBTripDAO] Trips with userId=${userId}: ${userTripsCount}`);
            }
            else {
                console.log('[MongoDBTripDAO] ⚠️  WARNING: No userId provided - will return ALL trips');
            }
            const trips = await TripModel.find(query).sort({ createdAt: -1 });
            console.log(`[MongoDBTripDAO] ✅ Found ${trips.length} trips${userId ? ` for userId: ${userId}` : ' (ALL TRIPS - NO FILTER)'} in MongoDB`);
            // Log first trip if exists for debugging
            if (trips.length > 0 && trips[0]) {
                try {
                    const firstTrip = trips[0];
                    const _idStr = firstTrip._id
                        ? (typeof firstTrip._id.toString === 'function' ? firstTrip._id.toString() : String(firstTrip._id))
                        : 'N/A';
                    console.log('[MongoDBTripDAO] First trip sample:', {
                        _id: _idStr,
                        tripId: firstTrip.tripId || 'N/A',
                        userId: firstTrip.userId || 'N/A',
                        title: firstTrip.title || 'N/A'
                    });
                }
                catch (logError) {
                    // Ignore logging errors - don't crash on logging
                    console.warn('[MongoDBTripDAO] Could not log trip sample:', logError?.message);
                }
            }
            return trips.map((trip) => this.mapToTrip(trip));
        }
        catch (error) {
            console.error('[MongoDBTripDAO] ❌ Error listing trips:', error);
            console.error('[MongoDBTripDAO] Error details:', {
                message: error?.message,
                stack: error?.stack?.substring(0, 500),
                mongoState: mongoose_1.default.connection.readyState
            });
            throw error;
        }
    }
    async findById(id, userId) {
        try {
            // Verify MongoDB is connected BEFORE getting model
            verifyMongoConnection();
            const { TripModel } = getTripModel();
            // Build query with userId filter if provided
            const baseQuery = {};
            if (userId) {
                baseQuery.userId = userId;
            }
            // Try to find by _id first (only if it's a valid MongoDB ObjectId format)
            let trip = null;
            if (id && /^[0-9a-fA-F]{24}$/.test(id)) {
                // id is a valid ObjectId format, try finding by _id
                trip = await TripModel.findOne({ ...baseQuery, _id: id });
            }
            // If not found, try to find by tripId field (for UUIDs)
            if (!trip) {
                trip = await TripModel.findOne({ ...baseQuery, tripId: id });
            }
            return trip ? this.mapToTrip(trip) : null;
        }
        catch (error) {
            console.error('[MongoDBTripDAO] Error finding trip:', error);
            return null;
        }
    }
    async delete(id, userId) {
        try {
            // Verify MongoDB is connected BEFORE getting model
            verifyMongoConnection();
            const { TripModel } = getTripModel();
            // Build query with userId filter if provided
            const baseQuery = {};
            if (userId) {
                baseQuery.userId = userId;
            }
            // Try to delete by _id first (only if it's a valid MongoDB ObjectId format)
            let result = null;
            if (id && /^[0-9a-fA-F]{24}$/.test(id)) {
                // id is a valid ObjectId format, try deleting by _id
                result = await TripModel.findOneAndDelete({ ...baseQuery, _id: id });
            }
            // If not found, try to delete by tripId
            if (!result) {
                result = await TripModel.findOneAndDelete({ ...baseQuery, tripId: id });
            }
            console.log(`[MongoDBTripDAO] Trip deleted from MongoDB: ${id}${userId ? ` (userId: ${userId})` : ''}`);
            return !!result;
        }
        catch (error) {
            console.error('[MongoDBTripDAO] Error deleting trip:', error);
            throw error;
        }
    }
    mapToTrip(doc) {
        try {
            // Use tripId if available (for UUIDs), otherwise use _id
            let tripId;
            if (doc.tripId) {
                tripId = String(doc.tripId);
            }
            else if (doc._id) {
                tripId = typeof doc._id.toString === 'function' ? doc._id.toString() : String(doc._id);
            }
            else if (doc.id) {
                tripId = String(doc.id);
            }
            else {
                tripId = 'unknown';
            }
            // Safely get createdAt
            let createdAt;
            if (doc.createdAt) {
                if (typeof doc.createdAt.toISOString === 'function') {
                    createdAt = doc.createdAt.toISOString();
                }
                else if (typeof doc.createdAt === 'string') {
                    createdAt = doc.createdAt;
                }
                else {
                    createdAt = new Date().toISOString();
                }
            }
            else {
                createdAt = new Date().toISOString();
            }
            return {
                id: tripId,
                userId: doc.userId || undefined, // Include userId in mapped trip
                title: doc.title || 'Untitled Trip',
                travelerName: doc.travelerName || 'Traveler',
                status: doc.status || 'draft',
                days: (doc.days || []).map((day) => ({
                    date: day.date || new Date().toISOString().split('T')[0],
                    places: (day.places || []).map((place) => ({
                        id: place.id || 'unknown',
                        name: place.name || 'Unknown Place',
                        country: place.country || 'Unknown',
                        coordinates: place.coordinates || { lat: 0, lng: 0 }
                    })),
                    notes: day.notes || ''
                })),
                createdAt
            };
        }
        catch (error) {
            console.error('[MongoDBTripDAO] Error mapping trip:', error);
            // Return a safe default trip
            return {
                id: 'error',
                title: 'Error loading trip',
                travelerName: 'Unknown',
                status: 'draft',
                days: [],
                createdAt: new Date().toISOString()
            };
        }
    }
}
exports.MongoDBTripDAO = MongoDBTripDAO;
