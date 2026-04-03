'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { MeetingNote, saveMeetingNote, updateMeetingNote } from '@/lib/db/meetingNotesDB';

interface MeetingNoteFormProps {
  note?: MeetingNote | null;
  onClose: () => void;
}

export function MeetingNoteForm({ note, onClose }: MeetingNoteFormProps) {
  const [date, setDate] = useState('');
  const [meetingType, setMeetingType] = useState<MeetingNote['meetingType']>('midweek');
  const [title, setTitle] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [theme, setTheme] = useState('');
  const [content, setContent] = useState('');
  const [highlights, setHighlights] = useState<string[]>(['']);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (note) {
      setDate(new Date(note.date).toISOString().split('T')[0]);
      setMeetingType(note.meetingType);
      setTitle(note.title);
      setSpeaker(note.speaker || '');
      setTheme(note.theme || '');
      setContent(note.content);
      setHighlights(note.highlights.length > 0 ? note.highlights : ['']);
      setTags(note.tags);
    } else {
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [note]);

  const addHighlight = () => {
    setHighlights([...highlights, '']);
  };

  const updateHighlight = (index: number, value: string) => {
    const updated = [...highlights];
    updated[index] = value;
    setHighlights(updated);
  };

  const removeHighlight = (index: number) => {
    if (highlights.length > 1) {
      setHighlights(highlights.filter((_, i) => i !== index));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    try {
      const validHighlights = highlights.filter(h => h.trim());

      const noteData = {
        date: new Date(date),
        meetingType,
        title: title.trim(),
        speaker: speaker.trim() || undefined,
        theme: theme.trim() || undefined,
        content: content.trim(),
        highlights: validHighlights,
        tags
      };

      if (note) {
        await updateMeetingNote(note.id, noteData);
      } else {
        await saveMeetingNote(noteData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving meeting note:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {note ? 'Edit Meeting Note' : 'Add Meeting Note'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="meetingType">Meeting Type</Label>
              <Select value={meetingType} onValueChange={(value: MeetingNote['meetingType']) => setMeetingType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="midweek">Midweek Meeting</SelectItem>
                  <SelectItem value="weekend">Weekend Meeting</SelectItem>
                  <SelectItem value="circuit-assembly">Circuit Assembly</SelectItem>
                  <SelectItem value="convention">Convention</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Midweek Meeting - January 15"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="speaker">Speaker</Label>
              <Input
                id="speaker"
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value)}
                placeholder="Speaker name"
              />
            </div>
            <div>
              <Label htmlFor="theme">Theme</Label>
              <Input
                id="theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Talk theme or title"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="content">Notes *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Your meeting notes..."
              rows={6}
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <Label>Highlights</Label>
              <Button type="button" variant="outline" size="sm" onClick={addHighlight}>
                <Plus className="h-4 w-4 mr-1" />
                Add Highlight
              </Button>
            </div>
            <div className="space-y-2">
              {highlights.map((highlight, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Highlight ${index + 1}`}
                    value={highlight}
                    onChange={(e) => updateHighlight(index, e.target.value)}
                  />
                  {highlights.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeHighlight(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder="Add a tag and press Enter"
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !title.trim() || !content.trim()}>
              {saving ? 'Saving...' : note ? 'Update' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}