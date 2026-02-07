'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Target, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { PublisherGoalModal } from './PublisherGoalModal';
import { deletePublisherGoal } from '@/lib/actions/publisher-goal.actions';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';

interface PublisherGoalsClientProps {
  goals: any[];
  stats: any;
  notifications: any[];
  memberId: string;
}

export function PublisherGoalsClient({ goals, stats, notifications, memberId }: PublisherGoalsClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('active');

  useEffect(() => {
    notifications.forEach(notif => {
      if (notif.type === 'goal_completed') {
        toast.success(notif.title, { description: notif.message });
      } else {
        toast.info(notif.title, { description: notif.message });
      }
    });
  }, [notifications]);

  const handleEdit = (goal: any) => {
    setEditData(goal);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const result = await deletePublisherGoal(deleteId);
    if (result.success) {
      toast.success('Goal deleted');
    } else {
      toast.error(result.error);
    }
    setDeleteId(null);
  };

  const filteredGoals = statusFilter === 'all' ? goals : goals.filter(g => g.status === statusFilter);

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || colors.active;
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed || 0}</div>
            <p className="text-xs text-muted-foreground">Goals achieved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cancelled || 0}</div>
            <p className="text-xs text-muted-foreground">Not completed</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {['active', 'completed', 'cancelled', 'expired', 'all'].map(status => (
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
        <Button onClick={() => { setEditData(null); setModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> New Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGoals.map((goal) => {
          const progress = (goal.currentValue / goal.targetValue) * 100;
          const daysLeft = Math.ceil((new Date(goal.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          
          return (
            <Card key={goal._id} className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 ${getProgressColor(progress)}`} />
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                    <p className="text-sm text-muted-foreground capitalize">{goal.goalType.replace('_', ' ')}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(goal.status)}`}>
                    {goal.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {goal.description && (
                  <p className="text-sm text-muted-foreground">{goal.description}</p>
                )}
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Progress</span>
                    <span className="font-bold">{goal.currentValue} / {goal.targetValue}</span>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1">{Math.round(progress)}% complete</p>
                </div>

                {goal.milestones && goal.milestones.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Milestones</p>
                    <div className="flex gap-2">
                      {goal.milestones.map((milestone: any, idx: number) => (
                        <div key={idx} className="flex-1">
                          <div className={`h-2 rounded ${milestone.reached ? 'bg-green-500' : 'bg-gray-200'}`} />
                          <p className="text-xs text-center mt-1">{milestone.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <div>
                    <p className="text-muted-foreground">Start</p>
                    <p className="font-medium">{new Date(goal.startDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">End</p>
                    <p className="font-medium">{new Date(goal.endDate).toLocaleDateString()}</p>
                  </div>
                </div>

                {goal.status === 'active' && daysLeft >= 0 && (
                  <div className={`p-2 rounded text-center text-sm ${
                    daysLeft <= 7 ? 'bg-red-50 text-red-700' :
                    daysLeft <= 14 ? 'bg-yellow-50 text-yellow-700' :
                    'bg-blue-50 text-blue-700'
                  }`}>
                    {daysLeft === 0 ? 'Last day!' : `${daysLeft} days left`}
                  </div>
                )}

                {goal.status === 'completed' && (
                  <div className="p-2 rounded text-center text-sm bg-green-50 text-green-700">
                    🎉 Goal Achieved!
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(goal)}>
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setDeleteId(goal._id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredGoals.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
            <p className="text-muted-foreground mb-4">Set your first ministry goal to start tracking progress</p>
            <Button onClick={() => { setEditData(null); setModalOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Create Goal
            </Button>
          </CardContent>
        </Card>
      )}

      <PublisherGoalModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        memberId={memberId}
        editData={editData}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Goal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this goal? This action cannot be undone.
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
