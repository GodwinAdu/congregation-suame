import { currentUser } from '@/lib/helpers/session';
import { redirect } from 'next/navigation';
import { getBibleStudies, getBibleStudyStats, getStudyEffectivenessReport } from '@/lib/actions/bible-study.actions';
import { fetchAllMembers } from '@/lib/actions/user.actions';
import { BibleStudiesClient } from './_components/BibleStudiesClient';

export default async function BibleStudiesPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const [studiesRes, statsRes, reportRes, membersRes] = await Promise.all([
    getBibleStudies(''),
    getBibleStudyStats(''),
    getStudyEffectivenessReport(''),
    fetchAllMembers()
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bible Study Progress Tracker</h1>
        <p className="text-muted-foreground">Track individual bible studies and monitor progress</p>
      </div>

      <BibleStudiesClient
        studies={studiesRes.data || []}
        stats={statsRes.data || {}}
        report={reportRes.data || []}
        members={membersRes || []}
      />
    </div>
  );
}
