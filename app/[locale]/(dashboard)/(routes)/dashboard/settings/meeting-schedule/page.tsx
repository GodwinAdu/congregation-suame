import { requirePermission } from '@/lib/helpers/server-permission-check'
import Heading from '@/components/commons/Header'
import { MeetingScheduleSettings } from './_components/MeetingScheduleSettings'

export default async function MeetingSchedulePage() {
    await requirePermission('config')

    return (
        <div className="space-y-6">
            <Heading
                title="Meeting Schedule"
                description="Configure meeting days, times, and late attendance grace period"
            />
            <MeetingScheduleSettings />
        </div>
    )
}
