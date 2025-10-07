import React from 'react'
import { AssignmentManager } from './_components/assignment-manager'
import { fetchAssignmentsByWeek, fetchMembers } from '@/lib/actions/assignment.actions'

interface PageProps {
    searchParams: Promise<{ week?: string }>
}

const page = async ({ searchParams }: PageProps) => {
    // Get current week (Monday)
    const today = new Date()
    const monday = new Date(today)
    monday.setDate(today.getDate() - today.getDay() + 1)
    const defaultWeek = monday.toISOString().split('T')[0]

    const params = await searchParams
    const selectedWeek = params.week || defaultWeek

    const [assignments, members] = await Promise.all([
        fetchAssignmentsByWeek(selectedWeek),
        fetchMembers()
    ])

    return (
        <AssignmentManager
            initialAssignments={assignments}
            members={members}
            currentWeek={selectedWeek}
        />
    )
}

export default page