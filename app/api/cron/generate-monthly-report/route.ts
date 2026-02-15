import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongoose';
import Member from '@/lib/models/user.models';
import FieldServiceReport from '@/lib/models/field-service.models';
import Attendance from '@/lib/models/attendance.models';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();

    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const month = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

    // Field Service Stats
    const reports = await FieldServiceReport.find({ month }).lean();
    const totalReports = reports.length;
    const totalHours = reports.reduce((sum, r) => sum + (r.hours || 0), 0);
    const totalStudies = reports.reduce((sum, r) => sum + (r.bibleStudents || 0), 0);
    const auxiliaryPioneers = reports.filter(r => r.auxiliaryPioneer).length;

    // Attendance Stats
    const startDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    const endDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
    
    const attendanceRecords = await Attendance.find({
      date: { $gte: startDate, $lte: endDate }
    }).lean();

    const avgAttendance = attendanceRecords.length > 0
      ? Math.round(attendanceRecords.reduce((sum, r) => sum + r.attendance, 0) / attendanceRecords.length)
      : 0;

    // Member Stats
    const totalMembers = await Member.countDocuments({});
    const reportingRate = totalMembers > 0 ? Math.round((totalReports / totalMembers) * 100) : 0;

    const report = {
      month,
      generatedAt: new Date(),
      fieldService: {
        totalReports,
        totalHours,
        avgHours: totalReports > 0 ? Math.round(totalHours / totalReports) : 0,
        totalStudies,
        auxiliaryPioneers,
        reportingRate: `${reportingRate}%`
      },
      attendance: {
        avgAttendance,
        totalMeetings: attendanceRecords.length
      },
      congregation: {
        totalMembers
      }
    };

    // You can save this to a MonthlyReport model or send via email
    console.log('Monthly Report Generated:', report);

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
