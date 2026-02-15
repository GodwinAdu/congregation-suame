import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongoose';
import Member from '@/lib/models/user.models';
import FieldServiceReport from '@/lib/models/field-service.models';
import SMSLog from '@/lib/models/sms-log.models';
import { smsConfig } from '@/lib/sms/sms-config';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();

    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const members = await Member.find({}).select('_id fullName phone').lean();
    const reports = await FieldServiceReport.find({ month }).select('publisher').lean();
    const reportedIds = new Set(reports.map(r => r.publisher.toString()));

    const nonReporters = members.filter(m => 
      !reportedIds.has(m._id.toString()) && m.phone
    );

    if (nonReporters.length === 0) {
      return NextResponse.json({ success: true, message: 'All members have reported', sent: 0 });
    }

    const message = `Dear Brothers and Sisters, this is a friendly reminder to submit your field service report for ${monthName}. You can send your report directly to +233 551556650. Thank you for your faithful service!`;
    
    await smsConfig({
      text: message,
      sender: 'Suame JW',
      destinations: nonReporters.map(m => m.phone)
    });

    await SMSLog.insertMany(
      nonReporters.map(m => ({
        recipient: m._id,
        phone: m.phone,
        message,
        month,
        sentBy: null,
        sentAt: new Date()
      }))
    );

    return NextResponse.json({ success: true, sent: nonReporters.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
