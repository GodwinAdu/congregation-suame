import Heading from '@/components/commons/Header'
import { Separator } from '@/components/ui/separator'
import { requirePermission } from '@/lib/helpers/server-permission-check'
import FieldServiceHelpClient from './_components/FieldServiceHelpClient'

const page = async () => {
    await requirePermission('manageAllReport')
    return (
        <>
            <div className="flex justify-between items-center">
                <Heading title="Field Service Help Needed" />
            </div>
            <Separator />
            <div className="py-4">
                <FieldServiceHelpClient />
            </div>
        </>
    )
}

export default page
