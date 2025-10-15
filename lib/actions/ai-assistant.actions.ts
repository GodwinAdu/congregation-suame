"use server"

import { User, withAuth } from "../helpers/auth"
import { AIAssistantService } from "../services/ai-assistant.service"
import { connectToDB } from "../mongoose"
import { logActivity } from "../utils/activity-logger"

async function _getAssignmentSuggestions(
    user: User, 
    assignmentType: string, 
    week: string, 
    excludeMembers: string[] = []
) {
    try {
        await connectToDB()
        
        const suggestions = await AIAssistantService.suggestAssignments(
            assignmentType,
            week,
            excludeMembers
        )

        await logActivity({
            userId: user._id as string,
            type: 'ai_suggestion',
            action: `${user.fullName} requested AI assignment suggestions for ${assignmentType}`,
            details: { entityType: 'Assignment', metadata: { week, assignmentType } }
        })

        return suggestions
    } catch (error) {
        console.error('Error getting assignment suggestions:', error)
        throw error
    }
}

async function _predictMemberEngagement(user: User, memberId: string) {
    try {
        await connectToDB()
        
        const prediction = await AIAssistantService.predictEngagement(memberId)

        await logActivity({
            userId: user._id as string,
            type: 'engagement_analysis',
            action: `${user.fullName} analyzed member engagement`,
            details: { entityId: memberId, entityType: 'Member' }
        })

        return prediction
    } catch (error) {
        console.error('Error predicting member engagement:', error)
        throw error
    }
}

async function _detectSchedulingConflicts(user: User, week: string) {
    try {
        await connectToDB()
        
        const conflicts = await AIAssistantService.detectConflicts(week)

        await logActivity({
            userId: user._id as string,
            type: 'conflict_detection',
            action: `${user.fullName} checked for scheduling conflicts`,
            details: { entityType: 'Assignment', metadata: { week } }
        })

        return conflicts
    } catch (error) {
        console.error('Error detecting conflicts:', error)
        throw error
    }
}

async function _generateInsights(user: User, type: 'attendance' | 'field-service' | 'assignments') {
    try {
        await connectToDB()
        
        // Basic insights generation - can be expanded with more sophisticated AI
        const insights = {
            type,
            summary: `Analysis of ${type} patterns`,
            recommendations: [
                'Consider rotating assignments more frequently',
                'Focus on encouraging less active members',
                'Schedule follow-up meetings with elders'
            ],
            trends: {
                direction: 'stable',
                confidence: 0.75
            }
        }

        await logActivity({
            userId: user._id as string,
            type: 'insights_generate',
            action: `${user.fullName} generated ${type} insights`,
            details: { entityType: 'Analytics', metadata: { type } }
        })

        return insights
    } catch (error) {
        console.error('Error generating insights:', error)
        throw error
    }
}

async function _getWorkloadBalance(user: User, timeframe: 'month' | 'quarter' | 'year' = 'month') {
    try {
        await connectToDB()
        
        const Assignment = (await import("../models/assignment.models")).default
        const Member = (await import("../models/user.models")).default
        
        // Calculate date range
        const now = new Date()
        const startDate = new Date()
        
        switch (timeframe) {
            case 'month':
                startDate.setMonth(now.getMonth() - 1)
                break
            case 'quarter':
                startDate.setMonth(now.getMonth() - 3)
                break
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1)
                break
        }

        // Get assignments and members
        const [assignments, members] = await Promise.all([
            Assignment.find({
                createdAt: { $gte: startDate }
            }).populate('assignedTo', 'fullName'),
            Member.find({ status: 'active' }).select('fullName')
        ])

        // Calculate workload distribution
        const workloadMap = new Map()
        
        members.forEach(member => {
            workloadMap.set(member._id.toString(), {
                name: member.fullName,
                assignments: 0,
                lastAssignment: null
            })
        })

        assignments.forEach(assignment => {
            if (assignment.assignedTo) {
                const memberId = assignment.assignedTo._id.toString()
                const current = workloadMap.get(memberId)
                if (current) {
                    current.assignments += 1
                    if (!current.lastAssignment || assignment.createdAt > current.lastAssignment) {
                        current.lastAssignment = assignment.createdAt
                    }
                }
            }
        })

        const workloadData = Array.from(workloadMap.values())
            .sort((a, b) => b.assignments - a.assignments)

        const overloaded = workloadData.filter(w => w.assignments > 3)
        const underutilized = workloadData.filter(w => w.assignments === 0)

        return {
            timeframe,
            totalAssignments: assignments.length,
            averagePerMember: assignments.length / members.length,
            overloaded: overloaded.length,
            underutilized: underutilized.length,
            workloadDistribution: workloadData,
            recommendations: [
                ...(overloaded.length > 0 ? [`${overloaded.length} members are overloaded`] : []),
                ...(underutilized.length > 0 ? [`${underutilized.length} members need more assignments`] : [])
            ]
        }
    } catch (error) {
        console.error('Error getting workload balance:', error)
        throw error
    }
}

export const getAssignmentSuggestions = await withAuth(_getAssignmentSuggestions)
export const predictMemberEngagement = await withAuth(_predictMemberEngagement)
export const detectSchedulingConflicts = await withAuth(_detectSchedulingConflicts)
export const generateInsights = await withAuth(_generateInsights)
export const getWorkloadBalance = await withAuth(_getWorkloadBalance)