'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Users, CheckCircle, Calendar, Award, TrendingUp, Check, ChevronsUpDown } from 'lucide-react';
import { enrollStudent, scheduleAssignment, completeAssignment, updateStudentLevel } from '@/lib/actions/school.actions';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface TheocraticSchoolClientProps {
  students: any[];
  upcoming: any[];
  stats: any;
  members: any[];
  congregationId: string;
}

export function TheocraticSchoolClient({ students, upcoming, stats, members, congregationId }: TheocraticSchoolClientProps) {
  const [enrollModal, setEnrollModal] = useState(false);
  const [assignmentModal, setAssignmentModal] = useState<any>(null);
  const [counselModal, setCounselModal] = useState<any>(null);
  const [enrollData, setEnrollData] = useState({ memberId: '', enrollmentDate: '', currentLevel: 'beginner' });
  const [assignmentData, setAssignmentData] = useState({ assignmentNumber: '', assignmentType: 'talk', title: '', scheduledDate: '', assistantId: '' });
  const [counselData, setCounselData] = useState({ 
    overallRating: 'good', 
    notes: '',
    counselPoints: [{ point: '', rating: 'good', notes: '' }]
  });
  const [openEnrollCombo, setOpenEnrollCombo] = useState(false);

  const handleEnroll = async () => {
    const result = await enrollStudent({
      ...enrollData,
      enrollmentDate: new Date(enrollData.enrollmentDate),
      congregationId
    });
    if (result.success) {
      toast.success('Student enrolled');
      setEnrollModal(false);
      setEnrollData({ memberId: '', enrollmentDate: '', currentLevel: 'beginner' });
    } else {
      toast.error(result.error);
    }
  };

  const handleSchedule = async () => {
    if (!assignmentModal) return;
    const result = await scheduleAssignment(assignmentModal.memberId._id, {
      ...assignmentData,
      assignmentNumber: Number(assignmentData.assignmentNumber),
      scheduledDate: new Date(assignmentData.scheduledDate),
      assistantId: assignmentData.assistantId || undefined
    });
    if (result.success) {
      toast.success('Assignment scheduled');
      setAssignmentModal(null);
      setAssignmentData({ assignmentNumber: '', assignmentType: 'talk', title: '', scheduledDate: '', assistantId: '' });
    } else {
      toast.error(result.error);
    }
  };

  const handleComplete = async () => {
    if (!counselModal) return;
    const result = await completeAssignment(
      counselModal.student.memberId._id,
      counselModal.assignmentIndex,
      counselData
    );
    if (result.success) {
      toast.success('Assignment completed with counsel');
      setCounselModal(null);
      setCounselData({ overallRating: 'good', notes: '', counselPoints: [{ point: '', rating: 'good', notes: '' }] });
    } else {
      toast.error(result.error);
    }
  };

  const addCounselPoint = () => {
    setCounselData({
      ...counselData,
      counselPoints: [...counselData.counselPoints, { point: '', rating: 'good', notes: '' }]
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedAssignments || 0}/{stats.totalAssignments || 0}</div>
            <Progress value={stats.completionRate || 0} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Excellent</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.excellentCount || 0}</div>
            <p className="text-xs text-muted-foreground">Good: {stats.goodCount || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcoming.length}</div>
            <p className="text-xs text-muted-foreground">Scheduled assignments</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="students" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          </TabsList>
          <Button onClick={() => setEnrollModal(true)}>
            <Plus className="h-4 w-4 mr-2" /> Enroll Student
          </Button>
        </div>

        <TabsContent value="students" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students.map((student: any) => {
              const completionRate = student.progress.totalAssignments > 0
                ? Math.round((student.progress.completedAssignments / student.progress.totalAssignments) * 100)
                : 0;
              
              return (
                <Card key={student._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{student.memberId?.fullName || `${student.memberId?.firstName} ${student.memberId?.lastName}`}</CardTitle>
                        <p className="text-sm text-muted-foreground">Enrolled: {new Date(student.enrollmentDate).toLocaleDateString()}</p>
                      </div>
                      <Badge className="capitalize">{student.currentLevel}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{student.progress.completedAssignments}/{student.progress.totalAssignments}</span>
                      </div>
                      <Progress value={completionRate} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Excellent</p>
                        <p className="font-bold text-green-600">{student.progress.excellentCount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Good</p>
                        <p className="font-bold text-blue-600">{student.progress.goodCount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Needs Work</p>
                        <p className="font-bold text-orange-600">{student.progress.needsImprovementCount}</p>
                      </div>
                    </div>
                    {student.progress.lastAssignmentDate && (
                      <p className="text-xs text-muted-foreground">Last: {new Date(student.progress.lastAssignmentDate).toLocaleDateString()}</p>
                    )}
                    <Button onClick={() => setAssignmentModal(student)} className="w-full" size="sm">
                      <Plus className="h-4 w-4 mr-1" /> Schedule Assignment
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {upcoming.map((assignment: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="font-medium">{assignment.student?.fullName || `${assignment.student?.firstName} ${assignment.student?.lastName}`}</p>
                      <p className="text-sm text-muted-foreground">{assignment.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(assignment.scheduledDate).toLocaleDateString()} • {assignment.assignmentType.replace('_', ' ')}
                      </p>
                    </div>
                    <Button size="sm" onClick={() => setCounselModal({ student: { memberId: assignment.student }, assignmentIndex: idx })}>
                      <CheckCircle className="h-4 w-4 mr-1" /> Complete
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={enrollModal} onOpenChange={setEnrollModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Student</Label>
              <Popover open={openEnrollCombo} onOpenChange={setOpenEnrollCombo}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    {enrollData.memberId
                      ? members.find(m => m._id === enrollData.memberId)?.fullName || `${members.find(m => m._id === enrollData.memberId)?.firstName} ${members.find(m => m._id === enrollData.memberId)?.lastName}`
                      : "Select student..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search student..." />
                    <CommandList>
                      <CommandEmpty>No student found.</CommandEmpty>
                      <CommandGroup>
                        {members.filter(m => !students.some(s => s.memberId?._id === m._id)).map((m: any) => (
                          <CommandItem
                            key={m._id}
                            value={m.fullName || `${m.firstName} ${m.lastName}`}
                            onSelect={() => {
                              setEnrollData({ ...enrollData, memberId: m._id });
                              setOpenEnrollCombo(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", enrollData.memberId === m._id ? "opacity-100" : "opacity-0")} />
                            {m.fullName || `${m.firstName} ${m.lastName}`}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Enrollment Date</Label>
              <Input type="date" value={enrollData.enrollmentDate} onChange={(e) => setEnrollData({ ...enrollData, enrollmentDate: e.target.value })} />
            </div>
            <div>
              <Label>Level</Label>
              <Select value={enrollData.currentLevel} onValueChange={(v) => setEnrollData({ ...enrollData, currentLevel: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleEnroll}>Enroll</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!assignmentModal} onOpenChange={() => setAssignmentModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Assignment - {assignmentModal?.memberId?.firstName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Assignment #</Label>
                <Input type="number" value={assignmentData.assignmentNumber} onChange={(e) => setAssignmentData({ ...assignmentData, assignmentNumber: e.target.value })} />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={assignmentData.assignmentType} onValueChange={(v) => setAssignmentData({ ...assignmentData, assignmentType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial_call">Initial Call</SelectItem>
                    <SelectItem value="return_visit">Return Visit</SelectItem>
                    <SelectItem value="bible_study">Bible Study</SelectItem>
                    <SelectItem value="talk">Talk</SelectItem>
                    <SelectItem value="reading">Reading</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Title</Label>
              <Input value={assignmentData.title} onChange={(e) => setAssignmentData({ ...assignmentData, title: e.target.value })} />
            </div>
            <div>
              <Label>Scheduled Date</Label>
              <Input type="date" value={assignmentData.scheduledDate} onChange={(e) => setAssignmentData({ ...assignmentData, scheduledDate: e.target.value })} />
            </div>
            <div>
              <Label>Assistant (Optional)</Label>
              <Select value={assignmentData.assistantId} onValueChange={(v) => setAssignmentData({ ...assignmentData, assistantId: v })}>
                <SelectTrigger><SelectValue placeholder="Select assistant" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {members.map((m: any) => (
                    <SelectItem key={m._id} value={m._id}>{m.fullName || `${m.firstName} ${m.lastName}`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSchedule}>Schedule</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!counselModal} onOpenChange={() => setCounselModal(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Assignment & Provide Counsel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Overall Rating</Label>
              <Select value={counselData.overallRating} onValueChange={(v) => setCounselData({ ...counselData, overallRating: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="needs_improvement">Needs Improvement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Counsel Points</Label>
              {counselData.counselPoints.map((point, idx) => (
                <div key={idx} className="border p-3 rounded mb-2 space-y-2">
                  <Input placeholder="Counsel point" value={point.point} onChange={(e) => {
                    const newPoints = [...counselData.counselPoints];
                    newPoints[idx].point = e.target.value;
                    setCounselData({ ...counselData, counselPoints: newPoints });
                  }} />
                  <Select value={point.rating} onValueChange={(v) => {
                    const newPoints = [...counselData.counselPoints];
                    newPoints[idx].rating = v;
                    setCounselData({ ...counselData, counselPoints: newPoints });
                  }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="needs_improvement">Needs Improvement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addCounselPoint}>Add Point</Button>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={counselData.notes} onChange={(e) => setCounselData({ ...counselData, notes: e.target.value })} rows={3} />
            </div>
            <Button onClick={handleComplete}>Complete Assignment</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
