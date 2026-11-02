"use client"

import { Button } from "@/components/ui/button"
import { X, Download, Printer, Calendar, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { fetchAttendanceByMonth } from "@/lib/actions/attendance.actions"

interface ExportViewProps {
    congregationName: string
    selectedMonth: string
    attendanceData: any[]
    onClose: () => void
}

interface MonthData {
    month: string
    year: number
    label: string
    midweek: number[]
    weekend: number[]
}

// Helper to get the current service year
function getCurrentServiceYear(): number {
    const now = new Date()
    return now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1
}

// Helper to format service year label
function formatServiceYearLabel(year: number): string {
    return `September ${year} - August ${year + 1}`
}

// Helper to format short service year
function formatServiceYearShort(year: number): string {
    return `${year}-${year + 1}`
}

// Get months in a service year
function getServiceYearMonths(serviceYear: number): { month: number; year: number; label: string }[] {
    const months = [
        { month: 9, year: serviceYear, label: "September" },
        { month: 10, year: serviceYear, label: "October" },
        { month: 11, year: serviceYear, label: "November" },
        { month: 12, year: serviceYear, label: "December" },
        { month: 1, year: serviceYear + 1, label: "January" },
        { month: 2, year: serviceYear + 1, label: "February" },
        { month: 3, year: serviceYear + 1, label: "March" },
        { month: 4, year: serviceYear + 1, label: "April" },
        { month: 5, year: serviceYear + 1, label: "May" },
        { month: 6, year: serviceYear + 1, label: "June" },
        { month: 7, year: serviceYear + 1, label: "July" },
        { month: 8, year: serviceYear + 1, label: "August" },
    ]
    return months
}

export function ExportView({ congregationName, selectedMonth, attendanceData, onClose }: ExportViewProps) {
    const currentServiceYear = getCurrentServiceYear()
    
    // State for date range selection
    const [startServiceYear, setStartServiceYear] = useState<number>(currentServiceYear)
    const [endServiceYear, setEndServiceYear] = useState<number>(currentServiceYear)
    const [startMonthIndex, setStartMonthIndex] = useState<number>(0) // 0 = September
    const [endMonthIndex, setEndMonthIndex] = useState<number>(11) // 11 = August (current month by default)
    
    // State for fetched data
    const [monthsData, setMonthsData] = useState<MonthData[]>([])
    const [loading, setLoading] = useState(true)
    
    // Generate available service years (5 years back to current)
    const availableYears = Array.from({ length: 6 }, (_, i) => currentServiceYear - 5 + i)
    
    // Month options for dropdowns
    const monthOptions = [
        { index: 0, label: "September" },
        { index: 1, label: "October" },
        { index: 2, label: "November" },
        { index: 3, label: "December" },
        { index: 4, label: "January" },
        { index: 5, label: "February" },
        { index: 6, label: "March" },
        { index: 7, label: "April" },
        { index: 8, label: "May" },
        { index: 9, label: "June" },
        { index: 10, label: "July" },
        { index: 11, label: "August" },
    ]

    // Calculate which months to fetch based on selection
    const getMonthsToFetch = () => {
        const months: { month: number; year: number; label: string }[] = []
        
        for (let sy = startServiceYear; sy <= endServiceYear; sy++) {
            const serviceYearMonths = getServiceYearMonths(sy)
            const startIdx = sy === startServiceYear ? startMonthIndex : 0
            const endIdx = sy === endServiceYear ? endMonthIndex : 11
            
            for (let i = startIdx; i <= endIdx; i++) {
                months.push({
                    ...serviceYearMonths[i],
                    label: `${serviceYearMonths[i].label} ${serviceYearMonths[i].year}`
                })
            }
        }
        
        return months
    }

    // Fetch data when date range changes
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const monthsToFetch = getMonthsToFetch()
                
                const allData: MonthData[] = await Promise.all(
                    monthsToFetch.map(async ({ month, year, label }) => {
                        const data = await fetchAttendanceByMonth(month, year)
                        return processMonthData(data, label, month, year)
                    })
                )
                
                setMonthsData(allData)
            } catch (error) {
                console.error('Failed to fetch data:', error)
                // Fallback to current month data
                const processed = processAttendanceDataLegacy(attendanceData)
                setMonthsData([{
                    month: selectedMonth,
                    year: new Date().getFullYear(),
                    label: selectedMonth ? new Date(selectedMonth + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "",
                    midweek: processed.midweek,
                    weekend: processed.weekend
                }])
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [startServiceYear, endServiceYear, startMonthIndex, endMonthIndex])

    // Process attendance data for a single month
    const processMonthData = (data: any[], label: string, month: number, year: number): MonthData => {
        const midweek = [0, 0, 0, 0, 0]
        const weekend = [0, 0, 0, 0, 0]

        data.forEach(record => {
            const weekIndex = (record.week || 1) - 1
            if (weekIndex >= 0 && weekIndex < 5) {
                if (record.meetingType === "Midweek") {
                    midweek[weekIndex] = record.attendance
                } else if (record.meetingType === "Weekend") {
                    weekend[weekIndex] = record.attendance
                }
            }
        })

        return { month: month.toString(), year, label, midweek, weekend }
    }

    // Legacy processing for initial data
    const processAttendanceDataLegacy = (data: any[]) => {
        const midweek = [0, 0, 0, 0, 0]
        const weekend = [0, 0, 0, 0, 0]

        data.forEach(record => {
            const weekIndex = (record.week || 1) - 1
            if (weekIndex >= 0 && weekIndex < 5) {
                if (record.meetingType === "Midweek") {
                    midweek[weekIndex] = record.attendance
                } else if (record.meetingType === "Weekend") {
                    weekend[weekIndex] = record.attendance
                }
            }
        })

        return { midweek, weekend }
    }

    // Handle year/month changes
    const handleStartYearChange = (value: string) => {
        const newYear = parseInt(value)
        setStartServiceYear(newYear)
        if (newYear > endServiceYear) {
            setEndServiceYear(newYear)
        }
        if (newYear === endServiceYear && startMonthIndex > endMonthIndex) {
            setEndMonthIndex(startMonthIndex)
        }
    }

    const handleEndYearChange = (value: string) => {
        const newYear = parseInt(value)
        setEndServiceYear(newYear)
        if (newYear < startServiceYear) {
            setStartServiceYear(newYear)
        }
        if (newYear === startServiceYear && endMonthIndex < startMonthIndex) {
            setStartMonthIndex(endMonthIndex)
        }
    }

    const handleStartMonthChange = (value: string) => {
        const newMonth = parseInt(value)
        setStartMonthIndex(newMonth)
        if (startServiceYear === endServiceYear && newMonth > endMonthIndex) {
            setEndMonthIndex(newMonth)
        }
    }

    const handleEndMonthChange = (value: string) => {
        const newMonth = parseInt(value)
        setEndMonthIndex(newMonth)
        if (startServiceYear === endServiceYear && newMonth < startMonthIndex) {
            setStartMonthIndex(newMonth)
        }
    }

    const calculateTotal = (data: number[]) => data.reduce((sum, val) => sum + val, 0)
    const calculateAverage = (data: number[]) => {
        const nonZero = data.filter(n => n > 0)
        return nonZero.length > 0 ? Math.round(nonZero.reduce((sum, val) => sum + val, 0) / nonZero.length) : 0
    }

    const handlePrint = () => {
        window.print()
    }

    const handleDownload = () => {
        const printContent = document.getElementById("export-content")
        if (printContent) {
            const newWindow = window.open("", "_blank")
            if (newWindow) {
                newWindow.document.write(`
          <html>
            <head>
              <title>Meeting Attendance Report</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .report-container { max-width: 800px; margin: 0 auto; }
                .report-title { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 30px; text-transform: uppercase; letter-spacing: 1px; }
                .month-section { margin-bottom: 50px; page-break-inside: avoid; }
                .month-header { font-size: 16px; font-weight: bold; margin-bottom: 15px; padding: 10px; background-color: #f0f0f0; border: 1px solid #000; }
                .instructions { margin: 20px 0 40px 0; font-size: 14px; line-height: 1.5; }
                .form-fields { display: flex; justify-content: space-between; margin: 30px 0; }
                .field { display: flex; align-items: center; }
                .field-label { font-weight: bold; margin-right: 10px; }
                .field-line { border-bottom: 1px dotted #000; min-width: 200px; height: 20px; }
                .attendance-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                .attendance-table th, .attendance-table td { border: 2px solid #000; padding: 12px 8px; text-align: center; }
                .attendance-table th { background-color: #f5f5f5; font-weight: bold; }
                .meeting-type { text-align: left; font-weight: bold; padding-left: 15px !important; }
                .footer { margin-top: 40px; font-size: 12px; }
                @media print { 
                  body { margin: 20px; } 
                  .month-section { page-break-inside: avoid; }
                }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `)
                newWindow.document.close()
                newWindow.print()
            }
        }
    }

    // Render a single month's report
    const renderMonthReport = (monthData: MonthData, index: number) => (
        <div key={`${monthData.label}-${index}`} className="month-section mb-16 page-break-inside-avoid">
            <div className="month-header text-center py-3 px-4 bg-gray-100 border-2 border-black mb-6 font-bold text-lg">
                {monthData.label}
            </div>

            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center">
                    <span className="font-bold mr-3">Congregation name:</span>
                    <div className="border-b-2 border-dotted border-black min-w-[300px] h-6 flex items-end pb-1">
                        <span className="text-base">{congregationName || ""}</span>
                    </div>
                </div>
                <div className="flex items-center">
                    <span className="font-bold mr-3">Month:</span>
                    <div className="border-b-2 border-dotted border-black min-w-[200px] h-6 flex items-end pb-1">
                        <span className="text-base">{monthData.label}</span>
                    </div>
                </div>
            </div>

            <table className="w-full border-2 border-black mb-8">
                <thead>
                    <tr>
                        <th className="border-2 border-black p-3 bg-gray-50"></th>
                        <th className="border-2 border-black p-3 bg-gray-50 font-bold">1st week</th>
                        <th className="border-2 border-black p-3 bg-gray-50 font-bold">2nd week</th>
                        <th className="border-2 border-black p-3 bg-gray-50 font-bold">3rd week</th>
                        <th className="border-2 border-black p-3 bg-gray-50 font-bold">4th week</th>
                        <th className="border-2 border-black p-3 bg-gray-50 font-bold">5th week</th>
                        <th className="border-2 border-black p-3 bg-gray-50 font-bold">Total</th>
                        <th className="border-2 border-black p-3 bg-gray-50 font-bold">Average</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border-2 border-black p-4 font-bold text-left pl-6">
                            Midweek<br />Meeting
                        </td>
                        {monthData.midweek.map((count, i) => (
                            <td key={i} className="border-2 border-black p-4 text-center font-medium">
                                {count || ""}
                            </td>
                        ))}
                        <td className="border-2 border-black p-4 text-center font-bold">
                            {calculateTotal(monthData.midweek) || ""}
                        </td>
                        <td className="border-2 border-black p-4 text-center font-bold">
                            {calculateAverage(monthData.midweek) || ""}
                        </td>
                    </tr>
                    <tr>
                        <td className="border-2 border-black p-4 font-bold text-left pl-6">
                            Weekend<br />Meeting
                        </td>
                        {monthData.weekend.map((count, i) => (
                            <td key={i} className="border-2 border-black p-4 text-center font-medium">
                                {count || ""}
                            </td>
                        ))}
                        <td className="border-2 border-black p-4 text-center font-bold">
                            {calculateTotal(monthData.weekend) || ""}
                        </td>
                        <td className="border-2 border-black p-4 text-center font-bold">
                            {calculateAverage(monthData.weekend) || ""}
                        </td>
                    </tr>
                </tbody>
            </table>

            <div className="text-left text-sm">
                <p>S-3-E &nbsp;&nbsp; 10/15</p>
            </div>
        </div>
    )

    // Get selected range description
    const getSelectedRangeDescription = () => {
        const startMonth = monthOptions[startMonthIndex].label
        const endMonth = monthOptions[endMonthIndex].label
        const startYear = startMonthIndex <= 3 ? startServiceYear : startServiceYear + 1
        const endYear = endMonthIndex <= 3 ? endServiceYear : endServiceYear + 1
        
        if (startServiceYear === endServiceYear && startMonthIndex === endMonthIndex) {
            return `${startMonth} ${startYear}`
        }
        return `${startMonth} ${startYear} to ${endMonth} ${endYear}`
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Control Bar */}
            <div className="no-print sticky top-0 z-10 bg-background border-b border-border p-4">
                <div className="container mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Export Preview</h2>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" onClick={handlePrint} disabled={loading}>
                                <Printer className="w-4 h-4 mr-2" />
                                Print
                            </Button>
                            <Button variant="outline" onClick={handleDownload} disabled={loading}>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                            </Button>
                            <Button variant="ghost" size="sm" onClick={onClose}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Date Range Selection */}
                    <Card className="bg-card border-border">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-primary" />
                                    <span className="font-semibold">Export Date Range:</span>
                                </div>
                                
                                {/* Start Selection */}
                                <div className="flex items-center gap-2">
                                    <Label className="text-sm font-medium whitespace-nowrap">From:</Label>
                                    <Select value={startMonthIndex.toString()} onValueChange={handleStartMonthChange}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {monthOptions.map((m) => (
                                                <SelectItem key={m.index} value={m.index.toString()}>
                                                    {m.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select value={startServiceYear.toString()} onValueChange={handleStartYearChange}>
                                        <SelectTrigger className="w-36">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableYears.map((year) => (
                                                <SelectItem key={year} value={year.toString()}>
                                                    {formatServiceYearShort(year)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* End Selection */}
                                <div className="flex items-center gap-2">
                                    <Label className="text-sm font-medium whitespace-nowrap">To:</Label>
                                    <Select value={endMonthIndex.toString()} onValueChange={handleEndMonthChange}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {monthOptions.map((m) => (
                                                <SelectItem key={m.index} value={m.index.toString()}>
                                                    {m.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select value={endServiceYear.toString()} onValueChange={handleEndYearChange}>
                                        <SelectTrigger className="w-36">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableYears.filter(y => y >= startServiceYear).map((year) => (
                                                <SelectItem key={year} value={year.toString()}>
                                                    {formatServiceYearShort(year)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {monthsData.length > 1 && (
                                    <span className="text-sm text-primary font-medium">
                                        Exporting {monthsData.length} month(s)
                                    </span>
                                )}
                            </div>

                            <div className="mt-3 text-sm text-muted-foreground">
                                <span className="font-medium">Selected Range: </span>
                                {getSelectedRangeDescription()}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Export Content */}
            <div id="export-content" className="container mx-auto p-8 max-w-4xl bg-white text-black">
                <div className="report-container">
                    <h1 className="text-3xl font-bold text-center mb-8 tracking-wider">REPORT OF MEETING ATTENDANCE</h1>

                    <div className="mb-8 text-sm leading-relaxed">
                        <p>
                            (The attendance count should be taken once at the midpoint of each meeting. Remember to include any
                            homebound or isolated individuals who may be tied in.)
                        </p>
                    </div>

                    {monthsData.length > 1 && (
                        <div className="text-center mb-8 text-sm text-gray-600">
                            <p>Report Period: {getSelectedRangeDescription()}</p>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
                            <span className="text-muted-foreground">Loading attendance data...</span>
                        </div>
                    ) : (
                        monthsData.map((monthData, index) => renderMonthReport(monthData, index))
                    )}
                </div>
            </div>

            <style jsx>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body {
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    #export-content {
                        padding: 20px !important;
                        margin: 0 !important;
                        max-width: none !important;
                    }
                    .month-section {
                        page-break-inside: avoid;
                    }
                }
            `}</style>
        </div>
    )
}
