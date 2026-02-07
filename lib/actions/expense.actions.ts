'use server';

import { connectToDB } from '@/lib/mongoose';
import Expense from '@/lib/models/expense.models';
import { revalidatePath } from 'next/cache';

export async function createExpense(data: {
  title: string;
  description: string;
  amount: number;
  category: string;
  requestedBy: string;
  budgetCategory?: string;
  congregationId: string;
  approvers: Array<{ approverId: string; level: number }>;
}) {
  try {
    await connectToDB();
    
    const expense = await Expense.create({
      ...data,
      approvals: data.approvers.map(a => ({ ...a, status: 'pending' })),
      currentApprovalLevel: 1
    });
    
    revalidatePath('/dashboard/expenses');
    return { success: true, expense: JSON.parse(JSON.stringify(expense)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function approveExpense(expenseId: string, approverId: string, comments?: string) {
  try {
    await connectToDB();
    
    const expense = await Expense.findById(expenseId);
    if (!expense) return { success: false, error: 'Expense not found' };
    
    const approval = expense.approvals.find(
      (a: any) => a.approverId.toString() === approverId && a.level === expense.currentApprovalLevel
    );
    
    if (!approval) return { success: false, error: 'Not authorized' };
    
    approval.status = 'approved';
    approval.date = new Date();
    if (comments) approval.comments = comments;
    
    const nextLevel = expense.approvals.find((a: any) => a.level === expense.currentApprovalLevel + 1);
    
    if (nextLevel) {
      expense.currentApprovalLevel += 1;
    } else {
      expense.status = 'approved';
    }
    
    await expense.save();
    revalidatePath('/dashboard/expenses');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function rejectExpense(expenseId: string, approverId: string, comments: string) {
  try {
    await connectToDB();
    
    const expense = await Expense.findById(expenseId);
    if (!expense) return { success: false, error: 'Expense not found' };
    
    const approval = expense.approvals.find(
      (a: any) => a.approverId.toString() === approverId && a.level === expense.currentApprovalLevel
    );
    
    if (!approval) return { success: false, error: 'Not authorized' };
    
    approval.status = 'rejected';
    approval.date = new Date();
    approval.comments = comments;
    expense.status = 'rejected';
    
    await expense.save();
    revalidatePath('/dashboard/expenses');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function markExpensePaid(expenseId: string, receiptUrl?: string) {
  try {
    await connectToDB();
    
    await Expense.findByIdAndUpdate(expenseId, {
      status: 'paid',
      paidDate: new Date(),
      ...(receiptUrl && { receiptUrl })
    });
    
    revalidatePath('/dashboard/expenses');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getExpenses(congregationId: string, filters?: {
  status?: string;
  category?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    await connectToDB();
    
    const query: any = { congregationId };
    if (filters?.status) query.status = filters.status;
    if (filters?.category) query.category = filters.category;
    if (filters?.startDate || filters?.endDate) {
      query.requestDate = {};
      if (filters.startDate) query.requestDate.$gte = filters.startDate;
      if (filters.endDate) query.requestDate.$lte = filters.endDate;
    }
    
    const expenses = await Expense.find(query)
      .populate('requestedBy', 'firstName lastName')
      .populate('approvals.approverId', 'firstName lastName')
      .sort({ requestDate: -1 });
    
    return { success: true, expenses: JSON.parse(JSON.stringify(expenses)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getPendingApprovals(approverId: string, congregationId: string) {
  try {
    await connectToDB();
    
    const expenses = await Expense.find({
      congregationId,
      status: 'pending',
      'approvals.approverId': approverId,
      'approvals.status': 'pending'
    })
      .populate('requestedBy', 'firstName lastName')
      .sort({ requestDate: -1 });
    
    const filtered = expenses.filter((e: any) => 
      e.approvals.some((a: any) => 
        a.approverId.toString() === approverId && 
        a.level === e.currentApprovalLevel &&
        a.status === 'pending'
      )
    );
    
    return { success: true, expenses: JSON.parse(JSON.stringify(filtered)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getBudgetReport(congregationId: string, year: number) {
  try {
    await connectToDB();
    
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    const expenses = await Expense.find({
      congregationId,
      status: { $in: ['approved', 'paid'] },
      requestDate: { $gte: startDate, $lte: endDate }
    });
    
    const byCategory = expenses.reduce((acc: any, exp: any) => {
      if (!acc[exp.category]) acc[exp.category] = 0;
      acc[exp.category] += exp.amount;
      return acc;
    }, {});
    
    const total = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
    const paid = expenses.filter((e: any) => e.status === 'paid').reduce((sum: number, exp: any) => sum + exp.amount, 0);
    
    return { 
      success: true, 
      report: { byCategory, total, paid, pending: total - paid }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getExpenseStats(congregationId: string) {
  try {
    await connectToDB();
    
    const [pending, approved, rejected, paid] = await Promise.all([
      Expense.countDocuments({ congregationId, status: 'pending' }),
      Expense.countDocuments({ congregationId, status: 'approved' }),
      Expense.countDocuments({ congregationId, status: 'rejected' }),
      Expense.countDocuments({ congregationId, status: 'paid' })
    ]);
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const monthlyTotal = await Expense.aggregate([
      { 
        $match: { 
          congregationId: congregationId,
          status: { $in: ['approved', 'paid'] },
          requestDate: { $gte: thisMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    return { 
      success: true, 
      stats: { 
        pending, 
        approved, 
        rejected, 
        paid,
        monthlyTotal: monthlyTotal[0]?.total || 0
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
