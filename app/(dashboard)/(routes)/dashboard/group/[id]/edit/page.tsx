import { fetchUserById } from '@/lib/actions/user.actions'
import { GroupEditMemberForm } from './_components/GroupEditMemberForm'
import { notFound } from 'next/navigation'

interface EditMemberPageProps {
    params: Promise<{ id: string }>
}

const EditMemberPage = async ({ params }: EditMemberPageProps) => {
    const { id } = await params
    
    try {
        const member = await fetchUserById(id)

        if (!member) {
            notFound()
        }

        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Edit Group Member</h1>
                    <p className="text-muted-foreground">Update member personal information</p>
                </div>
                
                <GroupEditMemberForm member={member} />
            </div>
        )
    } catch (error) {
        notFound()
    }
}

export default EditMemberPage