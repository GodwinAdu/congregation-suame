"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, FileText, Clock, BookOpen, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMonthlyReport } from "@/lib/actions/monthly-report.actions";
import { useRouter } from "next/navigation";

interface MonthlyStats {
    activePublishers: number;
    publishers: {
        reports: number;
        bibleStudies: number;
    };
    auxiliaryPioneers: {
        reports: number;
        hours: number;
        bibleStudies: number;
    };
    regularPioneers: {
        reports: number;
        hours: number;
        bibleStudies: number;
    };
}

interface MonthlyReportViewProps {
    month: number;
    year: number;
}

export function MonthlyReportView({ month, year }: MonthlyReportViewProps) {
    const [stats, setStats] = useState<MonthlyStats | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await getMonthlyReport(month, year);
                setStats(data);
            } catch (error) {
                console.error("Error fetching monthly report:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [month, year]);

    const handleMonthChange = (newMonth: string) => {
        router.push(`/dashboard/monthly-report?month=${newMonth}&year=${year}`);
    };

    const handleYearChange = (newYear: string) => {
        router.push(`/dashboard/monthly-report?month=${month}&year=${newYear}`);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex gap-4">
                    <Skeleton className="h-10 w-40" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <Skeleton className="h-8 w-64 mx-auto" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-12 w-16" />
                        <Skeleton className="h-4 w-64 mt-2" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Skeleton className="h-8 w-12" />
                                <Skeleton className="h-4 w-24 mt-1" />
                            </div>
                            <div>
                                <Skeleton className="h-8 w-12" />
                                <Skeleton className="h-4 w-20 mt-1" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-40" />
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Skeleton className="h-8 w-12" />
                                <Skeleton className="h-4 w-24 mt-1" />
                            </div>
                            <div>
                                <Skeleton className="h-8 w-12" />
                                <Skeleton className="h-4 w-16 mt-1" />
                            </div>
                            <div>
                                <Skeleton className="h-8 w-12" />
                                <Skeleton className="h-4 w-20 mt-1" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-36" />
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Skeleton className="h-8 w-12" />
                                <Skeleton className="h-4 w-24 mt-1" />
                            </div>
                            <div>
                                <Skeleton className="h-8 w-12" />
                                <Skeleton className="h-4 w-16 mt-1" />
                            </div>
                            <div>
                                <Skeleton className="h-8 w-12" />
                                <Skeleton className="h-4 w-20 mt-1" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Month/Year Selector */}
            <div className="flex gap-4">
                <Select value={month.toString()} onValueChange={handleMonthChange}>
                    <SelectTrigger className="w-40">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {months.map((monthName, index) => (
                            <SelectItem key={index} value={(index + 1).toString()}>
                                {monthName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={year.toString()} onValueChange={handleYearChange}>
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {years.map((yearOption) => (
                            <SelectItem key={yearOption} value={yearOption.toString()}>
                                {yearOption}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Report Title */}
            <div className="text-center">
                <h2 className="text-2xl font-bold">
                    {months[month - 1]} {year} Congregation Report
                </h2>
            </div>

            {/* Active Publishers */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        All Active Publishers
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-primary">
                        {stats?.activePublishers || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Persons who reported at least once in the last 6 months
                    </p>
                </CardContent>
            </Card>

            {/* Publishers */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Publishers
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-2xl font-bold">{stats?.publishers.reports || 0}</div>
                            <p className="text-sm text-muted-foreground">Number of Reports</p>
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stats?.publishers.bibleStudies || 0}</div>
                            <p className="text-sm text-muted-foreground">Bible Studies</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Auxiliary Pioneers */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Auxiliary Pioneers
                        <Badge variant="secondary">AP</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <div className="text-2xl font-bold">{stats?.auxiliaryPioneers.reports || 0}</div>
                            <p className="text-sm text-muted-foreground">Number of Reports</p>
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stats?.auxiliaryPioneers.hours || 0}</div>
                            <p className="text-sm text-muted-foreground">Hours</p>
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stats?.auxiliaryPioneers.bibleStudies || 0}</div>
                            <p className="text-sm text-muted-foreground">Bible Studies</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Regular Pioneers */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Regular Pioneers
                        <Badge variant="default">RP</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <div className="text-2xl font-bold">{stats?.regularPioneers.reports || 0}</div>
                            <p className="text-sm text-muted-foreground">Number of Reports</p>
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stats?.regularPioneers.hours || 0}</div>
                            <p className="text-sm text-muted-foreground">Hours</p>
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stats?.regularPioneers.bibleStudies || 0}</div>
                            <p className="text-sm text-muted-foreground">Bible Studies</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Members Needing Help */}
            <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-700">
                        <AlertTriangle className="h-5 w-5" />
                        Members Needing Help
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        View members who didn't report or don't have bible studies this month
                    </p>
                    <Button 
                        onClick={() => router.push(`/dashboard/monthly-report/help-needed?month=${month}&year=${year}`)}
                        className="w-full"
                        variant="outline"
                    >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        View Members Who Need Help
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}