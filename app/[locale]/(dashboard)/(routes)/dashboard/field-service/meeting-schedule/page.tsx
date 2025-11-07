import React from 'react'
import MeetingScheduleGrid from './_components/MeetingScheduleGrid'
import { requirePermission } from '@/lib/helpers/server-permission-check'

const MeetingSchedulePage = () => {
    return (
        <div className="p-6">
            <MeetingScheduleGrid />
        </div>
    )
}

export default MeetingSchedulePage