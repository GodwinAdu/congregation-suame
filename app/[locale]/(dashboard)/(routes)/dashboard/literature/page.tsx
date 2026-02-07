import { currentUser } from '@/lib/helpers/session';
import { redirect } from 'next/navigation';
import { getLiterature, getLowStock, getLiteratureStats } from '@/lib/actions/literature.actions';
import { fetchAllMembers } from '@/lib/actions/user.actions';
import { LiteratureClient } from './_components/LiteratureClient';

export default async function LiteraturePage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const [literatureRes, lowStockRes, statsRes, membersRes] = await Promise.all([
    getLiterature(''),
    getLowStock(''),
    getLiteratureStats(''),
    fetchAllMembers()
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Literature Inventory</h1>
        <p className="text-muted-foreground">Manage literature stock, placements, and contributions</p>
      </div>

      <LiteratureClient
        literature={literatureRes.data || []}
        lowStock={lowStockRes.data || []}
        stats={statsRes.data || {}}
        members={membersRes || []}
        congregationId={''}
      />
    </div>
  );
}
