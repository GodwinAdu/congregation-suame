# Disaster Recovery Guide

## Restoring Backup to New Database

If the application is unavailable and you need to restore from a JSON backup file:

### Prerequisites
- Node.js installed
- MongoDB connection string
- Backup JSON file

### Steps

1. **Install MongoDB driver**
   ```bash
   npm install mongodb
   ```

2. **Set MongoDB connection string**
   ```bash
   export MONGODB_URL="mongodb://localhost:27017/your-database"
   # or
   export MONGODB_URL="mongodb+srv://user:pass@cluster.mongodb.net/database"
   ```

3. **Run restore script**
   ```bash
   node scripts/restore-backup.js path/to/congregation-backup-2024-01-15.json
   ```

### What Gets Restored

The script will restore all data including:
- ✅ Members (with all profile information)
- ✅ Groups (with assignments)
- ✅ Territories (with boundaries)
- ✅ Territory Assignments
- ✅ Field Service Reports

### Important Notes

- The script will **drop existing collections** before restoring
- All MongoDB `_id` fields are preserved
- Relationships between collections are maintained
- The database name is set to "Backup" by default (change in script if needed)

### Verification

After restore, you can verify the data:

```bash
# Connect to MongoDB
mongosh "your-connection-string"

# Check collections
use Backup
db.members.countDocuments()
db.groups.countDocuments()
db.territories.countDocuments()
```

### Troubleshooting

**Error: MONGODB_URL not set**
- Make sure you've exported the environment variable
- Check the connection string format

**Error: Backup file not found**
- Verify the file path is correct
- Use absolute path if relative path doesn't work

**Error: Connection timeout**
- Check MongoDB server is running
- Verify network connectivity
- Check firewall settings

## Regular Backups

To prevent data loss:
1. Export backups regularly (weekly recommended)
2. Store backups in multiple locations
3. Test restore process periodically
4. Keep backups for at least 3 months

## Support

For issues, check the application logs or contact system administrator.
