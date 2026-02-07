'use server';

import { connectToDB } from '@/lib/mongoose';
import Member from '@/lib/models/user.models';
import FieldServiceReport from '@/lib/models/field-service.models';
import { revalidatePath } from 'next/cache';

export async function getPublisherRecordData(memberId: string) {
  try {
    await connectToDB();

    const member = await Member.findById(memberId)
      .populate('privileges', 'name')
      .populate('groupId', 'name')
      .lean();

    if (!member) throw new Error('Member not found');

    const reports = await FieldServiceReport.find({ publisher: memberId })
      .sort({ month: -1 })
      .lean();

    const serviceYears = calculateServiceYears(reports);

    return {
      success: true,
      data: {
        member: JSON.parse(JSON.stringify(member)),
        reports: JSON.parse(JSON.stringify(reports)),
        serviceYears
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

function calculateServiceYears(reports: any[]) {
  const years: any = {};
  
  reports.forEach(report => {
    const [year, month] = report.month.split('-');
    const serviceYear = parseInt(month) >= 9 ? year : (parseInt(year) - 1).toString();
    
    if (!years[serviceYear]) {
      years[serviceYear] = {
        year: serviceYear,
        totalHours: 0,
        totalBibleStudies: 0,
        monthsReported: 0,
        pioneerMonths: 0,
        auxiliaryMonths: 0
      };
    }
    
    years[serviceYear].totalHours += report.hours || 0;
    years[serviceYear].totalBibleStudies += report.bibleStudents || 0;
    years[serviceYear].monthsReported += report.check ? 1 : 0;
    if (report.auxiliaryPioneer) years[serviceYear].auxiliaryMonths += 1;
  });
  
  return Object.values(years).map((y: any) => ({
    ...y,
    averageHours: y.monthsReported > 0 ? Math.round(y.totalHours / y.monthsReported) : 0
  }));
}

export async function updateMemberRecord(memberId: string, data: any) {
  try {
    await connectToDB();
    
    const member = await Member.findByIdAndUpdate(
      memberId,
      { $set: data },
      { new: true }
    );

    revalidatePath('/dashboard/publisher-records');
    return { success: true, data: JSON.parse(JSON.stringify(member)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
