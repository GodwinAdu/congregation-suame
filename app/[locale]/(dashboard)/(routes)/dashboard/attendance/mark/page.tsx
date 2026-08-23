import { fetchAllMembers } from '@/lib/actions/user.actions'
import { requirePermission } from '@/lib/helpers/server-permission-check'
import Heading from '@/components/commons/Header'
import { MarkAttendanceClient } from './_components/MarkAttendanceClient'

export default async function MarkAttendancePage() {
    await requirePermission('attendance')

    const members = await fetchAllMembers()

    return (
        <div className="space-y-6">
            <Heading
                title="Mark Individual Attendance"
                description="Record which members were present at a meeting for detailed tracking"
            />
            <MarkAttendanceClient members={members} />
        </div>
    )
}
