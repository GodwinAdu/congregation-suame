import Heading from '@/components/commons/Header'
import { Separator } from '@/components/ui/separator'
import { getUserGroup } from '@/lib/actions/group.actions'
import GroupRegistrationForm from '../_components/group-create-form'

const page = async () => {
    const group = await getUserGroup()
    return (
        <>
            <div className="flex justify-between items-center">
                <Heading title="New Group Member" />
            </div>
            <Separator />
            <div className="">
                <GroupRegistrationForm group={group} />
            </div>

        </>
    )
}

export default page
