import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserByClerkId } from '@/lib/actions/user.actions';
import { getAssignmentHistory, getAssignmentFrequency, getMembersWithoutRecentAssignments, getAssignmentStats } from '@/lib/actions/assignment-history.actions';
import { getMembers } from '@/lib/actions/member.actions';
import { AssignmentHistoryClient } from './_components/AssignmentHistoryClient';

export default async function AssignmentHistoryPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await getUserByClerkId(userId);
  if (!user?.success) redirect('/sign-in');

  const congregationId = user.data.congregationId;

  const [historyRes, frequencyRes, membersRes, statsRes, allMembersRes] = await Promise.all([
    getAssignmentHistory(congregationId),
    getAssignmentFrequency(congregationId, 6),
    getMembersWithoutRecentAssignments(congregationId, 90),
    getAssignmentStats(congregationId),
    getMembers(congregationId)
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
        allMembers={allMembersRes.data || []}
      />
    </div>
  );
}
