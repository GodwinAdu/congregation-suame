import { fetchGroupById } from '@/lib/actions/group.actions'
import { EditGroupForm } from './_components/EditGroupForm'
import { notFound } from 'next/navigation'

interface EditGroupPageProps {
    params: Promise<{ id: string }>
}

const EditGroupPage = async ({ params }: EditGroupPageProps) => {
    const { id } = await params
    
    try {
        const group = await fetchGroupById(id)

        if (!group) {
            notFound()
        }

        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Edit Group</h1>
                    <p className="text-muted-foreground">Update group information</p>
                </div>
                
                <EditGroupForm group={group} />
            </div>
        )
    } catch (error) {
        notFound()
    }
}

export default EditGroupPage