'use client';

import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';
import { deleteReaderAssignment } from '@/lib/actions/reader-assignment.actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ReadersTable({ assignments, onEdit }: any) {
  const router = useRouter();

  const getWeekStatus = (date: string) => {
    const assignmentDate = new Date(date);
    assignmentDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get start of current week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    // Get end of current week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    if (assignmentDate >= startOfWeek && assignmentDate <= endOfWeek) {
      return 'current';
    } else if (assignmentDate < startOfWeek) {
      return 'past';
    }
    return 'future';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this assignment?')) return;
    try {
      await deleteReaderAssignment(id);
      toast.success('Assignment deleted');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Date</th>
            <th className="text-left p-2">Meeting</th>
            <th className="text-left p-2">Reader</th>
            <th className="text-left p-2">Assistant</th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {assignments.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-4 text-center text-muted-foreground">
                No assignments yet
              </td>
            </tr>
          ) : (
            assignments.map((assignment: any) => {
              const weekStatus = getWeekStatus(assignment.date);
              return (
            <tr 
              key={assignment._id} 
              className={`border-b hover:bg-muted/50 ${
                weekStatus === 'current' ? 'bg-primary/10 font-medium' :
                weekStatus === 'past' ? 'opacity-60' : ''
              }`}
            >
              <td className="p-2">{new Date(assignment.date).toLocaleDateString()}</td>
              <td className="p-2 capitalize">{assignment.meetingType}</td>
              <td className="p-2">
                {assignment.reader?.fullName}
              </td>
              <td className="p-2">
                {assignment.assistant?.fullName || '-'}
              </td>
              <td className="p-2">
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => onEdit(assignment)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(assignment._id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          )}))}
        </tbody>
      </table>
    </div>
  );
}
