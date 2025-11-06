import React from 'react'
import FamilyGrid from './_components/FamilyGrid'
import { requirePermission } from '@/lib/helpers/server-permission-check'

const FamiliesPage = () => {
    return (
        <div className="p-6">
            <FamilyGrid />
        </div>
    )
}

export default FamiliesPage