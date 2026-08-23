import { requirePermission } from '@/lib/helpers/server-permission-check'
import Heading from '@/components/commons/Header'
import { ActivityLogClient } from './_components/ActivityLogClient'

export default async function ActivityLogPage() {
    await requirePermission('manageBackups')

    return (
        <div className="space-y-6">
            <Heading
                title="Activity Log"
                description="View all actions performed in the system — who did what and when"
            />
            <ActivityLogClient />
        </div>
    )
}
