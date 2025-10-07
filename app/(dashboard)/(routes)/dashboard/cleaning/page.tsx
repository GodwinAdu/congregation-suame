import React from 'react'
import { CleaningManager } from './_components/cleaning-manager'
import { fetchCleaningTasks, fetchInventoryItems } from '@/lib/actions/cleaning.actions'
import { fetchMembers } from '@/lib/actions/assignment.actions'

const page = async () => {
    const [tasks, inventory, members] = await Promise.all([
        fetchCleaningTasks(),
        fetchInventoryItems(),
        fetchMembers()
    ])
    
    return (
        <CleaningManager 
            initialTasks={tasks}
            initialInventory={inventory}
            members={members}
        />
    )
}

export default page