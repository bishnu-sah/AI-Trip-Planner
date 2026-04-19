// Script to update .env file with new MongoDB connection string
// This removes the old connection string and sets up for aitrip_planner database

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function updateEnvFile() {
  const envPath = path.join(__dirname, '.env');
  
  console.log('\n🔧 Updating MongoDB Connection Configuration\n');
  console.log('This will:');
  console.log('1. Remove the old MongoDB connection string');
  console.log('2. Set up for new database: aitrip_planner\n');
  
  let envContent = '';
  
  // Read existing .env file if it exists
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    console.log('📄 Current .env file found\n');
  } else {
    console.log('📄 Creating new .env file\n');
  }
  
  // Remove old MONGODB_URI line
  const lines = envContent.split('\n');
  const filteredLines = lines.filter(line => {
    const trimmed = line.trim();
    // Remove MONGODB_URI lines (keep other config)
    return !trimmed.startsWith('MONGODB_URI=');
  });
  
  // Ask user for connection method
  console.log('Choose MongoDB setup:');
  console.log('1. MongoDB Atlas (Cloud - Recommended)');
  console.log('2. Local MongoDB (localhost:27017)');
  console.log('3. Custom connection string\n');
  
  const choice = await question('Enter choice (1, 2, or 3): ');
  
  let mongoUri = '';
  
  if (choice === '1') {
    console.log('\n📋 MongoDB Atlas Setup:');
    console.log('1. Go to: https://www.mongodb.com/cloud/atlas/register');
    console.log('2. Create a free cluster');
    console.log('3. Create database user');
    console.log('4. Whitelist your IP');
    console.log('5. Get connection string\n');
    
    const hasConnectionString = await question('Do you have your Atlas connection string? (y/n): ');
    
    if (hasConnectionString.toLowerCase() === 'y' || hasConnectionString.toLowerCase() === 'yes') {
      const connectionString = await question('\nPaste your MongoDB Atlas connection string: ');
      mongoUri = connectionString.trim();
      
      // Ensure database name is aitrip_planner
      if (!mongoUri.includes('/aitrip_planner')) {
        if (mongoUri.includes('?')) {
          // Replace existing database or add before ?
          mongoUri = mongoUri.replace(/\/([^?\/]+)(\?|$)/, '/aitrip_planner$2');
        } else {
          mongoUri = mongoUri + '/aitrip_planner';
        }
      }
    } else {
      console.log('\n⏳ Please set up MongoDB Atlas first, then run this script again.');
      console.log('   Or use option 2 for local MongoDB.\n');
      rl.close();
      return;
    }
  } else if (choice === '2') {
    mongoUri = 'mongodb://localhost:27017/aitrip_planner';
    console.log(`\n✅ Using local MongoDB: ${mongoUri}`);
    console.log('   Make sure MongoDB is installed and running.\n');
  } else if (choice === '3') {
    const customUri = await question('\nEnter your custom MongoDB connection string: ');
    mongoUri = customUri.trim();
    
    // Ensure database name is aitrip_planner
    if (!mongoUri.includes('/aitrip_planner')) {
      if (mongoUri.includes('?')) {
        mongoUri = mongoUri.replace(/\/([^?\/]+)(\?|$)/, '/aitrip_planner$2');
      } else {
        mongoUri = mongoUri + '/aitrip_planner';
      }
    }
  } else {
    console.log('\n❌ Invalid choice. Exiting.\n');
    rl.close();
    return;
  }
  
  // Add new MONGODB_URI at the beginning
  const newEnvContent = `MONGODB_URI=${mongoUri}\n${filteredLines.join('\n')}`;
  
  // Write updated .env file
  fs.writeFileSync(envPath, newEnvContent, 'utf8');
  
  console.log('\n✅ .env file updated successfully!');
  console.log(`   MONGODB_URI=${mongoUri.replace(/\/\/.*@/, '//***:***@')}\n`);
  
  // Test connection
  const testConnection = await question('Test MongoDB connection now? (y/n): ');
  
  if (testConnection.toLowerCase() === 'y' || testConnection.toLowerCase() === 'yes') {
    console.log('\n🧪 Testing connection...\n');
    const mongoose = require('mongoose');
    
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      
      console.log('✅ MongoDB Connected Successfully!');
      console.log(`   Host: ${mongoose.connection.host}`);
      console.log(`   Database: ${mongoose.connection.db?.databaseName || 'aitrip_planner'}`);
      console.log(`   Ready State: ${mongoose.connection.readyState} (1=connected)\n`);
      
      await mongoose.disconnect();
      console.log('✅ Connection test passed!\n');
    } catch (error) {
      console.error('\n❌ Connection test failed:', error.message);
      console.error('\nTroubleshooting:');
      if (error.message.includes('ECONNREFUSED')) {
        console.error('- MongoDB is not running. Start MongoDB service.');
      } else if (error.message.includes('authentication')) {
        console.error('- Check username and password in connection string.');
      } else if (error.message.includes('ENOTFOUND')) {
        console.error('- Check connection string URL/hostname.');
      } else {
        console.error('- Verify connection string is correct.');
      }
      console.error('\nYou can test later with: npm run test:mongodb\n');
    }
  }
  
  console.log('✅ Setup complete! Your .env file is configured for aitrip_planner database.\n');
  rl.close();
}

updateEnvFile().catch(err => {
  console.error('Error:', err);
  rl.close();
  process.exit(1);
});

