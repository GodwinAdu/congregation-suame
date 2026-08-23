import { requirePermission } from '@/lib/helpers/server-permission-check'
import Heading from '@/components/commons/Header'
import { ReportReviewClient } from './_components/ReportReviewClient'

export default async function ReportReviewPage() {
    await requirePermission('fieldService')

    return (
        <div className="space-y-6">
            <Heading
                title="Report Review"
                description="Review submitted reports, detect issues, and verify field service data"
            />
            <ReportReviewClient />
        </div>
    )
}
