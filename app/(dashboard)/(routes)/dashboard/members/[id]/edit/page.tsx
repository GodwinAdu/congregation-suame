import { fetchUserById, fetchAllMembers } from '@/lib/actions/user.actions'
import { fetchAllGroups } from '@/lib/actions/group.actions'
import { fetchAllPrivileges } from '@/lib/actions/privilege.actions'
import { EditMemberForm } from './_components/EditMemberForm'
import { notFound } from 'next/navigation'

interface EditMemberPageProps {
    params: Promise<{ id: string }>
}

const EditMemberPage = async ({ params }: EditMemberPageProps) => {
    const { id } = await params
    
    try {
        const [member, groups, privileges, members] = await Promise.all([
            fetchUserById(id),
            fetchAllGroups(),
            fetchAllPrivileges(),
            fetchAllMembers()
        ])

        if (!member) {
            notFound()
        }

        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Edit Member</h1>
                    <p className="text-muted-foreground">Update member information</p>
                </div>
                
                <EditMemberForm 
                    member={member}
                    groups={groups}
                    privileges={privileges}
                    members={members}
                />
            </div>
        )
    } catch (error) {
        notFound()
    }
}

export default EditMemberPage