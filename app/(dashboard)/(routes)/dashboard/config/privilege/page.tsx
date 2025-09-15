import Heading from '@/components/commons/Header'
import { Separator } from '@/components/ui/separator'
import { DataTable } from '@/components/table/data-table'
import { columns } from './_components/column'
import { PrivilegeModal } from './_components/PrivilegeModal'
import { fetchAllPrivileges } from '@/lib/actions/privilege.actions'

const page = async () => {
    const privileges = await fetchAllPrivileges()
    return (
        <>
            <div className="flex justify-between items-center">
                <Heading title="Manage Privileges" />
                <PrivilegeModal />
            </div>
            <Separator />
            <div className="py-4">
                <DataTable searchKey='name' data={privileges} columns={columns} />
            </div>

        </>
    )
}

export default page
