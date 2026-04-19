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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importStar(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const container_1 = require("./core/container");
const feature_config_1 = require("./config/feature.config");
const types_1 = require("./config/types");
const InMemoryTripDAO_1 = require("./infra/dao/InMemoryTripDAO");
const mongoose_1 = __importDefault(require("mongoose"));
// Import MongoDBTripDAO - use dynamic import to avoid issues if module has problems
// We'll load it conditionally when needed
const MockPlacesAdapter_1 = require("./infra/adapters/MockPlacesAdapter");
const RealPlacesAdapter_1 = require("./infra/adapters/RealPlacesAdapter");
const MockAIAdapter_1 = require("./infra/adapters/MockAIAdapter");
const RealAIAdapter_1 = require("./infra/adapters/RealAIAdapter");
const MockWeatherAdapter_1 = require("./infra/adapters/MockWeatherAdapter");
const RealWeatherAdapter_1 = require("./infra/adapters/RealWeatherAdapter");
const MockDistanceAdapter_1 = require("./infra/adapters/MockDistanceAdapter");
const RealDistanceAdapter_1 = require("./infra/adapters/RealDistanceAdapter");
const PdfBufferAdapter_1 = require("./infra/adapters/PdfBufferAdapter");
const place_search_1 = require("./features/place-search");
const trips_1 = require("./features/trips");
const weather_1 = require("./features/weather");
const pdf_export_1 = require("./features/pdf-export");
const chat_assistant_1 = require("./features/chat-assistant");
const hotels_1 = require("./features/hotels");
const auth_1 = require("./features/auth");
const createApp = (config = feature_config_1.featureConfig) => {
    const app = (0, express_1.default)();
    const container = new container_1.Container();
    const apiRouter = (0, express_1.Router)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    app.use((0, morgan_1.default)('dev'));
    // --- Core registrations (DAOs) ---
    // Use MongoDB for trips if MongoDB is connected, otherwise use in-memory
    let tripDAO;
    try {
        // Check if mongoose is available and connected
        const mongooseAvailable = typeof mongoose_1.default !== 'undefined' && mongoose_1.default.connection;
        const mongoReadyState = mongooseAvailable ? mongoose_1.default.connection.readyState : 0; // 0=disconnected
        // Use numeric readyState for comparison (1=connected)
        const useMongoDB = mongooseAvailable && Number(mongoReadyState) === 1;
        console.log(`\n[Bootstrap] MongoDB status check:`);
        console.log(`   Available: ${mongooseAvailable}`);
        console.log(`   Ready State: ${mongoReadyState} (0=disconnected, 1=connected, 2=connecting, 3=disconnecting)`);
        console.log(`   Will use MongoDB: ${useMongoDB}`);
        if (useMongoDB) {
            try {
                // Try to get MongoDBTripDAO class using require
                let MongoDBTripDAO = null;
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
                }
                catch (reqError) {
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
                    console.log(`   ✅ Database: ${mongoose_1.default.connection.db?.databaseName || 'ai-trip-planner'}`);
                    console.log(`   ✅ Connection State: ${mongoose_1.default.connection.readyState} (1=connected)`);
                    console.log('   ✅ When users log in, their trips will be loaded from MongoDB\n');
                }
                catch (constructorError) {
                    console.error('[Bootstrap] Error instantiating MongoDBTripDAO:', constructorError?.message);
                    if (constructorError?.stack) {
                        console.error('[Bootstrap] Constructor stack:', constructorError.stack.substring(0, 600));
                    }
                    throw new Error(`Failed to instantiate MongoDBTripDAO: ${constructorError?.message}`);
                }
            }
            catch (mongoError) {
                console.error('\n❌❌❌ FAILED TO LOAD MONGODB DAO ❌❌❌');
                console.error(`   Error: ${mongoError?.message || 'Unknown error'}`);
                if (mongoError?.stack) {
                    console.error(`   Full stack trace:`);
                    console.error(mongoError.stack);
                }
                console.error('   Falling back to in-memory storage');
                tripDAO = new InMemoryTripDAO_1.InMemoryTripDAO();
                console.error('   ⚠️  WARNING: Trips will NOT persist - data will be lost on server restart\n');
            }
        }
        else {
            tripDAO = new InMemoryTripDAO_1.InMemoryTripDAO();
            console.log('\n⚠️⚠️⚠️  USING IN-MEMORY STORAGE ⚠️⚠️⚠️');
            if (mongooseAvailable) {
                console.log(`   ⚠️  MongoDB connection state: ${mongoReadyState}`);
                console.log(`   ⚠️  MongoDB URI: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-trip-planner'}`);
                if (mongoReadyState === 2) {
                    console.log('   ⚠️  MongoDB is still connecting...');
                }
                else {
                    console.log('   ⚠️  MongoDB is not connected');
                }
            }
            else {
                console.log('   ⚠️  MongoDB not available');
            }
            console.error('   ❌ WARNING: Trips will NOT persist - data will be lost on server restart');
            console.error('   To enable persistence:');
            console.error('   1. Ensure MongoDB is running: mongod');
            console.error('   2. Check MONGODB_URI in .env file');
            console.error('   3. Restart the server\n');
        }
    }
    catch (error) {
        console.error('\n❌❌❌ CRITICAL ERROR initializing trip DAO ❌❌❌');
        console.error(`   Error: ${error?.message || 'Unknown error'}`);
        if (error?.stack) {
            console.error(`   Stack trace (first 500 chars):`);
            console.error(`   ${error.stack.substring(0, 500)}`);
        }
        console.error('   Using in-memory storage as fallback');
        tripDAO = new InMemoryTripDAO_1.InMemoryTripDAO();
        console.error('   ⚠️  WARNING: Trips will NOT persist - data will be lost on server restart\n');
    }
    // Always register a DAO - never leave it undefined
    if (!tripDAO) {
        console.error('⚠️  tripDAO was undefined, using InMemoryTripDAO');
        tripDAO = new InMemoryTripDAO_1.InMemoryTripDAO();
    }
    container.register('TripDAO', tripDAO);
    // --- Adapters (swap Mock/Real based on config) ---
    const placesAdapter = config.adapters.places === types_1.AdapterChoice.Mock
        ? new MockPlacesAdapter_1.MockPlacesAdapter()
        : new RealPlacesAdapter_1.RealPlacesAdapter();
    container.register('PlacesAdapter', placesAdapter);
    let aiAdapter;
    try {
        if (config.adapters.ai === types_1.AdapterChoice.Mock) {
            aiAdapter = new MockAIAdapter_1.MockAIAdapter();
            console.log('⚠️  Using MOCK AI adapter - no real AI generation');
            console.log('   To enable real AI: Set AI_ADAPTER=real and GEMINI_API_KEY in .env');
        }
        else {
            const apiKey = process.env.GEMINI_API_KEY;
            console.log('[Bootstrap] Checking AI configuration...');
            console.log('[Bootstrap] AI_ADAPTER env:', process.env.AI_ADAPTER);
            console.log('[Bootstrap] GEMINI_API_KEY present:', !!apiKey);
            console.log('[Bootstrap] GEMINI_API_KEY length:', apiKey?.length || 0);
            if (!apiKey || apiKey === 'your-gemini-api-key-here' || apiKey.trim() === '') {
                console.warn('⚠️  GEMINI_API_KEY not set or invalid, falling back to Mock AI');
                console.warn('   Please set a valid GEMINI_API_KEY in your .env file');
                aiAdapter = new MockAIAdapter_1.MockAIAdapter();
            }
            else {
                try {
                    aiAdapter = new RealAIAdapter_1.RealAIAdapter();
                    console.log('✅ Real AI adapter initialized (using Google Gemini)');
                    console.log('   AI features are ENABLED and will generate real itineraries');
                }
                catch (initError) {
                    console.error('❌ Failed to initialize Real AI adapter:', initError?.message);
                    console.warn('   Falling back to Mock AI');
                    aiAdapter = new MockAIAdapter_1.MockAIAdapter();
                }
            }
        }
    }
    catch (error) {
        console.error('Failed to initialize AI adapter:', error?.message);
        console.warn('Falling back to Mock AI');
        aiAdapter = new MockAIAdapter_1.MockAIAdapter();
    }
    container.register('AIAdapter', aiAdapter);
    const weatherAdapter = config.adapters.weather === types_1.AdapterChoice.Mock
        ? new MockWeatherAdapter_1.MockWeatherAdapter()
        : new RealWeatherAdapter_1.RealWeatherAdapter();
    container.register('WeatherAdapter', weatherAdapter);
    const distanceAdapter = config.adapters.distance === types_1.AdapterChoice.Mock
        ? new MockDistanceAdapter_1.MockDistanceAdapter()
        : new RealDistanceAdapter_1.RealDistanceAdapter();
    container.register('DistanceAdapter', distanceAdapter);
    const pdfAdapter = new PdfBufferAdapter_1.PdfBufferAdapter();
    container.register('PdfAdapter', pdfAdapter);
    // --- Feature modules (registered only when enabled) ---
    // Auth module is always registered
    (0, auth_1.registerAuthModule)(apiRouter, container);
    if (config.features.placeSearch) {
        (0, place_search_1.registerPlaceModule)(apiRouter, container);
    }
    if (config.features.trips) {
        (0, trips_1.registerTripModule)(apiRouter, container);
    }
    if (config.features.weather) {
        (0, weather_1.registerWeatherModule)(apiRouter, container);
    }
    if (config.features.pdfExport) {
        (0, pdf_export_1.registerPdfModule)(apiRouter, container);
    }
    if (config.features.chatAssistant) {
        (0, chat_assistant_1.registerChatModule)(apiRouter, container);
    }
    if (config.features.hotels) {
        (0, hotels_1.registerHotelModule)(apiRouter, container);
    }
    app.use('/api', apiRouter);
    app.get('/health', (_req, res) => res.json({ ok: true }));
    app.get('/features', (_req, res) => res.json(config.features));
    return { app, container };
};
exports.createApp = createApp;
