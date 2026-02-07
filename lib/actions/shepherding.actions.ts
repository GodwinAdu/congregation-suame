"use server"

import {  withAuth } from "../helpers/auth"
import { connectToDB } from "../mongoose"
import { revalidatePath } from "next/cache"
import { logActivity } from "../utils/activity-logger"
import ShepherdingCall from "../models/shepherding-call.models"
import Member from "../models/user.models"

export const createShepherdingCall = await withAuth(async (user, data: any) => {
    try {
        await connectToDB()

        const newCall = new ShepherdingCall({
            ...data,
            createdBy: user._id
        })

        await newCall.save()

        await logActivity({
            userId: user._id as string,
            type: 'shepherding_call',
            action: `Created shepherding call for member`,
            details: { entityId: newCall._id, entityType: 'ShepherdingCall' },
        })

        revalidatePath('/dashboard/shepherding')
        return { success: true, data: JSON.parse(JSON.stringify(newCall)) }
    } catch (error) {
        console.error('Error creating shepherding call:', error)
        throw new Error("Failed to create shepherding call")
    }
})

export const updateShepherdingCall = await withAuth(async (user, callId: string, data: any) => {
    try {
        await connectToDB()

        const updatedCall = await ShepherdingCall.findByIdAndUpdate(
            callId,
            { ...data, modifiedBy: user?._id },
            { new: true }
        )

        if (!updatedCall) throw new Error("Shepherding call not found")

        await logActivity({
            userId: user?._id as string,
            type: 'shepherding_call',
            action: `Updated shepherding call`,
            details: { entityId: callId, entityType: 'ShepherdingCall' },
        })

        revalidatePath('/dashboard/shepherding')
        return { success: true, data: JSON.parse(JSON.stringify(updatedCall)) }
    } catch (error) {
        console.error('Error updating shepherding call:', error)
        throw new Error("Failed to update shepherding call")
    }
})

export const deleteShepherdingCall = await withAuth(async (user, callId: string) => {
    try {
        await connectToDB()

        await ShepherdingCall.findByIdAndDelete(callId)

        await logActivity({
            userId: user?._id as string,
            type: 'shepherding_call',
            action: `Deleted shepherding call`,
            details: { entityId: callId, entityType: 'ShepherdingCall' },
        })

        revalidatePath('/dashboard/shepherding')
        return { success: true }
    } catch (error) {
        console.error('Error deleting shepherding call:', error)
        throw new Error("Failed to delete shepherding call")
    }
})

export const getShepherdingCalls = await withAuth(async (user, filters?: any) => {
    try {
        await connectToDB()

        const query: any = {}
        
        if (filters?.memberId) query.memberId = filters.memberId
        if (filters?.status) query.status = filters.status
        if (filters?.followUpNeeded) query.followUpNeeded = true
        if (filters?.startDate && filters?.endDate) {
            query.visitDate = { $gte: new Date(filters.startDate), $lte: new Date(filters.endDate) }
        }

        const calls = await ShepherdingCall.find(query)
            .populate('memberId', 'fullName phone')
            .populate('shepherds', 'fullName')
            .populate('createdBy', 'fullName')
            .sort({ visitDate: -1 })
            .lean()

        return JSON.parse(JSON.stringify(calls))
    } catch (error) {
        console.error('Error fetching shepherding calls:', error)
        throw new Error("Failed to fetch shepherding calls")
    }
})

export const getOverdueFollowUps = await withAuth(async (user) => {
    try {
        await connectToDB()

        const today = new Date()
        const calls = await ShepherdingCall.find({
            followUpNeeded: true,
            followUpDate: { $lt: today },
            status: 'completed'
        })
            .populate('memberId', 'fullName phone')
            .populate('shepherds', 'fullName')
            .sort({ followUpDate: 1 })
            .lean()

        return JSON.parse(JSON.stringify(calls))
    } catch (error) {
        console.error('Error fetching overdue follow-ups:', error)
        throw new Error("Failed to fetch overdue follow-ups")
    }
})

export const getShepherdingStats = await withAuth(async (user, startDate?: string, endDate?: string) => {
    try {
        await connectToDB()

        const query: any = {}
        if (startDate && endDate) {
            query.visitDate = { $gte: new Date(startDate), $lte: new Date(endDate) }
        }

        const calls = await ShepherdingCall.find(query).lean()
        
        const stats = {
            total: calls.length,
            completed: calls.filter(c => c.status === 'completed').length,
            scheduled: calls.filter(c => c.status === 'scheduled').length,
            followUpNeeded: calls.filter(c => c.followUpNeeded).length,
            byType: {} as any,
            byOutcome: {} as any
        }

        calls.forEach(call => {
            stats.byType[call.visitType] = (stats.byType[call.visitType] || 0) + 1
            if (call.outcome) {
                stats.byOutcome[call.outcome] = (stats.byOutcome[call.outcome] || 0) + 1
            }
        })

        return stats
    } catch (error) {
        console.error('Error fetching shepherding stats:', error)
        throw new Error("Failed to fetch shepherding stats")
    }
})

export const getMembersNeedingShepherding = await withAuth(async (user) => {
    try {
        await connectToDB()

        // Get all members
        const members = await Member.find({})
            .populate('privileges')
            .select('fullName phone groupId')
            .lean()

        // Filter out children
        const activeMembers = members.filter(member => {
            if (!member.privileges || member.privileges.length === 0) return true
            return !member.privileges.some((priv: any) => priv.excludeFromActivities === true)
        })

        // Get recent calls (last 6 months)
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

        const recentCalls = await ShepherdingCall.find({
            visitDate: { $gte: sixMonthsAgo },
            status: 'completed'
        }).lean()

        const callMap = new Map()
        recentCalls.forEach(call => {
            const memberId = call.memberId.toString()
            if (!callMap.has(memberId) || new Date(call.visitDate) > new Date(callMap.get(memberId).visitDate)) {
                callMap.set(memberId, call)
            }
        })

        const membersWithStatus = activeMembers.map(member => {
            const lastCall = callMap.get(member._id.toString())
            const daysSinceLastCall = lastCall 
                ? Math.floor((Date.now() - new Date(lastCall.visitDate).getTime()) / (1000 * 60 * 60 * 24))
                : null

            return {
                _id: member._id.toString(),
                name: member.fullName,
                phone: member.phone,
                lastCallDate: lastCall?.visitDate || null,
                daysSinceLastCall,
                needsVisit: !lastCall || (daysSinceLastCall !== null && daysSinceLastCall > 90),
                priority: !lastCall ? 'high' : (daysSinceLastCall !== null && daysSinceLastCall > 180) ? 'high' : (daysSinceLastCall !== null && daysSinceLastCall > 90) ? 'medium' : 'low'
            }
        })

        return membersWithStatus.filter(m => m.needsVisit).sort((a, b) => {
            if (a.priority === 'high' && b.priority !== 'high') return -1
            if (a.priority !== 'high' && b.priority === 'high') return 1
            return (b.daysSinceLastCall || 999) - (a.daysSinceLastCall || 999)
        })
    } catch (error) {
        console.error('Error fetching members needing shepherding:', error)
        throw new Error("Failed to fetch members needing shepherding")
    }
})

export const getEldersAndMS = await withAuth(async (user) => {
    try {
        await connectToDB()

        const members = await Member.find({})
            .populate('privileges')
            .select('fullName privileges')
            .lean()

        const shepherds = members.filter(member => {
            if (!member.privileges || member.privileges.length === 0) return false
            return member.privileges.some((priv: any) => 
                priv.name.toLowerCase() === 'elder' || priv.name.toLowerCase() === 'ministerial servant'
            )
        })

        return JSON.parse(JSON.stringify(shepherds))
    } catch (error) {
        console.error('Error fetching elders and MS:', error)
        throw new Error("Failed to fetch elders and MS")
    }
})
