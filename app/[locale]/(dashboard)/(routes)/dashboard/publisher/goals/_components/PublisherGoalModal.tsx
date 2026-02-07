'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createPublisherGoal, updatePublisherGoal } from '@/lib/actions/publisher-goal.actions';
import { toast } from 'sonner';

interface PublisherGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  editData?: any;
}

export function PublisherGoalModal({ open, onOpenChange, memberId, editData }: PublisherGoalModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    goalType: editData?.goalType || 'hours',
    title: editData?.title || '',
    description: editData?.description || '',
    targetValue: editData?.targetValue || '',
    startDate: editData?.startDate ? new Date(editData.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    endDate: editData?.endDate ? new Date(editData.endDate).toISOString().split('T')[0] : '',
    notificationsEnabled: editData?.notificationsEnabled ?? true
  });

  const goalTypes = [
    { value: 'hours', label: 'Ministry Hours' },
    { value: 'placements', label: 'Placements' },
    { value: 'return_visits', label: 'Return Visits' },
    { value: 'bible_studies', label: 'Bible Studies' },
    { value: 'auxiliary_pioneer', label: 'Auxiliary Pioneer' },
    { value: 'regular_pioneer', label: 'Regular Pioneer' },
    { value: 'custom', label: 'Custom Goal' }
  ];

  const handleGoalTypeChange = (type: string) => {
    let title = '';
    let targetValue = '';
    
    switch(type) {
      case 'auxiliary_pioneer':
        title = 'Become Auxiliary Pioneer';
        targetValue = '30';
        break;
      case 'regular_pioneer':
        title = 'Become Regular Pioneer';
        targetValue = '50';
        break;
      default:
        title = '';
        targetValue = '';
    }

    setFormData({ ...formData, goalType: type, title, targetValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const milestones = [];
    const target = Number(formData.targetValue);
    
    if (target > 0) {
      milestones.push({ value: Math.round(target * 0.25), reached: false });
      milestones.push({ value: Math.round(target * 0.5), reached: false });
      milestones.push({ value: Math.round(target * 0.75), reached: false });
    }

    const data = {
      memberId,
      ...formData,
      targetValue: Number(formData.targetValue),
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      milestones: editData ? undefined : milestones
    };

    const result = editData
      ? await updatePublisherGoal(editData._id, data)
      : await createPublisherGoal(data);

    if (result.success) {
      toast.success(editData ? 'Goal updated' : 'Goal created');
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
          <DialogTitle>{editData ? 'Edit Goal' : 'Set New Goal'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Goal Type</Label>
            <Select value={formData.goalType} onValueChange={handleGoalTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {goalTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Goal Title</Label>
            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Reach 20 hours this month" required />
          </div>
          <div>
            <Label>Description (Optional)</Label>
            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Target Value</Label>
              <Input type="number" value={formData.targetValue} onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })} required />
            </div>
            <div>
              <Label>Start Date</Label>
              <Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
            </div>
            <div>
              <Label>End Date</Label>
              <Input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} required />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={formData.notificationsEnabled} onChange={(e) => setFormData({ ...formData, notificationsEnabled: e.target.checked })} />
            <Label>Enable encouragement notifications</Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Goal'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
