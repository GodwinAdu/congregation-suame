// Run this script to update existing roles with new permissions
// Usage: node scripts/update-roles.js

const mongoose = require('mongoose');

// Connect to MongoDB
async function updateRoles() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/suame');
        console.log('Connected to MongoDB');

        // Update all existing roles to include new permissions
        const result = await mongoose.connection.db.collection('roles').updateMany(
            {},
            {
                $set: {
                    'permissions.territory': true,
                    'permissions.financial': true,
                    'permissions.communication': true,
                    'permissions.events': true,
                    'permissions.documents': true,
                    'permissions.aiAssistant': true,
                    'permissions.notifications': true
                }
            }
        );

        console.log(`Updated ${result.modifiedCount} roles with new permissions`);
        
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error updating roles:', error);
    }
}

updateRoles();