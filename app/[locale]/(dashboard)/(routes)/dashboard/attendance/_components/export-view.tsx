"use client"

import { Button } from "@/components/ui/button"
import { X, Download, Printer } from "lucide-react"

interface ExportViewProps {
    congregationName: string
    selectedMonth: string
    attendanceData: any[]
    onClose: () => void
}

export function ExportView({ congregationName, selectedMonth, attendanceData, onClose }: ExportViewProps) {
    // Process real attendance data by week and meeting type
    const processAttendanceData = () => {
        const midweek = [0, 0, 0, 0, 0]
        const weekend = [0, 0, 0, 0, 0]

        attendanceData.forEach(record => {
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

    const processedData = processAttendanceData()

    const calculateTotal = (data: number[]) => data.reduce((sum, val) => sum + val, 0)
    const calculateAverage = (data: number[]) => Math.round(calculateTotal(data) / data.length)

    const handlePrint = () => {
        const printContent = document.getElementById("export-content")
        if (printContent) {
            const newWindow = window.open("", "_blank")
            if (newWindow) {
                newWindow.document.write(`
                    <html>
                        <head>
                            <title>Meeting Attendance Report</title>
                            <style>
                                body { font-family: Arial, sans-serif; margin: 20px; background: white; }
                                .report-container { max-width: 800px; margin: 0 auto; }
                                .text-3xl { font-size: 1.875rem; }
                                .font-bold { font-weight: bold; }
                                .text-center { text-align: center; }
                                .mb-8 { margin-bottom: 2rem; }
                                .mb-12 { margin-bottom: 3rem; }
                                .tracking-wider { letter-spacing: 0.05em; }
                                .text-sm { font-size: 0.875rem; }
                                .leading-relaxed { line-height: 1.625; }
                                .flex { display: flex; }
                                .justify-between { justify-content: space-between; }
                                .items-center { align-items: center; }
                                .mr-3 { margin-right: 0.75rem; }
                                .border-b-2 { border-bottom-width: 2px; }
                                .border-dotted { border-style: dotted; }
                                .border-black { border-color: black; }
                                .min-w-\[300px\] { min-width: 300px; }
                                .min-w-\[200px\] { min-width: 200px; }
                                .h-6 { height: 1.5rem; }
                                .items-end { align-items: flex-end; }
                                .pb-1 { padding-bottom: 0.25rem; }
                                .text-base { font-size: 1rem; }
                                .w-full { width: 100%; }
                                .border-2 { border-width: 2px; }
                                .p-3 { padding: 0.75rem; }
                                .p-4 { padding: 1rem; }
                                .bg-gray-50 { background-color: #f9fafb; }
                                .text-left { text-align: left; }
                                .pl-6 { padding-left: 1.5rem; }
                                table { border-collapse: collapse; }
                                @media print { body { margin: 20px; } }
                            </style>
                        </head>
                        <body>
                            ${printContent.innerHTML}
                        </body>
                    </html>
                `)
                newWindow.document.close()
                newWindow.print()
                newWindow.close()
            }
        }
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
                @media print { body { margin: 20px; } }
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

    return (
        <div className="min-h-screen bg-background">
            <div className="no-print sticky top-0 z-10 bg-background border-b border-border p-4">
                <div className="container mx-auto flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Export Preview</h2>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={handlePrint}>
                            <Printer className="w-4 h-4 mr-2" />
                            Print
                        </Button>
                        <Button variant="outline" onClick={handleDownload}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                        </Button>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div id="export-content" className="container mx-auto p-8 max-w-4xl bg-white text-black">
                <div className="report-container">
                    <h1 className="text-3xl font-bold text-center mb-8 tracking-wider">REPORT OF MEETING ATTENDANCE</h1>

                    <div className="mb-12 text-sm leading-relaxed">
                        <p>
                            (The attendance count should be taken once at the midpoint of each meeting. Remember to include any
                            homebound or isolated individuals who may be tied in.)
                        </p>
                    </div>

                    <div className="flex justify-between items-center mb-12">
                        <div className="flex items-center">
                            <span className="font-bold mr-3">Congregation name:</span>
                            <div className="border-b-2 border-dotted border-black min-w-[300px] h-6 flex items-end pb-1">
                                <span className="text-base">{congregationName || ""}</span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <span className="font-bold mr-3">Month:</span>
                            <div className="border-b-2 border-dotted border-black min-w-[200px] h-6 flex items-end pb-1">
                                <span className="text-base">
                                    {selectedMonth
                                        ? new Date(selectedMonth + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })
                                        : ""}
                                </span>
                            </div>
                        </div>
                    </div>

                    <table className="w-full border-2 border-black mb-12">
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
                                    Midweek
                                    <br />
                                    Meeting
                                </td>
                                {processedData.midweek.map((count, index) => (
                                    <td key={index} className="border-2 border-black p-4 text-center font-medium">
                                        {count || ""}
                                    </td>
                                ))}
                                <td className="border-2 border-black p-4 text-center font-bold">
                                    {calculateTotal(processedData.midweek)}
                                </td>
                                <td className="border-2 border-black p-4 text-center font-bold">
                                    {calculateAverage(processedData.midweek.filter(n => n > 0))}
                                </td>
                            </tr>
                            <tr>
                                <td className="border-2 border-black p-4 font-bold text-left pl-6">
                                    Weekend
                                    <br />
                                    Meeting
                                </td>
                                {processedData.weekend.map((count, index) => (
                                    <td key={index} className="border-2 border-black p-4 text-center font-medium">
                                        {count || ""}
                                    </td>
                                ))}
                                <td className="border-2 border-black p-4 text-center font-bold">
                                    {calculateTotal(processedData.weekend)}
                                </td>
                                <td className="border-2 border-black p-4 text-center font-bold">
                                    {calculateAverage(processedData.weekend.filter(n => n > 0))}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="text-left text-sm">
                        <p>S-3-E &nbsp;&nbsp; 10/15</p>
                    </div>
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
          * {
            visibility: hidden;
          }
          #export-content, #export-content * {
            visibility: visible;
          }
          #export-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px !important;
            margin: 0 !important;
            max-width: none !important;
          }
        }
      `}</style>
        </div>
    )
}
