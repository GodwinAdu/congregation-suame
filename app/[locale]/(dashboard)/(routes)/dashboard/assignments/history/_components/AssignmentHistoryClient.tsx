'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Calendar, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { AssignmentHistoryModal } from './AssignmentHistoryModal';
import { deleteAssignmentHistory } from '@/lib/actions/assignment-history.actions';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface AssignmentHistoryClientProps {
  history: any[];
  frequency: any[];
  membersWithoutAssignments: any[];
  stats: any;
  allMembers: any[];
}

export function AssignmentHistoryClient({ history, frequency, membersWithoutAssignments, stats, allMembers }: AssignmentHistoryClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleEdit = (item: any) => {
    setEditData(item);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const result = await deleteAssignmentHistory(deleteId);
    if (result.success) {
      toast.success('Assignment deleted');
    } else {
      toast.error(result.error);
    }
    setDeleteId(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssignments || 0}</div>
            <p className="text-xs text-muted-foreground">Last 6 months: {stats.last6MonthsCount || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Last Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lastMonthCount || 0}</div>
            <p className="text-xs text-muted-foreground">Last 3 months: {stats.last3MonthsCount || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueMembers || 0}</div>
            <p className="text-xs text-muted-foreground">With assignments (6mo)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Need Assignment</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{membersWithoutAssignments.length}</div>
            <p className="text-xs text-muted-foreground">90+ days without assignment</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="history" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="history">All Assignments</TabsTrigger>
            <TabsTrigger value="frequency">Frequency Analysis</TabsTrigger>
            <TabsTrigger value="needed">Need Assignment ({membersWithoutAssignments.length})</TabsTrigger>
          </TabsList>
          <Button onClick={() => { setEditData(null); setModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Record Assignment
          </Button>
        </div>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assignment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Member</th>
                      <th className="text-left p-2">Assignment</th>
                      <th className="text-left p-2">Meeting</th>
                      <th className="text-left p-2">Part</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-right p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr key={item._id} className="border-b hover:bg-muted/50">
                        <td className="p-2">{new Date(item.assignmentDate).toLocaleDateString()}</td>
                        <td className="p-2">{item.memberId?.firstName} {item.memberId?.lastName}</td>
                        <td className="p-2">{item.assignmentType}</td>
                        <td className="p-2 capitalize">{item.meetingType}</td>
                        <td className="p-2">{item.partNumber || '-'}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs ${item.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {item.completed ? 'Completed' : 'Scheduled'}
                          </span>
                        </td>
                        <td className="p-2 text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteId(item._id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frequency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Frequency (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Member</th>
                      <th className="text-center p-2">Total</th>
                      <th className="text-center p-2">Midweek</th>
                      <th className="text-center p-2">Weekend</th>
                      <th className="text-left p-2">Last Assignment</th>
                      <th className="text-left p-2">Days Since</th>
                    </tr>
                  </thead>
                  <tbody>
                    {frequency.map((item) => (
                      <tr key={item.memberId} className="border-b hover:bg-muted/50">
                        <td className="p-2">{item.memberName}</td>
                        <td className="p-2 text-center font-semibold">{item.totalAssignments}</td>
                        <td className="p-2 text-center">{item.midweekCount}</td>
                        <td className="p-2 text-center">{item.weekendCount}</td>
                        <td className="p-2">{new Date(item.lastAssignment).toLocaleDateString()}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            item.daysSinceLastAssignment > 90 ? 'bg-red-100 text-red-800' :
                            item.daysSinceLastAssignment > 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {Math.floor(item.daysSinceLastAssignment)} days
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="needed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Members Without Recent Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Member</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Phone</th>
                      <th className="text-left p-2">Last Assignment</th>
                      <th className="text-left p-2">Days Ago</th>
                    </tr>
                  </thead>
                  <tbody>
                    {membersWithoutAssignments.map((member) => (
                      <tr key={member._id} className="border-b hover:bg-muted/50">
                        <td className="p-2">{member.firstName} {member.lastName}</td>
                        <td className="p-2">{member.email || '-'}</td>
                        <td className="p-2">{member.phone || '-'}</td>
                        <td className="p-2">{member.lastAssignment ? member.lastAssignment.type : 'Never'}</td>
                        <td className="p-2">
                          {member.lastAssignment ? (
                            <span className={`px-2 py-1 rounded text-xs ${
                              member.lastAssignment.daysAgo > 180 ? 'bg-red-100 text-red-800' :
                              member.lastAssignment.daysAgo > 120 ? 'bg-orange-100 text-orange-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {member.lastAssignment.daysAgo} days
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">Never</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AssignmentHistoryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        members={allMembers}
        editData={editData}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this assignment record? This action cannot be undone.
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
