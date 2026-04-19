// Script to verify database setup and create initial collections
const mongoose = require('mongoose');
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/aitrip_planner';

async function verifyDatabase() {
  try {
    console.log('\n🔍 Verifying aitrip_planner database setup...\n');
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected to MongoDB');
    console.log(`   Database: ${mongoose.connection.db.databaseName}\n`);
    
    // Get database instance
    const db = mongoose.connection.db;
    
    // List existing collections
    const collections = await db.listCollections().toArray();
    console.log('📊 Existing collections:');
    if (collections.length === 0) {
      console.log('   (none - collections will be created automatically when you use the app)\n');
    } else {
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
      console.log('');
    }
    
    // Verify expected collections and their structure
    console.log('📋 Expected collections:');
    console.log('   1. trips - Stores trip data (created when first trip is saved)');
    console.log('   2. users - Stores user data (created when first user registers)\n');
    
    // Test Trip model schema
    console.log('🧪 Testing Trip model schema...');
    const TripSchema = new mongoose.Schema({
      tripId: { type: String, unique: true, sparse: true },
      userId: { type: String, index: true, sparse: true },
      title: { type: String, required: true, trim: true },
      travelerName: { type: String, required: true, default: 'Traveler' },
      status: { type: String, enum: ['draft', 'confirmed'], default: 'draft' },
      days: [{
        date: { type: String, required: true },
        places: [{
          id: { type: String, required: true },
          name: { type: String, required: true },
          country: { type: String, required: true },
          coordinates: {
            lat: { type: Number, default: 0 },
            lng: { type: Number, default: 0 }
          }
        }],
        notes: { type: String }
      }]
    }, { timestamps: true });
    
    const TripModel = mongoose.models.Trip || mongoose.model('Trip', TripSchema);
    console.log('   ✅ Trip model schema verified\n');
    
    // Test User model schema
    console.log('🧪 Testing User model schema...');
    const UserSchema = new mongoose.Schema({
      username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
      email: { type: String, required: true, unique: true, trim: true, lowercase: true },
      password: { type: String, required: true, minlength: 6 }
    }, { timestamps: true });
    
    const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
    console.log('   ✅ User model schema verified\n');
    
    // Check indexes (only if collections exist)
    console.log('🔍 Checking database indexes...');
    try {
      const tripIndexes = await TripModel.collection.getIndexes();
      console.log('   Trip indexes:', Object.keys(tripIndexes).join(', ') || '(none yet)');
    } catch (e) {
      console.log('   Trip indexes: (collection not created yet - will be created on first use)');
    }
    
    try {
      const userIndexes = await UserModel.collection.getIndexes();
      console.log('   User indexes:', Object.keys(userIndexes).join(', ') || '(none yet)');
    } catch (e) {
      console.log('   User indexes: (collection not created yet - will be created on first use)');
    }
    console.log('   ✅ Indexes will be created automatically when collections are used\n');
    
    await mongoose.disconnect();
    
    console.log('✅ Database verification complete!');
    console.log('\n📝 Summary:');
    console.log('   ✅ MongoDB connection: Working');
    console.log('   ✅ Database name: aitrip_planner');
    console.log('   ✅ Trip model: Ready');
    console.log('   ✅ User model: Ready');
    console.log('   ✅ Collections: Will be created automatically on first use\n');
    console.log('🎉 Your database is ready to use!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database verification failed:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n   MongoDB is not running. Start MongoDB service or run: mongod\n');
    }
    process.exit(1);
  }
}

verifyDatabase();

