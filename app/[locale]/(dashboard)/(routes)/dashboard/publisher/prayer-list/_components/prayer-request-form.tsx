"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PrayerRequest, savePrayerRequest, updatePrayerRequest } from '@/lib/db/prayerListDB';

interface PrayerRequestFormProps {
  request?: PrayerRequest | null;
  onSubmit: () => void;
  onCancel: () => void;
}

export function PrayerRequestForm({ request, onSubmit, onCancel }: PrayerRequestFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('personal');
  const [priority, setPriority] = useState<string>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (request) {
      setTitle(request.title);
      setDescription(request.description || '');
      setCategory(request.category);
      setPriority(request.priority);
    } else {
      setTitle('');
      setDescription('');
      setCategory('personal');
      setPriority('medium');
    }
  }, [request]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const requestData = {
        title: title.trim(),
        description: description.trim() || undefined,
        category: category as any,
        priority: priority as any
      };

      if (request) {
        await updatePrayerRequest(request.id, requestData);
      } else {
        await savePrayerRequest(requestData);
      }

      onSubmit();
    } catch (error) {
      console.error('Error saving prayer request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {request ? 'Edit Prayer Item' : 'Add Prayer Item'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">What do you want to pray about? *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Wisdom in ministry, Family health..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional details (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any specific details about this prayer request..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="spiritual">Spiritual</SelectItem>
                  <SelectItem value="congregation">Congregation</SelectItem>
                  <SelectItem value="ministry">Ministry</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || isSubmitting}>
              {isSubmitting ? 'Saving...' : (request ? 'Update' : 'Add')} Prayer Item
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}