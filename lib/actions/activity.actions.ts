"use server"

import { Types } from "mongoose"
import { currentUser } from "../helpers/session"
import Activity from "../models/activity.models"
import { connectToDB } from "../mongoose"
import { headers } from "next/headers"

interface CreateActivityParams {
    userId: string
    type: string
    action: string
    details?: {
        entityId?: string
        entityType?: string
        oldValue?: string
        newValue?: string
        metadata?: any
    }
    success?: boolean
    errorMessage?: string
}

export async function createActivity(params: CreateActivityParams) {
    try {
        await connectToDB()

        const headersList = await headers()
        const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '127.0.0.1'
        const userAgent = headersList.get('user-agent') || 'Unknown'

        const device = userAgent.includes('Mobile') ? 'Mobile' :
            userAgent.includes('Tablet') ? 'Tablet' : 'Desktop'

        await Activity.create({
            ...params,
            ipAddress,
            userAgent,
            device,
            location: 'Office', // You can enhance this with actual geolocation
        })
    } catch (error) {
        console.error('Error creating activity:', error)
    }
}

export async function fetchUserActivities(id: string, page: number = 1, limit: number = 10) {
    try {
        const user = await currentUser()
        if (!user) throw new Error("User not authenticated")
        await connectToDB()

        const skip = (page - 1) * limit
        const activities = await Activity.find({ userId: id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean()

        const total = await Activity.countDocuments({ userId: id })
        const totalPages = Math.ceil(total / limit)

        return {
            activities: JSON.parse(JSON.stringify(activities)),
            pagination: {
                currentPage: page,
                totalPages,
                total,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        }
    } catch (error) {
        console.error('Error fetching activities:', error)
        return {
            activities: [],
            pagination: { currentPage: 1, totalPages: 0, total: 0, hasNext: false, hasPrev: false }
        }
    }
}

export async function getActivityStats(userId: string) {
    try {
        await connectToDB()

        const id = new Types.ObjectId(userId)

        const stats = await Activity.aggregate([
            { $match: { userId: id } },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ])


        return {
            totalLogins: stats.find(s => s._id === 'login')?.count || 0,
            projectsAccessed: stats.find(s => s._id === 'building_access')?.count || 0,
            profileUpdates: stats.find(s => s._id === 'profile_update')?.count || 0,
            securityActions: stats.filter(s => ['password_change', 'email_verification'].includes(s._id)).reduce((sum, s) => sum + s.count, 0)
        }
    } catch (error) {
        console.error('Error fetching activity stats:', error)
        return { totalLogins: 0, projectsAccessed: 0, profileUpdates: 0, securityActions: 0 }
    }
}

export async function updateActivity(activityId: string, updateData: any) {
    try {
        await connectToDB()

        const updatedActivity = await Activity.findByIdAndUpdate(
            activityId,
            { ...updateData, updatedAt: new Date() },
            { new: true }
        )

        return JSON.parse(JSON.stringify(updatedActivity))
    } catch (error) {
        console.error('Error updating activity:', error)
        throw error
    }
}