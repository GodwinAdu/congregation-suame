import Heading from '@/components/commons/Header'
import { DataTable } from '@/components/table/data-table'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { fetchAllMembersByRole } from '@/lib/actions/user.actions'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { columns } from './_components/column'
import { getUserGroup } from '@/lib/actions/group.actions'



const page = async () => {
    const [members,userRole] = await Promise.all([
        fetchAllMembersByRole(),
        getUserGroup()
    ])
    return (
        <>
            <div className="flex justify-between items-center">
                <Heading title={`Manage All ${userRole.name} Members`} />
                <Link href="group/create" className={cn(buttonVariants())}>
                    Create Member
                </Link>
            </div>
            <Separator />
            <div className="">
                <DataTable searchKey='name' data={members} columns={columns} />
            </div>
        </>
    )
}

export default page
