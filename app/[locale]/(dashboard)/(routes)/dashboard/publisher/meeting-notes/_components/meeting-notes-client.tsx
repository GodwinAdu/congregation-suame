'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Calendar, FileText, Users, Building } from 'lucide-react';
import { 
  MeetingNote, 
  getAllMeetingNotes, 
  searchMeetingNotes, 
  getMeetingNotesByType,
  deleteMeetingNote 
} from '@/lib/db/meetingNotesDB';
import { MeetingNoteForm } from './meeting-note-form';
import { MeetingNoteCard } from './meeting-note-card';

const meetingTypes = [
  { id: 'all', label: 'All Notes', icon: FileText },
  { id: 'midweek', label: 'Midweek', icon: Calendar },
  { id: 'weekend', label: 'Weekend', icon: Users },
  { id: 'circuit-assembly', label: 'Circuit Assembly', icon: Building },
  { id: 'convention', label: 'Convention', icon: Building },
  { id: 'other', label: 'Other', icon: FileText }
];

export function MeetingNotesClient() {
  const [meetingNotes, setMeetingNotes] = useState<MeetingNote[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<MeetingNote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<MeetingNote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMeetingNotes();
  }, []);

  useEffect(() => {
    filterNotes();
  }, [meetingNotes, searchQuery, activeType]);

  const loadMeetingNotes = async () => {
    try {
      const notes = await getAllMeetingNotes();
      setMeetingNotes(notes);
    } catch (error) {
      console.error('Error loading meeting notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterNotes = async () => {
    let filtered = meetingNotes;

    if (searchQuery) {
      filtered = await searchMeetingNotes(searchQuery);
    }

    if (activeType !== 'all') {
      filtered = filtered.filter(note => note.meetingType === activeType);
    }

    setFilteredNotes(filtered);
  };

  const handleEditNote = (note: MeetingNote) => {
    setEditingNote(note);
    setShowForm(true);
  };

  const handleDeleteNote = async (id: string) => {
    if (confirm('Are you sure you want to delete this meeting note?')) {
      await deleteMeetingNote(id);
      loadMeetingNotes();
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingNote(null);
    loadMeetingNotes();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meeting Notes</h1>
          <p className="text-gray-600 text-sm">Take notes during meetings, organized by date</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs value={activeType} onValueChange={setActiveType}>
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6">
          {meetingTypes.map((type) => {
            const Icon = type.icon;
            return (
              <TabsTrigger key={type.id} value={type.id} className="text-xs">
                <Icon className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">{type.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {meetingTypes.map((type) => (
          <TabsContent key={type.id} value={type.id} className="mt-6">
            {filteredNotes.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery ? 'No results found' : 'No meeting notes yet'}
                  </h3>
                  <p className="text-gray-600 text-center mb-4">
                    {searchQuery 
                      ? 'Try adjusting your search terms'
                      : 'Start taking notes during meetings'
                    }
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setShowForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredNotes.map((note) => (
                  <MeetingNoteCard
                    key={note.id}
                    note={note}
                    onEdit={() => handleEditNote(note)}
                    onDelete={() => handleDeleteNote(note.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {showForm && (
        <MeetingNoteForm
          note={editingNote}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}