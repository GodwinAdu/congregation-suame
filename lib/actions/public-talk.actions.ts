'use server';

import { connectToDB } from '@/lib/mongoose';
import PublicTalk from '@/lib/models/public-talk.models';
import { User, withAuth } from '@/lib/helpers/auth';
import { logActivity } from '@/lib/utils/activity-logger';
import { revalidatePath } from 'next/cache';

async function _createPublicTalk(user: User, data: any) {
  try {
    if (!user) throw new Error('User not authorized');
    await connectToDB();

    const talk = await PublicTalk.create({ ...data, createdBy: user._id });
    await talk.populate('speaker chairman assistant');

    await logActivity({
      userId: user._id as string,
      type: 'public_talk_created',
      action: `${user.fullName} scheduled public talk for ${new Date(data.date).toDateString()}`,
      details: { entityId: talk._id, entityType: 'PublicTalk' }
    });

    revalidatePath('/dashboard/meetings/public-talks');
    return JSON.parse(JSON.stringify(talk));
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function _updatePublicTalk(user: User, id: string, data: any) {
  try {
    if (!user) throw new Error('User not authorized');
    await connectToDB();

    const talk = await PublicTalk.findByIdAndUpdate(id, data, { new: true })
      .populate('speaker chairman assistant');

    await logActivity({
      userId: user._id as string,
      type: 'public_talk_updated',
      action: `${user.fullName} updated public talk`,
      details: { entityId: id, entityType: 'PublicTalk' }
    });

    revalidatePath('/dashboard/meetings/public-talks');
    return JSON.parse(JSON.stringify(talk));
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function _deletePublicTalk(user: User, id: string) {
  try {
    if (!user) throw new Error('User not authorized');
    await connectToDB();

    await PublicTalk.findByIdAndDelete(id);

    await logActivity({
      userId: user._id as string,
      type: 'public_talk_deleted',
      action: `${user.fullName} deleted public talk`,
      details: { entityId: id, entityType: 'PublicTalk' }
    });

    revalidatePath('/dashboard/meetings/public-talks');
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function _getPublicTalks(user: User, startDate?: Date, endDate?: Date) {
  try {
    if (!user) throw new Error('User not authorized');
    await connectToDB();

    const query: any = {};
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const talks = await PublicTalk.find(query)
      .populate('speaker chairman assistant createdBy')
      .sort({ date: 1 });

    return JSON.parse(JSON.stringify(talks));
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export const createPublicTalk = await withAuth(_createPublicTalk);
export const updatePublicTalk = await withAuth(_updatePublicTalk);
export const deletePublicTalk = await withAuth(_deletePublicTalk);
export const getPublicTalks = await withAuth(_getPublicTalks);
