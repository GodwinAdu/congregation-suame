"use server"

import { User, withAuth } from "../helpers/auth"
import { Contribution, Expense, Budget } from "../models/financial.models"
import { connectToDB } from "../mongoose"
import { revalidatePath } from "next/cache"
import { logActivity } from "../utils/activity-logger"

async function _recordContribution(user: User, data: {
    memberId?: string
    amount: number
    type: 'worldwide-work' | 'local-congregation' | 'kingdom-hall' | 'circuit-assembly' | 'other'
    method: 'cash' | 'check' | 'online' | 'bank-transfer'
    anonymous: boolean
    notes?: string
}) {
    try {
        await connectToDB()
        
        const contribution = new Contribution({
            ...data,
            receiptNumber: `REC-${Date.now()}`
        })
        await contribution.save()

        await logActivity({
            userId: user._id as string,
            type: 'contribution_record',
            action: `${user.fullName} recorded contribution of $${data.amount}`,
            details: { entityId: contribution._id, entityType: 'Contribution' }
        })

        revalidatePath('/dashboard/financial')
        return JSON.parse(JSON.stringify(contribution))
    } catch (error) {
        console.error('Error recording contribution:', error)
        throw error
    }
}

async function _createExpense(user: User, data: {
    category: 'utilities' | 'maintenance' | 'supplies' | 'literature' | 'assembly' | 'other'
    description: string
    amount: number
    paidTo: string
    receiptUrl?: string
}) {
    try {
        await connectToDB()
        
        const expense = new Expense({
            ...data,
            approvedBy: user._id
        })
        await expense.save()

        await logActivity({
            userId: user._id as string,
            type: 'expense_create',
            action: `${user.fullName} created expense: ${data.description} - $${data.amount}`,
            details: { entityId: expense._id, entityType: 'Expense' }
        })

        revalidatePath('/dashboard/financial')
        return JSON.parse(JSON.stringify(expense))
    } catch (error) {
        console.error('Error creating expense:', error)
        throw error
    }
}

async function _fetchFinancialSummary(user: User, year?: number) {
    try {
        await connectToDB()
        
        const currentYear = year || new Date().getFullYear()
        const startDate = new Date(currentYear, 0, 1)
        const endDate = new Date(currentYear, 11, 31)

        const [contributions, expenses] = await Promise.all([
            Contribution.find({
                createdAt: { $gte: startDate, $lte: endDate }
            }),
            Expense.find({
                createdAt: { $gte: startDate, $lte: endDate },
                status: 'paid'
            })
        ])

        const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0)
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

        const contributionsByType = contributions.reduce((acc, c) => {
            acc[c.type] = (acc[c.type] || 0) + c.amount
            return acc
        }, {} as Record<string, number>)

        const expensesByCategory = expenses.reduce((acc, e) => {
            acc[e.category] = (acc[e.category] || 0) + e.amount
            return acc
        }, {} as Record<string, number>)

        return {
            totalContributions,
            totalExpenses,
            balance: totalContributions - totalExpenses,
            contributionsByType,
            expensesByCategory,
            year: currentYear
        }
    } catch (error) {
        console.error('Error fetching financial summary:', error)
        throw error
    }
}

async function _createBudget(user: User, data: {
    year: number
    categories: Array<{
        name: string
        budgeted: number
    }>
}) {
    try {
        await connectToDB()
        
        const totalBudget = data.categories.reduce((sum, cat) => sum + cat.budgeted, 0)
        
        const budget = new Budget({
            ...data,
            totalBudget,
            categories: data.categories.map(cat => ({
                ...cat,
                spent: 0,
                remaining: cat.budgeted
            }))
        })
        await budget.save()

        await logActivity({
            userId: user._id as string,
            type: 'budget_create',
            action: `${user.fullName} created budget for ${data.year}`,
            details: { entityId: budget._id, entityType: 'Budget' }
        })

        revalidatePath('/dashboard/financial')
        return JSON.parse(JSON.stringify(budget))
    } catch (error) {
        console.error('Error creating budget:', error)
        throw error
    }
}

async function _fetchContributions(user: User, filters?: {
    startDate?: Date
    endDate?: Date
    type?: string
}) {
    try {
        await connectToDB()
        
        let query: any = {}
        
        if (filters?.startDate && filters?.endDate) {
            query.createdAt = { $gte: filters.startDate, $lte: filters.endDate }
        }
        
        if (filters?.type) {
            query.type = filters.type
        }

        const contributions = await Contribution.find(query)
            .populate('memberId', 'fullName')
            .sort({ createdAt: -1 })

        return JSON.parse(JSON.stringify(contributions))
    } catch (error) {
        console.error('Error fetching contributions:', error)
        throw error
    }
}

export const recordContribution = await withAuth(_recordContribution)
export const createExpense = await withAuth(_createExpense)
export const fetchFinancialSummary = await withAuth(_fetchFinancialSummary)
export const createBudget = await withAuth(_createBudget)
export const fetchContributions = await withAuth(_fetchContributions)