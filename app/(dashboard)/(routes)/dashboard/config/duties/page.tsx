import Heading from '@/components/commons/Header'
import { Separator } from '@/components/ui/separator'
import DutyManagement from './_components/DutyManagement'

const page = () => {
    return (
        <>
            <div className="flex justify-between items-center">
                <Heading title="Congregation Duties Management" />
            </div>
            <Separator />
            <div className="py-4">
                <DutyManagement />
            </div>
        </>
    )
}

export default page