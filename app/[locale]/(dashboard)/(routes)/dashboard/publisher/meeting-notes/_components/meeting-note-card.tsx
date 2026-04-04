'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Calendar, User, Lightbulb } from 'lucide-react';
import { MeetingNote } from '@/lib/db/meetingNotesDB';

interface MeetingNoteCardProps {
  note: MeetingNote;
  onEdit: () => void;
  onDelete: () => void;
}

const typeColors = {
  midweek: 'bg-blue-100 text-blue-800',
  weekend: 'bg-green-100 text-green-800',
  'circuit-assembly': 'bg-purple-100 text-purple-800',
  convention: 'bg-orange-100 text-orange-800',
  other: 'bg-gray-100 text-gray-800'
};

const typeLabels = {
  midweek: 'Midweek Meeting',
  weekend: 'Weekend Meeting',
  'circuit-assembly': 'Circuit Assembly',
  convention: 'Convention',
  other: 'Other'
};

export function MeetingNoteCard({ note, onEdit, onDelete }: MeetingNoteCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg mb-2 leading-tight">{note.title}</CardTitle>
            <div className="flex flex-wrap gap-1.5 mb-2">
              <Badge className={`text-xs ${typeColors[note.meetingType] || typeColors.other}`}>
                {typeLabels[note.meetingType] || 'Other'}
              </Badge>
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(note.date).toLocaleDateString()}
              </Badge>
            </div>
            {(note.speaker || note.theme) && (
              <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                {note.speaker && (
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {note.speaker}
                  </span>
                )}
                {note.theme && (
                  <span className="italic truncate">"{note.theme}"</span>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-0.5 flex-shrink-0">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onEdit}>
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400 hover:text-red-600" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-700 line-clamp-3">{note.content}</p>
        </div>

        {note.highlights.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center">
              <Lightbulb className="h-4 w-4 mr-1" />
              Highlights
            </h4>
            <ul className="space-y-1">
              {note.highlights.slice(0, 2).map((highlight, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  {highlight}
                </li>
              ))}
              {note.highlights.length > 2 && (
                <li className="text-sm text-gray-500 italic">
                  +{note.highlights.length - 2} more highlights
                </li>
              )}
            </ul>
          </div>
        )}

        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {note.tags.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{note.tags.length - 4}
              </Badge>
            )}
          </div>
        )}

        <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t">
          <span>
            Created {new Date(note.createdAt).toLocaleDateString()}
          </span>
          {note.updatedAt.getTime() !== note.createdAt.getTime() && (
            <span>
              Updated {new Date(note.updatedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}