'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { addStudySession, addGoal, addMilestone } from '@/lib/actions/bible-study.actions';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

interface StudyDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  study: any;
}

export function StudyDetailModal({ open, onOpenChange, study }: StudyDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [sessionData, setSessionData] = useState({
    date: new Date().toISOString().split('T')[0],
    lessonNumber: study?.currentLesson + 1 || 1,
    attended: true,
    duration: '',
    topics: '',
    notes: '',
    engagement: 'good'
  });
  const [goalData, setGoalData] = useState({ description: '', targetDate: '' });
  const [milestoneData, setMilestoneData] = useState({ type: 'custom', description: '', date: new Date().toISOString().split('T')[0], notes: '' });

  const handleAddSession = async () => {
    setLoading(true);
    const result = await addStudySession(study._id, {
      ...sessionData,
      date: new Date(sessionData.date),
      lessonNumber: Number(sessionData.lessonNumber),
      duration: sessionData.duration ? Number(sessionData.duration) : undefined
    });
    if (result.success) {
      toast.success('Session recorded');
      setSessionData({ date: new Date().toISOString().split('T')[0], lessonNumber: study.currentLesson + 2, attended: true, duration: '', topics: '', notes: '', engagement: 'good' });
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleAddGoal = async () => {
    setLoading(true);
    const result = await addGoal(study._id, {
      ...goalData,
      targetDate: goalData.targetDate ? new Date(goalData.targetDate) : undefined
    });
    if (result.success) {
      toast.success('Goal added');
      setGoalData({ description: '', targetDate: '' });
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleAddMilestone = async () => {
    setLoading(true);
    const result = await addMilestone(study._id, {
      ...milestoneData,
      date: new Date(milestoneData.date)
    });
    if (result.success) {
      toast.success('Milestone added');
      setMilestoneData({ type: 'custom', description: '', date: new Date().toISOString().split('T')[0], notes: '' });
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  if (!study) return null;

  const progress = (study.currentLesson / study.totalLessons) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{study.studentName} - {study.publication}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border rounded">
              <p className="text-sm text-muted-foreground">Progress</p>
              <p className="text-2xl font-bold">{study.currentLesson}/{study.totalLessons}</p>
              <Progress value={progress} className="mt-2" />
            </div>
            <div className="p-4 border rounded">
              <p className="text-sm text-muted-foreground">Sessions</p>
              <p className="text-2xl font-bold">{study.sessions?.length || 0}</p>
            </div>
            <div className="p-4 border rounded">
              <p className="text-sm text-muted-foreground">Milestones</p>
              <p className="text-2xl font-bold">{study.milestones?.length || 0}</p>
            </div>
          </div>

          <Tabs defaultValue="sessions">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
            </TabsList>

            <TabsContent value="sessions" className="space-y-4">
              <div className="border p-4 rounded space-y-3">
                <h3 className="font-semibold">Record New Session</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Date</Label>
                    <Input type="date" value={sessionData.date} onChange={(e) => setSessionData({ ...sessionData, date: e.target.value })} />
                  </div>
                  <div>
                    <Label>Lesson #</Label>
                    <Input type="number" value={sessionData.lessonNumber} onChange={(e) => setSessionData({ ...sessionData, lessonNumber: Number(e.target.value) })} />
                  </div>
                  <div>
                    <Label>Duration (min)</Label>
                    <Input type="number" value={sessionData.duration} onChange={(e) => setSessionData({ ...sessionData, duration: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Engagement</Label>
                    <Select value={sessionData.engagement} onValueChange={(v) => setSessionData({ ...sessionData, engagement: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={sessionData.attended} onChange={(e) => setSessionData({ ...sessionData, attended: e.target.checked })} />
                      <span>Attended</span>
                    </label>
                  </div>
                </div>
                <div>
                  <Label>Topics Covered</Label>
                  <Input value={sessionData.topics} onChange={(e) => setSessionData({ ...sessionData, topics: e.target.value })} />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea value={sessionData.notes} onChange={(e) => setSessionData({ ...sessionData, notes: e.target.value })} rows={2} />
                </div>
                <Button onClick={handleAddSession} disabled={loading}>Add Session</Button>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Session History</h3>
                {study.sessions?.slice().reverse().map((session: any, idx: number) => (
                  <div key={idx} className="border p-3 rounded">
                    <div className="flex justify-between">
                      <span className="font-medium">Lesson {session.lessonNumber} - {new Date(session.date).toLocaleDateString()}</span>
                      <span className={`px-2 py-1 rounded text-xs ${session.attended ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {session.attended ? 'Attended' : 'Absent'}
                      </span>
                    </div>
                    {session.topics && <p className="text-sm text-muted-foreground mt-1">{session.topics}</p>}
                    {session.notes && <p className="text-sm mt-1">{session.notes}</p>}
                    <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                      <span>Engagement: {session.engagement}</span>
                      {session.duration && <span>Duration: {session.duration}min</span>}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="goals" className="space-y-4">
              <div className="border p-4 rounded space-y-3">
                <h3 className="font-semibold">Add New Goal</h3>
                <div>
                  <Label>Goal Description</Label>
                  <Input value={goalData.description} onChange={(e) => setGoalData({ ...goalData, description: e.target.value })} placeholder="e.g., Attend first meeting" />
                </div>
                <div>
                  <Label>Target Date (Optional)</Label>
                  <Input type="date" value={goalData.targetDate} onChange={(e) => setGoalData({ ...goalData, targetDate: e.target.value })} />
                </div>
                <Button onClick={handleAddGoal} disabled={loading || !goalData.description}>Add Goal</Button>
              </div>

              <div className="space-y-2">
                {study.goals?.map((goal: any, idx: number) => (
                  <div key={idx} className={`border p-3 rounded ${goal.completed ? 'bg-green-50' : ''}`}>
                    <div className="flex justify-between items-start">
                      <span className={goal.completed ? 'line-through' : ''}>{goal.description}</span>
                      {goal.completed && <span className="text-xs text-green-600">✓ Completed</span>}
                    </div>
                    {goal.targetDate && <p className="text-xs text-muted-foreground mt-1">Target: {new Date(goal.targetDate).toLocaleDateString()}</p>}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="milestones" className="space-y-4">
              <div className="border p-4 rounded space-y-3">
                <h3 className="font-semibold">Add Milestone</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Type</Label>
                    <Select value={milestoneData.type} onValueChange={(v) => setMilestoneData({ ...milestoneData, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="first_meeting">First Meeting</SelectItem>
                        <SelectItem value="first_comment">First Comment</SelectItem>
                        <SelectItem value="first_prayer">First Prayer</SelectItem>
                        <SelectItem value="unbaptized_publisher">Unbaptized Publisher</SelectItem>
                        <SelectItem value="baptism">Baptism</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Date</Label>
                    <Input type="date" value={milestoneData.date} onChange={(e) => setMilestoneData({ ...milestoneData, date: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Input value={milestoneData.description} onChange={(e) => setMilestoneData({ ...milestoneData, description: e.target.value })} />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea value={milestoneData.notes} onChange={(e) => setMilestoneData({ ...milestoneData, notes: e.target.value })} rows={2} />
                </div>
                <Button onClick={handleAddMilestone} disabled={loading || !milestoneData.description}>Add Milestone</Button>
              </div>

              <div className="space-y-2">
                {study.milestones?.map((milestone: any, idx: number) => (
                  <div key={idx} className="border p-3 rounded bg-blue-50">
                    <div className="flex justify-between">
                      <span className="font-medium">{milestone.description}</span>
                      <span className="text-xs text-muted-foreground">{new Date(milestone.date).toLocaleDateString()}</span>
                    </div>
                    {milestone.notes && <p className="text-sm text-muted-foreground mt-1">{milestone.notes}</p>}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
