"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bootstrap_1 = require("./bootstrap");
const mongodb_1 = require("./infra/db/mongodb");
const mongoose_1 = __importDefault(require("mongoose"));
const PORT = Number(process.env.PORT) || 4000;
// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit in development, just log
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
});
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Don't exit in development, just log
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
});
const startServer = async () => {
    try {
        // Connect to MongoDB FIRST (wait for it) - this ensures trips are persisted
        console.log('🔄 Connecting to MongoDB...');
        let mongoConnected = false;
        try {
            await (0, mongodb_1.connectMongoDB)();
            mongoConnected = true;
            console.log('✅ MongoDB connection established - trips will be persisted');
        }
        catch (error) {
            console.error('❌ MongoDB connection failed:', error?.message);
            if (error?.stack) {
                console.error('   Stack:', error.stack.substring(0, 400));
            }
            console.error('   Server will continue with in-memory storage (trips will NOT persist)');
            console.error('   To enable persistence:');
            console.error('   1. Start MongoDB: mongod');
            console.error('   2. Check MONGODB_URI in .env file');
            console.error('   3. Restart the server');
            mongoConnected = false;
        }
        // Wait a moment to ensure connection is fully established
        if (mongoConnected) {
            await new Promise(resolve => setTimeout(resolve, 500));
            // Double-check connection using numeric readyState
            if (Number(mongoose_1.default.connection.readyState) !== 1) {
                console.warn('⚠️  MongoDB connection state is not ready, but continuing...');
            }
        }
        // Create and start Express app AFTER MongoDB connection attempt
        // Wrap in try-catch to handle any bootstrap errors
        let app;
        try {
            const appResult = (0, bootstrap_1.createApp)();
            app = appResult.app;
            console.log('✅ Express app created successfully');
        }
        catch (bootstrapError) {
            console.error('❌ Failed to create Express app:', bootstrapError?.message);
            if (bootstrapError?.stack) {
                console.error('   Bootstrap stack:', bootstrapError.stack.substring(0, 800));
            }
            throw bootstrapError; // Re-throw to be caught by outer catch
        }
        if (!app) {
            throw new Error('Express app is null or undefined');
        }
        app.listen(PORT, () => {
            // eslint-disable-next-line no-console
            console.log(`✅ API server listening on http://localhost:${PORT}`);
            // eslint-disable-next-line no-console
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            // eslint-disable-next-line no-console
            if (process.env.AI_ADAPTER === 'real' && process.env.GEMINI_API_KEY) {
                console.log('AI Features: Enabled (Google Gemini)');
            }
            else {
                console.log('AI Features: Mock mode (set AI_ADAPTER=real and GEMINI_API_KEY to enable)');
            }
        });
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error('❌❌❌ CRITICAL ERROR: Failed to start server ❌❌❌');
        // eslint-disable-next-line no-console
        console.error('Error message:', error?.message || 'Unknown error');
        if (error?.stack) {
            // eslint-disable-next-line no-console
            console.error('Full stack trace:');
            // eslint-disable-next-line no-console
            console.error(error.stack);
        }
        // eslint-disable-next-line no-console
        console.error('\nPlease check the error above and fix the issue.');
        process.exit(1);
    }
};
startServer();
