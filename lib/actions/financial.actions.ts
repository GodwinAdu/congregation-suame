"use server"

import { User, withAuth } from "../helpers/auth"
import { Contribution, Expense, Budget, MonthlyReport, OpeningBalance } from "../models/financial.models"
import { connectToDB } from "../mongoose"
import { revalidatePath } from "next/cache"
import { logActivity } from "../utils/activity-logger"
import Member from "../models/user.models"

async function _recordContribution(user: User, data: {
    memberId?: string
    amount: number
    type: string
    method: 'cash' | 'check' | 'online' | 'bank-transfer'
    anonymous: boolean
    meetingDate: Date
    notes?: string
}) {
    try {
        if(!user) throw new Error('User not authenticated')
        await connectToDB()

        const contribution = new Contribution({
            ...data,
            recordedBy: user._id,
            receiptNumber: `REC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
        })
        await contribution.save()

        await logActivity({
            userId: user._id as string,
            type: 'contribution_record',
            action: `${user.fullName} recorded contribution of ₵${data.amount}`,
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
    category: string
    description: string
    amount: number
    paidTo: string
    receiptUrl?: string
    invoiceNumber?: string
    dueDate?: Date
    notes?: string
}) {
    try {
        if(!user) throw new Error('User not authenticated')
        await connectToDB()

        const expense = new Expense({
            ...data,
            requestedBy: user._id
        })
        await expense.save()

        await logActivity({
            userId: user._id as string,
            type: 'expense_create',
            action: `${user.fullName} created expense: ${data.description} - ₵${data.amount}`,
            details: { entityId: expense._id, entityType: 'Expense' }
        })

        revalidatePath('/dashboard/financial')
        return JSON.parse(JSON.stringify(expense))
    } catch (error) {
        console.error('Error creating expense:', error)
        throw error
    }
}

async function _approveExpense(user: User, expenseId: string, approved: boolean, notes?: string) {
    try {
        if (!user) throw new Error('User not authenticated')
        await connectToDB()

        const existingExpense = await Expense.findById(expenseId)
        if (!existingExpense) throw new Error('Expense not found')

        const expense = await Expense.findByIdAndUpdate(
            expenseId,
            {
                status: approved ? 'approved' : 'rejected',
                approvedBy: user._id,
                notes: notes || existingExpense.notes
            },
            { new: true }
        )

        await logActivity({
            userId: user._id as string,
            type: 'expense_approve',
            action: `${user.fullName} ${approved ? 'approved' : 'rejected'} expense: ${expense.description}`,
            details: { entityId: expenseId, entityType: 'Expense' }
        })

        revalidatePath('/dashboard/financial')
        return JSON.parse(JSON.stringify(expense))
    } catch (error) {
        console.error('Error approving expense:', error)
        throw error
    }
}

async function _markExpensePaid(user: User, expenseId: string, paymentDate: Date) {
    try {
        if (!user) throw new Error('User not authenticated')
        await connectToDB()

        const expense = await Expense.findByIdAndUpdate(
            expenseId,
            {
                status: 'paid',
                paymentDate
            },
            { new: true }
        )

        await logActivity({
            userId: user._id as string,
            type: 'expense_paid',
            action: `${user.fullName} marked expense as paid: ${expense.description}`,
            details: { entityId: expenseId, entityType: 'Expense' }
        })

        revalidatePath('/dashboard/financial')
        return JSON.parse(JSON.stringify(expense))
    } catch (error) {
        console.error('Error marking expense as paid:', error)
        throw error
    }
}

async function _fetchFinancialSummary(user: User, year?: number, month?: number) {
  try {
    if (!user) throw new Error('User not authenticated')
    await connectToDB()

    const currentYear = year || new Date().getFullYear()
    let startDate, endDate

    if (month) {
      startDate = new Date(currentYear, month - 1, 1)
      endDate = new Date(currentYear, month, 0)
    } else {
      startDate = new Date(currentYear, 0, 1)
      endDate = new Date(currentYear, 11, 31)
    }

    const budgetQuery: any = { year: currentYear }
    if (month) budgetQuery.month = month

    const [contributions, expenses, budget] = await Promise.all([
      Contribution.find({ createdAt: { $gte: startDate, $lte: endDate } })
        .populate('recordedBy', 'fullName')
        .lean(),
      Expense.find({ createdAt: { $gte: startDate, $lte: endDate } })
        .populate('approvedBy', 'fullName')
        .lean(),
      Budget.findOne(budgetQuery).lean()
    ])

    const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0)
    const totalExpenses = expenses.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0)
    const pendingExpenses = expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0)

    const contributionsByType = contributions.reduce((acc, c) => {
      acc[c.type] = (acc[c.type] || 0) + c.amount
      return acc
    }, {} as Record<string, number>)

    const expensesByCategory = expenses
      .filter(e => e.status === 'paid')
      .reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount
        return acc
      }, {} as Record<string, number>)

    // Get opening balance
    const currentOpeningBalance = await OpeningBalance.findOne({ year: currentYear, month: month || new Date().getMonth() + 1 })
    const openingBalance = currentOpeningBalance?.amount || 0

    return {
      totalContributions,
      totalExpenses,
      pendingExpenses,
      balance: openingBalance + totalContributions - totalExpenses,
      openingBalance,
      contributionsByType,
      expensesByCategory,
      contributions: contributions.slice(0, 10),
      expenses: expenses.slice(0, 10),
      budget,
      year: currentYear,
      month: month || new Date().getMonth() + 1
    }
  } catch (error) {
    console.error('Error fetching financial summary:', error)
    throw error
  }
}

async function _createBudget(user: User, data: {
    year: number
    month?: number
    categories: Array<{
        name: string
        budgeted: number
        description?: string
    }>
}) {
    try {
        if(!user) throw new Error('User not authenticated')
        await connectToDB()

        const totalBudget = data.categories.reduce((sum, cat) => sum + cat.budgeted, 0)

        const budget = new Budget({
            ...data,
            totalBudget,
            approvedBy: user._id,
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
            action: `${user.fullName} created budget for ${data.year}${data.month ? `/${data.month}` : ''}`,
            details: { entityId: budget._id, entityType: 'Budget' }
        })

        revalidatePath('/dashboard/financial')
        return JSON.parse(JSON.stringify(budget))
    } catch (error) {
        console.error('Error creating budget:', error)
        throw error
    }
}

async function _generateMonthlyReport(user: User, year: number, month: number) {
    try {
        if (!user) throw new Error('User not authenticated')
        await connectToDB()

        const startDate = new Date(year, month - 1, 1)
        const endDate = new Date(year, month, 0)
        const prevMonth = month === 1 ? 12 : month - 1
        const prevYear = month === 1 ? year - 1 : year

        // Get opening balance for current month or previous month's closing balance
        const currentOpeningBalance = await OpeningBalance.findOne({ year, month })
        const prevReport = await MonthlyReport.findOne({ year: prevYear, month: prevMonth })
        const openingBalance = currentOpeningBalance?.amount || prevReport?.closingBalance || 0

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
        const closingBalance = openingBalance + totalContributions - totalExpenses

        const contributionBreakdown = contributions.reduce((acc, c) => {
            switch (c.type) {
                case 'worldwide-work':
                    acc.worldwideWork += c.amount
                    break
                case 'local-congregation-expenses':
                    acc.localExpenses += c.amount
                    break
                case 'kingdom-hall-construction':
                    acc.kingdomHall += c.amount
                    break
                case 'circuit-assembly-expenses':
                    acc.circuitAssembly += c.amount
                    break
                default:
                    acc.other += c.amount
            }
            return acc
        }, {
            worldwideWork: 0,
            localExpenses: 0,
            kingdomHall: 0,
            circuitAssembly: 0,
            other: 0
        })

        const expenseBreakdown = expenses.reduce((acc, e) => {
            switch (e.category) {
                case 'utilities':
                    acc.utilities += e.amount
                    break
                case 'maintenance':
                    acc.maintenance += e.amount
                    break
                case 'supplies':
                case 'cleaning-supplies':
                    acc.supplies += e.amount
                    break
                case 'literature':
                    acc.literature += e.amount
                    break
                default:
                    acc.other += e.amount
            }
            return acc
        }, {
            utilities: 0,
            maintenance: 0,
            supplies: 0,
            literature: 0,
            other: 0
        })

        const report = new MonthlyReport({
            year,
            month,
            openingBalance,
            totalContributions,
            totalExpenses,
            closingBalance,
            contributionBreakdown,
            expenseBreakdown,
            preparedBy: user._id
        })
        await report.save()

        await logActivity({
            userId: user._id as string,
            type: 'report_generate',
            action: `${user.fullName} generated monthly financial report for ${year}/${month}`,
            details: { entityId: report._id, entityType: 'MonthlyReport' }
        })

        revalidatePath('/dashboard/financial')
        return JSON.parse(JSON.stringify(report))
    } catch (error) {
        console.error('Error generating monthly report:', error)
        throw error
    }
}

async function _fetchContributions(user: User, filters?: {
    startDate?: Date
    endDate?: Date
    type?: string
    method?: string
}) {
    try {
        if (!user) throw new Error('User not authenticated')
        await connectToDB()

        let query: any = {}

        if (filters?.startDate && filters?.endDate) {
            query.createdAt = { $gte: filters.startDate, $lte: filters.endDate }
        }

        if (filters?.type) {
            query.type = filters.type
        }

        if (filters?.method) {
            query.method = filters.method
        }

        const contributions = await Contribution.find(query)
            .populate('memberId', 'fullName')
            .populate('recordedBy', 'fullName')
            .sort({ createdAt: -1 })

            

        return JSON.parse(JSON.stringify(contributions))
    } catch (error) {
        console.error('Error fetching contributions:', error)
        throw error
    }
}

async function _fetchExpenses(user: User, filters?: {
    startDate?: Date
    endDate?: Date
    category?: string
    status?: string
}) {
    try {
        if (!user) throw new Error('User not authenticated')
        await connectToDB()

        let query: any = {}

        if (filters?.startDate && filters?.endDate) {
            query.createdAt = { $gte: filters.startDate, $lte: filters.endDate }
        }

        if (filters?.category) {
            query.category = filters.category
        }

        if (filters?.status) {
            query.status = filters.status
        }

        const expenses = await Expense.find(query)
            .populate('requestedBy', 'fullName')
            .populate('approvedBy', 'fullName')
            .sort({ createdAt: -1 })

        return JSON.parse(JSON.stringify(expenses))
    } catch (error) {
        console.error('Error fetching expenses:', error)
        throw error
    }
}

async function _deleteExpense(user: User, expenseId: string) {
    try {
        if (!user) throw new Error('User not authenticated')
        await connectToDB()

        const expense = await Expense.findById(expenseId)
        if (!expense) {
            throw new Error('Expense not found')
        }

        // Only allow deletion if pending or if user is the requester
        if (expense.status !== 'pending' && expense.requestedBy.toString() !== user._id?.toString()) {
            throw new Error('Cannot delete approved or paid expenses')
        }

        await Expense.findByIdAndDelete(expenseId)

        await logActivity({
            userId: user._id as string,
            type: 'expense_delete',
            action: `${user.fullName} deleted expense: ${expense.description}`,
            details: { entityId: expenseId, entityType: 'Expense' }
        })

        revalidatePath('/dashboard/financial')
        return { success: true }
    } catch (error) {
        console.error('Error deleting expense:', error)
        throw error
    }
}

async function _fetchBudgets(user: User, year?: number) {
    try {
        if (!user) throw new Error('User not authenticated')
        await connectToDB()

        let query: any = {}
        if (year) {
            query.year = year
        }

        const budgets = await Budget.find(query)
            .populate('approvedBy', 'fullName')
            .sort({ year: -1, month: -1 })

        return JSON.parse(JSON.stringify(budgets))
    } catch (error) {
        console.error('Error fetching budgets:', error)
        throw error
    }
}

async function _setOpeningBalance(user: User, data: {
    year: number
    month: number
    amount: number
    notes?: string
}) {
    try {
        if (!user) throw new Error('User not authenticated')
        await connectToDB()
        
        const existingBalance = await OpeningBalance.findOne({ year: data.year, month: data.month })
        
        if (existingBalance) {
            existingBalance.amount = data.amount
            existingBalance.notes = data.notes
            existingBalance.recordedBy = user._id
            await existingBalance.save()
        } else {
            const openingBalance = new OpeningBalance({
                ...data,
                recordedBy: user._id
            })
            await openingBalance.save()
        }

        await logActivity({
            userId: user._id as string,
            type: 'opening_balance_set',
            action: `${user.fullName} set opening balance for ${data.year}/${data.month}: ₵${data.amount}`,
            details: { entityType: 'OpeningBalance' }
        })

        revalidatePath('/dashboard/financial')
        return { success: true }
    } catch (error) {
        console.error('Error setting opening balance:', error)
        throw error
    }
}

export const recordContribution = await withAuth(_recordContribution)
export const createExpense = await withAuth(_createExpense)
export const approveExpense = await withAuth(_approveExpense)
export const markExpensePaid = await withAuth(_markExpensePaid)
export const fetchFinancialSummary = await withAuth(_fetchFinancialSummary)
export const createBudget = await withAuth(_createBudget)
export const generateMonthlyReport = await withAuth(_generateMonthlyReport)
export const fetchContributions = await withAuth(_fetchContributions)
export const fetchExpenses = await withAuth(_fetchExpenses)
export const deleteExpense = await withAuth(_deleteExpense)
export const fetchBudgets = await withAuth(_fetchBudgets)
export const setOpeningBalance = await withAuth(_setOpeningBalance)