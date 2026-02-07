"use server"

import { User, withAuth } from "../helpers/auth"
import { connectToDB } from "../mongoose"
import Member from "../models/user.models"
import { logActivity } from "../utils/activity-logger"

const CONGREGATION_DUTIES = {
    midweek_meeting: [
        "Spiritual Gems", "Bible Reading", "Initial Call", "Return Visit",
        "Bible Study", "Living as Christians", "Life and Ministry Chairman",
        "Watchtower Reader", "Bible Student Reader"
    ],
    weekend_meeting: [
        "Public Talk", "Public Talk Chairman", "Watchtower Reader", "Watchtower Conductor",
        "Public Talk Speaker", "Bible Student Reader"
    ],
    field_service: [
        "Field Service Overseer", "Field Service Group Conductor", "Public Witnessing Coordinator"
    ],
    administrative: [
        "Literature Servant", "Accounts Servant", "Secretary", "Sound System Operator", "Attendant"
    ],
    special_events: [
        "Circuit Assembly Chairman", "Convention Chairman", "Memorial Speaker"
    ]
}

async function _assignDutyToMember(user: User, memberId: string, dutyName: string, category: string, notes?: string) {
    try {
        if (!user) throw new Error("User not authorized")

        await connectToDB()

        const member = await Member.findById(memberId)
        if (!member) {
            return { success: false, message: "Member not found" }
        }

        // Check if duty already assigned
        const existingDuty = member.duties?.find((d: any) => d.name === dutyName && d.isActive)
        if (existingDuty) {
            return { success: false, message: "Member already has this duty" }
        }

        const newDuty = {
            name: dutyName,
            category,
            assignedDate: new Date(),
            assignedBy: user._id,
            notes: notes || '',
            isActive: true
        }

        member.duties = member.duties || []
        member.duties.push(newDuty)
        await member.save()

        await logActivity({
            userId: user._id as string,
            type: 'duty_assignment',
            action: `${user.fullName} assigned ${dutyName} to ${member.fullName}`,
            details: { entityId: memberId, entityType: 'Member', metadata: { dutyName, category } }
        })

        return { success: true, message: "Duty assigned successfully" }
    } catch (error) {
        console.error('Error assigning duty:', error)
        return { success: false, message: "Failed to assign duty" }
    }
}

async function _removeDutyFromMember(user: User, memberId: string, dutyName: string) {
    try {
        if (!user) throw new Error("User not authorized")

        await connectToDB()

        const member = await Member.findById(memberId)
        if (!member) {
            return { success: false, message: "Member not found" }
        }

        const dutyIndex = member.duties?.findIndex((d: any) => d.name === dutyName && d.isActive)
        if (dutyIndex === -1) {
            return { success: false, message: "Duty not found" }
        }

        member.duties[dutyIndex].isActive = false
        await member.save()

        await logActivity({
            userId: user._id as string,
            type: 'duty_assignment',
            action: `${user.fullName} removed ${dutyName} from ${member.fullName}`,
            details: { entityId: memberId, entityType: 'Member', metadata: { dutyName } }
        })

        return { success: true, message: "Duty removed successfully" }
    } catch (error) {
        console.error('Error removing duty:', error)
        return { success: false, message: "Failed to remove duty" }
    }
}

async function _getMemberDuties(user: User, memberId: string) {
    try {
        if (!user) throw new Error("User not authorized")

        await connectToDB()

        const member = await Member.findById(memberId)
            .lean()

        if (!member) {
            return { success: false, duties: [] }
        }

        const activeDuties = member.duties?.filter((d: any) => d.isActive) || []

        return { success: true, duties: activeDuties }
    } catch (error) {
        console.error('Error fetching member duties:', error)
        return { success: false, duties: [] }
    }
}

async function _getAllAvailableDuties(user: User) {
    try {
        if (!user) throw new Error("User not authorized")
        return { success: true, duties: CONGREGATION_DUTIES }
    } catch (error) {
        return { success: false, duties: {} }
    }
}

async function _getMembersWithDuties(user: User) {
    try {
        if (!user) throw new Error("User not authorized")

        await connectToDB()

        const members = await Member.find({
            role: { $in: ['publisher', 'ministerial_servant', 'elder'] },
            'duties.isActive': true
        })
            .select('fullName email role gender baptizedDate privileges groupId duties')
            .populate('groupId', 'name')
            .lean()

        return { success: true, members }
    } catch (error) {
        console.error('Error fetching members with duties:', error)
        return { success: false, members: [] }
    }
}

async function _getEligibleMembersForAssignment(user: User, assignmentType: string) {
    try {
        if (!user) throw new Error("User not authorized")

        await connectToDB()

        // Map assignment types to duty names
        const dutyMapping: Record<string, string[]> = {
            "Watchtower Reader": ["Watchtower Reader", "Watchtower Conductor"],
            "Bible Student Reader": ["Bible Reading", "Bible Student Reader"],
            "Life and Ministry": ["Initial Call", "Return Visit", "Bible Study", "Life and Ministry Chairman", "Spiritual Gems", "Living as Christians"],
            "Public Talk Speaker": ["Public Talk", "Public Talk Speaker", "Public Talk Chairman"]
        }

        const eligibleDuties = dutyMapping[assignmentType]
        
        if (!eligibleDuties) {
            // If no mapping found, return all members
            const allMembers = await Member.find({
                role: { $in: ['publisher', 'ministerial_servant', 'elder'] }
            })
                .select('fullName email role gender')
                .lean()
            return { success: true, members: allMembers }
        }

        // Find members who have any of the eligible duties assigned
        const members = await Member.find({
            duties: {
                $elemMatch: {
                    name: { $in: eligibleDuties },
                    isActive: true
                }
            }
        })
            .select('fullName email role gender duties')
            .lean()

        return { success: true, members }
    } catch (error) {
        console.error('Error fetching eligible members:', error)
        return { success: false, members: [] }
    }
}

export const assignDutyToMember = await withAuth(_assignDutyToMember)
export const removeDutyFromMember = await withAuth(_removeDutyFromMember)
export const getMemberDuties = await withAuth(_getMemberDuties)
export const getAllAvailableDuties = await withAuth(_getAllAvailableDuties)
export const getMembersWithDuties = await withAuth(_getMembersWithDuties)
export const getEligibleMembersForAssignment = await withAuth(_getEligibleMembersForAssignment)