
import { TransportFeeManager } from './_components/TransportFeeManager'
import { requirePermission } from '@/lib/helpers/server-permission-check'
const page = () => {
    return (
        <>
            <div className="py-4">
                <TransportFeeManager />
            </div>
        </>
    )
}

export default page