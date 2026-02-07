import { currentUser } from '@/lib/helpers/session';
import { redirect } from 'next/navigation';
import { getPublisherGoals, getGoalStats, updateGoalProgress, checkGoalMilestones } from '@/lib/actions/publisher-goal.actions';
import { PublisherGoalsClient } from './_components/PublisherGoalsClient';

export default async function PublisherGoalsPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const memberId = user.id;

  await updateGoalProgress(memberId);

  const [goalsRes, statsRes, notificationsRes] = await Promise.all([
    getPublisherGoals(memberId),
    getGoalStats(memberId),
    checkGoalMilestones(memberId)
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Ministry Goals</h1>
        <p className="text-muted-foreground">Set and track your personal ministry goals</p>
      </div>

      <PublisherGoalsClient
        goals={goalsRes.data || []}
        stats={statsRes.data || {}}
        notifications={notificationsRes.data || []}
        memberId={memberId}
      />
    </div>
  );
}
