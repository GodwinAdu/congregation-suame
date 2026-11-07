import { NextRequest, NextResponse } from 'next/server';
import { sendCOVisitReminders } from '@/lib/services/co-visit-reminders';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ?dry=1 shows who would be reminded without saving or sending anything.
    const dryRun = request.nextUrl.searchParams.get('dry') === '1';
    const summary = await sendCOVisitReminders({ dryRun });
    return NextResponse.json({ success: true, ...summary });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
