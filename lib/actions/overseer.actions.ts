"use server"

import { revalidatePath } from "next/cache"
import { withAuth } from "../helpers/auth"
import { connectToDB } from "../mongoose"
import { logActivity } from "../utils/activity-logger"
import OverseerReport from "../models/overseer-report.models"
import GroupSchedule from "../models/group-schedule.models"
import Member from "../models/user.models"
import Group from "../models/group.models"
import FieldServiceReport from "../models/field-service.models"

// Get all groups for overseer
export const getAllGroups = await withAuth(async (user) => {
    try {
        await connectToDB()

        const groups = await Group.find({})
            .select('name')
            .sort({ name: 1 })
            .lean()

        return {
            success: true,
            groups: groups.map(group => ({
                _id: group._id.toString(),
                name: group.name
            }))
        }
    } catch (error) {
        console.error('Error fetching groups:', error)
        throw new Error("Failed to fetch groups")
    }
})

// Get group members for overseer report
export const getGroupMembers = await withAuth(async (user, groupId: string, month: string) => {
    try {
        await connectToDB()

        // Verify group exists
        const group = await Group.findById(groupId)
        if (!group) {
            throw new Error("Group not found")
        }

        // Get group members
        const members = await Member.find({ groupId })
            .select('fullName')
            .sort({ fullName: 1 })
            .lean()

        // Get field service reports for this month
        const memberIds = members.map(m => m._id)
        const fieldServiceReports = await FieldServiceReport.find({
            publisher: { $in: memberIds },
            month: month
        }).lean()

        const reportMap = new Map(fieldServiceReports.map(r => [r.publisher.toString(), r]))

        // Combine member data with field service info
        const membersWithReports = members.map(member => {
            const fieldReport = reportMap.get(member._id.toString())
            return {
                id: member._id.toString(),
                name: member.fullName,
                present: false, // Default values for overseer to fill
                hasStudy: fieldReport?.bibleStudents > 0 || false,
                participatesInMinistry: fieldReport?.hours > 0 || false,
                fieldServiceHours: fieldReport?.hours || 0,
                submittedReport: !!fieldReport
            }
        })

        return {
            success: true,
            groupName: group.name,
            members: membersWithReports
        }
    } catch (error) {
        console.error('Error fetching group members:', error)
        throw new Error("Failed to fetch group members")
    }
})

// Overseer Report Schema
interface OverseerReportData {
    groupId: string
    month: string
    visitDate: string
    meetingAttendance: string
    fieldServiceParticipation: string
    generalObservations: string
    encouragement: string
    recommendations: string
    followUpNeeded: boolean
    followUpNotes?: string
    members: Array<{
        id: string
        name: string
        present: boolean
        hasStudy: boolean
        participatesInMinistry: boolean
        fieldServiceHours?: number
        submittedReport?: boolean
    }>
}

// Group Schedule Schema
interface GroupScheduleData {
    groupId: string
    month: string
    scheduledDate: string
    status: 'scheduled' | 'completed' | 'pending'
}

export const submitOverseerReport = await withAuth(async (user, reportData: OverseerReportData) => {
    if (!user) throw new Error('User not authenticated')
    try {
        await connectToDB();

        // Validate required fields
        if (!reportData.groupId || !reportData.month || !reportData.visitDate) {
            throw new Error("Group, month, and visit date are required")
        }

        // Verify group exists
        const group = await Group.findById(reportData.groupId)
        if (!group) {
            throw new Error("Group not found")
        }

        // Check if report already exists for this group and month
        // const existingReport = await OverseerReport.findOne({
        //     groupId: reportData.groupId,
        //     month: reportData.month
        // })

        // if (existingReport) {
        //     throw new Error("Report already exists for this group and month")
        // }

        // Get group members and their field service data
        const groupMembers = await Member.find({ groupId: reportData.groupId })
            .select('fullName')
            .lean()

        // Get field service reports for this month for group members
        const memberIds = groupMembers.map(m => m._id)
        const fieldServiceReports = await FieldServiceReport.find({
            publisher: { $in: memberIds },
            month: reportData.month
        }).lean()

        const reportMap = new Map(fieldServiceReports.map(r => [r.publisher.toString(), r]))

        // Enhance member data with field service info
        const enhancedMembers = reportData.members.map(member => {
            const fieldReport = reportMap.get(member.id)
            return {
                ...member,
                fieldServiceHours: fieldReport?.hours || 0,
                submittedReport: !!fieldReport
            }
        })

        // Create the report
        const newReport = new OverseerReport({
            ...reportData,
            members: enhancedMembers,
            overseerUserId: user._id,
            overseerName: user.fullName
        })

        const result = await newReport.save()

        // Update group schedule status to completed
        await GroupSchedule.findOneAndUpdate(
            { groupId: reportData.groupId, month: reportData.month },
            {
                status: 'completed',
                completedDate: reportData.visitDate,
                overseerUserId: user._id,
                overseerName: user.fullName
            },
            { upsert: true }
        )

        // Log activity
        await logActivity({
            userId: user._id as string,
            type: 'overseer_report',
            action: `Submitted overseer report for ${group.name} - ${reportData.month}`,
            details: { entityId: result._id, entityType: 'OverseerReport', metadata: { groupName: group.name } },
        })

        revalidatePath('/dashboard/overseer-report')

        return {
            success: true,
            message: "Overseer report submitted successfully",
            reportId: result._id
        }
    } catch (error) {
        console.error('Error submitting overseer report:', error)

        // Log failed activity
        await logActivity({
            userId: user._id as string,
            type: 'overseer_report',
            action: `Failed to submit overseer report: ${error instanceof Error ? error.message : 'Unknown error'}`,
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
        })

        throw new Error(error instanceof Error ? error.message : "Failed to submit overseer report")
    }
})

export const updateOverseerReport = await withAuth(async (user, reportId: string, reportData: OverseerReportData) => {
    if (!user) throw new Error('User not authenticated')
    try {
        await connectToDB()

        // Find existing report
        const existingReport = await OverseerReport.findById(reportId)
        if (!existingReport) {
            throw new Error("Report not found")
        }

        // Check if user owns this report
        if (existingReport.overseerUserId.toString() !== user._id.toString()) {
            throw new Error("Unauthorized to update this report")
        }

        // Update the report
        const updatedReport = await OverseerReport.findByIdAndUpdate(
            reportId,
            { ...reportData, overseerUserId: user._id, overseerName: user.fullName },
            { new: true }
        )

        // Log activity
        await logActivity({
            userId: user._id as string,
            type: 'overseer_report',
            action: `Updated overseer report for ${reportData.month}`,
            details: { entityId: reportId, entityType: 'OverseerReport' },
        })

        revalidatePath('/dashboard/overseer-report')

        return {
            success: true,
            message: "Overseer report updated successfully",
            report: updatedReport
        }
    } catch (error) {
        console.error('Error updating overseer report:', error)
        throw new Error(error instanceof Error ? error.message : "Failed to update overseer report")
    }
})

export const deleteOverseerReport = await withAuth(async (user, reportId: string) => {
    if (!user) throw new Error('User not authenticated')
    try {
        await connectToDB()

        // Find existing report
        const existingReport = await OverseerReport.findById(reportId)
        if (!existingReport) {
            throw new Error("Report not found")
        }

        // Check if user owns this report
        if (existingReport.overseerUserId.toString() !== user._id.toString()) {
            throw new Error("Unauthorized to delete this report")
        }

        // Delete the report
        await OverseerReport.findByIdAndDelete(reportId)

        // Update group schedule status back to scheduled
        await GroupSchedule.findOneAndUpdate(
            { groupId: existingReport.groupId, month: existingReport.month },
            { status: 'scheduled', $unset: { completedDate: 1 } }
        )

        // Log activity
        await logActivity({
            userId: user._id as string,
            type: 'overseer_report',
            action: `Deleted overseer report for ${existingReport.month}`,
            details: { entityId: reportId, entityType: 'OverseerReport' },
        })

        revalidatePath('/dashboard/overseer-report')

        return {
            success: true,
            message: "Overseer report deleted successfully"
        }
    } catch (error) {
        console.error('Error deleting overseer report:', error)
        throw new Error(error instanceof Error ? error.message : "Failed to delete overseer report")
    }
})

export const getOverseerReport = await withAuth(async (user, reportId: string) => {
    try {
        await connectToDB()

        const report = await OverseerReport.findById(reportId).lean()
        if (!report) {
            throw new Error("Report not found")
        }

        // Check if user owns this report
        if (report.overseerUserId.toString() !== user._id.toString()) {
            throw new Error("Unauthorized to view this report")
        }

        // Get group name
        const group = await Group.findById(report.groupId).lean()
        
        return {
            success: true,
            report: {
                ...report,
                _id: report._id.toString(),
                groupName: group?.name || 'Unknown Group'
            }
        }
    } catch (error) {
        console.error('Error fetching overseer report:', error)
        throw new Error(error instanceof Error ? error.message : "Failed to fetch overseer report")
    }
})

export const updateGroupSchedule = await withAuth(async (user, schedules: GroupScheduleData[]) => {
    try {
        await connectToDB()

        console.log('Received schedules to update:', schedules) // Debug log

        // Validate schedules
        if (!schedules || schedules.length === 0) {
            throw new Error("No schedules provided")
        }

        // Verify all groups exist
        const groupIds = schedules.map(s => s.groupId)
        const groups = await Group.find({ _id: { $in: groupIds } }).lean()
        const groupMap = new Map(groups.map(g => [g._id.toString(), g.name]))

        console.log('Found groups:', groupMap) // Debug log

        // Update each schedule
        const updatePromises = schedules.map(async (schedule) => {
            if (!groupMap.has(schedule.groupId)) {
                throw new Error(`Group not found: ${schedule.groupId}`)
            }

            console.log('Updating schedule:', schedule) // Debug log

            return GroupSchedule.findOneAndUpdate(
                {
                    groupId: schedule.groupId,
                    month: schedule.month,
                    scheduledDate: new Date(schedule.scheduledDate)
                },
                {
                    ...schedule,
                    scheduledDate: new Date(schedule.scheduledDate),
                    overseerUserId: user._id,
                    overseerName: user.fullName
                },
                { upsert: true, new: true }
            )
        })

        const results = await Promise.all(updatePromises)
        console.log('Update results:', results) // Debug log

        // Log activity with group names
        const groupNames = schedules.map(s => groupMap.get(s.groupId)).join(', ')
        await logActivity({
            userId: user._id as string,
            type: 'group_schedule',
            action: `Updated group visit schedules for ${schedules.length} groups: ${groupNames}`,
            details: { schedulesCount: schedules.length, groups: groupNames },
        })

        revalidatePath('/dashboard/overseer-report')

        return {
            success: true,
            message: "Group schedules updated successfully"
        }
    } catch (error) {
        console.error('Error updating group schedules:', error)

        // Log failed activity
        await logActivity({
            userId: user._id as string,
            type: 'group_schedule',
            action: `Failed to update group schedules: ${error instanceof Error ? error.message : 'Unknown error'}`,
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
        })

        throw new Error(error instanceof Error ? error.message : "Failed to update group schedules")
    }
})

export const deleteGroupScheduleById = await withAuth(async (user, scheduleId: string) => {
    try {
        await connectToDB()
        console.log(`Attempting to delete schedule with ID: ${scheduleId}`)

        // Find and delete the schedule by ID - only allow creator to delete
        const deletedSchedule = await GroupSchedule.findOneAndDelete({
            _id: scheduleId,
            overseerUserId: user._id
        })
        console.log('Deleted schedule:', deletedSchedule)

        if (!deletedSchedule) {
            throw new Error("Schedule not found or unauthorized")
        }

        // Get group name for logging
        const group = await Group.findById(deletedSchedule.groupId).lean()
        
        // Log activity
        await logActivity({
            userId: user._id as string,
            type: 'group_schedule',
            action: `Deleted group visit schedule for ${group?.name || 'Unknown Group'} - ${deletedSchedule.month}`,
            details: { groupId: deletedSchedule.groupId, month: deletedSchedule.month },
        })

        revalidatePath('/dashboard/overseer-report')

        return {
            success: true,
            message: "Schedule deleted successfully"
        }
    } catch (error) {
        console.error('Error deleting group schedule:', error)
        throw new Error(error instanceof Error ? error.message : "Failed to delete schedule")
    }
})

export const getOverseerReportsForGrid = await withAuth(async (user, month?: string) => {
    try {
        if (!user) {
            throw new Error("Unauthorized: User is not an overseer")
        }
        await connectToDB()

        const currentMonth = month || new Date().toISOString().slice(0, 7)

        // Get scheduled groups for the month
        const schedules = await GroupSchedule.find({
            overseerUserId: user._id,
            month: currentMonth
        }).lean()

        // Get group names for scheduled groups
        const groupIds = schedules.map(s => s.groupId)
        const groups = await Group.find({ _id: { $in: groupIds } }).lean()
        const groupMap = new Map(groups.map(g => [g._id.toString(), g.name]))

        // Get existing reports for scheduled groups
        const reports = await OverseerReport.find({
            overseerUserId: user._id,
            month: currentMonth,
            groupId: { $in: groupIds }
        }).lean()

        const reportMap = new Map(reports.map(r => [r.groupId, r]))

        // Create data for scheduled groups only
        const reportsData = schedules.map((schedule, index) => {
            // Check if there's a report for this specific schedule date
            const report = reports.find(r =>
                r.groupId === schedule.groupId &&
                r.visitDate &&
                new Date(r.visitDate).toDateString() === new Date(schedule.scheduledDate).toDateString()
            )
            const groupName = groupMap.get(schedule.groupId) || 'Unknown Group'

            if (report) {
                return {
                    _id: report._id.toString(),
                    groupName,
                    month: report.month,
                    visitDate: report.visitDate,
                    status: 'completed' as const,
                    presentCount: report.members?.filter(m => m.present).length || 0,
                    totalMembers: report.members?.length || 0,
                    studyCount: report.members?.filter(m => m.hasStudy).length || 0,
                    ministryActive: report.members?.filter(m => m.participatesInMinistry).length || 0,
                    followUpNeeded: report.followUpNeeded || false,
                    createdAt: report.createdAt,
                    scheduledDate: schedule.scheduledDate
                }
            } else {
                return {
                    _id: `scheduled-${schedule._id}-${schedule.groupId}-${schedule.month}-${index}`,
                    groupName,
                    month: schedule.month,
                    visitDate: '',
                    status: schedule.status as 'scheduled' | 'pending',
                    presentCount: 0,
                    totalMembers: 0,
                    studyCount: 0,
                    ministryActive: 0,
                    followUpNeeded: false,
                    createdAt: new Date().toISOString(),
                    scheduledDate: schedule.scheduledDate
                }
            }
        })

        return reportsData
    } catch (error) {
        console.error('Error fetching overseer reports for grid:', error)
        throw new Error("Failed to fetch overseer reports")
    }
})

const _getGroupSchedulesForModal = async (user: any) => {
    try {
        await connectToDB()

        // Get all groups
        const groups = await Group.find({}).lean()

        // Get existing schedules only
        const schedules = await GroupSchedule.find({ overseerUserId: user._id }).lean()

        // Get group names for existing schedules
        const groupIds = schedules.map(s => s.groupId)
        const groupsWithSchedules = await Group.find({ _id: { $in: groupIds } }).lean()
        const groupMap = new Map(groupsWithSchedules.map(g => [g._id.toString(), g.name]))

        // Only return existing schedules
        const scheduleData = schedules.map(schedule => ({
            groupId: schedule.groupId.toString(),
            groupName: groupMap.get(schedule.groupId.toString()) || 'Unknown Group',
            month: schedule.month,
            monthLabel: new Date(schedule.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            scheduledDate: schedule.scheduledDate ?
                new Date(schedule.scheduledDate).toISOString().slice(0, 10) : '',
            status: schedule.status
        }))

        return {
            success: true,
            groups: groups.map(g => ({ _id: g._id.toString(), name: g.name })),
            schedules: scheduleData
        }
    } catch (error) {
        console.error('Error fetching group schedules for modal:', error)
        throw new Error("Failed to fetch group schedules")
    }
}

export const getGroupSchedulesForModal = await withAuth(_getGroupSchedulesForModal)

export const getGroupSchedules = await withAuth(async (user, month?: string) => {
    try {
        await connectToDB()

        // Build query
        const query: any = { overseerUserId: user._id }

        if (month) {
            query.month = month
        }

        // Get schedules with group names
        const schedules = await GroupSchedule.find(query)
            .sort({ month: 1 })
            .lean()

        // Get group names
        const groupIds = [...new Set(schedules.map(s => s.groupId))]
        const groups = await Group.find({ _id: { $in: groupIds } }).lean()
        const groupMap = new Map(groups.map(g => [g._id.toString(), g.name]))

        return {
            success: true,
            schedules: schedules.map(schedule => ({
                ...schedule,
                _id: schedule._id.toString(),
                groupName: groupMap.get(schedule.groupId) || 'Unknown Group'
            }))
        }
    } catch (error) {
        console.error('Error fetching group schedules:', error)
        throw new Error("Failed to fetch group schedules")
    }
})

export const getOverseerReports = await withAuth(async (user, filters?: { month?: string, groupId?: string }) => {
    try {
        await connectToDB()

        // Build query
        const query: any = { overseerUserId: user._id }

        if (filters?.month) {
            query.month = filters.month
        }

        if (filters?.groupId) {
            query.groupId = filters.groupId
        }

        // Get reports with group names
        const reports = await OverseerReport.find(query)
            .sort({ createdAt: -1 })
            .lean()

        // Get group names for reports
        const groupIds = [...new Set(reports.map(r => r.groupId))]
        const groups = await Group.find({ _id: { $in: groupIds } }).lean()
        const groupMap = new Map(groups.map(g => [g._id.toString(), g.name]))

        return {
            success: true,
            reports: reports.map(report => ({
                ...report,
                _id: report._id.toString(),
                groupName: groupMap.get(report.groupId) || 'Unknown Group'
            }))
        }
    } catch (error) {
        console.error('Error fetching overseer reports:', error)
        throw new Error("Failed to fetch overseer reports")
    }
})

export const getOverseerAnalytics = await withAuth(async (user, month?: string) => {
    try {
        await connectToDB()

        // Build query
        const query: any = {}
        if (month) {
            query.month = month
        }

        // Get reports for analytics
        const reports = await OverseerReport.find(query)
            .sort({ visitDate: -1 })
            .lean()

        // Get group names
        const groupIds = [...new Set(reports.map(r => r.groupId))]
        const groups = await Group.find({ _id: { $in: groupIds } }).lean()
        const groupMap = new Map(groups.map(g => [g._id, g.name]))

        return reports.map(report => ({
            _id: report._id as string,
            groupName: groupMap.get(report.groupId) || 'Unknown Group',
            month: report.month,
            visitDate: report.visitDate,
            presentCount: report.members?.filter(m => m.present).length || 0,
            totalMembers: report.members?.length || 0,
            studyCount: report.members?.filter(m => m.hasStudy).length || 0,
            ministryActive: report.members?.filter(m => m.participatesInMinistry).length || 0,
            followUpNeeded: report.followUpNeeded || false,
            meetingAttendance: report.meetingAttendance,
            generalObservations: report.generalObservations,
            encouragement: report.encouragement,
            recommendations: report.recommendations,
            members: report.members?.map(member => ({
                id: member.id,
                name: member.name,
                present: member.present,
                hasStudy: member.hasStudy,
                participatesInMinistry: member.participatesInMinistry
            })) || []
        }))
    } catch (error) {
        console.error('Error fetching overseer analytics:', error)
        throw new Error("Failed to fetch overseer analytics")
    }
})

export const getOverallMemberAnalytics = await withAuth(async (user, month?: string) => {
    try {
        await connectToDB()

        // Build query }
        const query: any = {}
        if (month) {
            query.month = month
        }

        // Get all reports
        const reports = await OverseerReport.find(query).lean()
        
        // Combine all members across all reports
        const memberStats = new Map()
        
        reports.forEach(report => {
            report.members?.forEach(member => {
                if (!memberStats.has(member.id)) {
                    memberStats.set(member.id, {
                        id: member.id,
                        name: member.name,
                        wasPresent: false,
                        hasStudy: false,
                        participatesInMinistry: false
                    })
                }
                
                const memberStat = memberStats.get(member.id)
                if (member.present) memberStat.wasPresent = true
                if (member.hasStudy) memberStat.hasStudy = true
                if (member.participatesInMinistry) memberStat.participatesInMinistry = true
            })
        })

        // Convert to array and categorize
        const allMembers = Array.from(memberStats.values())
        
        // Categorize members
        const presentMembers = allMembers.filter(m => m.wasPresent)
        const absentMembers = allMembers.filter(m => !m.wasPresent)
        const membersWithStudy = allMembers.filter(m => m.hasStudy)
        const membersWithoutStudy = allMembers.filter(m => !m.hasStudy)
        const membersInMinistry = allMembers.filter(m => m.participatesInMinistry)
        const membersNotInMinistry = allMembers.filter(m => !m.participatesInMinistry)

        return {
            totalMembers: allMembers.length,
            presentMembers,
            absentMembers,
            membersWithStudy,
            membersWithoutStudy,
            membersInMinistry,
            membersNotInMinistry
        }
    } catch (error) {
        console.error('Error fetching overall member analytics:', error)
        throw new Error("Failed to fetch overall member analytics")
    }
})