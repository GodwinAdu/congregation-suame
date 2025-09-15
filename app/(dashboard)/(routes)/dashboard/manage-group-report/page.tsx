import Heading from '@/components/commons/Header'
import { Separator } from '@/components/ui/separator'
import GroupGrid from './_components/GroupGrid'


const page = () => {
    return (
        <>
            <div className="flex justify-between items-center">
                <Heading title="Manage Field Service Report" />
            </div>
            <Separator />
            <div className="py-4">
                <GroupGrid />
            </div>
        </>
    )
}

export default page
