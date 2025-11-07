"use client"

import { Button } from "@/components/ui/button"
import { X, Download, Printer } from "lucide-react"

interface PublisherData {
    name: string
    dateOfBirth: string
    dateOfBaptism: string
    gender: "male" | "female" | ""
    privileges: {
        elder: boolean
        ministerialServant: boolean
        regularPioneer: boolean
        specialPioneer: boolean
        otherSheep: boolean
        anointed: boolean
        fieldMissionary: boolean
    }
    monthlyRecords: {
        [key: string]: {
            sharedInMinistry: boolean
            bibleStudies: number
            auxiliaryPioneer: boolean
            hours: number
            remarks: string
        }
    }
}

interface PublisherExportViewProps {
    data: PublisherData
    onClose: () => void
}

const months = [
    "September",
    "October",
    "November",
    "December",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
]

export function PublisherExportView({ data, onClose }: PublisherExportViewProps) {
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
              <title>Publisher Record - ${data.name}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .export-content { max-width: 800px; margin: 0 auto; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                th { background-color: #f5f5f5; font-weight: bold; }
                .header { text-align: center; margin-bottom: 30px; }
                .personal-info { margin-bottom: 20px; }
                .checkbox { width: 15px; height: 15px; }
                @media print { body { margin: 0; } }
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

    const calculateTotals = () => {
        const totals = { bibleStudies: 0, hours: 0 }
        Object.values(data.monthlyRecords).forEach((record) => {
            totals.bibleStudies += record.bibleStudies
            totals.hours += record.hours
        })
        return totals
    }

    const totals = calculateTotals()

    return (
        <div className="min-h-screen bg-background p-4">
            {/* Control Bar */}
            <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
                <Button variant="outline" onClick={onClose} className="gap-2 bg-transparent">
                    <X className="h-4 w-4" />
                    Close
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePrint} className="gap-2 bg-transparent">
                        <Printer className="h-4 w-4" />
                        Print
                    </Button>
                    <Button onClick={handleDownload} className="gap-2">
                        <Download className="h-4 w-4" />
                        Download
                    </Button>
                </div>
            </div>

            {/* Export Content */}
            <div id="export-content" className="export-content max-w-4xl mx-auto bg-white text-black p-8">
                <div className="header">
                    <h1 className="text-2xl font-bold mb-4">CONGREGATION'S PUBLISHER RECORD</h1>
                </div>

                <div className="personal-info grid grid-cols-2 gap-8 mb-6">
                    <div>
                        <div className="mb-3">
                            <strong>Name:</strong>{" "}
                            <span className="border-b border-dotted border-black pb-1 inline-block min-w-[200px]">{data.name}</span>
                        </div>
                        <div className="mb-3">
                            <strong>Date of birth:</strong>{" "}
                            <span className="border-b border-dotted border-black pb-1 inline-block min-w-[150px]">
                                {data.dateOfBirth}
                            </span>
                        </div>
                        <div className="mb-3">
                            <strong>Date of baptism:</strong>{" "}
                            <span className="border-b border-dotted border-black pb-1 inline-block min-w-[150px]">
                                {data.dateOfBaptism}
                            </span>
                        </div>
                    </div>

                    <div>
                        <div className="mb-3">
                            <input type="checkbox" checked={data.gender === "male"} readOnly className="checkbox mr-2" />
                            <strong>Male</strong>
                            <input type="checkbox" checked={data.gender === "female"} readOnly className="checkbox ml-8 mr-2" />
                            <strong>Female</strong>
                        </div>
                        <div className="mb-3">
                            <input type="checkbox" checked={data.privileges.otherSheep} readOnly className="checkbox mr-2" />
                            <strong>Other sheep</strong>
                            <input type="checkbox" checked={data.privileges.anointed} readOnly className="checkbox ml-8 mr-2" />
                            <strong>Anointed</strong>
                        </div>
                    </div>
                </div>

                <div className="privileges mb-6">
                    <div className="grid grid-cols-5 gap-4">
                        <div>
                            <input type="checkbox" checked={data.privileges.elder} readOnly className="checkbox mr-2" />
                            <strong>Elder</strong>
                        </div>
                        <div>
                            <input type="checkbox" checked={data.privileges.ministerialServant} readOnly className="checkbox mr-2" />
                            <strong>Ministerial servant</strong>
                        </div>
                        <div>
                            <input type="checkbox" checked={data.privileges.regularPioneer} readOnly className="checkbox mr-2" />
                            <strong>Regular pioneer</strong>
                        </div>
                        <div>
                            <input type="checkbox" checked={data.privileges.specialPioneer} readOnly className="checkbox mr-2" />
                            <strong>Special pioneer</strong>
                        </div>
                        <div>
                            <input type="checkbox" checked={data.privileges.fieldMissionary} readOnly className="checkbox mr-2" />
                            <strong>Field missionary</strong>
                        </div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Service Year</th>
                            <th>Shared in Ministry</th>
                            <th>Bible Studies</th>
                            <th>Auxiliary Pioneer</th>
                            <th>
                                Hours
                                <br />
                                (If pioneer or field missionary)
                            </th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {months.map((month) => {
                            const record = data.monthlyRecords[month] || {
                                sharedInMinistry: false,
                                bibleStudies: 0,
                                auxiliaryPioneer: false,
                                hours: 0,
                                remarks: "",
                            }
                            return (
                                <tr key={month}>
                                    <td>{month}</td>
                                    <td className="text-center">
                                        <input type="checkbox" checked={record.sharedInMinistry} readOnly className="checkbox" />
                                    </td>
                                    <td className="text-center">{record.bibleStudies || ""}</td>
                                    <td className="text-center">
                                        <input type="checkbox" checked={record.auxiliaryPioneer} readOnly className="checkbox" />
                                    </td>
                                    <td className="text-center">{record.hours || ""}</td>
                                    <td>{record.remarks}</td>
                                </tr>
                            )
                        })}
                        <tr className="font-bold">
                            <td>Total</td>
                            <td></td>
                            <td className="text-center">{totals.bibleStudies}</td>
                            <td></td>
                            <td className="text-center">{totals.hours}</td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}
