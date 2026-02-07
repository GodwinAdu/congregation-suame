'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createAssignmentHistory, updateAssignmentHistory } from '@/lib/actions/assignment-history.actions';
import { toast } from 'sonner';

interface AssignmentHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: any[];
  editData?: any;
}

export function AssignmentHistoryModal({ open, onOpenChange, members, editData }: AssignmentHistoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    memberId: editData?.memberId?._id || '',
    assignmentType: editData?.assignmentType || '',
    assignmentDate: editData?.assignmentDate ? new Date(editData.assignmentDate).toISOString().split('T')[0] : '',
    meetingType: editData?.meetingType || 'midweek',
    partNumber: editData?.partNumber || '',
    duration: editData?.duration || '',
    notes: editData?.notes || '',
    completed: editData?.completed || false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      ...formData,
      assignmentDate: new Date(formData.assignmentDate),
      duration: formData.duration ? Number(formData.duration) : undefined
    };

    const result = editData
      ? await updateAssignmentHistory(editData._id, data)
      : await createAssignmentHistory(data);

    if (result.success) {
      toast.success(editData ? 'Assignment updated' : 'Assignment recorded');
      onOpenChange(false);
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editData ? 'Edit Assignment' : 'Record Assignment'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Member</Label>
              <Select value={formData.memberId} onValueChange={(v) => setFormData({ ...formData, memberId: v })} disabled={!!editData}>
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m._id} value={m._id}>
                      {m.firstName} {m.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Assignment Type</Label>
              <Input value={formData.assignmentType} onChange={(e) => setFormData({ ...formData, assignmentType: e.target.value })} placeholder="e.g., Bible Reading, Talk #3" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date</Label>
              <Input type="date" value={formData.assignmentDate} onChange={(e) => setFormData({ ...formData, assignmentDate: e.target.value })} required />
            </div>
            <div>
              <Label>Meeting Type</Label>
              <Select value={formData.meetingType} onValueChange={(v: any) => setFormData({ ...formData, meetingType: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="midweek">Midweek</SelectItem>
                  <SelectItem value="weekend">Weekend</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Part Number (Optional)</Label>
              <Input value={formData.partNumber} onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })} placeholder="e.g., #3" />
            </div>
            <div>
              <Label>Duration (minutes)</Label>
              <Input type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="5" />
            </div>
          </div>
          <div>
            <Label>Notes (Optional)</Label>
            <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Additional notes..." rows={3} />
          </div>
          {editData && (
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={formData.completed} onChange={(e) => setFormData({ ...formData, completed: e.target.checked })} />
              <Label>Mark as completed</Label>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
