import Heading from '@/components/commons/Header'
import { Separator } from '@/components/ui/separator'
import { TransportFeeManager } from './_components/TransportFeeManager'

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