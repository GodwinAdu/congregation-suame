'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X, BookOpen } from 'lucide-react';
import { TalkingPoint, Scripture, saveTalkingPoint, updateTalkingPoint } from '@/lib/db/talkingPointsDB';

interface TalkingPointFormProps {
  point?: TalkingPoint | null;
  onClose: () => void;
}

export function TalkingPointForm({ point, onClose }: TalkingPointFormProps) {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState<string>('presentation');
  const [scriptures, setScriptures] = useState<Scripture[]>([]);
  const [points, setPoints] = useState<string[]>(['']);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (point) {
      setTitle(point.title);
      setTopic(point.topic);
      setCategory(point.category);
      setScriptures(point.scriptures);
      setPoints(point.points.length > 0 ? point.points : ['']);
      setNotes(point.notes || '');
    }
  }, [point]);

  const addScripture = () => {
    setScriptures([...scriptures, {
      id: `s-${Date.now()}`,
      book: '',
      chapter: 1,
      verses: '',
      text: ''
    }]);
  };

  const updateScripture = (index: number, field: keyof Scripture, value: string | number) => {
    const updated = [...scriptures];
    updated[index] = { ...updated[index], [field]: value };
    setScriptures(updated);
  };

  const removeScripture = (index: number) => {
    setScriptures(scriptures.filter((_, i) => i !== index));
  };

  const addPoint = () => {
    setPoints([...points, '']);
  };

  const updatePoint = (index: number, value: string) => {
    const updated = [...points];
    updated[index] = value;
    setPoints(updated);
  };

  const removePoint = (index: number) => {
    if (points.length > 1) {
      setPoints(points.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !topic.trim()) return;

    setSaving(true);
    try {
      const validScriptures = scriptures.filter(s => s.book && s.chapter && s.verses);
      const validPoints = points.filter(p => p.trim());

      const talkingPointData = {
        title: title.trim(),
        topic: topic.trim(),
        category: category as TalkingPoint['category'],
        scriptures: validScriptures,
        points: validPoints,
        notes: notes.trim()
      };

      if (point) {
        await updateTalkingPoint(point.id, talkingPointData);
      } else {
        await saveTalkingPoint(talkingPointData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving talking point:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-full max-w-2xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            {point ? 'Edit Talking Point' : 'Add Talking Point'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Why Does God Allow Suffering?"
                required
              />
            </div>
            <div>
              <Label htmlFor="topic">Topic *</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Suffering"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="introduction">Introduction</SelectItem>
                <SelectItem value="presentation">Presentation</SelectItem>
                <SelectItem value="return-visit">Return Visit</SelectItem>
                <SelectItem value="bible-study">Bible Study</SelectItem>
                <SelectItem value="informal">Informal</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <Label>Scriptures</Label>
              <Button type="button" variant="outline" size="sm" onClick={addScripture}>
                <Plus className="h-4 w-4 mr-1" />
                Add Scripture
              </Button>
            </div>
            <div className="space-y-3">
              {scriptures.map((scripture, index) => (
                <Card key={scripture.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <BookOpen className="h-4 w-4 text-gray-500 mt-1" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeScripture(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Input
                        placeholder="Book"
                        value={scripture.book}
                        onChange={(e) => updateScripture(index, 'book', e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Chapter"
                        value={scripture.chapter}
                        onChange={(e) => updateScripture(index, 'chapter', parseInt(e.target.value) || 1)}
                      />
                      <Input
                        placeholder="Verses"
                        value={scripture.verses}
                        onChange={(e) => updateScripture(index, 'verses', e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <Label>Key Points</Label>
              <Button type="button" variant="outline" size="sm" onClick={addPoint}>
                <Plus className="h-4 w-4 mr-1" />
                Add Point
              </Button>
            </div>
            <div className="space-y-2">
              {points.map((point, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Point ${index + 1}`}
                    value={point}
                    onChange={(e) => updatePoint(index, e.target.value)}
                  />
                  {points.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePoint(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes or reminders..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !title.trim() || !topic.trim()}>
              {saving ? 'Saving...' : point ? 'Update' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}