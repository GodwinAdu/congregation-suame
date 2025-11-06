import React from 'react'
import Heading from '@/components/commons/Header'
import { Separator } from '@/components/ui/separator'
import PublicWitnessingGrid from './_components/PublicWitnessingGrid'
import { requirePermission } from '@/lib/helpers/server-permission-check'

const PublicWitnessingPage = () => {
  return (
    <>
      <Heading title="Public Witnessing Scheduler" />
      <Separator />
      <div className="py-4">
        <PublicWitnessingGrid />
      </div>
    </>
  )
}

export default PublicWitnessingPage