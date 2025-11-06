import React from 'react'
import { CleaningManager } from './_components/cleaning-manager'
import { fetchCleaningTasks, fetchInventoryItems } from '@/lib/actions/cleaning.actions'
import { fetchAllGroups } from '@/lib/actions/group.actions'
import { requirePermission } from '@/lib/helpers/server-permission-check'

const page = async () => {
    await requirePermission('/dashboard/cleaning')
    const [tasks, inventory, groups] = await Promise.all([
        fetchCleaningTasks(),
        fetchInventoryItems(),
        fetchAllGroups()
    ])
    
    return (
        <CleaningManager 
            initialTasks={tasks}
            initialInventory={inventory}
            groups={groups}
        />
    )
}

export default page