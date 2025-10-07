"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Printer } from "lucide-react"

interface MonthlyRecord {
    month: string
    numberOfMeetings: number
    totalAttendance: number
    averageAttendance: number
}

interface MeetingAttendanceExportViewProps {
    records: MonthlyRecord[]
    onClose: () => void
}

export function MeetingAttendanceExportView({ records, onClose }: MeetingAttendanceExportViewProps) {
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

    // Split records into two halves for side-by-side layout
    const firstHalf = records.slice(0, 6)
    const secondHalf = records.slice(6, 12)

    const calculateTotal = (recordSet: MonthlyRecord[]) => {
        return recordSet.reduce((sum, record) => sum + record.totalAttendance, 0)
    }

    const calculateAverageAttendance = (recordSet: MonthlyRecord[]) => {
        const totalAttendance = calculateTotal(recordSet)
        const totalMeetings = recordSet.reduce((sum, record) => sum + record.numberOfMeetings, 0)
        return totalMeetings > 0 ? Math.round(totalAttendance / totalMeetings) : 0
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Control Bar */}
            <div className="no-print bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 p-4 flex justify-between items-center shadow-sm">
                <Button variant="outline" onClick={onClose} className="border-blue-200 hover:bg-blue-50 bg-transparent">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Button>
                <div className="space-x-3">
                    <Button variant="outline" onClick={handlePrint} className="border-blue-200 hover:bg-blue-50 bg-transparent">
                        <Printer className="w-4 h-4 mr-2" />
                        Print Report
                    </Button>
                    <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                    </Button>
                </div>
            </div>

            {/* Export Content */}
            <div id="export-content" className="export-container max-w-6xl mx-auto p-12 bg-white">
                <div className="text-center mb-8">
                    <h1
                        className="text-xl font-bold tracking-wide mb-8 text-black"
                        style={{ fontFamily: "Times New Roman, serif" }}
                    >
                        CONGREGATION MEETING ATTENDANCE RECORD
                    </h1>
                </div>
                <h2 className="text-lg font-bold text-left mb-4 text-black" style={{ fontFamily: "Times New Roman, serif" }}>
                    Midweek Meeting
                </h2>

                <div className="flex gap-0 w-full">
                    {/* First Table */}
                    <div className="w-1/2">
                        <table
                            className="w-full border-collapse"
                            style={{ border: "2px solid #000", fontFamily: "Times New Roman, serif" }}
                        >
                            <thead>
                                <tr>
                                    <th
                                        className="border border-black p-1 bg-white text-center text-xs font-bold"
                                        style={{ minWidth: "90px" }}
                                    >
                                        Service Year
                                    </th>
                                    <th
                                        className="border border-black p-1 bg-white text-center text-xs font-bold"
                                        style={{ minWidth: "70px" }}
                                    >
                                        Number of Meetings
                                    </th>
                                    <th
                                        className="border border-black p-1 bg-white text-center text-xs font-bold"
                                        style={{ minWidth: "70px" }}
                                    >
                                        Total Attendance
                                    </th>
                                    <th
                                        className="border border-black p-1 bg-white text-center text-xs font-bold"
                                        style={{ minWidth: "80px" }}
                                    >
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
                                            {record.numberOfMeetings || ""}
                                        </td>
                                        <td className="border border-black p-1 text-center text-sm bg-white" style={{ height: "30px" }}>
                                            {record.totalAttendance || ""}
                                        </td>
                                        <td className="border border-black p-1 text-center text-sm bg-white" style={{ height: "30px" }}>
                                            {record.averageAttendance || ""}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-white">
                                    <td
                                        className="border border-black p-1 text-left pl-2 text-xs font-bold bg-white"
                                        style={{ height: "30px" }}
                                    >
                                        Average Attendance Each Month
                                    </td>
                                    <td className="border border-black p-1 text-center bg-white" style={{ height: "30px" }}></td>
                                    <td
                                        className="border border-black p-1 text-center text-sm font-bold bg-white"
                                        style={{ height: "30px" }}
                                    >
                                        {calculateTotal(firstHalf) || ""}
                                    </td>
                                    <td
                                        className="border border-black p-1 text-center text-sm font-bold bg-white"
                                        style={{ height: "30px" }}
                                    >
                                        {calculateAverageAttendance(firstHalf) || ""}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Second Table */}
                    <div className="w-1/2">
                        <table
                            className="w-full border-collapse"
                            style={{ border: "2px solid #000", fontFamily: "Times New Roman, serif" }}
                        >
                            <thead>
                                <tr>
                                    <th
                                        className="border border-black p-1 bg-white text-center text-xs font-bold"
                                        style={{ minWidth: "90px" }}
                                    >
                                        Service Year
                                    </th>
                                    <th
                                        className="border border-black p-1 bg-white text-center text-xs font-bold"
                                        style={{ minWidth: "70px" }}
                                    >
                                        Number of Meetings
                                    </th>
                                    <th
                                        className="border border-black p-1 bg-white text-center text-xs font-bold"
                                        style={{ minWidth: "70px" }}
                                    >
                                        Total Attendance
                                    </th>
                                    <th
                                        className="border border-black p-1 bg-white text-center text-xs font-bold"
                                        style={{ minWidth: "80px" }}
                                    >
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
                                            {record.numberOfMeetings || ""}
                                        </td>
                                        <td className="border border-black p-1 text-center text-sm bg-white" style={{ height: "30px" }}>
                                            {record.totalAttendance || ""}
                                        </td>
                                        <td className="border border-black p-1 text-center text-sm bg-white" style={{ height: "30px" }}>
                                            {record.averageAttendance || ""}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-white">
                                    <td
                                        className="border border-black p-1 text-left pl-2 text-xs font-bold bg-white"
                                        style={{ height: "30px" }}
                                    >
                                        Average Attendance Each Month
                                    </td>
                                    <td className="border border-black p-1 text-center bg-white" style={{ height: "30px" }}></td>
                                    <td
                                        className="border border-black p-1 text-center text-sm font-bold bg-white"
                                        style={{ height: "30px" }}
                                    >
                                        {calculateTotal(secondHalf) || ""}
                                    </td>
                                    <td
                                        className="border border-black p-1 text-center text-sm font-bold bg-white"
                                        style={{ height: "30px" }}
                                    >
                                        {calculateAverageAttendance(secondHalf) || ""}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
