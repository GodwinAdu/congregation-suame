'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingDown, TrendingUp, Calendar, BarChart3, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface AttendanceAnalyticsClientProps {
  analytics: any[];
  declining: any[];
  trends: any[];
  comparison: any;
  stats: any;
}

export function AttendanceAnalyticsClient({ analytics, declining, trends, comparison, stats }: AttendanceAnalyticsClientProps) {
  const getAttendanceColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-100';
    if (rate >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getAttendanceStatus = (rate: number) => {
    if (rate >= 80) return 'Excellent';
    if (rate >= 60) return 'Good';
    if (rate >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMeetings || 0}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgAttendance || 0}</div>
            <p className="text-xs text-muted-foreground">Per meeting</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unique Attendees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueAttendees || 0}</div>
            <p className="text-xs text-muted-foreground">Of {stats.totalMembers || 0} members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendanceRate || 0}%</div>
            <Progress value={stats.attendanceRate || 0} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Declining</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{declining.length}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Midweek vs Weekend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Midweek Meetings</span>
                  <span className="text-sm text-muted-foreground">{comparison.midweek?.totalMeetings || 0} meetings</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Progress value={comparison.midweek?.avgAttendance || 0} className="h-3" />
                  </div>
                  <span className="font-bold">{comparison.midweek?.avgAttendance || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{comparison.midweek?.uniqueAttendees || 0} unique attendees</p>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Weekend Meetings</span>
                  <span className="text-sm text-muted-foreground">{comparison.weekend?.totalMeetings || 0} meetings</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Progress value={comparison.weekend?.avgAttendance || 0} className="h-3" />
                  </div>
                  <span className="font-bold">{comparison.weekend?.avgAttendance || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{comparison.weekend?.uniqueAttendees || 0} unique attendees</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Declining Attendance ({declining.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {declining.slice(0, 5).map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <p className="font-medium text-sm">{item.member?.firstName} {item.member?.lastName}</p>
                    <p className="text-xs text-muted-foreground">{item.olderRate}% → {item.recentRate}%</p>
                  </div>
                  <Badge className="bg-red-100 text-red-800">-{item.decline}%</Badge>
                </div>
              ))}
              {declining.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No declining attendance detected</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="patterns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="patterns">Attendance Patterns</TabsTrigger>
          <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
          <TabsTrigger value="declining">Declining Members</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Individual Attendance Patterns (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Member</th>
                      <th className="text-center p-2">Overall</th>
                      <th className="text-center p-2">Midweek</th>
                      <th className="text-center p-2">Weekend</th>
                      <th className="text-center p-2">Attended</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Last Seen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.sort((a, b) => b.attendanceRate - a.attendanceRate).map((item: any, idx: number) => (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          <div>
                            <p className="font-medium">{item.member?.firstName} {item.member?.lastName}</p>
                            <p className="text-xs text-muted-foreground">{item.member?.email}</p>
                          </div>
                        </td>
                        <td className="p-2 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-bold">{item.attendanceRate}%</span>
                            <Progress value={item.attendanceRate} className="w-16 h-2 mt-1" />
                          </div>
                        </td>
                        <td className="p-2 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getAttendanceColor(item.midweekRate)}`}>
                            {item.midweekRate}%
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getAttendanceColor(item.weekendRate)}`}>
                            {item.weekendRate}%
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          <span className="text-sm">{item.attendedMeetings}/{item.totalMeetings}</span>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline">{getAttendanceStatus(item.attendanceRate)}</Badge>
                        </td>
                        <td className="p-2 text-sm text-muted-foreground">
                          {item.lastAttendance ? new Date(item.lastAttendance).toLocaleDateString() : 'Never'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Monthly Attendance Trends (Last 12 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trends.map((trend: any, idx: number) => (
                  <div key={idx} className="border rounded p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold">{new Date(trend.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                      <Badge>{trend.totalMeetings} meetings</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Overall Avg</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={trend.avgAttendance} className="flex-1" />
                          <span className="font-bold">{trend.avgAttendance}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Midweek Avg</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={trend.avgMidweek} className="flex-1" />
                          <span className="font-bold">{trend.avgMidweek}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Weekend Avg</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={trend.avgWeekend} className="flex-1" />
                          <span className="font-bold">{trend.avgWeekend}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="declining" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Members with Declining Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Member</th>
                      <th className="text-center p-2">Previous Rate</th>
                      <th className="text-center p-2">Recent Rate</th>
                      <th className="text-center p-2">Decline</th>
                      <th className="text-left p-2">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {declining.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          <div>
                            <p className="font-medium">{item.member?.firstName} {item.member?.lastName}</p>
                            <p className="text-xs text-muted-foreground">{item.member?.email}</p>
                          </div>
                        </td>
                        <td className="p-2 text-center">
                          <span className="font-medium">{item.olderRate}%</span>
                        </td>
                        <td className="p-2 text-center">
                          <span className="font-medium">{item.recentRate}%</span>
                        </td>
                        <td className="p-2 text-center">
                          <Badge className="bg-red-100 text-red-800">-{item.decline}%</Badge>
                        </td>
                        <td className="p-2">
                          <Badge className={
                            item.decline > 40 ? 'bg-red-600 text-white' :
                            item.decline > 30 ? 'bg-orange-600 text-white' :
                            'bg-yellow-600 text-white'
                          }>
                            {item.decline > 40 ? 'High' : item.decline > 30 ? 'Medium' : 'Low'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {declining.length === 0 && (
                  <div className="text-center py-12">
                    <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Great News!</h3>
                    <p className="text-muted-foreground">No members with significantly declining attendance</p>
                  </div>
                )}
              </div>
            </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </>
    );
}
