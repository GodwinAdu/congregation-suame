/**
 * Script to create vector search indexes for PRIORITY collections only
 * Run: node lib/utils/create-priority-vector-indexes.js
 * 
 * This creates indexes for the 10 most important collections to stay within limits
 */

const mongoose = require('mongoose');
require('dotenv').config();

// PRIORITY collections - most frequently searched
const PRIORITY_COLLECTIONS = [
  'users',              // Member information
  'fieldservicereports', // Field service data
  'territories',        // Territory assignments
  'shepherdingcalls',   // Shepherding visits
  'biblestudies',       // Bible studies
  'events',             // Meetings and events
  'groups',             // Field service groups
  'attendances',        // Meeting attendance
  'publisherrecords',   // Publisher records
  'broadcasts',         // Communications
];

async function createVectorIndex(collectionName) {
  try {
    const collection = mongoose.connection.db.collection(collectionName);
    
    await collection.createSearchIndex({
      name: "vector_index",
      type: "vectorSearch",
      definition: {
        fields: [{
          type: "vector",
          path: "embedding",
          numDimensions: 1536,
          similarity: "cosine"
        }]
      }
    });
    
    console.log(`✓ Created vector index for: ${collectionName}`);
    return true;
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`⚠ Index already exists for: ${collectionName}`);
      return true;
    } else if (error.message.includes('maximum number')) {
      console.error(`✗ INDEX LIMIT REACHED at: ${collectionName}`);
      console.error('   Upgrade your MongoDB Atlas cluster to create more indexes');
      return false;
    } else if (error.message.includes('does not exist')) {
      console.log(`⚠ Collection ${collectionName} is empty, skipping...`);
      return true;
    } else {
      console.error(`✗ Error creating index for ${collectionName}:`, error.message);
      return true; // Continue with other collections
    }
  }
}

async function main() {
  try {
    console.log('=== MongoDB Priority Vector Index Creator ===\n');
    
    if (!process.env.MONGODB_URI && !process.env.MONGODB_URL) {
      throw new Error('MONGODB_URI or MONGODB_URL not found in .env file');
    }
    
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL;
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      dbName: 'Suame',
      bufferCommands: false,
    });
    console.log('✓ Connected to MongoDB\n');
    
    console.log(`Creating vector indexes for ${PRIORITY_COLLECTIONS.length} priority collections...\n`);
    
    let successCount = 0;
    let limitReached = false;
    
    // Create indexes sequentially
    for (const collectionName of PRIORITY_COLLECTIONS) {
      if (limitReached) {
        console.log(`⏭ Skipping ${collectionName} (limit reached)`);
        continue;
      }
      
      const success = await createVectorIndex(collectionName);
      if (success) successCount++;
      else limitReached = true;
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n✓ Created ${successCount} vector indexes successfully!`);
    
    if (limitReached) {
      console.log('\n⚠ WARNING: Index limit reached!');
      console.log('Your MongoDB Atlas cluster has a limit on search indexes.');
      console.log('\nOptions:');
      console.log('1. Use current indexes (covers most important data)');
      console.log('2. Upgrade to M10+ cluster for more indexes');
      console.log('3. Delete unused indexes in Atlas to make room\n');
    } else {
      console.log('\nIMPORTANT: Wait 5-10 minutes for indexes to build.');
      console.log('Check status: MongoDB Atlas → Search tab\n');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

main();
