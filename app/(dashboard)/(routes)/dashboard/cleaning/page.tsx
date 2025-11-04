import React from 'react'
import { CleaningManager } from './_components/cleaning-manager'
import { fetchCleaningTasks, fetchInventoryItems } from '@/lib/actions/cleaning.actions'
import { fetchAllGroups } from '@/lib/actions/group.actions'

const page = async () => {
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