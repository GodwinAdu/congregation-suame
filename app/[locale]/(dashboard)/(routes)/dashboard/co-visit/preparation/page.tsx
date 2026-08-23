import { requirePermission } from '@/lib/helpers/server-permission-check'
import Heading from '@/components/commons/Header'
import { COVisitPrepClient } from './_components/COVisitPrepClient'

export default async function COVisitPreparationPage() {
    await requirePermission('coVisitView')

    return (
        <div className="space-y-6">
            <Heading
                title="CO Visit Preparation"
                description="Comprehensive summary package for the Circuit Overseer's visit"
            />
            <COVisitPrepClient />
        </div>
    )
}
