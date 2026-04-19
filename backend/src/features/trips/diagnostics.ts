import { Request, Response, Router } from 'express';
import { Container } from '../../core/container';
import { ITripDAO } from '../../domain/interfaces/dao';
import mongoose, { ConnectionStates } from 'mongoose';

export const createDiagnosticsRoutes = (container: Container): Router => {
  const router = Router();

  // Diagnostic endpoint to check MongoDB status and trip storage
  router.get('/status', async (req: Request, res: Response) => {
    try {
      const tripDAO = container.resolve<ITripDAO>('TripDAO');
      const daoType = tripDAO.constructor.name;
      
      const mongoAvailable = typeof mongoose !== 'undefined' && mongoose.connection;
      const mongoState = mongoAvailable ? Number(mongoose.connection.readyState) : 0;
      const mongoConnected = mongoState === Number(ConnectionStates.connected);
      
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
      } catch (error: any) {
        errorMessage = error.message;
      }
      
      // Try to query MongoDB directly if connected
      let mongoTripCount = 0;
      let mongoCollectionInfo = null;
      
      if (mongoConnected && mongoose.connection.db) {
        try {
          const db = mongoose.connection.db;
          const collection = db.collection('trips');
          mongoTripCount = await collection.countDocuments();
          
          // Get sample documents
          const sampleDocs = await collection.find({}).limit(3).toArray();
          mongoCollectionInfo = {
            count: mongoTripCount,
            sampleIds: sampleDocs.map((doc: any) => ({
              _id: doc._id?.toString(),
              tripId: doc.tripId,
              userId: doc.userId,
              title: doc.title
            }))
          };
        } catch (mongoError: any) {
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
          database: mongoConnected ? mongoose.connection.db?.databaseName : null,
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
    } catch (error: any) {
      res.status(500).json({
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  return router;
};

