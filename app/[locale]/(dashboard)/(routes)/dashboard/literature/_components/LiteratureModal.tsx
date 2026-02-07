'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createLiterature, updateLiterature } from '@/lib/actions/literature.actions';
import { toast } from 'sonner';

interface LiteratureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  congregationId: string;
  editData?: any;
}

export function LiteratureModal({ open, onOpenChange, congregationId, editData }: LiteratureModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: editData?.title || '',
    type: editData?.type || 'book',
    language: editData?.language || 'English',
    stockQuantity: editData?.stockQuantity || 0,
    reorderLevel: editData?.reorderLevel || 10,
    unitCost: editData?.unitCost || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      ...formData,
      stockQuantity: Number(formData.stockQuantity),
      reorderLevel: Number(formData.reorderLevel),
      unitCost: formData.unitCost ? Number(formData.unitCost) : undefined,
      congregationId
    };

    const result = editData
      ? await updateLiterature(editData._id, data)
      : await createLiterature(data);

    if (result.success) {
      toast.success(editData ? 'Literature updated' : 'Literature added');
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
          <DialogTitle>{editData ? 'Edit Literature' : 'Add Literature'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="book">Book</SelectItem>
                  <SelectItem value="brochure">Brochure</SelectItem>
                  <SelectItem value="tract">Tract</SelectItem>
                  <SelectItem value="magazine">Magazine</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Language</Label>
              <Input value={formData.language} onChange={(e) => setFormData({ ...formData, language: e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Stock Quantity</Label>
              <Input type="number" value={formData.stockQuantity} onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })} required />
            </div>
            <div>
              <Label>Reorder Level</Label>
              <Input type="number" value={formData.reorderLevel} onChange={(e) => setFormData({ ...formData, reorderLevel: Number(e.target.value) })} required />
            </div>
            <div>
              <Label>Unit Cost (Optional)</Label>
              <Input type="number" step="0.01" value={formData.unitCost} onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })} />
            </div>
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
