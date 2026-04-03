import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface MeetingNote {
  id: string;
  date: Date;
  meetingType: 'midweek' | 'weekend' | 'circuit-assembly' | 'convention' | 'other';
  title: string;
  speaker?: string;
  theme?: string;
  content: string;
  highlights: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface MeetingNotesDB extends DBSchema {
  meetingNotes: {
    key: string;
    value: MeetingNote;
    indexes: {
      'by-date': Date;
      'by-type': string;
      'by-title': string;
    };
  };
  settings: {
    key: string;
    value: any;
  };
}

let db: IDBPDatabase<MeetingNotesDB> | null = null;

export async function initMeetingNotesDB(): Promise<IDBPDatabase<MeetingNotesDB>> {
  if (db) return db;

  db = await openDB<MeetingNotesDB>('MeetingNotesDB', 1, {
    upgrade(db) {
      // Meeting notes store
      const notesStore = db.createObjectStore('meetingNotes', {
        keyPath: 'id'
      });
      notesStore.createIndex('by-date', 'date');
      notesStore.createIndex('by-type', 'meetingType');
      notesStore.createIndex('by-title', 'title');

      // Settings store
      db.createObjectStore('settings', {
        keyPath: 'key'
      });
    }
  });

  return db;
}

export async function saveMeetingNote(note: Omit<MeetingNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const database = await initMeetingNotesDB();
  const id = `mn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const newNote: MeetingNote = {
    ...note,
    id,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await database.add('meetingNotes', newNote);
  return id;
}

export async function updateMeetingNote(id: string, updates: Partial<MeetingNote>): Promise<void> {
  const database = await initMeetingNotesDB();
  const existing = await database.get('meetingNotes', id);
  
  if (existing) {
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };
    await database.put('meetingNotes', updated);
  }
}

export async function getMeetingNote(id: string): Promise<MeetingNote | undefined> {
  const database = await initMeetingNotesDB();
  return database.get('meetingNotes', id);
}

export async function getAllMeetingNotes(): Promise<MeetingNote[]> {
  const database = await initMeetingNotesDB();
  const notes = await database.getAll('meetingNotes');
  return notes.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function getMeetingNotesByType(type: string): Promise<MeetingNote[]> {
  const database = await initMeetingNotesDB();
  const notes = await database.getAllFromIndex('meetingNotes', 'by-type', type);
  return notes.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function getMeetingNotesByDateRange(startDate: Date, endDate: Date): Promise<MeetingNote[]> {
  const database = await initMeetingNotesDB();
  const allNotes = await database.getAll('meetingNotes');
  
  return allNotes.filter(note => {
    const noteDate = new Date(note.date);
    return noteDate >= startDate && noteDate <= endDate;
  }).sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function searchMeetingNotes(query: string): Promise<MeetingNote[]> {
  const database = await initMeetingNotesDB();
  const allNotes = await database.getAll('meetingNotes');
  
  const searchTerm = query.toLowerCase();
  return allNotes.filter(note => 
    note.title.toLowerCase().includes(searchTerm) ||
    note.content.toLowerCase().includes(searchTerm) ||
    note.speaker?.toLowerCase().includes(searchTerm) ||
    note.theme?.toLowerCase().includes(searchTerm) ||
    note.highlights.some(h => h.toLowerCase().includes(searchTerm)) ||
    note.tags.some(t => t.toLowerCase().includes(searchTerm))
  ).sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function deleteMeetingNote(id: string): Promise<void> {
  const database = await initMeetingNotesDB();
  await database.delete('meetingNotes', id);
}

export async function getMeetingNotesStats(): Promise<{
  totalNotes: number;
  notesByType: Record<string, number>;
  recentNotes: number;
}> {
  const database = await initMeetingNotesDB();
  const allNotes = await database.getAll('meetingNotes');
  
  const notesByType = allNotes.reduce((acc, note) => {
    acc[note.meetingType] = (acc[note.meetingType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentNotes = allNotes.filter(note => 
    new Date(note.date) >= thirtyDaysAgo
  ).length;

  return {
    totalNotes: allNotes.length,
    notesByType,
    recentNotes
  };
}