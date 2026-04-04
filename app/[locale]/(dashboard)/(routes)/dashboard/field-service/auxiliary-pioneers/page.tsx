import { AuxiliaryPioneersClient } from './_components/AuxiliaryPioneersClient'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AuxiliaryPioneersPage() {
  return (
    <div className="p-3 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/publisher">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Auxiliary Pioneers</h1>
          <p className="text-sm text-muted-foreground">Monthly auxiliary pioneer report</p>
        </div>
      </div>
      <AuxiliaryPioneersClient />
    </div>
  )
}
