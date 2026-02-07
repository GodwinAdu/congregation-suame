import { currentUser } from '@/lib/helpers/session';
import { redirect } from 'next/navigation';
import { getAttendanceAnalytics, getDecliningAttendance, getAttendanceTrends, getAttendanceComparison, getAttendanceStats } from '@/lib/actions/attendance-analytics.actions';
import { AttendanceAnalyticsClient } from './_components/AttendanceAnalyticsClient';

export default async function AttendanceAnalyticsPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const [analyticsRes, decliningRes, trendsRes, comparisonRes, statsRes] = await Promise.all([
    getAttendanceAnalytics('', 6),
    getDecliningAttendance(''),
    getAttendanceTrends('', 12),
    getAttendanceComparison(''),
    getAttendanceStats('')
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meeting Attendance Analytics</h1>
        <p className="text-muted-foreground">Track attendance patterns and identify trends</p>
      </div>

      <AttendanceAnalyticsClient
        analytics={analyticsRes.data || []}
        declining={decliningRes.data || []}
        trends={trendsRes.data || []}
        comparison={comparisonRes.data || {}}
        stats={statsRes.data || {}}
      />
    </div>
  );
}
