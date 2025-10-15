"use server"

import { connectToDB } from "../mongoose"
import Role from "../models/role.models"

export async function updateAllRolesWithNewPermissions() {
    try {
        await connectToDB()
        
        const result = await Role.updateMany(
            {},
            {
                $set: {
                    'permissions.territory': true,
                    'permissions.financial': true,
                    'permissions.communication': true,
                    'permissions.events': true,
                    'permissions.documents': true,
                    'permissions.aiAssistant': true,
                    'permissions.notifications': true
                }
            }
        )

        return {
            success: true,
            message: `Updated ${result.modifiedCount} roles with new permissions`
        }
    } catch (error) {
        console.error('Error updating roles:', error)
        return {
            success: false,
            message: 'Failed to update roles'
        }
    }
}