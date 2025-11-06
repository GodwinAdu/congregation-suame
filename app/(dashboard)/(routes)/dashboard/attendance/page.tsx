import Heading from '@/components/commons/Header'
import { Separator } from '@/components/ui/separator'
import { AttendanceModal } from './_components/AttendanceModal'
import AttendanceGrid from './_components/AttendanceGrid'
import { requirePermission } from '@/lib/helpers/server-permission-check'

const page = () => {

    return (
        <>
            <div className="flex justify-between items-center">
                <Heading title="Congregation Attendance" />
                <AttendanceModal />
            </div>
            <Separator />
            <div className="py-4">
               <AttendanceGrid  />
            </div>
        </>
    )
}

export default page
