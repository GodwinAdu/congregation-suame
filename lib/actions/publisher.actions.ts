"use server"

import { User, withAuth } from "../helpers/auth"
import FieldServiceReport from "../models/field-service.models"
import Attendance from "../models/attendance.models"
import { MemberFeePayment } from "../models/transport-fee.models"
import Activity from "../models/activity.models"
import Assignment from "../models/assignment.models"
import GroupSchedule from "../models/group-schedule.models"
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
            upcomingAssignments,
            groupSchedules
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
            }).sort({ week: 1 }).limit(5).lean(),
            GroupSchedule.find({ groupId: user.groupId }).sort({ createdAt: -1 }).limit(12).lean()
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
            activities: recentActivities,
            groupSchedules: groupSchedules
        }))
    } catch (error) {
        console.error("Error fetching publisher data:", error)
        throw error
    }
}

async function _submitFieldServiceReport(user: User, data: {
    month: string
    hours?: number
    bibleStudies: number
    auxiliaryPioneer?: boolean
    check?: boolean
    comments?: string
}) {
    try {
        if (!user) throw new Error("User not authorized")

        await connectToDB()
        
        // Check if user can record hours (has pioneer privilege or auxiliary pioneer checked)
        const Member = (await import('../models/user.models')).default
        
        const member = await Member.findById(user._id).populate('privileges')
        const hasPioneerPrivilege = member.privileges.some((p: any) => 
            p.name === 'Pioneer' || p.name === 'Regular Pioneer' || p.name === 'Auxiliary Pioneer'
        )
        
        // Only allow hours if user has pioneer privilege or checked auxiliary pioneer
        if (data.hours && !hasPioneerPrivilege && !data.auxiliaryPioneer) {
            throw new Error("Only pioneers can record hours. Check 'Auxiliary Pioneer' if you served as one this month.")
        }
        
        // Check editing restrictions - can edit previous month report until 10th of current month
        const currentDate = new Date()
        const currentDay = currentDate.getDate()
        const reportMonth = new Date(data.month + '-01')
        const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
        
        const existingReport = await FieldServiceReport.findOne({
            publisher: user._id,
            month: data.month
        })
        
        // Allow editing if:
        // 1. It's the previous month report and we're before 10th of current month
        // 2. It's the current month report (always editable)
        const isPreviousMonth = reportMonth.getTime() === previousMonth.getTime()
        const isCurrentMonth = reportMonth.getTime() === currentMonth.getTime()
        
        if (existingReport && !isCurrentMonth && !isPreviousMonth) {
            throw new Error("Only current and previous month reports can be edited")
        }
        
        if (existingReport && isPreviousMonth && currentDay > 10) {
            throw new Error("Previous month reports can only be edited until the 10th of the current month")
        }

        let report
        if (existingReport) {
            report = await FieldServiceReport.findByIdAndUpdate(
                existingReport._id,
                { 
                    ...data,
                    bibleStudents: data.bibleStudies,
                    hours: (hasPioneerPrivilege || data.auxiliaryPioneer) ? data.hours : undefined
                },
                { new: true, runValidators: false }
            )
        } else {
            report = new FieldServiceReport({
                ...data,
                bibleStudents: data.bibleStudies,
                publisher: user._id,
                hours: (hasPioneerPrivilege || data.auxiliaryPioneer) ? data.hours : undefined
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

async function _fetchFamilyMemberReports(user: User, memberId: string) {
    try {
        if (!user) throw new Error("User not authorized")
        if (!user.isFamilyHead) throw new Error("Only family heads can view family member reports")

        await connectToDB()

        const reports = await FieldServiceReport.find({ publisher: memberId })
            .sort({ month: -1 })
            .limit(12)
            .lean()

        return JSON.parse(JSON.stringify(reports))
    } catch (error) {
        console.error("Error fetching family member reports:", error)
        throw error
    }
}

async function _checkReportingPermissions(user: User) {
    try {
        if (!user) throw new Error("User not authorized")

        await connectToDB()
        
        const Member = (await import('../models/user.models')).default
        const member = await Member.findById(user._id).populate('privileges')
        
        const hasPioneerPrivilege = member.privileges.some((p: any) => 
            p.name === 'Pioneer' || p.name === 'Regular Pioneer' || p.name === 'Auxiliary Pioneer'
        )
        
        // Check editing permissions
        const currentDate = new Date()
        const currentDay = currentDate.getDate()
        const canEditPreviousMonth = currentDay <= 10
        
        return {
            canRecordHours: hasPioneerPrivilege,
            canEditPreviousMonth,
            hasPioneerPrivilege
        }
    } catch (error) {
        console.error("Error checking reporting permissions:", error)
        throw error
    }
}

async function _deleteFieldServiceReport(user: User, reportId: string) {
    try {
        if (!user) throw new Error("User not authorized")

        await connectToDB()
        
        const report = await FieldServiceReport.findById(reportId)
        if (!report) {
            throw new Error("Report not found")
        }
        
        // Check if user owns the report
        if (report.publisher.toString() !== user._id?.toString()) {
            throw new Error("You can only delete your own reports")
        }
        
        // Check deletion restrictions - same as editing
        const currentDate = new Date()
        const currentDay = currentDate.getDate()
        const reportMonth = new Date(report.month + '-01')
        const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
        
        const isPreviousMonth = reportMonth.getTime() === previousMonth.getTime()
        const isCurrentMonth = reportMonth.getTime() === currentMonth.getTime()
        
        if (!isCurrentMonth && !isPreviousMonth) {
            throw new Error("Only current and previous month reports can be deleted")
        }
        
        if (isPreviousMonth && currentDay > 10) {
            throw new Error("Previous month reports can only be deleted until the 10th of the current month")
        }
        
        await FieldServiceReport.findByIdAndDelete(reportId)
        
        await logActivity({
            userId: user._id as string,
            type: 'report_delete',
            action: `${user.fullName} deleted field service report for ${report.month}`,
            details: { entityId: reportId, entityType: 'FieldServiceReport' }
        })
        
        revalidatePath('/dashboard/publisher')
        return { success: true }
    } catch (error) {
        console.error("Error deleting field service report:", error)
        throw error
    }
}

export const fetchPublisherData = await withAuth(_fetchPublisherData)
export const submitFieldServiceReport = await withAuth(_submitFieldServiceReport)
export const fetchFamilyMemberReports = await withAuth(_fetchFamilyMemberReports)
export const checkReportingPermissions = await withAuth(_checkReportingPermissions)
export const deleteFieldServiceReport = await withAuth(_deleteFieldServiceReport)