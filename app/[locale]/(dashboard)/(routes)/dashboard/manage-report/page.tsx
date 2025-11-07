import Heading from '@/components/commons/Header'
import { Separator } from '@/components/ui/separator'
import ReportGrid from './_components/ReportGrid'
import { requirePermission } from '@/lib/helpers/server-permission-check'

const page = () => {
    return (
        <>
            <div className="flex justify-between items-center">
                <Heading title="Manage Field Service Report" />
            </div>
            <Separator />
            <div className="py-4">
                <ReportGrid />
            </div>
        </>
    )
}

export default page
