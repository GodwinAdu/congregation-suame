import { currentUser } from '@/lib/helpers/session';
import { redirect } from 'next/navigation';
import { getSchoolStudents, getUpcomingAssignments, getSchoolStats } from '@/lib/actions/school.actions';
import { fetchAllMembers } from '@/lib/actions/user.actions';
import { TheocraticSchoolClient } from './_components/TheocraticSchoolClient';

export default async function TheocraticSchoolPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const [studentsRes, upcomingRes, statsRes, members] = await Promise.all([
    getSchoolStudents(''),
    getUpcomingAssignments(''),
    getSchoolStats(''),
    fetchAllMembers()
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Theocratic Ministry School</h1>
        <p className="text-muted-foreground">Track student progress and assignments</p>
      </div>

      <TheocraticSchoolClient
        students={studentsRes.data || []}
        upcoming={upcomingRes.data || []}
        stats={statsRes.data || {}}
        members={members || []}
        congregationId={''}
      />
    </div>
  );
}
