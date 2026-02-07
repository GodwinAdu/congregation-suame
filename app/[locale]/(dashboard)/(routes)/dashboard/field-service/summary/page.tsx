"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, TrendingUp, TrendingDown, AlertTriangle, Users, RefreshCw, Download, Filter } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { getFieldServiceSummary } from '@/lib/actions/field-service-summary.actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { toast } from 'sonner'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function FieldServiceSummaryPage() {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<any>(null)
    const [groups, setGroups] = useState<any[]>([])
    const [roles, setRoles] = useState<any[]>([])
    const [startDate, setStartDate] = useState(() => {
        const date = new Date()
        date.setMonth(date.getMonth() - 5)
        return date.toISOString().slice(0, 7)
    })
    const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 7))
    const [groupFilter, setGroupFilter] = useState('all')
    const [roleFilter, setRoleFilter] = useState('all')

    const fetchData = async () => {
        setLoading(true)
        try {
            const result = await getFieldServiceSummary(startDate, endDate, groupFilter !== 'all' ? groupFilter : undefined, roleFilter !== 'all' ? roleFilter : undefined)
            setData(result)
        } catch (error) {
            console.error('Error fetching summary:', error)
            toast.error('Failed to load summary')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
        // Fetch groups and roles for filters
        fetch('/api/groups').then(r => r.json()).then(d => setGroups(d)).catch(() => {})
        fetch('/api/roles').then(r => r.json()).then(d => setRoles(d)).catch(() => {})
    }, [])

    const exportToCSV = () => {
        if (!data) return
        
        const allMembers = [
            ...data.categories.excellent,
            ...data.categories.active,
            ...data.categories.lowActivity,
            ...data.categories.irregular,
            ...data.categories.inactive
        ]
        
        const csv = [
            ['Name', 'Status', 'Total Hours', 'Avg Hours', 'Months Reported', 'Reporting Rate', 'Bible Studies', 'Placements'].join(','),
            ...allMembers.map((m: any) => 
                [m.name, m.status, m.totalHours, m.avgHours, m.monthsReported, `${m.reportingRate}%`, m.totalBibleStudies, m.totalPlacements].join(',')
            )
        ].join('\n')
        
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `field-service-summary-${startDate}-to-${endDate}.csv`
        a.click()
        toast.success('Report exported')
    }

    const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">{title}</p>
                        <p className="text-2xl font-bold">{value}</p>
                        {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
                    </div>
                    <Icon className={`h-8 w-8 ${color}`} />
                </div>
            </CardContent>
        </Card>
    )

    const MemberList = ({ members, emptyMessage }: any) => (
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {members.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">{emptyMessage}</p>
            ) : (
                members.map((member: any) => (
                    <Card key={member._id}>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h4 className="font-medium">{member.name}</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm text-muted-foreground">
                                        <span>Hours: {member.totalHours}</span>
                                        <span>Avg: {member.avgHours}h/mo</span>
                                        <span>Studies: {member.totalBibleStudies}</span>
                                        <span>Reports: {member.monthsReported}/{member.expectedMonths}</span>
                                    </div>
                                </div>
                                <Badge variant={
                                    member.status === 'excellent' ? 'default' :
                                    member.status === 'active' ? 'secondary' :
                                    member.status === 'low_activity' ? 'outline' :
                                    'destructive'
                                }>
                                    {member.reportingRate}%
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    )

    const pieData = data ? [
        { name: 'Excellent', value: data.summary.excellentCount, color: COLORS[0] },
        { name: 'Active', value: data.summary.activeCount, color: COLORS[1] },
        { name: 'Low Activity', value: data.summary.lowActivityCount, color: COLORS[2] },
        { name: 'Irregular', value: data.summary.irregularCount, color: COLORS[3] },
        { name: 'Inactive', value: data.summary.inactiveCount, color: COLORS[4] }
    ] : []

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Field Service Summary</h1>
                    <p className="text-muted-foreground">Comprehensive member activity analysis</p>
                </div>
                {data && (
                    <Button onClick={exportToCSV} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <Label>Start Month</Label>
                            <Input
                                type="month"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>End Month</Label>
                            <Input
                                type="month"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Group</Label>
                            <Select value={groupFilter} onValueChange={setGroupFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Groups" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Groups</SelectItem>
                                    {groups.map(g => (
                                        <SelectItem key={g._id} value={g._id}>{g.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Role</Label>
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Roles" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    {roles.map(r => (
                                        <SelectItem key={r._id} value={r._id}>{r.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Button onClick={fetchData} disabled={loading} className="mt-4">
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Generate Report
                    </Button>
                </CardContent>
            </Card>

            {data && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard title="Total Members" value={data.summary.totalMembers} icon={Users} color="text-blue-600" />
                        <StatCard title="Excellent" value={data.summary.excellentCount} icon={TrendingUp} color="text-green-600" trend={`${((data.summary.excellentCount/data.summary.totalMembers)*100).toFixed(1)}%`} />
                        <StatCard title="Need Shepherding" value={data.summary.needsShepherdingCount} icon={AlertTriangle} color="text-orange-600" trend={`${((data.summary.needsShepherdingCount/data.summary.totalMembers)*100).toFixed(1)}%`} />
                        <StatCard title="Inactive" value={data.summary.inactiveCount} icon={TrendingDown} color="text-red-600" trend={`${((data.summary.inactiveCount/data.summary.totalMembers)*100).toFixed(1)}%`} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm text-muted-foreground">Total Hours</p>
                                <p className="text-2xl font-bold">{data.summary.totalHours}</p>
                                <p className="text-xs text-muted-foreground mt-1">Congregation total</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm text-muted-foreground">Avg Hours/Member</p>
                                <p className="text-2xl font-bold">{data.summary.avgHoursPerMember}</p>
                                <p className="text-xs text-muted-foreground mt-1">Per month average</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm text-muted-foreground">Bible Studies</p>
                                <p className="text-2xl font-bold">{data.summary.totalBibleStudies}</p>
                                <p className="text-xs text-muted-foreground mt-1">Total conducted</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Activity Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Monthly Trends</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={data.trends}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="totalHours" stroke="#3b82f6" name="Total Hours" />
                                        <Line type="monotone" dataKey="avgHours" stroke="#10b981" name="Avg Hours" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Monthly Activity Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={data.trends}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="totalReports" fill="#3b82f6" name="Reports Submitted" />
                                    <Bar dataKey="bibleStudies" fill="#10b981" name="Bible Studies" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Member Categories</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="shepherding">
                                <TabsList className="grid w-full grid-cols-6">
                                    <TabsTrigger value="shepherding">Shepherding ({data.summary.needsShepherdingCount})</TabsTrigger>
                                    <TabsTrigger value="excellent">Excellent ({data.summary.excellentCount})</TabsTrigger>
                                    <TabsTrigger value="active">Active ({data.summary.activeCount})</TabsTrigger>
                                    <TabsTrigger value="low">Low ({data.summary.lowActivityCount})</TabsTrigger>
                                    <TabsTrigger value="irregular">Irregular ({data.summary.irregularCount})</TabsTrigger>
                                    <TabsTrigger value="inactive">Inactive ({data.summary.inactiveCount})</TabsTrigger>
                                </TabsList>
                                <TabsContent value="shepherding" className="mt-4">
                                    <MemberList members={data.categories.needsShepherding} emptyMessage="No members need shepherding" />
                                </TabsContent>
                                <TabsContent value="excellent" className="mt-4">
                                    <MemberList members={data.categories.excellent} emptyMessage="No members in excellent category" />
                                </TabsContent>
                                <TabsContent value="active" className="mt-4">
                                    <MemberList members={data.categories.active} emptyMessage="No active members" />
                                </TabsContent>
                                <TabsContent value="low" className="mt-4">
                                    <MemberList members={data.categories.lowActivity} emptyMessage="No members with low activity" />
                                </TabsContent>
                                <TabsContent value="irregular" className="mt-4">
                                    <MemberList members={data.categories.irregular} emptyMessage="No irregular members" />
                                </TabsContent>
                                <TabsContent value="inactive" className="mt-4">
                                    <MemberList members={data.categories.inactive} emptyMessage="No inactive members" />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}
