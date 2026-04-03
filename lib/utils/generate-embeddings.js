/**
 * Script to generate embeddings for existing data
 * Run: node lib/utils/generate-embeddings.js
 */

const mongoose = require('mongoose');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

function documentToText(doc, collectionName) {
  // Convert document to searchable text
  const parts = [collectionName];
  
  if (doc.fullName) parts.push(doc.fullName);
  if (doc.name) parts.push(doc.name);
  if (doc.title) parts.push(doc.title);
  if (doc.description) parts.push(doc.description);
  if (doc.notes) parts.push(doc.notes);
  if (doc.address) parts.push(doc.address);
  if (doc.message) parts.push(doc.message);
  if (doc.subject) parts.push(doc.subject);
  if (doc.content) parts.push(doc.content);
  
  return parts.filter(Boolean).join(' ');
}

async function generateEmbeddingsForCollection(collectionName) {
  console.log(`\nProcessing ${collectionName}...`);
  
  const collection = mongoose.connection.db.collection(collectionName);
  const docs = await collection.find({}).limit(100).toArray();
  
  console.log(`Found ${docs.length} documents`);
  
  let updated = 0;
  for (const doc of docs) {
    try {
      const text = documentToText(doc, collectionName);
      if (text.length < 10) continue; // Skip empty docs
      
      const embedding = await generateEmbedding(text);
      
      await collection.updateOne(
        { _id: doc._id },
        { $set: { embedding, embeddingText: text } }
      );
      
      updated++;
      if (updated % 10 === 0) {
        console.log(`  Updated ${updated}/${docs.length}`);
      }
    } catch (error) {
      console.error(`  Error on doc ${doc._id}:`, error.message);
    }
  }
  
  console.log(`✓ Completed ${collectionName}: ${updated} documents updated`);
}

async function createVectorIndexes() {
  console.log('\n=== Creating Vector Search Indexes ===');
  console.log('\nIMPORTANT: Vector indexes must be created in MongoDB Atlas UI:');
  console.log('\n1. Go to MongoDB Atlas → Database → Search');
  console.log('2. Click "Create Search Index"');
  console.log('3. Choose "JSON Editor"');
  console.log('4. Use this configuration:\n');
  
  const indexConfig = {
    "mappings": {
      "dynamic": true,
      "fields": {
        "embedding": {
          "type": "knnVector",
          "dimensions": 1536,
          "similarity": "cosine"
        }
      }
    }
  };
  
  console.log(JSON.stringify(indexConfig, null, 2));
  console.log('\n5. Name it "vector_index"');
  console.log('6. Create for each collection:', COLLECTIONS.join(', '));
  console.log('\nOR use this MongoDB command in mongosh:\n');
  
  for (const coll of COLLECTIONS) {
    console.log(`db.${coll}.createSearchIndex({
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
});\n`);
  }
}

async function main() {
  try {
    console.log('=== MongoDB Vector Embeddings Generator ===\n');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not set in environment');
    }
    
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not set in environment');
    }
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected\n');
    
    // Generate embeddings
    for (const collectionName of COLLECTIONS) {
      await generateEmbeddingsForCollection(collectionName);
    }
    
    // Show index creation instructions
    await createVectorIndexes();
    
    console.log('\n✓ Embedding generation complete!');
    console.log('\nNext steps:');
    console.log('1. Create vector indexes in MongoDB Atlas (see instructions above)');
    console.log('2. Test semantic search in AI assistant');
    console.log('3. Set up automatic embedding generation for new documents\n');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

main();
