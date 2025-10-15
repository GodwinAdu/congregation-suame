"use server"

import { User, withAuth } from "../helpers/auth"
import { Territory, ReturnVisit } from "../models/territory.models"
import { connectToDB } from "../mongoose"
import { revalidatePath } from "next/cache"
import { logActivity } from "../utils/activity-logger"

async function _createTerritory(user: User, data: {
    number: string
    name?: string
    type: 'residential' | 'business' | 'rural' | 'foreign'
    boundaries?: any
    difficulty: 'easy' | 'medium' | 'hard'
    notes?: string
}) {
    try {
        await connectToDB()
        
        const territory = new Territory(data)
        await territory.save()

        await logActivity({
            userId: user._id as string,
            type: 'territory_create',
            action: `${user.fullName} created territory ${data.number}`,
            details: { entityId: territory._id, entityType: 'Territory' }
        })

        revalidatePath('/dashboard/territory')
        return JSON.parse(JSON.stringify(territory))
    } catch (error) {
        console.error('Error creating territory:', error)
        throw error
    }
}

async function _assignTerritory(user: User, territoryId: string, publisherId: string) {
    try {
        await connectToDB()
        
        const territory = await Territory.findByIdAndUpdate(
            territoryId,
            { 
                assignedTo: publisherId,
                assignedDate: new Date(),
                status: 'assigned'
            },
            { new: true }
        ).populate('assignedTo', 'fullName')

        await logActivity({
            userId: user._id as string,
            type: 'territory_assign',
            action: `${user.fullName} assigned territory ${territory.number} to ${territory.assignedTo.fullName}`,
            details: { entityId: territoryId, entityType: 'Territory' }
        })

        revalidatePath('/dashboard/territory')
        return JSON.parse(JSON.stringify(territory))
    } catch (error) {
        console.error('Error assigning territory:', error)
        throw error
    }
}

async function _fetchTerritories(user: User) {
    try {
        await connectToDB()
        
        const territories = await Territory.find({})
            .populate('assignedTo', 'fullName')
            .sort({ number: 1 })

        return JSON.parse(JSON.stringify(territories))
    } catch (error) {
        console.error('Error fetching territories:', error)
        throw error
    }
}

async function _createReturnVisit(user: User, data: {
    territoryId: string
    address: string
    personName: string
    phoneNumber?: string
    email?: string
    interest: string
    nextVisitDate: Date
}) {
    try {
        await connectToDB()
        
        const returnVisit = new ReturnVisit({
            ...data,
            publisherId: user._id
        })
        await returnVisit.save()

        await logActivity({
            userId: user._id as string,
            type: 'return_visit_create',
            action: `${user.fullName} created return visit for ${data.personName}`,
            details: { entityId: returnVisit._id, entityType: 'ReturnVisit' }
        })

        revalidatePath('/dashboard/territory')
        return JSON.parse(JSON.stringify(returnVisit))
    } catch (error) {
        console.error('Error creating return visit:', error)
        throw error
    }
}

async function _addVisitRecord(user: User, returnVisitId: string, visitData: {
    notes: string
    literature?: string
    duration: number
}) {
    try {
        await connectToDB()
        
        const returnVisit = await ReturnVisit.findByIdAndUpdate(
            returnVisitId,
            {
                $push: {
                    visits: {
                        ...visitData,
                        date: new Date()
                    }
                }
            },
            { new: true }
        )

        await logActivity({
            userId: user._id as string,
            type: 'visit_record',
            action: `${user.fullName} added visit record`,
            details: { entityId: returnVisitId, entityType: 'ReturnVisit' }
        })

        revalidatePath('/dashboard/territory')
        return JSON.parse(JSON.stringify(returnVisit))
    } catch (error) {
        console.error('Error adding visit record:', error)
        throw error
    }
}

export const createTerritory = await withAuth(_createTerritory)
export const assignTerritory = await withAuth(_assignTerritory)
export const fetchTerritories = await withAuth(_fetchTerritories)
export const createReturnVisit = await withAuth(_createReturnVisit)
export const addVisitRecord = await withAuth(_addVisitRecord)