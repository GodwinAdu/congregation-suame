'use server';

import { connectToDB } from '@/lib/mongoose';
import AssignmentHistory from '@/lib/models/assignment-history.models';
import Member from '@/lib/models/user.models';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';

export async function createAssignmentHistory(data: {
  memberId: string;
  assignmentType: string;
  assignmentDate: Date;
  meetingType: 'midweek' | 'weekend';
  partNumber?: string;
  duration?: number;
  notes?: string;
}) {
  try {
    await connectToDB();

    const member = await Member.findById(data.memberId);
    if (!member) throw new Error('Member not found');

    const history = await AssignmentHistory.create({
      ...data,
      completed: false
    });


    revalidatePath('/dashboard/assignments/history');
    return { success: true, data: JSON.parse(JSON.stringify(history)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateAssignmentHistory(id: string, data: Partial<{
  assignmentType: string;
  assignmentDate: Date;
  meetingType: 'midweek' | 'weekend';
  partNumber?: string;
  duration?: number;
  notes?: string;
  completed: boolean;
}>) {
  try {
    await connectToDB();

    const history = await AssignmentHistory.findByIdAndUpdate(id, data, { new: true });
    if (!history) throw new Error('Assignment history not found');


    revalidatePath('/dashboard/assignments/history');
    return { success: true, data: JSON.parse(JSON.stringify(history)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAssignmentHistory(id: string) {
  try {
    await connectToDB();

    await AssignmentHistory.findByIdAndDelete(id);


    revalidatePath('/dashboard/assignments/history');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAssignmentHistory(congregationId: string, filters?: {
  memberId?: string;
  startDate?: Date;
  endDate?: Date;
  meetingType?: 'midweek' | 'weekend';
}) {
  try {
    await connectToDB();

    const query: any = {};
    if (filters?.memberId) query.memberId = filters.memberId;
    if (filters?.meetingType) query.meetingType = filters.meetingType;
    if (filters?.startDate || filters?.endDate) {
      query.assignmentDate = {};
      if (filters.startDate) query.assignmentDate.$gte = filters.startDate;
      if (filters.endDate) query.assignmentDate.$lte = filters.endDate;
    }

    const history = await AssignmentHistory.find(query)
      .populate('memberId', 'fullName firstName lastName')
      .sort({ assignmentDate: -1 })
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(history)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAssignmentFrequency(congregationId: string, months: number = 6) {
  try {
    await connectToDB();

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const frequency = await AssignmentHistory.aggregate([
      {
        $match: {
          assignmentDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$memberId',
          totalAssignments: { $sum: 1 },
          midweekCount: {
            $sum: { $cond: [{ $eq: ['$meetingType', 'midweek'] }, 1, 0] }
          },
          weekendCount: {
            $sum: { $cond: [{ $eq: ['$meetingType', 'weekend'] }, 1, 0] }
          },
          lastAssignment: { $max: '$assignmentDate' },
          assignmentTypes: { $addToSet: '$assignmentType' }
        }
      },
      {
        $lookup: {
          from: 'members',
          localField: '_id',
          foreignField: '_id',
          as: 'member'
        }
      },
      { $unwind: '$member' },
      {
        $project: {
          memberId: '$_id',
          memberName: { $ifNull: ['$member.fullName', { $concat: ['$member.firstName', ' ', '$member.lastName'] }] },
          totalAssignments: 1,
          midweekCount: 1,
          weekendCount: 1,
          lastAssignment: 1,
          assignmentTypes: 1,
          daysSinceLastAssignment: {
            $divide: [
              { $subtract: [new Date(), '$lastAssignment'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      { $sort: { totalAssignments: -1 } }
    ]);

    return { success: true, data: JSON.parse(JSON.stringify(frequency)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getMembersWithoutRecentAssignments(congregationId: string, days: number = 90) {
  try {
    await connectToDB();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentAssignments = await AssignmentHistory.find({
      assignmentDate: { $gte: cutoffDate }
    }).distinct('memberId');

    const members = await Member.find({
      _id: { $nin: recentAssignments }
    })
      .populate('privileges')
      .select('fullName firstName lastName email phone privileges')
      .lean();

    const membersWithLastAssignment = await Promise.all(
      members.map(async (member) => {
        const lastAssignment = await AssignmentHistory.findOne({
          memberId: member._id
        })
          .sort({ assignmentDate: -1 })
          .select('assignmentDate assignmentType')
          .lean();

        return {
          ...member,
          lastAssignment: lastAssignment ? {
            date: lastAssignment.assignmentDate,
            type: lastAssignment.assignmentType,
            daysAgo: Math.floor((Date.now() - new Date(lastAssignment.assignmentDate).getTime()) / (1000 * 60 * 60 * 24))
          } : null
        };
      })
    );

    return { success: true, data: JSON.parse(JSON.stringify(membersWithLastAssignment)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAssignmentStats(congregationId: string) {
  try {
    await connectToDB();

    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const last3Months = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const last6Months = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    const [totalAssignments, lastMonthCount, last3MonthsCount, last6MonthsCount, uniqueMembers] = await Promise.all([
      AssignmentHistory.countDocuments({}),
      AssignmentHistory.countDocuments({ assignmentDate: { $gte: lastMonth } }),
      AssignmentHistory.countDocuments({ assignmentDate: { $gte: last3Months } }),
      AssignmentHistory.countDocuments({ assignmentDate: { $gte: last6Months } }),
      AssignmentHistory.distinct('memberId', { assignmentDate: { $gte: last6Months } })
    ]);

    const typeDistribution = await AssignmentHistory.aggregate([
      { $match: { assignmentDate: { $gte: last6Months } } },
      { $group: { _id: '$assignmentType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return {
      success: true,
      data: {
        totalAssignments,
        lastMonthCount,
        last3MonthsCount,
        last6MonthsCount,
        uniqueMembers: uniqueMembers.length,
        typeDistribution: JSON.parse(JSON.stringify(typeDistribution))
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
