import OverseerAnalyticsGrid from './_components/OverseerAnalyticsGrid'
import { requirePermission } from '@/lib/helpers/server-permission-check'

export default function OverseerAnalyticsPage() {
    return (
        <div className="p-6">
            <OverseerAnalyticsGrid />
        </div>
    )
}