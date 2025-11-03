import Heading from '@/components/commons/Header'
import { Separator } from '@/components/ui/separator'
import OverseerReportGrid from './_components/OverseerReportGrid'

const page = () => {
    return (
        <>
            <div className="flex justify-between items-center">
                <Heading title="Field Service Overseer Reports" />
            </div>
            <Separator />
            <div className="py-4">
                <OverseerReportGrid />
            </div>
        </>
    )
}

export default page