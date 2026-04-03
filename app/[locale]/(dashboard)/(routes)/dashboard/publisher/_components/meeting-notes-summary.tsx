'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Calendar } from 'lucide-react';
import { getAllMeetingNotes, MeetingNote } from '@/lib/db/meetingNotesDB';
import Link from 'next/link';

export function MeetingNotesSummary() {
  const [meetingNotes, setMeetingNotes] = useState<MeetingNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMeetingNotes();
  }, []);

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

  const recentNotes = meetingNotes.slice(0, 3);
  
  const thisWeek = new Date();
  thisWeek.setDate(thisWeek.getDate() - 7);
  const recentCount = meetingNotes.filter(note => 
    new Date(note.date) >= thisWeek
  ).length;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          Meeting Notes
        </CardTitle>
        <Link href="/dashboard/publisher/meeting-notes">
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">{meetingNotes.length}</div>
        <p className="text-xs text-muted-foreground mb-4">
          Total notes • {recentCount} this week
        </p>

        {meetingNotes.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600 mb-3">No meeting notes yet</p>
            <Link href="/dashboard/publisher/meeting-notes">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add First Note
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Recent Notes</h4>
            {recentNotes.map((note) => (
              <div key={note.id} className="flex justify-between items-start text-xs">
                <div className="flex-1">
                  <div className="font-medium truncate">{note.title}</div>
                  <div className="text-gray-500 flex items-center mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(note.date).toLocaleDateString()}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs ml-2">
                  {note.meetingType}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}