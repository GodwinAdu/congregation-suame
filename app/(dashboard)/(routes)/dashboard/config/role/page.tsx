import Heading from '@/components/commons/Header'
import { Separator } from '@/components/ui/separator'
import RoleGrid from './_components/RoleGrid'

const RolePage = () => {
    return (
        <>
            <div className="flex justify-between items-center">
                <Heading title="Role Management" />
            </div>
            <Separator />
            <div className="py-4">
                <RoleGrid />
            </div>
        </>
    )
}

export default RolePage
