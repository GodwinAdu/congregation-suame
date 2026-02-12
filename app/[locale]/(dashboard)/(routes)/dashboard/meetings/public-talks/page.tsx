import { currentUser } from '@/lib/helpers/session';
import { redirect } from 'next/navigation';
import { getPublicTalks } from '@/lib/actions/public-talk.actions';
import PublicTalksClient from './_components/PublicTalksClient';

export default async function PublicTalksPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const talks = await getPublicTalks();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Public Talk Schedule</h1>
        <p className="text-muted-foreground">Manage public talk speakers and assistants</p>
      </div>
      <PublicTalksClient talks={talks} />
    </div>
  );
}
