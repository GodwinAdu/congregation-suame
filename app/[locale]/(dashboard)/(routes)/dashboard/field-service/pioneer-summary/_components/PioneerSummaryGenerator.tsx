"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { generatePioneerSummaryReport } from '@/lib/actions/field-service-report.actions'
import { FileText, Download, Calendar } from 'lucide-react'

// Service year helper functions
function getCurrentServiceYear(): number {
  const now = new Date()
  return now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1
}

function formatServiceYearShort(year: number): string {
  return `${year}-${year + 1}`
}

function formatServiceYearLabel(year: number): string {
  return `September ${year} - August ${year + 1}`
}

// Get month value in YYYY-MM format from service year and month index
function getMonthValue(serviceYear: number, monthIndex: number): string {
  // monthIndex: 0=September, 1=October, ..., 11=August
  const year = monthIndex <= 3 ? serviceYear : serviceYear + 1
  const month = monthIndex <= 3 ? monthIndex + 9 : monthIndex - 3
  return `${year}-${month.toString().padStart(2, '0')}`
}

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

const reportSchema = z.object({
  startMonth: z.string().min(1, 'Start month is required'),
  endMonth: z.string().min(1, 'End month is required')
})

type ReportFormData = z.infer<typeof reportSchema>

export function PioneerSummaryGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  
  // Service year date range state
  const currentServiceYear = getCurrentServiceYear()
  const [startServiceYear, setStartServiceYear] = useState(currentServiceYear)
  const [endServiceYear, setEndServiceYear] = useState(currentServiceYear)
  const [startMonthIndex, setStartMonthIndex] = useState(0) // September
  const [endMonthIndex, setEndMonthIndex] = useState(11) // August
  
  const availableYears = Array.from({ length: 6 }, (_, i) => currentServiceYear - 5 + i)
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      startMonth: getMonthValue(currentServiceYear, 0),
      endMonth: getMonthValue(currentServiceYear, 11)
    }
  })

  // Update form values when service year selectors change
  const handleStartYearChange = (value: string) => {
    const newYear = parseInt(value)
    setStartServiceYear(newYear)
    if (newYear > endServiceYear) {
      setEndServiceYear(newYear)
      setValue('endMonth', getMonthValue(newYear, endMonthIndex))
    }
    if (newYear === endServiceYear && startMonthIndex > endMonthIndex) {
      setEndMonthIndex(startMonthIndex)
      setValue('endMonth', getMonthValue(newYear, startMonthIndex))
    }
    setValue('startMonth', getMonthValue(newYear, startMonthIndex))
  }

  const handleEndYearChange = (value: string) => {
    const newYear = parseInt(value)
    setEndServiceYear(newYear)
    if (newYear < startServiceYear) {
      setStartServiceYear(newYear)
      setValue('startMonth', getMonthValue(newYear, startMonthIndex))
    }
    if (newYear === startServiceYear && endMonthIndex < startMonthIndex) {
      setStartMonthIndex(endMonthIndex)
      setValue('startMonth', getMonthValue(newYear, endMonthIndex))
    }
    setValue('endMonth', getMonthValue(newYear, endMonthIndex))
  }

  const handleStartMonthChange = (value: string) => {
    const newMonth = parseInt(value)
    setStartMonthIndex(newMonth)
    if (startServiceYear === endServiceYear && newMonth > endMonthIndex) {
      setEndMonthIndex(newMonth)
      setValue('endMonth', getMonthValue(endServiceYear, newMonth))
    }
    setValue('startMonth', getMonthValue(startServiceYear, newMonth))
  }

  const handleEndMonthChange = (value: string) => {
    const newMonth = parseInt(value)
    setEndMonthIndex(newMonth)
    if (startServiceYear === endServiceYear && newMonth < startMonthIndex) {
      setStartMonthIndex(newMonth)
      setValue('startMonth', getMonthValue(startServiceYear, newMonth))
    }
    setValue('endMonth', getMonthValue(endServiceYear, newMonth))
  }
  
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
  
  // Check if multiple service years are selected
  const isMultipleServiceYears = startServiceYear !== endServiceYear

  const onSubmit = async (data: ReportFormData) => {
    setIsGenerating(true)
    try {
      const result = await generatePioneerSummaryReport(data)
      setReportData(result)
    } catch (error) {
      console.error('Error generating pioneer summary:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const exportToPDF = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Pioneer Summary Report</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Service Year Date Range Selection */}
            <Card className="bg-muted/30 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Report Date Range (Service Year)</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Start Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">From:</Label>
                    <div className="flex gap-2">
                      <Select value={startMonthIndex.toString()} onValueChange={handleStartMonthChange}>
                        <SelectTrigger className="flex-1">
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
                        <SelectTrigger className="w-32">
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
                  </div>

                  {/* End Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">To:</Label>
                    <div className="flex gap-2">
                      <Select value={endMonthIndex.toString()} onValueChange={handleEndMonthChange}>
                        <SelectTrigger className="flex-1">
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
                        <SelectTrigger className="w-32">
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
                  </div>
                </div>

                <div className="mt-3 text-sm text-muted-foreground">
                  <span className="font-medium">Selected Range: </span>
                  {getSelectedRangeDescription()}
                  {isMultipleServiceYears && (
                    <span className="ml-2 text-primary font-medium">
                      (Multiple service years)
                    </span>
                  )}
                </div>
                
                {/* Hidden inputs for form submission */}
                <input type="hidden" {...register('startMonth')} />
                <input type="hidden" {...register('endMonth')} />
              </CardContent>
            </Card>

            <Button type="submit" disabled={isGenerating} className="w-full">
              {isGenerating ? 'Generating...' : 'Generate Pioneer Summary'}
              <FileText className="h-4 w-4 ml-2" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {reportData && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Pioneer Summary Report</CardTitle>
              <Button onClick={exportToPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="print:p-0" id="pioneer-summary-content">
              {/* Summary Cards */}
              <div className="mb-8 print:hidden">
                <h3 className="text-xl font-bold mb-6 text-center">Pioneer Activity Summary</h3>
                <p className="text-center text-muted-foreground mb-4">{getSelectedRangeDescription()}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-semibold text-green-700 mb-4">Regular Pioneers</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-green-600">{reportData.totals.regularPioneers.averageCount.toFixed(1)}</p>
                        <p className="text-xs text-gray-500">Avg Count</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{reportData.totals.regularPioneers.totalHours}</p>
                        <p className="text-xs text-gray-500">Total Hours</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{reportData.totals.regularPioneers.totalBibleStudies}</p>
                        <p className="text-xs text-gray-500">Bible Studies</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-semibold text-blue-700 mb-4">Auxiliary Pioneers</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{reportData.totals.auxiliaryPioneers.averageCount.toFixed(1)}</p>
                        <p className="text-xs text-gray-500">Avg Count</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{reportData.totals.auxiliaryPioneers.totalHours}</p>
                        <p className="text-xs text-gray-500">Total Hours</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{reportData.totals.auxiliaryPioneers.totalBibleStudies}</p>
                        <p className="text-xs text-gray-500">Bible Studies</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Breakdown Table */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Monthly Pioneer Activity</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border-2 border-black">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-black p-3 font-bold">Month</th>
                        <th className="border border-black p-3 font-bold" colSpan={3}>Regular Pioneers</th>
                        <th className="border border-black p-3 font-bold" colSpan={3}>Auxiliary Pioneers</th>
                      </tr>
                      <tr className="bg-gray-50">
                        <th className="border border-black p-2"></th>
                        <th className="border border-black p-2 text-sm">Count</th>
                        <th className="border border-black p-2 text-sm">Hours</th>
                        <th className="border border-black p-2 text-sm">Bible Studies</th>
                        <th className="border border-black p-2 text-sm">Count</th>
                        <th className="border border-black p-2 text-sm">Hours</th>
                        <th className="border border-black p-2 text-sm">Bible Studies</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.months.map((month: any) => (
                        <tr key={month.month}>
                          <td className="border border-black p-3 font-medium">{month.monthName}</td>
                          <td className="border border-black p-3 text-center">{month.regularPioneers.count}</td>
                          <td className="border border-black p-3 text-center">{month.regularPioneers.totalHours}</td>
                          <td className="border border-black p-3 text-center">{month.regularPioneers.totalBibleStudies}</td>
                          <td className="border border-black p-3 text-center">{month.auxiliaryPioneers.count}</td>
                          <td className="border border-black p-3 text-center">{month.auxiliaryPioneers.totalHours}</td>
                          <td className="border border-black p-3 text-center">{month.auxiliaryPioneers.totalBibleStudies}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-100 font-bold">
                        <td className="border border-black p-3">TOTALS</td>
                        <td className="border border-black p-3 text-center">-</td>
                        <td className="border border-black p-3 text-center">{reportData.totals.regularPioneers.totalHours}</td>
                        <td className="border border-black p-3 text-center">{reportData.totals.regularPioneers.totalBibleStudies}</td>
                        <td className="border border-black p-3 text-center">-</td>
                        <td className="border border-black p-3 text-center">{reportData.totals.auxiliaryPioneers.totalHours}</td>
                        <td className="border border-black p-3 text-center">{reportData.totals.auxiliaryPioneers.totalBibleStudies}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t text-sm text-muted-foreground">
                <p>Generated on {new Date(reportData.generatedAt).toLocaleString()}</p>
                <p>Generated by {reportData.generatedBy}</p>
                <p>Report Period: {reportData.filters.startMonth} to {reportData.filters.endMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pioneer Summary S-21 Records */}
      {reportData && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Pioneer Summary S-21 Records</CardTitle>
              <Button onClick={() => exportSummaryS21s()}>
                <Download className="h-4 w-4 mr-2" />
                Export Pioneer Summary S-21s
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <SummaryS21Record 
                pioneerType="Regular Pioneer" 
                months={reportData.months} 
                totals={reportData.totals.regularPioneers}
                reportData={reportData}
              />
              <SummaryS21Record 
                pioneerType="Auxiliary Pioneer" 
                months={reportData.months} 
                totals={reportData.totals.auxiliaryPioneers}
                reportData={reportData}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  function SummaryS21Record({ pioneerType, months, totals, reportData }: { pioneerType: string, months: any[], totals: any, reportData: any }) {
    return (
      <div className="bg-white border-2 border-black p-6 break-inside-avoid">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold">CONGREGATION'S PUBLISHER RECORD</h2>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <div className="mb-3">
              <strong>Name:</strong>{" "}
              <span className="border-b border-dotted border-black pb-1 inline-block min-w-[200px]">{pioneerType}</span>
            </div>
            <div className="mb-3">
              <strong>Date of birth:</strong>{" "}
              <span className="border-b border-dotted border-black pb-1 inline-block min-w-[150px]"></span>
            </div>
            <div className="mb-3">
              <strong>Date of baptism:</strong>{" "}
              <span className="border-b border-dotted border-black pb-1 inline-block min-w-[150px]"></span>
            </div>
          </div>

          <div>
            <div className="mb-3">
              <input type="checkbox" readOnly className="mr-2" />
              <strong>Male</strong>
              <input type="checkbox" readOnly className="ml-8 mr-2" />
              <strong>Female</strong>
            </div>
            <div className="mb-3">
              <input type="checkbox" checked readOnly className="mr-2" />
              <strong>Other sheep</strong>
              <input type="checkbox" readOnly className="ml-8 mr-2" />
              <strong>Anointed</strong>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="grid grid-cols-5 gap-4 text-sm">
            <div>
              <input type="checkbox" readOnly className="mr-2" />
              <strong>Elder</strong>
            </div>
            <div>
              <input type="checkbox" readOnly className="mr-2" />
              <strong>Ministerial servant</strong>
            </div>
            <div>
              <input type="checkbox" checked={pioneerType === 'Regular Pioneer'} readOnly className="mr-2" />
              <strong>Regular pioneer</strong>
            </div>
            <div>
              <input type="checkbox" checked={pioneerType === 'Auxiliary Pioneer'} readOnly className="mr-2" />
              <strong>Auxiliary pioneer</strong>
            </div>
            <div>
              <input type="checkbox" readOnly className="mr-2" />
              <strong>Special pioneer</strong>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border-2 border-black table-fixed">
            <thead>
              <tr>
                <th className="border border-black p-2 bg-gray-100 font-bold w-[90px]">Service Year</th>
                <th className="border border-black p-2 bg-gray-100 font-bold w-[80px] text-center">Shared in Ministry</th>
                <th className="border border-black p-2 bg-gray-100 font-bold w-[70px] text-center">Bible Studies</th>
                <th className="border border-black p-2 bg-gray-100 font-bold w-[80px] text-center">Auxiliary Pioneer</th>
                <th className="border border-black p-2 bg-gray-100 font-bold w-[80px] text-center">Hours<br /><span className="text-xs font-normal">(If pioneer or field missionary)</span></th>
                <th className="border border-black p-2 bg-gray-100 font-bold min-w-[100px]">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {['September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August'].map((monthName) => {
                const monthData = months.find(m => {
                  const date = new Date(m.month + '-01')
                  return date.toLocaleDateString('en-US', { month: 'long' }) === monthName
                })
                
                const monthStats = pioneerType === 'Regular Pioneer' 
                  ? monthData?.regularPioneers 
                  : monthData?.auxiliaryPioneers
                
                return (
                  <tr key={monthName}>
                    <td className="border border-black p-2">{monthName}</td>
                    <td className="border border-black p-2 text-center">
                      <input type="checkbox" checked={monthStats?.count > 0} readOnly />
                    </td>
                    <td className="border border-black p-2 text-center">{monthStats?.totalBibleStudies || ''}</td>
                    <td className="border border-black p-2 text-center">
                      <input type="checkbox" checked={pioneerType === 'Auxiliary Pioneer' && monthStats?.count > 0} readOnly />
                    </td>
                    <td className="border border-black p-2 text-center">{monthStats?.totalHours || ''}</td>
                    <td className="border border-black p-2 text-sm break-words whitespace-pre-wrap">{monthStats?.count > 0 ? `${monthStats.count} individuals` : ''}</td>
                  </tr>
                )
              })}
              <tr className="font-bold">
                <td className="border border-black p-2">Total</td>
                <td className="border border-black p-2"></td>
                <td className="border border-black p-2 text-center">{totals.totalBibleStudies}</td>
                <td className="border border-black p-2"></td>
                <td className="border border-black p-2 text-center">{totals.totalHours}</td>
                <td className="border border-black p-2 text-center">Avg: {totals.averageCount.toFixed(1)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  function exportSummaryS21s() {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      let allContent = `
        <html>
          <head>
            <title>Pioneer Summary S-21 Records</title>
            <style>
              @page { size: A4; margin: 20mm; }
              body { font-family: Arial, sans-serif; margin: 0; background: white; color: black; }
              .page { page-break-after: always; min-height: 90vh; padding: 20px; }
              .page:last-child { page-break-after: auto; }
              table { width: 100%; border-collapse: collapse; table-layout: fixed; }
              th, td { border: 2px solid #000; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; font-weight: bold; }
              .header { text-align: center; margin-bottom: 20px; }
              .personal-info { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 24px; }
              .privileges { margin-bottom: 24px; }
              .privileges > div { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
              input[type="checkbox"] { width: 15px; height: 15px; }
              .remarks-col { word-wrap: break-word; white-space: pre-wrap; font-size: 11px; }
            </style>
          </head>
          <body>
      `
      
      // Regular Pioneer S-21
      allContent += generateSummaryS21HTML('Regular Pioneer', reportData.months, reportData.totals.regularPioneers)
      
      // Auxiliary Pioneer S-21
      allContent += generateSummaryS21HTML('Auxiliary Pioneer', reportData.months, reportData.totals.auxiliaryPioneers)
      
      allContent += `
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 1000);
              }
            </script>
          </body>
        </html>
      `
      
      printWindow.document.write(allContent)
      printWindow.document.close()
    }
  }

  function generateSummaryS21HTML(pioneerType: string, months: any[], totals: any) {
    return `
      <div class="page">
        <div class="header">
          <h1>CONGREGATION'S PUBLISHER RECORD</h1>
        </div>

        <div class="personal-info">
          <div>
            <div style="margin-bottom: 12px;">
              <strong>Name:</strong>
              <span style="border-bottom: 1px dotted #000; padding-bottom: 4px; display: inline-block; min-width: 200px;">${pioneerType}</span>
            </div>
            <div style="margin-bottom: 12px;">
              <strong>Date of birth:</strong>
              <span style="border-bottom: 1px dotted #000; padding-bottom: 4px; display: inline-block; min-width: 150px;"></span>
            </div>
            <div style="margin-bottom: 12px;">
              <strong>Date of baptism:</strong>
              <span style="border-bottom: 1px dotted #000; padding-bottom: 4px; display: inline-block; min-width: 150px;"></span>
            </div>
          </div>

          <div>
            <div style="margin-bottom: 12px;">
              <input type="checkbox" />
              <strong>Male</strong>
              <input type="checkbox" style="margin-left: 32px;" />
              <strong>Female</strong>
            </div>
            <div style="margin-bottom: 12px;">
              <input type="checkbox" checked />
              <strong>Other sheep</strong>
              <input type="checkbox" style="margin-left: 32px;" />
              <strong>Anointed</strong>
            </div>
          </div>
        </div>

        <div class="privileges">
          <div>
            <div>
              <input type="checkbox" />
              <strong>Elder</strong>
            </div>
            <div>
              <input type="checkbox" />
              <strong>Ministerial servant</strong>
            </div>
            <div>
              <input type="checkbox" ${pioneerType === 'Regular Pioneer' ? 'checked' : ''} />
              <strong>Regular pioneer</strong>
            </div>
            <div>
              <input type="checkbox" ${pioneerType === 'Auxiliary Pioneer' ? 'checked' : ''} />
              <strong>Auxiliary pioneer</strong>
            </div>
            <div>
              <input type="checkbox" />
              <strong>Special pioneer</strong>
            </div>
          </div>
        </div>

        <table style="table-layout: fixed; width: 100%;">
          <colgroup>
            <col style="width: 90px;" />
            <col style="width: 80px;" />
            <col style="width: 70px;" />
            <col style="width: 80px;" />
            <col style="width: 80px;" />
            <col style="width: auto; min-width: 100px;" />
          </colgroup>
          <thead>
            <tr>
              <th>Service Year</th>
              <th>Shared in Ministry</th>
              <th>Bible Studies</th>
              <th>Auxiliary Pioneer</th>
              <th>Hours<br/><span style="font-size: 10px; font-weight: normal;">(If pioneer or field missionary)</span></th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${['September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August'].map(monthName => {
              const monthData = months.find(m => {
                const date = new Date(m.month + '-01')
                return date.toLocaleDateString('en-US', { month: 'long' }) === monthName
              })
              
              const monthStats = pioneerType === 'Regular Pioneer' 
                ? monthData?.regularPioneers 
                : monthData?.auxiliaryPioneers
              
              return `
                <tr>
                  <td>${monthName}</td>
                  <td style="text-align: center;">
                    <input type="checkbox" ${monthStats?.count > 0 ? 'checked' : ''} />
                  </td>
                  <td style="text-align: center;">${monthStats?.totalBibleStudies || ''}</td>
                  <td style="text-align: center;">
                    <input type="checkbox" ${pioneerType === 'Auxiliary Pioneer' && monthStats?.count > 0 ? 'checked' : ''} />
                  </td>
                  <td style="text-align: center;">${monthStats?.totalHours || ''}</td>
                  <td class="remarks-col" style="word-wrap: break-word; white-space: pre-wrap; font-size: 11px;">${monthStats?.count > 0 ? `${monthStats.count} Pub.` : ''}</td>
                </tr>
              `
            }).join('')}
            <tr style="font-weight: bold;">
              <td>Total</td>
              <td></td>
              <td style="text-align: center;">${totals.totalBibleStudies}</td>
              <td></td>
              <td style="text-align: center;">${totals.totalHours}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    `
  }
}
