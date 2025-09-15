import Heading from '@/components/commons/Header'
import { Separator } from '@/components/ui/separator'
import { GroupModal } from './_components/GroupModal'
import { DataTable } from '@/components/table/data-table'
import { columns } from './_components/column'
import { fetchAllGroups } from '@/lib/actions/group.actions'

const page = async () => {
    const groups = await fetchAllGroups()
    return (
        <>
            <div className="flex justify-between items-center">
                <Heading title="Manage Groups" />
                <GroupModal />
            </div>
            <Separator />
            <div className="py-4">
                <DataTable searchKey='name' data={groups} columns={columns} />
            </div>

        </>
    )
}

export default page
