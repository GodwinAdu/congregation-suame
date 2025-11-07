import { fetchMemberAnalytics } from '@/lib/actions/analytics.actions'
import { MemberAnalytics } from './_components/MemberAnalytics'
import { requirePermission } from '@/lib/helpers/server-permission-check'

const MemberAnalyticsPage = async () => {
    await requirePermission('/dashboard/members/analytics')
    const analytics = await fetchMemberAnalytics()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Member Analytics</h1>
                <p className="text-muted-foreground">View congregation member statistics and details</p>
            </div>
            
            <MemberAnalytics data={analytics} />
        </div>
    )
}

export default MemberAnalyticsPage