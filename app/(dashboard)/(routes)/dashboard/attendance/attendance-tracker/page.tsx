import React from 'react'
import { MeetingAttendanceTracker } from '../_components/meeting-attendane-tracker'
import { fetchAttendanceByServiceYear } from '@/lib/actions/attendance.actions'

interface PageProps {
    searchParams: Promise<{ year?: string }>
}

const page = async ({ searchParams }: PageProps) => {
    const params = await searchParams
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const defaultServiceYear = currentMonth >= 8 ? currentDate.getFullYear() : currentDate.getFullYear() - 1
    const serviceYear = params.year ? parseInt(params.year) : defaultServiceYear

    const attendanceData = await fetchAttendanceByServiceYear(serviceYear)

    return (
        <MeetingAttendanceTracker initialData={attendanceData} currentYear={serviceYear} />
    )
}

export default page