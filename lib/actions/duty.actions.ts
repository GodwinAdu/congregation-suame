"use server"

import { connectToDB } from "@/lib/mongoose"
import { Duty, MemberDuty } from "@/lib/models/duty.models"
import { User } from "@/lib/models/user.models"
import { withAuth } from "@/lib/helpers/withAuth"
import { logActivity } from "@/lib/helpers/activity-logger"

// Default duties for congregation
const DEFAULT_DUTIES = [
    // Midweek Meeting
    { name: "Spiritual Gems", category: "midweek_meeting", description: "Present spiritual gems from weekly Bible reading", requirements: { gender: "both", baptized: true } },
    { name: "Bible Reading", category: "midweek_meeting", description: "Read assigned Bible portion", requirements: { gender: "both" } },
    { name: "Initial Call", category: "midweek_meeting", description: "Demonstrate initial call in field service", requirements: { gender: "both" } },
    { name: "Return Visit", category: "midweek_meeting", description: "Demonstrate return visit", requirements: { gender: "both" } },
    { name: "Bible Study", category: "midweek_meeting", description: "Conduct Bible study demonstration", requirements: { gender: "both" } },
    { name: "Living as Christians", category: "midweek_meeting", description: "Present Living as Christians part", requirements: { gender: "both", baptized: true } },
    { name: "Life and Ministry Chairman", category: "midweek_meeting", description: "Chair Life and Ministry meeting", requirements: { gender: "male", privileges: ["Elder", "Ministerial Servant"] } },
    
    // Weekend Meeting
    { name: "Public Talk", category: "weekend_meeting", description: "Deliver public talk", requirements: { gender: "male", privileges: ["Elder"] } },
    { name: "Public Talk Chairman", category: "weekend_meeting", description: "Chair public meeting", requirements: { gender: "male", privileges: ["Elder", "Ministerial Servant"] } },
    { name: "Watchtower Reader", category: "weekend_meeting", description: "Read Watchtower paragraphs", requirements: { gender: "male", baptized: true } },
    { name: "Watchtower Conductor", category: "weekend_meeting", description: "Conduct Watchtower study", requirements: { gender: "male", privileges: ["Elder"] } },
    
    // Field Service
    { name: "Field Service Overseer", category: "field_service", description: "Oversee field service group", requirements: { gender: "male", privileges: ["Elder", "Ministerial Servant"] } },
    { name: "Field Service Group Conductor", category: "field_service", description: "Conduct field service group", requirements: { gender: "male", baptized: true } },
    { name: "Public Witnessing Coordinator", category: "field_service", description: "Coordinate public witnessing", requirements: { gender: "both", baptized: true } },
    
    // Administrative
    { name: "Literature Servant", category: "administrative", description: "Manage congregation literature", requirements: { gender: "male", privileges: ["Elder", "Ministerial Servant"] } },
    { name: "Accounts Servant", category: "administrative", description: "Handle congregation accounts", requirements: { gender: "male", privileges: ["Elder", "Ministerial Servant"] } },
    { name: "Secretary", category: "administrative", description: "Congregation secretary duties", requirements: { gender: "male", privileges: ["Elder", "Ministerial Servant"] } },
    { name: "Sound System Operator", category: "administrative", description: "Operate sound system", requirements: { gender: "male", baptized: true } },
    { name: "Attendant", category: "administrative", description: "Meeting attendant duties", requirements: { gender: "male", baptized: true } },
    
    // Special Events
    { name: "Circuit Assembly Chairman", category: "special_events", description: "Chair circuit assembly parts", requirements: { gender: "male", privileges: ["Elder"] } },
    { name: "Convention Chairman", category: "special_events", description: "Chair convention parts", requirements: { gender: "male", privileges: ["Elder"] } },
    { name: "Memorial Speaker", category: "special_events", description: "Deliver Memorial talk", requirements: { gender: "male", privileges: ["Elder"] } }
]

export const initializeDefaultDuties = withAuth(async (currentUser) => {
    try {
        await connectToDB()
        
        const existingDuties = await Duty.countDocuments()
        if (existingDuties > 0) {
            return { success: true, message: "Duties already initialized" }
        }
        
        const duties = DEFAULT_DUTIES.map(duty => ({
            ...duty,
            createdBy: currentUser._id
        }))
        
        await Duty.insertMany(duties)
        
        await logActivity(currentUser._id, 'DUTY_MANAGEMENT', 'Initialized default congregation duties', true)
        
        return { success: true, message: "Default duties initialized successfully" }
    } catch (error) {
        console.error('Error initializing duties:', error)
        return { success: false, message: "Failed to initialize duties" }
    }
})

export const getAllDuties = withAuth(async (currentUser) => {
    try {
        await connectToDB()
        
        const duties = await Duty.find({ isActive: true })
            .sort({ category: 1, name: 1 })
            .lean()
        
        return { success: true, duties }
    } catch (error) {
        console.error('Error fetching duties:', error)
        return { success: false, duties: [] }
    }
})

export const assignDutyToMember = withAuth(async (currentUser, memberId: string, dutyId: string, notes?: string) => {
    try {
        await connectToDB()
        
        // Check if member exists
        const member = await User.findById(memberId)
        if (!member) {
            return { success: false, message: "Member not found" }
        }
        
        // Check if duty exists
        const duty = await Duty.findById(dutyId)
        if (!duty) {
            return { success: false, message: "Duty not found" }
        }
        
        // Check if assignment already exists
        const existingAssignment = await MemberDuty.findOne({ memberId, dutyId, isActive: true })
        if (existingAssignment) {
            return { success: false, message: "Member already assigned to this duty" }
        }
        
        // Create new assignment
        const assignment = new MemberDuty({
            memberId,
            dutyId,
            notes,
            assignedBy: currentUser._id
        })
        
        await assignment.save()
        
        await logActivity(currentUser._id, 'DUTY_ASSIGNMENT', `Assigned ${duty.name} to ${member.fullName}`, true)
        
        return { success: true, message: "Duty assigned successfully" }
    } catch (error) {
        console.error('Error assigning duty:', error)
        return { success: false, message: "Failed to assign duty" }
    }
})

export const removeDutyFromMember = withAuth(async (currentUser, memberId: string, dutyId: string) => {
    try {
        await connectToDB()
        
        const assignment = await MemberDuty.findOne({ memberId, dutyId, isActive: true })
        if (!assignment) {
            return { success: false, message: "Assignment not found" }
        }
        
        assignment.isActive = false
        await assignment.save()
        
        const member = await User.findById(memberId)
        const duty = await Duty.findById(dutyId)
        
        await logActivity(currentUser._id, 'DUTY_ASSIGNMENT', `Removed ${duty?.name} from ${member?.fullName}`, true)
        
        return { success: true, message: "Duty removed successfully" }
    } catch (error) {
        console.error('Error removing duty:', error)
        return { success: false, message: "Failed to remove duty" }
    }
})

export const getMemberDuties = withAuth(async (currentUser, memberId: string) => {
    try {
        await connectToDB()
        
        const assignments = await MemberDuty.find({ memberId, isActive: true })
            .populate('dutyId')
            .populate('assignedBy', 'fullName')
            .sort({ assignedDate: -1 })
            .lean()
        
        return { success: true, assignments }
    } catch (error) {
        console.error('Error fetching member duties:', error)
        return { success: false, assignments: [] }
    }
})

export const getAllMembersWithDuties = withAuth(async (currentUser) => {
    try {
        await connectToDB()
        
        const members = await User.find({ role: { $in: ['publisher', 'ministerial_servant', 'elder'] } })
            .select('fullName email role gender baptizedDate privileges groupId')
            .populate('groupId', 'name')
            .lean()
        
        // Get duties for each member
        const membersWithDuties = await Promise.all(
            members.map(async (member) => {
                const assignments = await MemberDuty.find({ memberId: member._id, isActive: true })
                    .populate('dutyId')
                    .lean()
                
                return {
                    ...member,
                    duties: assignments.map(a => a.dutyId)
                }
            })
        )
        
        return { success: true, members: membersWithDuties }
    } catch (error) {
        console.error('Error fetching members with duties:', error)
        return { success: false, members: [] }
    }
})