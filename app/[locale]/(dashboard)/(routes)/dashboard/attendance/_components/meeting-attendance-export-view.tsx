"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Printer, Calendar, Loader2 } from "lucide-react"
import { fetchAttendanceByServiceYearSeparated } from "@/lib/actions/attendance.actions"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

interface MonthlyRecord {
    month: string
    numberOfMeetings: number
    totalAttendance: number
    averageAttendance: number
    midweek?: {
        numberOfMeetings: number
        totalAttendance: number
        averageAttendance: number
    }
    weekend?: {
        numberOfMeetings: number
        totalAttendance: number
        averageAttendance: number
    }
}

interface ServiceYearData {
    serviceYear: number
    label: string
    data: MonthlyRecord[]
}

interface MeetingAttendanceExportViewProps {
    records: MonthlyRecord[]
    onClose: () => void
    initialServiceYear?: number
}

// Helper to get the current service year
function getCurrentServiceYear(): number {
    const now = new Date()
    return now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1
}

// Helper to format service year label (e.g., "September 2025 - August 2026")
function formatServiceYearLabel(year: number): string {
    return `September ${year} - August ${year + 1}`
}

// Helper to format short service year (e.g., "2025-2026")
function formatServiceYearShort(year: number): string {
    return `${year}-${year + 1}`
}

export function MeetingAttendanceExportView({ records, onClose, initialServiceYear }: MeetingAttendanceExportViewProps) {
    const currentServiceYear = getCurrentServiceYear()
    
    // State for date range selection
    const [startServiceYear, setStartServiceYear] = useState<number>(initialServiceYear || currentServiceYear)
    const [endServiceYear, setEndServiceYear] = useState<number>(initialServiceYear || currentServiceYear)
    
    // State for fetched data per service year
    const [serviceYearsData, setServiceYearsData] = useState<ServiceYearData[]>([])
    const [loading, setLoading] = useState(true)
    
    // Generate available service years (5 years back, current, and 1 year forward)
    const availableYears = Array.from({ length: 7 }, (_, i) => currentServiceYear - 5 + i)

    // Fetch data when date range changes
    useEffect(() => {
        const fetchDataForRange = async () => {
            setLoading(true)
            try {
                const yearsToFetch: number[] = []
                for (let year = startServiceYear; year <= endServiceYear; year++) {
                    yearsToFetch.push(year)
                }
                
                const allData: ServiceYearData[] = await Promise.all(
                    yearsToFetch.map(async (year) => {
                        const data = await fetchAttendanceByServiceYearSeparated(year)
                        return {
                            serviceYear: year,
                            label: formatServiceYearLabel(year),
                            data
                        }
                    })
                )
                
                setServiceYearsData(allData)
            } catch (error) {
                console.error('Failed to fetch data for range:', error)
                // Fallback to initial records for current year
                setServiceYearsData([{
                    serviceYear: currentServiceYear,
                    label: formatServiceYearLabel(currentServiceYear),
                    data: records
                }])
            } finally {
                setLoading(false)
            }
        }
        fetchDataForRange()
    }, [startServiceYear, endServiceYear, records, currentServiceYear])

    // Handle start year change - ensure end year is >= start year
    const handleStartYearChange = (value: string) => {
        const newStart = parseInt(value)
        setStartServiceYear(newStart)
        if (newStart > endServiceYear) {
            setEndServiceYear(newStart)
        }
    }

    // Handle end year change - ensure start year is <= end year
    const handleEndYearChange = (value: string) => {
        const newEnd = parseInt(value)
        setEndServiceYear(newEnd)
        if (newEnd < startServiceYear) {
            setStartServiceYear(newEnd)
        }
    }

    const handlePrint = () => {
        window.print()
    }

    const handleDownload = () => {
        const element = document.getElementById("export-content")
        if (element) {
            const printWindow = window.open("", "_blank")
            if (printWindow) {
                printWindow.document.write(`
          <html>
            <head>
              <title>Congregation Meeting Attendance Record</title>
              <style>
                body { 
                  font-family: 'Times New Roman', serif; 
                  margin: 40px; 
                  background: white;
                  color: black;
                  line-height: 1.2;
                }
                .export-container { 
                  max-width: 100%; 
                  margin: 0 auto; 
                }
                .title { 
                  text-align: center; 
                  font-size: 18px; 
                  font-weight: bold; 
                  margin-bottom: 30px; 
                  letter-spacing: 0.5px;
                }
                .subtitle { 
                  font-size: 16px; 
                  font-weight: bold; 
                  margin-bottom: 15px; 
                  text-align: left;
                }
                .service-year-section {
                  margin-bottom: 40px;
                  page-break-inside: avoid;
                }
                .service-year-header {
                  font-size: 14px;
                  font-weight: bold;
                  margin-bottom: 10px;
                  padding: 8px;
                  background-color: #f0f0f0;
                  border: 1px solid #000;
                }
                .table-container { 
                  display: flex; 
                  gap: 0; 
                  width: 100%;
                }
                .table-half { 
                  flex: 1; 
                  width: 50%;
                }
                table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  border: 2px solid #000; 
                  font-size: 12px;
                }
                th, td { 
                  border: 1px solid #000; 
                  padding: 6px 4px; 
                  text-align: center; 
                  vertical-align: middle;
                  height: 30px;
                }
                th { 
                  background-color: white; 
                  font-weight: bold; 
                  font-size: 10px;
                  text-align: center;
                }
                .month-cell { 
                  text-align: left !important; 
                  padding-left: 8px !important; 
                  font-weight: normal;
                }
                .total-row { 
                  font-weight: bold; 
                  background-color: white;
                }
                .total-row .month-cell {
                  font-size: 10px;
                  font-weight: bold;
                }
                @media print {
                  body { margin: 20px; }
                  .no-print { display: none; }
                  .export-container { max-width: none; }
                  .service-year-section { page-break-inside: avoid; }
                }
              </style>
            </head>
            <body>
              ${element.innerHTML}
            </body>
          </html>
        `)
                printWindow.document.close()
                printWindow.print()
            }
        }
    }

    const calculateMidweekTotal = (recordSet: MonthlyRecord[]) => {
        return recordSet.reduce((sum, record) => sum + (record.midweek?.totalAttendance || 0), 0)
    }

    const calculateMidweekAverageAttendance = (recordSet: MonthlyRecord[]) => {
        const totalAttendance = calculateMidweekTotal(recordSet)
        const totalMeetings = recordSet.reduce((sum, record) => sum + (record.midweek?.numberOfMeetings || 0), 0)
        return totalMeetings > 0 ? Math.round(totalAttendance / totalMeetings) : 0
    }

    const calculateWeekendTotal = (recordSet: MonthlyRecord[]) => {
        return recordSet.reduce((sum, record) => sum + (record.weekend?.totalAttendance || 0), 0)
    }

    const calculateWeekendAverageAttendance = (recordSet: MonthlyRecord[]) => {
        const totalAttendance = calculateWeekendTotal(recordSet)
        const totalMeetings = recordSet.reduce((sum, record) => sum + (record.weekend?.numberOfMeetings || 0), 0)
        return totalMeetings > 0 ? Math.round(totalAttendance / totalMeetings) : 0
    }

    // Render a single service year's attendance tables
    const renderServiceYearTables = (yearData: ServiceYearData) => {
        const firstHalf = yearData.data.slice(0, 6)
        const secondHalf = yearData.data.slice(6, 12)

        return (
            <div key={yearData.serviceYear} className="service-year-section mb-12">
                {/* Service Year Header */}
                <div 
                    className="service-year-header text-center py-2 px-4 bg-gray-100 border border-black mb-4"
                    style={{ fontFamily: "Times New Roman, serif" }}
                >
                    <span className="font-bold text-lg">
                        Service Year: {formatServiceYearShort(yearData.serviceYear)}
                    </span>
                    <span className="text-sm ml-2 text-gray-600">
                        ({yearData.label})
                    </span>
                </div>

                {/* Midweek Meeting Section */}
                <h2 className="text-lg font-bold text-left mb-4 text-black" style={{ fontFamily: "Times New Roman, serif" }}>
                    Midweek Meeting
                </h2>

                <div className="flex gap-0 w-full mb-8">
                    {/* First Table - Midweek */}
                    <div className="w-1/2">
                        <table
                            className="w-full border-collapse"
                            style={{ border: "2px solid #000", fontFamily: "Times New Roman, serif" }}
                        >
                            <thead>
                                <tr>
                                    <th className="border border-black p-1 bg-white text-center text-xs font-bold" style={{ minWidth: "90px" }}>
                                        Service Year
                                    </th>
                                    <th className="border border-black p-1 bg-white text-center text-xs font-bold" style={{ minWidth: "70px" }}>
                                        Number of Meetings
                                    </th>
                                    <th className="border border-black p-1 bg-white text-center text-xs font-bold" style={{ minWidth: "70px" }}>
                                        Total Attendance
                                    </th>
                                    <th className="border border-black p-1 bg-white text-center text-xs font-bold" style={{ minWidth: "80px" }}>
                                        Average Attendance Each Week
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {firstHalf.map((record) => (
                                    <tr key={record.month}>
                                        <td className="border border-black p-1 text-left pl-2 text-sm bg-white" style={{ height: "30px" }}>
                                            {record.month}
                                        </td>
                                        <td className="border border-black p-1 text-center text-sm bg-white" style={{ height: "30px" }}>
                                            {record.midweek?.numberOfMeetings || ""}
                                        </td>
                                        <td className="border border-black p-1 text-center text-sm bg-white" style={{ height: "30px" }}>
                                            {record.midweek?.totalAttendance || ""}
                                        </td>
                                        <td className="border border-black p-1 text-center text-sm bg-white" style={{ height: "30px" }}>
                                            {record.midweek?.averageAttendance || ""}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-white">
                                    <td className="border border-black p-1 text-left pl-2 text-xs font-bold bg-white" style={{ height: "30px" }}>
                                        Average Attendance Each Month
                                    </td>
                                    <td className="border border-black p-1 text-center bg-white" style={{ height: "30px" }}></td>
                                    <td className="border border-black p-1 text-center text-sm font-bold bg-white" style={{ height: "30px" }}>
                                        {calculateMidweekTotal(firstHalf) || ""}
                                    </td>
                                    <td className="border border-black p-1 text-center text-sm font-bold bg-white" style={{ height: "30px" }}>
                                        {calculateMidweekAverageAttendance(firstHalf) || ""}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Second Table - Midweek */}
                    <div className="w-1/2">
                        <table
                            className="w-full border-collapse"
                            style={{ border: "2px solid #000", fontFamily: "Times New Roman, serif" }}
                        >
                            <thead>
                                <tr>
                                    <th className="border border-black p-1 bg-white text-center text-xs font-bold" style={{ minWidth: "90px" }}>
                                        Service Year
                                    </th>
                                    <th className="border border-black p-1 bg-white text-center text-xs font-bold" style={{ minWidth: "70px" }}>
                                        Number of Meetings
                                    </th>
                                    <th className="border border-black p-1 bg-white text-center text-xs font-bold" style={{ minWidth: "70px" }}>
                                        Total Attendance
                                    </th>
                                    <th className="border border-black p-1 bg-white text-center text-xs font-bold" style={{ minWidth: "80px" }}>
                                        Average Attendance Each Week
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {secondHalf.map((record) => (
                                    <tr key={record.month}>
                                        <td className="border border-black p-1 text-left pl-2 text-sm bg-white" style={{ height: "30px" }}>
                                            {record.month}
                                        </td>
                                        <td className="border border-black p-1 text-center text-sm bg-white" style={{ height: "30px" }}>
                                            {record.midweek?.numberOfMeetings || ""}
                                        </td>
                                        <td className="border border-black p-1 text-center text-sm bg-white" style={{ height: "30px" }}>
                                            {record.midweek?.totalAttendance || ""}
                                        </td>
                                        <td className="border border-black p-1 text-center text-sm bg-white" style={{ height: "30px" }}>
                                            {record.midweek?.averageAttendance || ""}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-white">
                                    <td className="border border-black p-1 text-left pl-2 text-xs font-bold bg-white" style={{ height: "30px" }}>
                                        Average Attendance Each Month
                                    </td>
                                    <td className="border border-black p-1 text-center bg-white" style={{ height: "30px" }}></td>
                                    <td className="border border-black p-1 text-center text-sm font-bold bg-white" style={{ height: "30px" }}>
                                        {calculateMidweekTotal(secondHalf) || ""}
                                    </td>
                                    <td className="border border-black p-1 text-center text-sm font-bold bg-white" style={{ height: "30px" }}>
                                        {calculateMidweekAverageAttendance(secondHalf) || ""}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Weekend Meeting Section */}
                <h2 className="text-lg font-bold text-left mb-4 text-black" style={{ fontFamily: "Times New Roman, serif" }}>
                    Weekend Meeting
                </h2>

                <div className="flex gap-0 w-full">
                    {/* First Table - Weekend */}
                    <div className="w-1/2">
                        <table
                            className="w-full border-collapse"
                            style={{ border: "2px solid #000", fontFamily: "Times New Roman, serif" }}
                        >
                            <thead>
                                <tr>
                                    <th className="border border-black p-1 bg-white text-center text-xs font-bold" style={{ minWidth: "90px" }}>
                                        Service Year
                                    </th>
                                    <th className="border border-black p-1 bg-white text-center text-xs font-bold" style={{ minWidth: "70px" }}>
                                        Number of Meetings
                                    </th>
                                    <th className="border border-black p-1 bg-white text-center text-xs font-bold" style={{ minWidth: "70px" }}>
                                        Total Attendance
                                    </th>
                                    <th className="border border-black p-1 bg-white text-center text-xs font-bold" style={{ minWidth: "80px" }}>
                                        Average Attendance Each Week
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {firstHalf.map((record) => (
                                    <tr key={`weekend-${record.month}`}>
                                        <td className="border border-black p-1 text-left pl-2 text-sm bg-white" style={{ height: "30px" }}>
                                            {record.month}
                                        </td>
                                        <td className="border border-black p-1 text-center text-sm bg-white" style={{ height: "30px" }}>
                                            {record.weekend?.numberOfMeetings || ""}
                                        </td>
                                        <td className="border border-black p-1 text-center text-sm bg-white" style={{ height: "30px" }}>
                                            {record.weekend?.totalAttendance || ""}
                                        </td>
                                        <td className="border border-black p-1 text-center text-sm bg-white" style={{ height: "30px" }}>
                                            {record.weekend?.averageAttendance || ""}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-white">
                                    <td className="border border-black p-1 text-left pl-2 text-xs font-bold bg-white" style={{ height: "30px" }}>
                                        Average Attendance Each Month
                                    </td>
                                    <td className="border border-black p-1 text-center bg-white" style={{ height: "30px" }}></td>
                                    <td className="border border-black p-1 text-center text-sm font-bold bg-white" style={{ height: "30px" }}>
                                        {calculateWeekendTotal(firstHalf) || ""}
                                    </td>
                                    <td className="border border-black p-1 text-center text-sm font-bold bg-white" style={{ height: "30px" }}>
                                        {calculateWeekendAverageAttendance(firstHalf) || ""}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Second Table - Weekend */}
                    <div className="w-1/2">
                        <table
                            className="w-full border-collapse"
                            style={{ border: "2px solid #000", fontFamily: "Times New Roman, serif" }}
                        >
                            <thead>
                                <tr>
                                    <th className="border border-black p-1 bg-white text-center text-xs font-bold" style={{ minWidth: "90px" }}>
                                        Service Year
                                    </th>
                                    <th className="border border-black p-1 bg-white text-center text-xs font-bold" style={{ minWidth: "70px" }}>
                                        Number of Meetings
                                    </th>
                                    <th className="border border-black p-1 bg-white text-center text-xs font-bold" style={{ minWidth: "70px" }}>
                                        Total Attendance
                                    </th>
                                    <th className="border border-black p-1 bg-white text-center text-xs font-bold" style={{ minWidth: "80px" }}>
                                        Average Attendance Each Week
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {secondHalf.map((record) => (
                                    <tr key={`weekend-${record.month}`}>
                                        <td className="border border-black p-1 text-left pl-2 text-sm bg-white" style={{ height: "30px" }}>
                                            {record.month}
                                        </td>
                                        <td className="border border-black p-1 text-center text-sm bg-white" style={{ height: "30px" }}>
                                            {record.weekend?.numberOfMeetings || ""}
                                        </td>
                                        <td className="border border-black p-1 text-center text-sm bg-white" style={{ height: "30px" }}>
                                            {record.weekend?.totalAttendance || ""}
                                        </td>
                                        <td className="border border-black p-1 text-center text-sm bg-white" style={{ height: "30px" }}>
                                            {record.weekend?.averageAttendance || ""}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-white">
                                    <td className="border border-black p-1 text-left pl-2 text-xs font-bold bg-white" style={{ height: "30px" }}>
                                        Average Attendance Each Month
                                    </td>
                                    <td className="border border-black p-1 text-center bg-white" style={{ height: "30px" }}></td>
                                    <td className="border border-black p-1 text-center text-sm font-bold bg-white" style={{ height: "30px" }}>
                                        {calculateWeekendTotal(secondHalf) || ""}
                                    </td>
                                    <td className="border border-black p-1 text-center text-sm font-bold bg-white" style={{ height: "30px" }}>
                                        {calculateWeekendAverageAttendance(secondHalf) || ""}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Control Bar */}
            <div className="no-print bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 p-4 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <Button variant="outline" onClick={onClose} className="border-blue-200 hover:bg-blue-50 bg-transparent">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
                    <div className="space-x-3">
                        <Button variant="outline" onClick={handlePrint} className="border-blue-200 hover:bg-blue-50 bg-transparent" disabled={loading}>
                            <Printer className="w-4 h-4 mr-2" />
                            Print Report
                        </Button>
                        <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md" disabled={loading}>
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                        </Button>
                    </div>
                </div>

                {/* Date Range Selection */}
                <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-6 flex-wrap">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                <span className="font-semibold text-gray-700">Export Date Range:</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <Label htmlFor="start-year" className="text-sm font-medium whitespace-nowrap">
                                    From Service Year:
                                </Label>
                                <Select value={startServiceYear.toString()} onValueChange={handleStartYearChange}>
                                    <SelectTrigger className="w-36" id="start-year">
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

                            <div className="flex items-center gap-2">
                                <Label htmlFor="end-year" className="text-sm font-medium whitespace-nowrap">
                                    To Service Year:
                                </Label>
                                <Select value={endServiceYear.toString()} onValueChange={handleEndYearChange}>
                                    <SelectTrigger className="w-36" id="end-year">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableYears.filter(year => year >= startServiceYear).map((year) => (
                                            <SelectItem key={year} value={year.toString()}>
                                                {formatServiceYearShort(year)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {startServiceYear !== endServiceYear && (
                                <span className="text-sm text-blue-600 font-medium">
                                    Exporting {endServiceYear - startServiceYear + 1} service year(s)
                                </span>
                            )}
                        </div>

                        {/* Selected Range Display */}
                        <div className="mt-3 text-sm text-gray-600">
                            <span className="font-medium">Selected Range: </span>
                            {formatServiceYearLabel(startServiceYear)}
                            {startServiceYear !== endServiceYear && (
                                <> to {formatServiceYearLabel(endServiceYear)}</>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Export Content */}
            <div id="export-content" className="export-container max-w-6xl mx-auto p-12 bg-white">
                <div className="text-center mb-8">
                    <h1
                        className="text-xl font-bold tracking-wide mb-4 text-black"
                        style={{ fontFamily: "Times New Roman, serif" }}
                    >
                        CONGREGATION MEETING ATTENDANCE RECORD
                    </h1>
                    {startServiceYear !== endServiceYear && (
                        <p className="text-sm text-gray-600" style={{ fontFamily: "Times New Roman, serif" }}>
                            Service Years: {formatServiceYearShort(startServiceYear)} to {formatServiceYearShort(endServiceYear)}
                        </p>
                    )}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
                        <span className="text-gray-600">Loading attendance data...</span>
                    </div>
                ) : (
                    serviceYearsData.map(yearData => renderServiceYearTables(yearData))
                )}
            </div>
        </div>
    )
}
