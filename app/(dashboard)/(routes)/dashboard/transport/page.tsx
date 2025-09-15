import Heading from '@/components/commons/Header'
import { Separator } from '@/components/ui/separator'
import TransportGrid from './_components/TransportGrid'

const page = () => {
    return (
        <>
            <div className="flex justify-between items-center">
                <Heading title="Transport Management" />
            </div>
            <Separator />
            <div className="py-4">
                <TransportGrid />
            </div>
        </>
    )
}

export default page