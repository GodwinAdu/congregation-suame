import { currentUser } from '@/lib/helpers/session';
import { redirect } from 'next/navigation';
import { getReaderAssignments } from '@/lib/actions/reader-assignment.actions';
import ReadersClient from './_components/ReadersClient';

export default async function ReadersPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const assignments = await getReaderAssignments();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reader Assignments</h1>
        <p className="text-muted-foreground">Manage Bible study and Watchtower readers</p>
      </div>
      <ReadersClient assignments={assignments} />
    </div>
  );
}
