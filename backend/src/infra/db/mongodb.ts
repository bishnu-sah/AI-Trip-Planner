import mongoose from 'mongoose';

export const connectMongoDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://akanksha12074_db_user:8fJefra9raV8MU3D@cluster0.f7x8pny.mongodb.net/aitrip_planner?retryWrites=true&w=majority&appName=Cluster0';
    
    // Use numeric readyState (0=disconnected, 1=connected, 2=connecting, 3=disconnecting)
    const CONNECTED_VALUE = 1;

    // Check if already connected - read state as number
    const initialState = Number(mongoose.connection.readyState);
    if (initialState === CONNECTED_VALUE) {
      console.log('✅ MongoDB already connected');
      return;
    }

    // Set connection options for better reliability
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };

    console.log(`🔄 Connecting to MongoDB: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`); // Hide credentials in logs
    
    await mongoose.connect(mongoUri, options);
    
    // Verify connection is actually established
    // After connect(), the state should be 1 (connected)
    // Use type assertion to bypass TypeScript narrowing after early return
    const finalState = Number(mongoose.connection.readyState as any);
    if (finalState !== CONNECTED_VALUE) {
      throw new Error(`MongoDB connection not established after connect() (state: ${finalState}, expected: ${CONNECTED_VALUE})`);
    }
    
    console.log('✅ MongoDB Connected Successfully!');
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Database: ${mongoose.connection.db?.databaseName || 'aitrip_planner'}`);
    console.log(`   Ready State: ${mongoose.connection.readyState} (1=connected)`);
    
    // Set up connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
  } catch (error: any) {
    console.error('❌ MongoDB connection error:', error?.message);
    
    // Provide specific error messages based on error type
    if (error?.message?.includes('ECONNREFUSED')) {
      console.error('\n📋 Connection Refused - MongoDB is not running or not accessible');
      console.error('   Solutions:');
      console.error('   1. Install MongoDB: https://www.mongodb.com/try/download/community');
      console.error('   2. Start MongoDB service: mongod (or use MongoDB as a Windows service)');
      console.error('   3. OR use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas');
      console.error('   4. Update MONGODB_URI in .env file with your connection string');
    } else if (error?.message?.includes('authentication failed')) {
      console.error('\n📋 Authentication Failed - Check your MongoDB credentials');
      console.error('   Update MONGODB_URI in .env file with correct username/password');
    } else if (error?.message?.includes('ENOTFOUND') || error?.message?.includes('getaddrinfo')) {
      console.error('\n📋 Host Not Found - Check your MongoDB host/URL');
      console.error('   Verify MONGODB_URI in .env file is correct');
    } else {
      console.error('\n📋 Troubleshooting:');
      console.error('   1. Check MONGODB_URI in .env file');
      console.error('   2. Verify MongoDB is running and accessible');
      console.error('   3. For cloud MongoDB (Atlas), ensure IP is whitelisted');
    }
    
    throw error;
  }
};

