import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, TrendingUp, Target } from "lucide-react"

interface AttendanceStatsProps {
    attendanceData: any[];
}

export function AttendanceStats({ attendanceData }: AttendanceStatsProps) {
    const totalAttendance = attendanceData.reduce((sum, record) => sum + record.attendance, 0)
    const averageAttendance = attendanceData.length > 0 ? Math.round(totalAttendance / attendanceData.length) : 0
    const meetingsTracked = attendanceData.length
    
    const stats = [
        {
            title: "Total Attendance",
            value: totalAttendance.toString(),
            change: "+12%",
            changeType: "positive" as const,
            icon: Users,
            description: "This month",
        },
        {
            title: "Average per Meeting",
            value: averageAttendance.toString(),
            change: "+5%",
            changeType: "positive" as const,
            icon: Target,
            description: "Across all meetings",
        },
        {
            title: "Meetings Tracked",
            value: meetingsTracked.toString(),
            change: "Active",
            changeType: "neutral" as const,
            icon: Calendar,
            description: "This reporting period",
        },
        {
            title: "Growth Rate",
            value: "8.5%",
            change: "+2.1%",
            changeType: "positive" as const,
            icon: TrendingUp,
            description: "Month over month",
        },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <Card key={index} className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-card-foreground">{stat.title}</CardTitle>
                        <stat.icon className="h-4 w-4 text-secondary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
                        <div className="flex items-center space-x-2 text-xs">
                            <span
                                className={`font-medium ${stat.changeType === "positive"
                                        ? "text-green-600"
                                        : stat.changeType === "negative"
                                            ? "text-red-600"
                                            : "text-muted-foreground"
                                    }`}
                            >
                                {stat.change}
                            </span>
                            <span className="text-muted-foreground">{stat.description}</span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
