import { currentUser } from '@/lib/helpers/session';
import { redirect } from 'next/navigation';
import { getOrCreatePublisherRecord } from '@/lib/actions/publisher-record.actions';
import { PublisherRecordClient } from './_components/PublisherRecordClient';

export default async function PublisherRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const recordRes = await getOrCreatePublisherRecord(id);

  return (
    <div className="p-6 space-y-6">
      <PublisherRecordClient
        record={recordRes.data || {}}
        memberId={id}
        currentUserId={user._id as string}
      />
    </div>
  );
}
