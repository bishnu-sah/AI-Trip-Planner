"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDiagnosticsRoutes = void 0;
const express_1 = require("express");
const mongoose_1 = __importStar(require("mongoose"));
const createDiagnosticsRoutes = (container) => {
    const router = (0, express_1.Router)();
    // Diagnostic endpoint to check MongoDB status and trip storage
    router.get('/status', async (req, res) => {
        try {
            const tripDAO = container.resolve('TripDAO');
            const daoType = tripDAO.constructor.name;
            const mongoAvailable = typeof mongoose_1.default !== 'undefined' && mongoose_1.default.connection;
            const mongoState = mongoAvailable ? Number(mongoose_1.default.connection.readyState) : 0;
            const mongoConnected = mongoState === Number(mongoose_1.ConnectionStates.connected);
            // Try to get trip count (this will fail if MongoDB is not connected and using MongoDBTripDAO)
            let tripCount = 0;
            let allTripsCount = 0;
            let errorMessage = null;
            try {
                const trips = await tripDAO.list(); // Get all trips (no userId filter)
                allTripsCount = trips.length;
                // Try to get trips with a test userId to see if filtering works
                const testTrips = await tripDAO.list('test-user-id-that-does-not-exist');
                tripCount = testTrips.length; // Should be 0
            }
            catch (error) {
                errorMessage = error.message;
            }
            // Try to query MongoDB directly if connected
            let mongoTripCount = 0;
            let mongoCollectionInfo = null;
            if (mongoConnected && mongoose_1.default.connection.db) {
                try {
                    const db = mongoose_1.default.connection.db;
                    const collection = db.collection('trips');
                    mongoTripCount = await collection.countDocuments();
                    // Get sample documents
                    const sampleDocs = await collection.find({}).limit(3).toArray();
                    mongoCollectionInfo = {
                        count: mongoTripCount,
                        sampleIds: sampleDocs.map((doc) => ({
                            _id: doc._id?.toString(),
                            tripId: doc.tripId,
                            userId: doc.userId,
                            title: doc.title
                        }))
                    };
                }
                catch (mongoError) {
                    // Ignore MongoDB query errors
                }
            }
            res.json({
                daoType,
                usingMongoDB: daoType === 'MongoDBTripDAO',
                usingInMemory: daoType === 'InMemoryTripDAO',
                mongoDB: {
                    available: mongoAvailable,
                    connected: mongoConnected,
                    state: mongoState,
                    stateName: mongoState === 0 ? 'disconnected' :
                        mongoState === 1 ? 'connected' :
                            mongoState === 2 ? 'connecting' : 'disconnecting',
                    database: mongoConnected ? mongoose_1.default.connection.db?.databaseName : null,
                    // Use same default DB name as connectMongoDB helper
                    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/aitrip_planner'
                },
                trips: {
                    viaDAO: allTripsCount,
                    viaMongoDB: mongoTripCount,
                    error: errorMessage
                },
                mongoCollectionInfo,
                persistence: {
                    willPersist: daoType === 'MongoDBTripDAO' && mongoConnected,
                    willNotPersist: daoType === 'InMemoryTripDAO' || !mongoConnected
                }
            });
        }
        catch (error) {
            res.status(500).json({
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    });
    return router;
};
exports.createDiagnosticsRoutes = createDiagnosticsRoutes;
