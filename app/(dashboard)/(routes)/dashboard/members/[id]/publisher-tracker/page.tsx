import { fetchMemberReports } from '@/lib/actions/field-service.actions';
import { PublisherRecordTracker } from '../../_components/publisher-record-tracker';
import { redirect } from 'next/navigation';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function PublisherTrackerPage({ params }: PageProps) {
    try {
        const { id } = await params
        const { member, reports } = await fetchMemberReports(id);

        return (
            <PublisherRecordTracker
                member={member}
                reports={reports}
            />
        );
    } catch (error) {
        console.error('Error fetching member data:', error);
        redirect('/dashboard/members');
    }
}