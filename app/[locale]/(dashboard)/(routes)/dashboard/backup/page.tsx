import { currentUser } from '@/lib/helpers/session';
import { redirect } from 'next/navigation';
import { BackupClient } from './_components/BackupClient';

export default async function BackupPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Backup & Restore</h1>
        <p className="text-muted-foreground">Manage database backups and restore data</p>
      </div>
      <BackupClient currentUserId={user._id as string} />
    </div>
  );
}
