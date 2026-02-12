'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPublicTalk, updatePublicTalk } from '@/lib/actions/public-talk.actions';
import { fetchMaleMembers } from '@/lib/actions/user.actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function PublicTalkModal({ open, onClose, editData }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [speakerOpen, setSpeakerOpen] = useState(false);
  const [chairmanOpen, setChairmanOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    eventType: 'public-talk',
    eventTitle: '',
    talkNumber: '',
    talkTitle: '',
    speaker: '',
    chairman: '',
    assistant: '',
    isVisitingSpeaker: false,
    visitingSpeakerName: '',
    visitingCongregation: '',
    notes: ''
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
        eventType: editData.eventType || 'public-talk',
        eventTitle: editData.eventTitle || '',
        talkNumber: editData.talkNumber || '',
        talkTitle: editData.talkTitle || '',
        speaker: editData.speaker?._id || '',
        chairman: editData.chairman?._id || '',
        assistant: editData.assistant?._id || '',
        isVisitingSpeaker: editData.isVisitingSpeaker || false,
        visitingSpeakerName: editData.visitingSpeakerName || '',
        visitingCongregation: editData.visitingCongregation || '',
        notes: editData.notes || ''
      });
    } else {
      setFormData({
        date: '',
        eventType: 'public-talk',
        eventTitle: '',
        talkNumber: '',
        talkTitle: '',
        speaker: '',
        chairman: '',
        assistant: '',
        isVisitingSpeaker: false,
        visitingSpeakerName: '',
        visitingCongregation: '',
        notes: ''
      });
    }
  }, [editData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editData) {
        await updatePublicTalk(editData._id, formData);
        toast.success('Talk updated successfully');
      } else {
        await createPublicTalk(formData);
        toast.success('Talk scheduled successfully');
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editData ? 'Edit' : 'Schedule'} Public Talk</DialogTitle>
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

          <div>
            <Label>Event Type</Label>
            <select
              className="w-full border rounded-md p-2"
              value={formData.eventType}
              onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
            >
              <option value="public-talk">Public Talk</option>
              <option value="convention">Convention</option>
              <option value="co-visit">CO Visit</option>
              <option value="special-program">Special Program</option>
              <option value="other">Other</option>
            </select>
          </div>

          {formData.eventType !== 'public-talk' ? (
            <div>
              <Label>Event Title</Label>
              <Input
                value={formData.eventTitle}
                onChange={(e) => setFormData({ ...formData, eventTitle: e.target.value })}
                required
                placeholder="e.g., Regional Convention, Circuit Overseer Visit"
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Talk Number</Label>
                  <Input
                    value={formData.talkNumber}
                    onChange={(e) => setFormData({ ...formData, talkNumber: e.target.value })}
                    placeholder="e.g., 123"
                  />
                </div>
                <div>
                  <Label>Talk Title</Label>
                  <Input
                    value={formData.talkTitle}
                    onChange={(e) => setFormData({ ...formData, talkTitle: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.isVisitingSpeaker}
                  onCheckedChange={(checked) => setFormData({ ...formData, isVisitingSpeaker: checked as boolean })}
                />
                <Label>Visiting Speaker</Label>
              </div>

              {formData.isVisitingSpeaker ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Speaker Name</Label>
                    <Input
                      value={formData.visitingSpeakerName}
                      onChange={(e) => setFormData({ ...formData, visitingSpeakerName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Congregation</Label>
                    <Input
                      value={formData.visitingCongregation}
                      onChange={(e) => setFormData({ ...formData, visitingCongregation: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <Label>Speaker</Label>
                  <Popover open={speakerOpen} onOpenChange={setSpeakerOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between">
                        {formData.speaker ? members.find(m => m._id === formData.speaker)?.fullName : 'Select speaker'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search speaker..." />
                        <CommandList>
                          <CommandEmpty>No speaker found.</CommandEmpty>
                          <CommandGroup>
                            {members.map((member) => (
                              <CommandItem
                                key={member._id}
                                value={member.fullName}
                                onSelect={() => {
                                  setFormData({ ...formData, speaker: member._id });
                                  setSpeakerOpen(false);
                                }}
                              >
                                <Check className={cn('mr-2 h-4 w-4', formData.speaker === member._id ? 'opacity-100' : 'opacity-0')} />
                                {member.fullName}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              <div>
                <Label>Chairman</Label>
                <Popover open={chairmanOpen} onOpenChange={setChairmanOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {formData.chairman ? members.find(m => m._id === formData.chairman)?.fullName : 'Select chairman'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search chairman..." />
                      <CommandList>
                        <CommandEmpty>No chairman found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="none"
                            onSelect={() => {
                              setFormData({ ...formData, chairman: '' });
                              setChairmanOpen(false);
                            }}
                          >
                            <Check className={cn('mr-2 h-4 w-4', !formData.chairman ? 'opacity-100' : 'opacity-0')} />
                            None
                          </CommandItem>
                          {members.map((member) => (
                            <CommandItem
                              key={member._id}
                              value={member.fullName}
                              onSelect={() => {
                                setFormData({ ...formData, chairman: member._id });
                                setChairmanOpen(false);
                              }}
                            >
                              <Check className={cn('mr-2 h-4 w-4', formData.chairman === member._id ? 'opacity-100' : 'opacity-0')} />
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
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : editData ? 'Update' : 'Schedule'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
