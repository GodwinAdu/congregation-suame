import { connectToDB } from "../mongoose"
import Member from "../models/user.models"
import Assignment from "../models/assignment.models"
import Attendance from "../models/attendance.models"
import FieldServiceReport from "../models/field-service.models"

interface AssignmentSuggestion {
    memberId: string
    memberName: string
    confidence: number
    reasons: string[]
}

interface MemberAvailability {
    memberId: string
    isAvailable: boolean
    lastAssignment: Date | null
    assignmentCount: number
    skills: string[]
}

export class AIAssistantService {
    // Smart assignment algorithm
    static async suggestAssignments(
        assignmentType: string,
        week: string,
        excludeMembers: string[] = []
    ): Promise<AssignmentSuggestion[]> {
        await connectToDB()

        // Get all eligible members
        const members = await Member.find({
            _id: { $nin: excludeMembers },
            status: 'active'
        }).select('fullName gender privileges')

        // Get recent assignments for workload balancing
        const recentAssignments = await Assignment.find({
            week: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }).populate('assignedTo')

        const suggestions: AssignmentSuggestion[] = []

        for (const member of members) {
            const confidence = this.calculateAssignmentConfidence(
                member,
                assignmentType,
                recentAssignments
            )

            if (confidence > 0.3) {
                suggestions.push({
                    memberId: member._id.toString(),
                    memberName: member.fullName,
                    confidence,
                    reasons: this.getAssignmentReasons(member, assignmentType, confidence)
                })
            }
        }

        return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 5)
    }

    // Predict member engagement
    static async predictEngagement(memberId: string): Promise<{
        score: number
        trend: 'increasing' | 'stable' | 'declining'
        recommendations: string[]
    }> {
        await connectToDB()

        // Get member's recent activity
        const [attendance, fieldService, assignments] = await Promise.all([
            Attendance.find({ memberId }).sort({ createdAt: -1 }).limit(12),
            FieldServiceReport.find({ memberId }).sort({ createdAt: -1 }).limit(6),
            Assignment.find({ assignedTo: memberId }).sort({ createdAt: -1 }).limit(10)
        ])

        const attendanceRate = attendance.filter(a => a.present).length / attendance.length
        const fieldServiceRate = fieldService.filter(r => r.hours > 0).length / fieldService.length
        const assignmentCompletion = assignments.length > 0 ? 0.8 : 0.5 // Simplified

        const score = (attendanceRate * 0.4 + fieldServiceRate * 0.4 + assignmentCompletion * 0.2)
        
        const trend = this.calculateTrend(attendance, fieldService)
        const recommendations = this.generateRecommendations(score, trend)

        return { score, trend, recommendations }
    }

    // Detect scheduling conflicts
    static async detectConflicts(week: string): Promise<{
        conflicts: Array<{
            type: string
            members: string[]
            description: string
        }>
    }> {
        await connectToDB()

        const assignments = await Assignment.find({ week })
            .populate('assignedTo assistant')

        const conflicts = []

        // Check for double bookings
        const memberAssignments = new Map()
        assignments.forEach(assignment => {
            if (assignment.assignedTo) {
                const memberId = assignment.assignedTo._id.toString()
                if (!memberAssignments.has(memberId)) {
                    memberAssignments.set(memberId, [])
                }
                memberAssignments.get(memberId).push(assignment)
            }
        })

        memberAssignments.forEach((assignments, memberId) => {
            if (assignments.length > 1) {
                conflicts.push({
                    type: 'double-booking',
                    members: [assignments[0].assignedTo.fullName],
                    description: `${assignments[0].assignedTo.fullName} has multiple assignments`
                })
            }
        })

        return { conflicts }
    }

    private static calculateAssignmentConfidence(
        member: any,
        assignmentType: string,
        recentAssignments: any[]
    ): number {
        let confidence = 0.5 // Base confidence

        // Gender-based assignments
        if (assignmentType === 'Watchtower Reader' && member.gender === 'Male') {
            confidence += 0.3
        }

        // Privilege-based assignments
        if (member.privileges?.includes('Elder') || member.privileges?.includes('Ministerial Servant')) {
            confidence += 0.2
        }

        // Workload balancing
        const memberAssignments = recentAssignments.filter(
            a => a.assignedTo?._id.toString() === member._id.toString()
        )
        
        if (memberAssignments.length === 0) {
            confidence += 0.2 // Prefer members with no recent assignments
        } else if (memberAssignments.length > 2) {
            confidence -= 0.3 // Reduce confidence for overloaded members
        }

        return Math.min(Math.max(confidence, 0), 1)
    }

    private static getAssignmentReasons(member: any, assignmentType: string, confidence: number): string[] {
        const reasons = []
        
        if (member.gender === 'Male' && assignmentType === 'Watchtower Reader') {
            reasons.push('Qualified for this assignment type')
        }
        
        if (member.privileges?.length > 0) {
            reasons.push('Has congregation privileges')
        }
        
        if (confidence > 0.7) {
            reasons.push('High availability and suitable qualifications')
        }

        return reasons
    }

    private static calculateTrend(attendance: any[], fieldService: any[]): 'increasing' | 'stable' | 'declining' {
        // Simplified trend calculation
        const recentAttendance = attendance.slice(0, 6).filter(a => a.present).length
        const olderAttendance = attendance.slice(6, 12).filter(a => a.present).length
        
        if (recentAttendance > olderAttendance) return 'increasing'
        if (recentAttendance < olderAttendance) return 'declining'
        return 'stable'
    }

    private static generateRecommendations(score: number, trend: string): string[] {
        const recommendations = []
        
        if (score < 0.5) {
            recommendations.push('Consider pastoral visit')
            recommendations.push('Offer encouragement and support')
        }
        
        if (trend === 'declining') {
            recommendations.push('Monitor closely for next month')
            recommendations.push('Assign lighter responsibilities')
        }
        
        if (score > 0.8) {
            recommendations.push('Consider for additional privileges')
            recommendations.push('Excellent candidate for training others')
        }

        return recommendations
    }
}