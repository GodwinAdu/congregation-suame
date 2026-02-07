'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createBibleStudy, updateBibleStudy } from '@/lib/actions/bible-study.actions';
import { toast } from 'sonner';

interface BibleStudyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: any[];
  editData?: any;
}

export function BibleStudyModal({ open, onOpenChange, members, editData }: BibleStudyModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentName: editData?.studentName || '',
    studentEmail: editData?.studentEmail || '',
    studentPhone: editData?.studentPhone || '',
    studentAddress: editData?.studentAddress || '',
    conductorId: editData?.conductorId?._id || '',
    assistantId: editData?.assistantId?._id || '',
    publication: editData?.publication || '',
    totalLessons: editData?.totalLessons || '',
    startDate: editData?.startDate ? new Date(editData.startDate).toISOString().split('T')[0] : '',
    studyDay: editData?.studyDay || '',
    studyTime: editData?.studyTime || '',
    location: editData?.location || '',
    status: editData?.status || 'active',
    notes: editData?.notes || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      ...formData,
      totalLessons: Number(formData.totalLessons),
      startDate: new Date(formData.startDate),
      assistantId: formData.assistantId || undefined
    };

    const result = editData
      ? await updateBibleStudy(editData._id, data)
      : await createBibleStudy(data);

    if (result.success) {
      toast.success(editData ? 'Bible study updated' : 'Bible study created');
      onOpenChange(false);
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editData ? 'Edit Bible Study' : 'New Bible Study'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Student Name *</Label>
              <Input value={formData.studentName} onChange={(e) => setFormData({ ...formData, studentName: e.target.value })} required />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={formData.studentEmail} onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Phone</Label>
              <Input value={formData.studentPhone} onChange={(e) => setFormData({ ...formData, studentPhone: e.target.value })} />
            </div>
            <div>
              <Label>Address</Label>
              <Input value={formData.studentAddress} onChange={(e) => setFormData({ ...formData, studentAddress: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Conductor *</Label>
              <Select value={formData.conductorId} onValueChange={(v) => setFormData({ ...formData, conductorId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select conductor" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m._id} value={m._id}>{m.firstName} {m.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Assistant</Label>
              <Select value={formData.assistantId} onValueChange={(v) => setFormData({ ...formData, assistantId: v === 'none' ? '' : v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assistant (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m._id} value={m._id}>{m.firstName} {m.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Publication *</Label>
              <Input value={formData.publication} onChange={(e) => setFormData({ ...formData, publication: e.target.value })} placeholder="e.g., Enjoy Life Forever" required />
            </div>
            <div>
              <Label>Total Lessons *</Label>
              <Input type="number" value={formData.totalLessons} onChange={(e) => setFormData({ ...formData, totalLessons: e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Start Date *</Label>
              <Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
            </div>
            <div>
              <Label>Study Day *</Label>
              <Select value={formData.studyDay} onValueChange={(v) => setFormData({ ...formData, studyDay: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <SelectItem key={day} value={day}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Study Time *</Label>
              <Input type="time" value={formData.studyTime} onChange={(e) => setFormData({ ...formData, studyTime: e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Location *</Label>
              <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="e.g., Student's home" required />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
