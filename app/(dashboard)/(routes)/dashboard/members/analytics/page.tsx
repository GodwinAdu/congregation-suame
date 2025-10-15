import { fetchMemberAnalytics } from '@/lib/actions/analytics.actions'
import { MemberAnalytics } from './_components/MemberAnalytics'

const MemberAnalyticsPage = async () => {
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