/**
 * DISASTER RECOVERY SCRIPT
 * 
 * Use this script to restore a backup to a new MongoDB database
 * when the application is not available.
 * 
 * Usage:
 * 1. Install dependencies: npm install mongodb
 * 2. Set environment variable: export MONGODB_URL="your-mongodb-connection-string"
 * 3. Run: node scripts/restore-backup.js path/to/backup.json
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

async function restoreBackup(backupFilePath) {
  const MONGODB_URL = process.env.MONGODB_URL;
  
  if (!MONGODB_URL) {
    console.error('❌ Error: MONGODB_URL environment variable is not set');
    process.exit(1);
  }

  if (!fs.existsSync(backupFilePath)) {
    console.error(`❌ Error: Backup file not found: ${backupFilePath}`);
    process.exit(1);
  }

  console.log('📦 Reading backup file...');
  const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf8'));

  console.log('🔌 Connecting to MongoDB...');
  const client = new MongoClient(MONGODB_URL);
  
  try {
    await client.connect();
    const db = client.db('Backup'); // Change to your database name

    console.log('✅ Connected to MongoDB');
    console.log(`📊 Backup version: ${backupData.version}`);
    console.log(`📅 Backup date: ${backupData.timestamp}`);
    console.log(`📈 Total records: ${backupData.metadata.totalMembers + backupData.metadata.totalGroups + backupData.metadata.totalTerritories}`);

    // Restore collections
    const collections = [
      { name: 'members', data: backupData.data.members },
      { name: 'groups', data: backupData.data.groups },
      { name: 'territories', data: backupData.data.territories },
      { name: 'territoryassignments', data: backupData.data.assignments },
      { name: 'fieldservicereports', data: backupData.data.reports }
    ];

    for (const collection of collections) {
      if (collection.data && collection.data.length > 0) {
        console.log(`\n📥 Restoring ${collection.name}...`);
        
        // Drop existing collection
        try {
          await db.collection(collection.name).drop();
          console.log(`   Dropped existing ${collection.name} collection`);
        } catch (err) {
          // Collection doesn't exist, that's fine
        }

        // Insert data
        const result = await db.collection(collection.name).insertMany(collection.data);
        console.log(`   ✅ Restored ${result.insertedCount} documents to ${collection.name}`);
      }
    }

    console.log('\n🎉 Backup restored successfully!');
    console.log('\n📋 Summary:');
    console.log(`   Members: ${backupData.data.members.length}`);
    console.log(`   Groups: ${backupData.data.groups.length}`);
    console.log(`   Territories: ${backupData.data.territories.length}`);
    console.log(`   Assignments: ${backupData.data.assignments.length}`);
    console.log(`   Reports: ${backupData.data.reports.length}`);

  } catch (error) {
    console.error('❌ Error during restore:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Get backup file path from command line argument
const backupFilePath = process.argv[2];

if (!backupFilePath) {
  console.error('❌ Error: Please provide backup file path');
  console.log('\nUsage: node scripts/restore-backup.js path/to/backup.json');
  process.exit(1);
}

restoreBackup(backupFilePath);
