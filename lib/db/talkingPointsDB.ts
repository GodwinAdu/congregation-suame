import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface Scripture {
  id: string;
  book: string;
  chapter: number;
  verses: string;
  text?: string;
}

export interface TalkingPoint {
  id: string;
  title: string;
  topic: string;
  category: 'introduction' | 'presentation' | 'return-visit' | 'bible-study' | 'informal' | 'other';
  scriptures: Scripture[];
  points: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  lastUsed?: Date;
  useCount: number;
}

interface TalkingPointsDB extends DBSchema {
  talkingPoints: {
    key: string;
    value: TalkingPoint;
    indexes: {
      'by-topic': string;
      'by-category': string;
      'by-last-used': Date;
    };
  };
  settings: {
    key: string;
    value: any;
  };
}

let db: IDBPDatabase<TalkingPointsDB> | null = null;

export async function initTalkingPointsDB(): Promise<IDBPDatabase<TalkingPointsDB>> {
  if (db) return db;

  db = await openDB<TalkingPointsDB>('TalkingPointsDB', 1, {
    upgrade(db) {
      // Talking points store
      const talkingPointsStore = db.createObjectStore('talkingPoints', {
        keyPath: 'id'
      });
      talkingPointsStore.createIndex('by-topic', 'topic');
      talkingPointsStore.createIndex('by-category', 'category');
      talkingPointsStore.createIndex('by-last-used', 'lastUsed');

      // Settings store
      db.createObjectStore('settings', {
        keyPath: 'key'
      });

      // Add default talking points
      const defaultPoints: TalkingPoint[] = [
        {
          id: 'tp-1',
          title: 'Why Does God Allow Suffering?',
          topic: 'Suffering',
          category: 'presentation',
          scriptures: [
            { id: 's1', book: 'Job', chapter: 2, verses: '4-5' },
            { id: 's2', book: 'Revelation', chapter: 21, verses: '3-4' }
          ],
          points: [
            'Satan challenged God\'s right to rule',
            'God allows time to prove Satan wrong',
            'Soon God will end all suffering permanently'
          ],
          notes: 'Use Job\'s example to show Satan\'s challenge',
          createdAt: new Date(),
          updatedAt: new Date(),
          useCount: 0
        },
        {
          id: 'tp-2',
          title: 'What Happens When We Die?',
          topic: 'Death',
          category: 'presentation',
          scriptures: [
            { id: 's3', book: 'Ecclesiastes', chapter: 9, verses: '5' },
            { id: 's4', book: 'John', chapter: 5, verses: '28-29' }
          ],
          points: [
            'The dead are conscious of nothing',
            'Death is like a deep sleep',
            'God promises a resurrection'
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
          useCount: 0
        }
      ];

      defaultPoints.forEach(point => {
        talkingPointsStore.add(point);
      });
    }
  });

  return db;
}

export async function saveTalkingPoint(point: Omit<TalkingPoint, 'id' | 'createdAt' | 'updatedAt' | 'useCount'>): Promise<string> {
  const database = await initTalkingPointsDB();
  const id = `tp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const newPoint: TalkingPoint = {
    ...point,
    id,
    createdAt: new Date(),
    updatedAt: new Date(),
    useCount: 0
  };

  await database.add('talkingPoints', newPoint);
  return id;
}

export async function updateTalkingPoint(id: string, updates: Partial<TalkingPoint>): Promise<void> {
  const database = await initTalkingPointsDB();
  const existing = await database.get('talkingPoints', id);
  
  if (existing) {
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };
    await database.put('talkingPoints', updated);
  }
}

export async function getTalkingPoint(id: string): Promise<TalkingPoint | undefined> {
  const database = await initTalkingPointsDB();
  return database.get('talkingPoints', id);
}

export async function getAllTalkingPoints(): Promise<TalkingPoint[]> {
  const database = await initTalkingPointsDB();
  return database.getAll('talkingPoints');
}

export async function getTalkingPointsByCategory(category: string): Promise<TalkingPoint[]> {
  const database = await initTalkingPointsDB();
  return database.getAllFromIndex('talkingPoints', 'by-category', category);
}

export async function searchTalkingPoints(query: string): Promise<TalkingPoint[]> {
  const database = await initTalkingPointsDB();
  const allPoints = await database.getAll('talkingPoints');
  
  const searchTerm = query.toLowerCase();
  return allPoints.filter(point => 
    point.title.toLowerCase().includes(searchTerm) ||
    point.topic.toLowerCase().includes(searchTerm) ||
    point.points.some(p => p.toLowerCase().includes(searchTerm)) ||
    point.notes?.toLowerCase().includes(searchTerm)
  );
}

export async function incrementUseCount(id: string): Promise<void> {
  const database = await initTalkingPointsDB();
  const point = await database.get('talkingPoints', id);
  
  if (point) {
    await database.put('talkingPoints', {
      ...point,
      useCount: point.useCount + 1,
      lastUsed: new Date()
    });
  }
}

export async function deleteTalkingPoint(id: string): Promise<void> {
  const database = await initTalkingPointsDB();
  await database.delete('talkingPoints', id);
}