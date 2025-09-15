import Heading from '@/components/commons/Header'
import { DataTable } from '@/components/table/data-table'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { fetchAllMembers } from '@/lib/actions/user.actions'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { columns } from './_components/column'

const page = async () => {
    const members = await fetchAllMembers()
    return (
        <>
            <div className="flex justify-between items-center">
                <Heading title="Manage All Members" />
                <Link href="members/create" className={cn(buttonVariants())}>
                    Create Member
                </Link>
            </div>
            <Separator />
            <div className="">
                <DataTable searchKey='fullName' data={members} columns={columns} />
            </div>
        </>
    )
}

export default page
