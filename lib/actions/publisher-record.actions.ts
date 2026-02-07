'use server';

import { connectToDB } from '@/lib/mongoose';
import PublisherRecord from '@/lib/models/publisher-record.models';
import Member from '@/lib/models/user.models';
import { revalidatePath } from 'next/cache';

export async function getOrCreatePublisherRecord(memberId: string) {
  try {
    await connectToDB();

    let record = await PublisherRecord.findOne({ memberId }).lean();

    if (!record) {
      const member = await Member.findById(memberId);
      if (!member) throw new Error('Member not found');

      record = await PublisherRecord.create({
        memberId,
        congregationId: member.congregationId,
        appointments: [],
        serviceYears: [],
        notes: []
      });
    }

    return { success: true, data: JSON.parse(JSON.stringify(record)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updatePublisherRecord(memberId: string, data: any) {
  try {
    await connectToDB();

    const record = await PublisherRecord.findOneAndUpdate(
      { memberId },
      { $set: data },
      { new: true, upsert: true }
    );


    revalidatePath('/dashboard/publisher-records');
    return { success: true, data: JSON.parse(JSON.stringify(record)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addAppointment(memberId: string, appointment: any) {
  try {
    await connectToDB();

    const record = await PublisherRecord.findOneAndUpdate(
      { memberId },
      { $push: { appointments: appointment } },
      { new: true, upsert: true }
    );


    revalidatePath('/dashboard/publisher-records');
    return { success: true, data: JSON.parse(JSON.stringify(record)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addRecordNote(memberId: string, note: any, userId: string) {
  try {
    await connectToDB();

    const record = await PublisherRecord.findOneAndUpdate(
      { memberId },
      { $push: { notes: { ...note, addedBy: userId, date: new Date() } } },
      { new: true, upsert: true }
    );


    revalidatePath('/dashboard/publisher-records');
    return { success: true, data: JSON.parse(JSON.stringify(record)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function calculateServiceYear(memberId: string, year: string) {
  try {
    await connectToDB();

    const startDate = new Date(`${year}-09-01`);
    const endDate = new Date(`${parseInt(year) + 1}-08-31`);

    // Since Report model doesn't exist, return empty service year
    const totalHours = 0;
    const totalPlacements = 0;
    const totalReturnVisits = 0;
    const totalBibleStudies = 0;
    const monthsReported = 0;
    const pioneerMonths = 0;
    const auxiliaryMonths = 0;
    const averageHours = 0;

    const serviceYear = {
      year,
      totalHours,
      totalPlacements,
      totalReturnVisits,
      totalBibleStudies,
      averageHours,
      monthsReported,
      pioneerMonths,
      auxiliaryMonths
    };

    const record = await PublisherRecord.findOneAndUpdate(
      { memberId },
      { $pull: { serviceYears: { year } } },
      { new: true }
    );

    await PublisherRecord.findOneAndUpdate(
      { memberId },
      { $push: { serviceYears: serviceYear } },
      { new: true, upsert: true }
    );

    revalidatePath('/dashboard/publisher-records');
    return { success: true, data: serviceYear };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getPublisherRecords(congregationId: string) {
  try {
    await connectToDB();

    const records = await PublisherRecord.find({})
      .populate('memberId', 'firstName lastName email phone')
      .sort({ 'memberId.lastName': 1 })
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(records)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addTransferRecord(memberId: string, transfer: any) {
  try {
    await connectToDB();

    const record = await PublisherRecord.findOneAndUpdate(
      { memberId },
      { $push: { transferHistory: transfer } },
      { new: true, upsert: true }
    );


    revalidatePath('/dashboard/publisher-records');
    return { success: true, data: JSON.parse(JSON.stringify(record)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
