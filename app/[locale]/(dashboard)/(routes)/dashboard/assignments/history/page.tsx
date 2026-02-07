import { currentUser } from '@/lib/helpers/session';
import { redirect } from 'next/navigation';
import { getAssignmentHistory, getAssignmentFrequency, getMembersWithoutRecentAssignments, getAssignmentStats } from '@/lib/actions/assignment-history.actions';
import { fetchAllMembers } from '@/lib/actions/user.actions';
import { AssignmentHistoryClient } from './_components/AssignmentHistoryClient';

export default async function AssignmentHistoryPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const [historyRes, frequencyRes, membersRes, statsRes, allMembersRes] = await Promise.all([
    getAssignmentHistory(''),
    getAssignmentFrequency('', 6),
    getMembersWithoutRecentAssignments('', 90),
    getAssignmentStats(''),
    fetchAllMembers()
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Assignment History</h1>
        <p className="text-muted-foreground">Track meeting part assignments and ensure fair distribution</p>
      </div>

      <AssignmentHistoryClient
        history={historyRes.data || []}
        frequency={frequencyRes.data || []}
        membersWithoutAssignments={membersRes.data || []}
        stats={statsRes.data || {}}
        allMembers={allMembersRes || []}
      />
    </div>
  );
}
