import Heading from '@/components/commons/Header'
import { Separator } from '@/components/ui/separator'
import UserRegistrationForm from '../_components/member-create-form'
import { fetchAllGroups } from '@/lib/actions/group.actions'
import { getAllRoles } from '@/lib/actions/role.actions'
import { fetchAllPrivileges } from '@/lib/actions/privilege.actions'
import { fetchAllMembers } from '@/lib/actions/user.actions'

const page =  async () => {
    const [roles,groups,privileges,members] = await Promise.all([
        getAllRoles(),
        fetchAllGroups(),
        fetchAllPrivileges(),
        fetchAllMembers()
    ])
    return (
        <>
            <div className="flex justify-between items-center">
                <Heading title="New Member" />
            </div>
            <Separator />
            <div className="">
                <UserRegistrationForm roles={roles} groups={groups} privileges={privileges} members={members} />
            </div>

        </>
    )
}

export default page
