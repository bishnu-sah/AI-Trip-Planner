import cors from 'cors';
import express, { Router } from 'express';
import morgan from 'morgan';

import { Container } from './core/container';
import { featureConfig as defaultFeatureConfig } from './config/feature.config';
import { AdapterChoice, FeatureConfig } from './config/types';
import { ITripDAO } from './domain/interfaces/dao';
import {
  IAIAdapter,
  IDistanceAdapter,
  IPlacesAdapter,
  IWeatherAdapter,
  IPdfAdapter
} from './domain/interfaces/adapters';
import { InMemoryTripDAO } from './infra/dao/InMemoryTripDAO';
import mongoose from 'mongoose';

// Import MongoDBTripDAO - use dynamic import to avoid issues if module has problems
// We'll load it conditionally when needed
import { MockPlacesAdapter } from './infra/adapters/MockPlacesAdapter';
import { RealPlacesAdapter } from './infra/adapters/RealPlacesAdapter';
import { MockAIAdapter } from './infra/adapters/MockAIAdapter';
import { RealAIAdapter } from './infra/adapters/RealAIAdapter';
import { MockWeatherAdapter } from './infra/adapters/MockWeatherAdapter';
import { RealWeatherAdapter } from './infra/adapters/RealWeatherAdapter';
import { MockDistanceAdapter } from './infra/adapters/MockDistanceAdapter';
import { RealDistanceAdapter } from './infra/adapters/RealDistanceAdapter';
import { PdfBufferAdapter } from './infra/adapters/PdfBufferAdapter';
import { registerPlaceModule } from './features/place-search';
import { registerTripModule } from './features/trips';
import { registerWeatherModule } from './features/weather';
import { registerPdfModule } from './features/pdf-export';
import { registerChatModule } from './features/chat-assistant';
import { registerHotelModule } from './features/hotels';
import { registerAuthModule } from './features/auth';
import { registerPlacesModule } from './features/places';

export const createApp = (config: FeatureConfig = defaultFeatureConfig) => {
  const app = express();
  const container = new Container();
  const apiRouter = Router();

  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  // --- Core registrations (DAOs) ---
  // Use MongoDB for trips if MongoDB is connected, otherwise use in-memory
  let tripDAO: ITripDAO;
  try {
    // Check if mongoose is available and connected
    const mongooseAvailable = typeof mongoose !== 'undefined' && mongoose.connection;
    const mongoReadyState = mongooseAvailable ? mongoose.connection.readyState : 0; // 0=disconnected
    // Use numeric readyState for comparison (1=connected)
    const useMongoDB = mongooseAvailable && Number(mongoReadyState) === 1;

    console.log(`\n[Bootstrap] MongoDB status check:`);
    console.log(`   Available: ${mongooseAvailable}`);
    console.log(`   Ready State: ${mongoReadyState} (0=disconnected, 1=connected, 2=connecting, 3=disconnecting)`);
    console.log(`   Will use MongoDB: ${useMongoDB}`);

    if (useMongoDB) {
      try {
        // Try to get MongoDBTripDAO class using require
        let MongoDBTripDAO: any = null;

        try {
          // Use require with full error handling
          const mongoDAOModule = require('./infra/dao/MongoDBTripDAO');
          MongoDBTripDAO = mongoDAOModule?.MongoDBTripDAO || mongoDAOModule?.default;

          if (!MongoDBTripDAO) {
            throw new Error('MongoDBTripDAO export not found in module');
          }

          if (typeof MongoDBTripDAO !== 'function') {
            throw new Error(`MongoDBTripDAO is not a constructor (type: ${typeof MongoDBTripDAO})`);
          }
        } catch (reqError: any) {
          console.error('[Bootstrap] Error loading MongoDBTripDAO module:', reqError?.message);
          if (reqError?.stack) {
            console.error('[Bootstrap] Require error stack:', reqError.stack.substring(0, 600));
          }
          throw new Error(`Failed to load MongoDBTripDAO module: ${reqError?.message}`);
        }

        // Try to instantiate - constructor is safe (doesn't load model)
        try {
          tripDAO = new MongoDBTripDAO();
          console.log('\n✅✅✅ USING MONGODB FOR TRIP STORAGE ✅✅✅');
          console.log('   ✅ Trips WILL persist across server restarts');
          console.log('   ✅ All trips are saved with userId for user-specific retrieval');
          console.log(`   ✅ MongoDB URI: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-trip-planner'}`);
          console.log(`   ✅ Database: ${mongoose.connection.db?.databaseName || 'ai-trip-planner'}`);
          console.log(`   ✅ Connection State: ${mongoose.connection.readyState} (1=connected)`);
          console.log('   ✅ When users log in, their trips will be loaded from MongoDB\n');
        } catch (constructorError: any) {
          console.error('[Bootstrap] Error instantiating MongoDBTripDAO:', constructorError?.message);
          if (constructorError?.stack) {
            console.error('[Bootstrap] Constructor stack:', constructorError.stack.substring(0, 600));
          }
          throw new Error(`Failed to instantiate MongoDBTripDAO: ${constructorError?.message}`);
        }
      } catch (mongoError: any) {
        console.error('\n❌❌❌ FAILED TO LOAD MONGODB DAO ❌❌❌');
        console.error(`   Error: ${mongoError?.message || 'Unknown error'}`);
        if (mongoError?.stack) {
          console.error(`   Full stack trace:`);
          console.error(mongoError.stack);
        }
        console.error('   Falling back to in-memory storage');
        tripDAO = new InMemoryTripDAO();
        console.error('   ⚠️  WARNING: Trips will NOT persist - data will be lost on server restart\n');
      }
    } else {
      tripDAO = new InMemoryTripDAO();
      console.log('\n⚠️⚠️⚠️  USING IN-MEMORY STORAGE ⚠️⚠️⚠️');
      if (mongooseAvailable) {
        console.log(`   ⚠️  MongoDB connection state: ${mongoReadyState}`);
        console.log(`   ⚠️  MongoDB URI: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-trip-planner'}`);
        if (mongoReadyState === 2) {
          console.log('   ⚠️  MongoDB is still connecting...');
        } else {
          console.log('   ⚠️  MongoDB is not connected');
        }
      } else {
        console.log('   ⚠️  MongoDB not available');
      }
      console.error('   ❌ WARNING: Trips will NOT persist - data will be lost on server restart');
      console.error('   To enable persistence:');
      console.error('   1. Ensure MongoDB is running: mongod');
      console.error('   2. Check MONGODB_URI in .env file');
      console.error('   3. Restart the server\n');
    }
  } catch (error: any) {
    console.error('\n❌❌❌ CRITICAL ERROR initializing trip DAO ❌❌❌');
    console.error(`   Error: ${error?.message || 'Unknown error'}`);
    if (error?.stack) {
      console.error(`   Stack trace (first 500 chars):`);
      console.error(`   ${error.stack.substring(0, 500)}`);
    }
    console.error('   Using in-memory storage as fallback');
    tripDAO = new InMemoryTripDAO();
    console.error('   ⚠️  WARNING: Trips will NOT persist - data will be lost on server restart\n');
  }

  // Always register a DAO - never leave it undefined
  if (!tripDAO) {
    console.error('⚠️  tripDAO was undefined, using InMemoryTripDAO');
    tripDAO = new InMemoryTripDAO();
  }

  container.register<ITripDAO>('TripDAO', tripDAO);

  // --- Adapters (swap Mock/Real based on config) ---
  const placesAdapter: IPlacesAdapter =
    config.adapters.places === AdapterChoice.Mock
      ? new MockPlacesAdapter()
      : new RealPlacesAdapter();
  container.register<IPlacesAdapter>('PlacesAdapter', placesAdapter);

  let aiAdapter: IAIAdapter;
  try {
    if (config.adapters.ai === AdapterChoice.Mock) {
      aiAdapter = new MockAIAdapter();
      console.log('⚠️  Using MOCK AI adapter - no real AI generation');
      console.log('   To enable real AI: Set AI_ADAPTER=real and GEMINI_API_KEY in .env');
    } else {
      const apiKey = process.env.GEMINI_API_KEY;
      console.log('[Bootstrap] Checking AI configuration...');
      console.log('[Bootstrap] AI_ADAPTER env:', process.env.AI_ADAPTER);
      console.log('[Bootstrap] GEMINI_API_KEY present:', !!apiKey);
      console.log('[Bootstrap] GEMINI_API_KEY length:', apiKey?.length || 0);

      if (!apiKey || apiKey === 'your-gemini-api-key-here' || apiKey.trim() === '') {
        console.warn('⚠️  GEMINI_API_KEY not set or invalid, falling back to Mock AI');
        console.warn('   Please set a valid GEMINI_API_KEY in your .env file');
        aiAdapter = new MockAIAdapter();
      } else {
        try {
          aiAdapter = new RealAIAdapter();
          console.log('✅ Real AI adapter initialized (using Google Gemini)');
          console.log('   AI features are ENABLED and will generate real itineraries');
        } catch (initError: any) {
          console.error('❌ Failed to initialize Real AI adapter:', initError?.message);
          console.warn('   Falling back to Mock AI');
          aiAdapter = new MockAIAdapter();
        }
      }
    }
  } catch (error: any) {
    console.error('Failed to initialize AI adapter:', error?.message);
    console.warn('Falling back to Mock AI');
    aiAdapter = new MockAIAdapter();
  }
  container.register<IAIAdapter>('AIAdapter', aiAdapter);

  const weatherAdapter: IWeatherAdapter =
    config.adapters.weather === AdapterChoice.Mock
      ? new MockWeatherAdapter()
      : new RealWeatherAdapter();
  container.register<IWeatherAdapter>('WeatherAdapter', weatherAdapter);

  const distanceAdapter: IDistanceAdapter =
    config.adapters.distance === AdapterChoice.Mock
      ? new MockDistanceAdapter()
      : new RealDistanceAdapter();
  container.register<IDistanceAdapter>('DistanceAdapter', distanceAdapter);

  const pdfAdapter: IPdfAdapter = new PdfBufferAdapter();
  container.register<IPdfAdapter>('PdfAdapter', pdfAdapter);

  // --- Feature modules (registered only when enabled) ---
  // Auth module is always registered
  registerAuthModule(apiRouter, container);

  // if (config.features.placeSearch) {
  //   registerPlaceModule(apiRouter, container);
  // }
  if (config.features.trips) {
    registerTripModule(apiRouter, container);
  }
  if (config.features.weather) {
    registerWeatherModule(apiRouter, container);
  }
  if (config.features.pdfExport) {
    registerPdfModule(apiRouter, container);
  }
  if (config.features.chatAssistant) {
    registerChatModule(apiRouter, container);
  }
  if (config.features.hotels) {
    registerHotelModule(apiRouter, container);
  }

  registerPlacesModule(apiRouter, container);

  app.use('/api', apiRouter);

  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.get('/features', (_req, res) => res.json(config.features));

  return { app, container };
};

