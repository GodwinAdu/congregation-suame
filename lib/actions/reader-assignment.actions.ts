'use server';

import { connectToDB } from '@/lib/mongoose';
import ReaderAssignment from '@/lib/models/reader-assignment.models';
import Member from '@/lib/models/user.models';
import { User, withAuth } from '@/lib/helpers/auth';
import { logActivity } from '@/lib/utils/activity-logger';
import { revalidatePath } from 'next/cache';

async function _createReaderAssignment(user: User, data: any) {
  try {
    if (!user) throw new Error('User not authorized');
    await connectToDB();

    const assignment: any = await ReaderAssignment.create({ ...data, createdBy: user._id });
    const populated = await ReaderAssignment.findById(assignment._id)
      .populate({ path: 'reader', model: Member })
      .populate({ path: 'assistant', model: Member });

    await logActivity({
      userId: user._id as string,
      type: 'reader_assignment_created',
      action: `${user.fullName} assigned ${data.studyType} reader for ${new Date(data.date).toDateString()}`,
      details: { entityId: assignment._id.toString(), entityType: 'ReaderAssignment' }
    });

    revalidatePath('/dashboard/meetings/readers');
    return JSON.parse(JSON.stringify(populated));
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function _updateReaderAssignment(user: User, id: string, data: any) {
  try {
    if (!user) throw new Error('User not authorized');
    await connectToDB();

    const assignment = await ReaderAssignment.findByIdAndUpdate(id, data, { new: true })
      .populate({ path: 'reader', model: Member })
      .populate({ path: 'assistant', model: Member });

    await logActivity({
      userId: user._id as string,
      type: 'reader_assignment_updated',
      action: `${user.fullName} updated reader assignment`,
      details: { entityId: id, entityType: 'ReaderAssignment' }
    });

    revalidatePath('/dashboard/meetings/readers');
    return JSON.parse(JSON.stringify(assignment));
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function _deleteReaderAssignment(user: User, id: string) {
  try {
    if (!user) throw new Error('User not authorized');
    await connectToDB();

    await ReaderAssignment.findByIdAndDelete(id);

    await logActivity({
      userId: user._id as string,
      type: 'reader_assignment_deleted',
      action: `${user.fullName} deleted reader assignment`,
      details: { entityId: id, entityType: 'ReaderAssignment' }
    });

    revalidatePath('/dashboard/meetings/readers');
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function _getReaderAssignments(user: User, startDate?: Date, endDate?: Date) {
  try {
    if (!user) throw new Error('User not authorized');
    await connectToDB();

    const query: any = {};
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const assignments = await ReaderAssignment.find(query)
      .populate({ path: 'reader', model: Member })
      .populate({ path: 'assistant', model: Member })
      .populate({ path: 'createdBy', model: Member })
      .sort({ date: 1 });

    return JSON.parse(JSON.stringify(assignments));
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export const createReaderAssignment = await withAuth(_createReaderAssignment);
export const updateReaderAssignment = await withAuth(_updateReaderAssignment);
export const deleteReaderAssignment = await withAuth(_deleteReaderAssignment);
export const getReaderAssignments = await withAuth(_getReaderAssignments);
