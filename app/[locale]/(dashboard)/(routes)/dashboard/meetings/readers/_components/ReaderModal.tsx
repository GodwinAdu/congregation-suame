'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { createReaderAssignment, updateReaderAssignment } from '@/lib/actions/reader-assignment.actions';
import { fetchMaleMembers } from '@/lib/actions/user.actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ReaderModal({ open, onClose, editData }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [readerOpen, setReaderOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [selectedReaders, setSelectedReaders] = useState<string[]>([]);
  const [selectedAssistants, setSelectedAssistants] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    date: '',
    meetingType: 'midweek',
    studyType: 'bible-study',
    reader: '',
    assistant: '',
    notes: '',
    isRotating: false,
    rotationWeeks: 4
  });

  useEffect(() => {
    if (open) {
      fetchMaleMembers().then((data) => {
        setMembers(data || []);
      }).catch(err => {
        console.error('Error fetching members:', err);
        toast.error('Failed to load members');
      });
    }
  }, [open]);

  useEffect(() => {
    if (editData) {
      setFormData({
        date: new Date(editData.date).toISOString().slice(0, 10),
        meetingType: editData.meetingType || 'midweek',
        studyType: editData.studyType || 'bible-study',
        reader: editData.reader?._id || '',
        assistant: editData.assistant?._id || '',
        notes: editData.notes || '',
        isRotating: false,
        rotationWeeks: 4
      });
      setSelectedReaders([]);
      setSelectedAssistants([]);
    } else {
      setFormData({
        date: '',
        meetingType: 'midweek',
        studyType: 'bible-study',
        reader: '',
        assistant: '',
        notes: '',
        isRotating: false,
        rotationWeeks: 4
      });
      setSelectedReaders([]);
      setSelectedAssistants([]);
    }
  }, [editData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editData) {
        await updateReaderAssignment(editData._id, formData);
        toast.success('Assignment updated');
      } else {
        if (formData.isRotating && selectedReaders.length > 0) {
          const startDate = new Date(formData.date);
          const assignments = [];
          
          for (let week = 0; week < formData.rotationWeeks; week++) {
            const readerIndex = week % selectedReaders.length;
            const assistantIndex = week % (selectedAssistants.length || 1);
            const assignmentDate = new Date(startDate);
            assignmentDate.setDate(startDate.getDate() + (week * 7));
            
            assignments.push({
              date: assignmentDate,
              meetingType: formData.meetingType,
              studyType: formData.studyType,
              reader: selectedReaders[readerIndex],
              assistant: selectedAssistants.length > 0 ? selectedAssistants[assistantIndex] : '',
              notes: formData.notes
            });
          }
          
          // Create all assignments
          await Promise.all(assignments.map(a => createReaderAssignment(a)));
          toast.success(`Created ${assignments.length} rotating assignments`);
        } else {
          await createReaderAssignment(formData);
          toast.success('Reader assigned');
        }
      }
      router.refresh();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editData ? 'Edit' : 'Assign'} Reader</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Meeting Type</Label>
              <Select value={formData.meetingType} onValueChange={(value) => setFormData({ ...formData, meetingType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="midweek">Midweek</SelectItem>
                  <SelectItem value="weekend">Weekend</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Study Type</Label>
              <Select value={formData.studyType} onValueChange={(value) => setFormData({ ...formData, studyType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bible-study">Bible Study</SelectItem>
                  <SelectItem value="watchtower">Watchtower</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData.isRotating}
              onCheckedChange={(checked) => setFormData({ ...formData, isRotating: checked as boolean })}
            />
            <Label>Create Rotating Schedule</Label>
          </div>

          {formData.isRotating ? (
            <>
              <div>
                <Label>Number of Weeks</Label>
                <Input
                  type="number"
                  min="2"
                  max="52"
                  value={formData.rotationWeeks}
                  onChange={(e) => setFormData({ ...formData, rotationWeeks: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div>
                <Label>Select Readers (in rotation order)</Label>
                <div className="border rounded p-3 space-y-2 max-h-60 overflow-y-auto">
                  {members.map((member) => (
                    <div key={member._id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedReaders.includes(member._id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedReaders([...selectedReaders, member._id]);
                          } else {
                            setSelectedReaders(selectedReaders.filter(id => id !== member._id));
                          }
                        }}
                      />
                      <Label className="font-normal cursor-pointer">{member.fullName}</Label>
                      {selectedReaders.includes(member._id) && (
                        <span className="text-xs text-muted-foreground ml-auto">
                          #{selectedReaders.indexOf(member._id) + 1}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Selected: {selectedReaders.length} readers
                </p>
              </div>

              <div>
                <Label>Select Assistants (in rotation order, optional)</Label>
                <div className="border rounded p-3 space-y-2 max-h-60 overflow-y-auto">
                  {members.map((member) => (
                    <div key={member._id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedAssistants.includes(member._id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedAssistants([...selectedAssistants, member._id]);
                          } else {
                            setSelectedAssistants(selectedAssistants.filter(id => id !== member._id));
                          }
                        }}
                      />
                      <Label className="font-normal cursor-pointer">{member.fullName}</Label>
                      {selectedAssistants.includes(member._id) && (
                        <span className="text-xs text-muted-foreground ml-auto">
                          #{selectedAssistants.indexOf(member._id) + 1}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Selected: {selectedAssistants.length} assistants
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <Label>Reader</Label>
                <Popover open={readerOpen} onOpenChange={setReaderOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {formData.reader ? members.find(m => m._id === formData.reader)?.fullName : 'Select reader'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search reader..." />
                      <CommandList>
                        <CommandEmpty>No reader found.</CommandEmpty>
                        <CommandGroup>
                          {members.map((member) => (
                            <CommandItem
                              key={member._id}
                              value={member.fullName}
                              onSelect={() => {
                                setFormData({ ...formData, reader: member._id });
                                setReaderOpen(false);
                              }}
                            >
                              <Check className={cn('mr-2 h-4 w-4', formData.reader === member._id ? 'opacity-100' : 'opacity-0')} />
                              {member.fullName}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Assistant (Optional)</Label>
            <Popover open={assistantOpen} onOpenChange={setAssistantOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between">
                  {formData.assistant ? members.find(m => m._id === formData.assistant)?.fullName : 'Select assistant'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search assistant..." />
                  <CommandList>
                    <CommandEmpty>No assistant found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="none"
                        onSelect={() => {
                          setFormData({ ...formData, assistant: '' });
                          setAssistantOpen(false);
                        }}
                      >
                        <Check className={cn('mr-2 h-4 w-4', !formData.assistant ? 'opacity-100' : 'opacity-0')} />
                        None
                      </CommandItem>
                      {members.map((member) => (
                        <CommandItem
                          key={member._id}
                          value={member.fullName}
                          onSelect={() => {
                            setFormData({ ...formData, assistant: member._id });
                            setAssistantOpen(false);
                          }}
                        >
                          <Check className={cn('mr-2 h-4 w-4', formData.assistant === member._id ? 'opacity-100' : 'opacity-0')} />
                          {member.fullName}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
            </>
          )}

          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : editData ? 'Update' : 'Assign'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
