"use server"

import { User, withAuth } from "../helpers/auth"
import FieldServiceReport from "../models/field-service.models"
import Attendance from "../models/attendance.models"
import { MemberFeePayment } from "../models/transport-fee.models"
import Activity from "../models/activity.models"
import Assignment from "../models/assignment.models"
import { connectToDB } from "../mongoose"
import { logActivity } from "../utils/activity-logger"
import { revalidatePath } from "next/cache"

async function _fetchPublisherData(user: User) {
    try {
        if (!user) throw new Error("User not authorized")

        await connectToDB()

        const currentYear = new Date().getFullYear()
        const currentMonth = new Date().getMonth() + 1

        const [
            fieldServiceReports,
            attendanceRecords,
            transportPayments,
            recentActivities,
            myAssignments,
            upcomingAssignments
        ] = await Promise.all([
            FieldServiceReport.find({ publisher: user._id }).sort({ createdAt: -1 }).lean(),
            Attendance.find({}).lean(),
            MemberFeePayment.find({ memberId: user._id }).populate('feeId', 'name amount').lean(),
            Activity.find({ userId: user._id }).sort({ createdAt: -1 }).limit(10).lean(),
            Assignment.find({ 
                $or: [{ assignedTo: user._id }, { assistant: user._id }] 
            }).sort({ week: -1 }).limit(20).lean(),
            Assignment.find({ 
                $or: [{ assignedTo: user._id }, { assistant: user._id }],
                week: { $gte: new Date().toISOString().split('T')[0] }
            }).sort({ week: 1 }).limit(5).lean()
        ])

        // Calculate statistics
        const totalHours = fieldServiceReports.reduce((sum, report) => sum + (report.hours || 0), 0)
        const totalStudies = fieldServiceReports.reduce((sum, report) => sum + (report.bibleStudents || 0), 0)
        const thisMonthReport = fieldServiceReports.find(report => 
            report.month === `${currentYear}-${currentMonth.toString().padStart(2, '0')}`
        )

        // Transport status
        const activeTransport = transportPayments.filter(payment => payment.isJoined)
        const totalTransportPaid = transportPayments.reduce((sum, payment) => sum + (payment.amountPaid || 0), 0)

        // Calculate attendance statistics
        const totalMeetings = attendanceRecords.length
        const totalAttendanceCount = attendanceRecords.reduce((sum, record) => sum + (record.attendanceCount || 0), 0)
        const averageAttendance = totalMeetings > 0 ? Math.round(totalAttendanceCount / totalMeetings) : 0

        return JSON.parse(JSON.stringify({
            reports: fieldServiceReports,
            statistics: {
                totalReports: fieldServiceReports.length,
                totalHours,
                totalStudies,
                averageHours: fieldServiceReports.length > 0 ? Math.round(totalHours / fieldServiceReports.length) : 0
            },
            thisMonth: {
                hasReport: !!thisMonthReport,
                report: thisMonthReport,
                month: `${currentYear}-${currentMonth.toString().padStart(2, '0')}`
            },
            transport: {
                active: activeTransport,
                totalPaid: totalTransportPaid,
                participating: activeTransport.length > 0
            },
            assignments: {
                all: myAssignments,
                upcoming: upcomingAssignments,
                total: myAssignments.length
            },
            attendance: {
                totalMeetings,
                averageAttendance,
                weeklyMeetings: attendanceRecords.filter(r => r.meetingType === 'midweek').length,
                weekendMeetings: attendanceRecords.filter(r => r.meetingType === 'weekend').length
            },
            activities: recentActivities
        }))
    } catch (error) {
        console.error("Error fetching publisher data:", error)
        throw error
    }
}

async function _submitFieldServiceReport(user: User, data: {
    month: string
    hours?: number
    bibleStudents: number
    auxiliaryPioneer?: boolean
    check?: boolean
    comments?: string
}) {
    try {
        if (!user) throw new Error("User not authorized")

        await connectToDB()

        const existingReport = await FieldServiceReport.findOne({
            publisher: user._id,
            month: data.month
        })

        let report
        if (existingReport) {
            report = await FieldServiceReport.findByIdAndUpdate(
                existingReport._id,
                { ...data },
                { new: true, runValidators: false }
            )
        } else {
            report = new FieldServiceReport({
                ...data,
                publisher: user._id
            })
            await report.save()
        }

        await logActivity({
            userId: user._id as string,
            type: 'report_submit',
            action: `${user.fullName} submitted field service report for ${data.month}`,
            details: { entityId: report._id, entityType: 'FieldServiceReport' }
        })

        revalidatePath('/dashboard/publisher')
        return JSON.parse(JSON.stringify(report))
    } catch (error) {
        console.error("Error submitting field service report:", error)
        throw error
    }
}

export const fetchPublisherData = await withAuth(_fetchPublisherData)
export const submitFieldServiceReport = await withAuth(_submitFieldServiceReport)