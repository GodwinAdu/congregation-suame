import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface PrayerRequest {
  id: string;
  title: string;
  description?: string;
  category: 'personal' | 'family' | 'health' | 'spiritual' | 'congregation' | 'ministry' | 'other';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

interface PrayerListDB extends DBSchema {
  prayerRequests: {
    key: string;
    value: PrayerRequest;
    indexes: {
      'by-category': string;
      'by-priority': string;
      'by-created': Date;
    };
  };
  settings: {
    key: string;
    value: any;
  };
}

let db: IDBPDatabase<PrayerListDB> | null = null;

export async function initPrayerListDB(): Promise<IDBPDatabase<PrayerListDB>> {
  if (db) return db;

  db = await openDB<PrayerListDB>('PrayerListDB', 2, {
    upgrade(db, oldVersion) {
      // Delete old stores if upgrading
      if (oldVersion < 2) {
        if (db.objectStoreNames.contains('prayerRequests')) {
          db.deleteObjectStore('prayerRequests');
        }
        if (db.objectStoreNames.contains('settings')) {
          db.deleteObjectStore('settings');
        }
      }

      // Prayer requests store
      const requestsStore = db.createObjectStore('prayerRequests', {
        keyPath: 'id'
      });
      requestsStore.createIndex('by-category', 'category');
      requestsStore.createIndex('by-priority', 'priority');
      requestsStore.createIndex('by-created', 'createdAt');

      // Settings store
      db.createObjectStore('settings', {
        keyPath: 'key'
      });

      // Add sample prayer requests
      const sampleRequests: PrayerRequest[] = [
        {
          id: 'pr-1',
          title: 'Wisdom in Ministry',
          description: 'Pray for wisdom and courage in the preaching work',
          category: 'ministry',
          priority: 'high',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'pr-2',
          title: 'Family Bible Study',
          description: 'That our family worship will be regular and meaningful',
          category: 'family',
          priority: 'medium',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      sampleRequests.forEach(request => {
        requestsStore.add(request);
      });
    }
  });

  return db;
}

export async function savePrayerRequest(request: Omit<PrayerRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const database = await initPrayerListDB();
  const id = `pr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const newRequest: PrayerRequest = {
    ...request,
    id,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await database.add('prayerRequests', newRequest);
  return id;
}

export async function updatePrayerRequest(id: string, updates: Partial<PrayerRequest>): Promise<void> {
  const database = await initPrayerListDB();
  const existing = await database.get('prayerRequests', id);
  
  if (existing) {
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };
    await database.put('prayerRequests', updated);
  }
}

export async function getPrayerRequest(id: string): Promise<PrayerRequest | undefined> {
  const database = await initPrayerListDB();
  return database.get('prayerRequests', id);
}

export async function getAllPrayerRequests(): Promise<PrayerRequest[]> {
  const database = await initPrayerListDB();
  const requests = await database.getAll('prayerRequests');
  return requests.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (a.priority !== b.priority) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

export async function getPrayerRequestsByCategory(category: string): Promise<PrayerRequest[]> {
  const database = await initPrayerListDB();
  const requests = await database.getAllFromIndex('prayerRequests', 'by-category', category);
  return requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function searchPrayerRequests(query: string): Promise<PrayerRequest[]> {
  const database = await initPrayerListDB();
  const allRequests = await database.getAll('prayerRequests');
  
  const searchTerm = query.toLowerCase();
  return allRequests.filter(request => 
    request.title.toLowerCase().includes(searchTerm) ||
    request.description?.toLowerCase().includes(searchTerm)
  ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function deletePrayerRequest(id: string): Promise<void> {
  const database = await initPrayerListDB();
  await database.delete('prayerRequests', id);
}

export async function getPrayerStats(): Promise<{
  totalRequests: number;
  requestsByCategory: Record<string, number>;
  requestsByPriority: Record<string, number>;
}> {
  const database = await initPrayerListDB();
  const allRequests = await database.getAll('prayerRequests');
  
  const requestsByCategory = allRequests.reduce((acc, request) => {
    acc[request.category] = (acc[request.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const requestsByPriority = allRequests.reduce((acc, request) => {
    acc[request.priority] = (acc[request.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalRequests: allRequests.length,
    requestsByCategory,
    requestsByPriority
  };
}