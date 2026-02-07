'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, BookOpen, TrendingUp, Users, CheckCircle, Eye } from 'lucide-react';
import { BibleStudyModal } from './BibleStudyModal';
import { StudyDetailModal } from './StudyDetailModal';
import { deleteBibleStudy } from '@/lib/actions/bible-study.actions';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';

interface BibleStudiesClientProps {
  studies: any[];
  stats: any;
  report: any[];
  members: any[];
}

export function BibleStudiesClient({ studies, stats, report, members }: BibleStudiesClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [selectedStudy, setSelectedStudy] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const handleEdit = (study: any) => {
    setEditData(study);
    setModalOpen(true);
  };

  const handleViewDetails = (study: any) => {
    setSelectedStudy(study);
    setDetailModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const result = await deleteBibleStudy(deleteId);
    if (result.success) {
      toast.success('Bible study deleted');
    } else {
      toast.error(result.error);
    }
    setDeleteId(null);
  };

  const filteredStudies = statusFilter === 'all' ? studies : studies.filter(s => s.status === statusFilter);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Studies</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total || 0}</div>
            <p className="text-xs text-muted-foreground">Active: {stats.active || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgProgress || 0}%</div>
            <Progress value={stats.avgProgress || 0} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendanceRate || 0}%</div>
            <p className="text-xs text-muted-foreground">Overall attendance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed || 0}</div>
            <p className="text-xs text-muted-foreground">Discontinued: {stats.discontinued || 0}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="studies" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="studies">All Studies</TabsTrigger>
            <TabsTrigger value="report">Effectiveness Report</TabsTrigger>
          </TabsList>
          <Button onClick={() => { setEditData(null); setModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> New Bible Study
          </Button>
        </div>

        <TabsContent value="studies" className="space-y-4">
          <div className="flex gap-2">
            {['all', 'active', 'inactive', 'completed', 'discontinued'].map(status => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStudies.map((study) => {
              const progress = (study.currentLesson / study.totalLessons) * 100;
              return (
                <Card key={study._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{study.studentName}</CardTitle>
                        <p className="text-sm text-muted-foreground">{study.publication}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        study.status === 'active' ? 'bg-green-100 text-green-800' :
                        study.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        study.status === 'discontinued' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {study.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{study.currentLesson}/{study.totalLessons} ({Math.round(progress)}%)</span>
                      </div>
                      <Progress value={progress} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Conductor</p>
                        <p className="font-medium">{study.conductorId?.firstName} {study.conductorId?.lastName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Schedule</p>
                        <p className="font-medium">{study.studyDay} {study.studyTime}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Sessions</p>
                        <p className="font-bold">{study.sessions?.length || 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Goals</p>
                        <p className="font-bold">{study.goals?.length || 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Milestones</p>
                        <p className="font-bold">{study.milestones?.length || 0}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewDetails(study)}>
                        <Eye className="h-4 w-4 mr-1" /> Details
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(study)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setDeleteId(study._id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="report" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Study Effectiveness Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Student</th>
                      <th className="text-left p-2">Conductor</th>
                      <th className="text-center p-2">Progress</th>
                      <th className="text-center p-2">Sessions</th>
                      <th className="text-center p-2">Attendance</th>
                      <th className="text-center p-2">Engagement</th>
                      <th className="text-center p-2">Goals</th>
                      <th className="text-center p-2">Milestones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.map((item) => (
                      <tr key={item.studyId} className="border-b hover:bg-muted/50">
                        <td className="p-2">{item.studentName}</td>
                        <td className="p-2">{item.conductor?.firstName} {item.conductor?.lastName}</td>
                        <td className="p-2 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${
                            item.progress >= 75 ? 'bg-green-100 text-green-800' :
                            item.progress >= 50 ? 'bg-blue-100 text-blue-800' :
                            item.progress >= 25 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.progress}%
                          </span>
                        </td>
                        <td className="p-2 text-center">{item.totalSessions}</td>
                        <td className="p-2 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${
                            item.attendanceRate >= 80 ? 'bg-green-100 text-green-800' :
                            item.attendanceRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {item.attendanceRate}%
                          </span>
                        </td>
                        <td className="p-2 text-center">{item.avgEngagement}</td>
                        <td className="p-2 text-center">{item.completedGoals}/{item.totalGoals}</td>
                        <td className="p-2 text-center">{item.milestones}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <BibleStudyModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        members={members}
        editData={editData}
      />

      <StudyDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        study={selectedStudy}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bible Study</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bible study? This will remove all sessions, goals, and milestones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
