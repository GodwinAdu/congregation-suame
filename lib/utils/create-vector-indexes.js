/**
 * Script to create vector search indexes for all collections
 * Run: node lib/utils/create-vector-indexes.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const COLLECTIONS = [
  'users',
  'activities',
  'assignmenthistories',
  'assignments',
  'attendances',
  'biblestudies',
  'cleaningtasks',
  'coreports',
  'covisits',
  'broadcasts',
  'dailyfieldservices',
  'documents',
  'duties',
  'events',
  'expenses',
  'families',
  'fieldservicemeetings',
  'fieldservicereports',
  'groupschedules',
  'groups',
  'histories',
  'literatures',
  'notifications',
  'overseerreports',
  'privileges',
  'publictalks',
  'publicwitnesses',
  'publishergoals',
  'publisherrecords',
  'pushsubscriptions',
  'readerassignments',
  'roles',
  'schoolstudents',
  'shepherdingcalls',
  'smslogs',
  'territories',
  'transportconfigs',
  'transportfees',
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
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`⚠ Index already exists for: ${collectionName}`);
    } else {
      console.error(`✗ Error creating index for ${collectionName}:`, error.message);
    }
  }
}

async function main() {
  try {
    console.log('=== MongoDB Vector Index Creator ===\n');
    
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
    
    console.log(`Creating vector indexes for ${COLLECTIONS.length} collections...\n`);
    
    // Create indexes sequentially to avoid rate limits
    for (const collectionName of COLLECTIONS) {
      await createVectorIndex(collectionName);
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n✓ All vector indexes created successfully!');
    console.log('\nIMPORTANT: Wait 5-10 minutes for indexes to build.');
    console.log('You can check index status in MongoDB Atlas → Search tab\n');
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure MONGODB_URI is set in your .env file');
    console.error('2. Ensure you have MongoDB Atlas M10+ cluster (vector search requires it)');
    console.error('3. Check your MongoDB user has proper permissions\n');
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

main();
