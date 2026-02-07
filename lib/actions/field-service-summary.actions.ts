"use server"

import { withAuth } from "../helpers/auth"
import { connectToDB } from "../mongoose"
import FieldServiceReport from "../models/field-service.models"
import Member from "../models/user.models"

export const getFieldServiceSummary = await withAuth(async (user, startDate: string, endDate: string, groupId?: string, roleId?: string) => {
    try {
        await connectToDB()

        // Build member filter
        const memberFilter: any = {}
        if (groupId) memberFilter.groupId = groupId
        if (roleId) memberFilter.role = roleId

        // Get all members with their privileges
        const members = await Member.find(memberFilter)
            .populate('privileges')
            .select('fullName privileges groupId role')
            .lean()

        // Filter out children (those with excludeFromActivities privilege)
        const activeMembers = members.filter(member => {
            if (!member.privileges || member.privileges.length === 0) return true
            return !member.privileges.some((priv: any) => priv.excludeFromActivities === true)
        })

        // Get all reports in date range
        const reports = await FieldServiceReport.find({
            month: { $gte: startDate, $lte: endDate }
        }).lean()

        // Calculate expected months
        const start = new Date(startDate + '-01')
        const end = new Date(endDate + '-01')
        const expectedMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1

        // Generate month labels for trends
        const monthLabels: string[] = []
        const currentDate = new Date(start)
        while (currentDate <= end) {
            monthLabels.push(currentDate.toISOString().slice(0, 7))
            currentDate.setMonth(currentDate.getMonth() + 1)
        }

        // Calculate monthly trends
        const monthlyTrends = monthLabels.map(month => {
            const monthReports = reports.filter(r => r.month === month)
            return {
                month,
                totalHours: monthReports.reduce((sum, r) => sum + (r.hours || 0), 0),
                totalReports: monthReports.length,
                avgHours: monthReports.length > 0 ? Math.round((monthReports.reduce((sum, r) => sum + (r.hours || 0), 0) / monthReports.length) * 10) / 10 : 0,
                bibleStudies: monthReports.reduce((sum, r) => sum + (r.bibleStudents || 0), 0)
            }
        })

        // Create member statistics
        const memberStats = activeMembers.map(member => {
            const memberReports = reports.filter(r => r.publisher.toString() === member._id.toString())
            
            const totalHours = memberReports.reduce((sum, r) => sum + (r.hours || 0), 0)
            const totalPlacements = memberReports.reduce((sum, r) => sum + (r.placements || 0), 0)
            const totalVideos = memberReports.reduce((sum, r) => sum + (r.videos || 0), 0)
            const totalReturnVisits = memberReports.reduce((sum, r) => sum + (r.returnVisits || 0), 0)
            const totalBibleStudies = memberReports.reduce((sum, r) => sum + (r.bibleStudents || 0), 0)
            const monthsReported = memberReports.length

            const avgHours = monthsReported > 0 ? totalHours / monthsReported : 0
            const reportingRate = (monthsReported / expectedMonths) * 100

            // Determine status
            let status = 'active'
            let needsShepherding = false
            
            if (monthsReported === 0) {
                status = 'inactive'
                needsShepherding = true
            } else if (reportingRate < 50) {
                status = 'irregular'
                needsShepherding = true
            } else if (avgHours < 1) {
                status = 'low_activity'
                needsShepherding = true
            } else if (avgHours >= 10) {
                status = 'excellent'
            }

            return {
                _id: member._id.toString(),
                name: member.fullName,
                totalHours,
                totalPlacements,
                totalVideos,
                totalReturnVisits,
                totalBibleStudies,
                monthsReported,
                expectedMonths,
                avgHours: Math.round(avgHours * 10) / 10,
                reportingRate: Math.round(reportingRate),
                status,
                needsShepherding
            }
        })

        // Categorize members
        const excellent = memberStats.filter(m => m.status === 'excellent')
        const active = memberStats.filter(m => m.status === 'active')
        const lowActivity = memberStats.filter(m => m.status === 'low_activity')
        const irregular = memberStats.filter(m => m.status === 'irregular')
        const inactive = memberStats.filter(m => m.status === 'inactive')
        const needsShepherding = memberStats.filter(m => m.needsShepherding)

        return {
            summary: {
                totalMembers: memberStats.length,
                excellentCount: excellent.length,
                activeCount: active.length,
                lowActivityCount: lowActivity.length,
                irregularCount: irregular.length,
                inactiveCount: inactive.length,
                needsShepherdingCount: needsShepherding.length,
                totalHours: memberStats.reduce((sum, m) => sum + m.totalHours, 0),
                totalPlacements: memberStats.reduce((sum, m) => sum + m.totalPlacements, 0),
                totalBibleStudies: memberStats.reduce((sum, m) => sum + m.totalBibleStudies, 0),
                avgHoursPerMember: Math.round((memberStats.reduce((sum, m) => sum + m.totalHours, 0) / memberStats.length) * 10) / 10
            },
            categories: {
                excellent,
                active,
                lowActivity,
                irregular,
                inactive,
                needsShepherding
            },
            trends: monthlyTrends
        }
    } catch (error) {
        console.error('Error generating field service summary:', error)
        throw new Error("Failed to generate field service summary")
    }
})
