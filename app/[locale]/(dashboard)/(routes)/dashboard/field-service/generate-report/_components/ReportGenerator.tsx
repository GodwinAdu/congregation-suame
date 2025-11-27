"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { generateFieldServiceReport } from '@/lib/actions/field-service-report.actions'
import { FileText, Download } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const reportSchema = z.object({
  startMonth: z.string().min(1, 'Start month is required'),
  endMonth: z.string().min(1, 'End month is required'),
  filterType: z.enum(['all', 'role', 'group', 'privilege', 'member']),
  filterValue: z.string().optional()
})

type ReportFormData = z.infer<typeof reportSchema>

interface ReportGeneratorProps {
  roles: any[]
  groups: any[]
  privileges: any[]
  members: any[]
}

export function ReportGenerator({ roles, groups, privileges, members }: ReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      filterType: 'all'
    }
  })

  const filterType = watch('filterType')

  const onSubmit = async (data: ReportFormData) => {
    setIsGenerating(true)
    try {
      const result = await generateFieldServiceReport(data)
      setReportData(result)
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const exportToPDF = () => {
    window.print()
  }

  const exportAllS21Simple = () => {
    if (!reportData?.memberReports) return
    
    reportData.memberReports.forEach((memberReport: any, index: number) => {
      setTimeout(() => {
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          const s21Content = generateS21HTML(memberReport)
          printWindow.document.write(`
            <html>
              <head>
                <title>S-21 Record - ${memberReport.member.fullName}</title>
                <style>
                  @page { size: A4; margin: 20mm; }
                  body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                  .s21-container { max-width: 100%; margin: 0 auto; }
                  table { width: 100%; border-collapse: collapse; }
                  th, td { border: 2px solid #000; padding: 8px; text-align: left; }
                  th { background-color: #f5f5f5; font-weight: bold; }
                  .header { text-align: center; margin-bottom: 20px; }
                  .personal-info { margin-bottom: 20px; }
                  .privileges { margin-bottom: 20px; }
                  input[type="checkbox"] { width: 15px; height: 15px; }
                </style>
              </head>
              <body>
                ${s21Content}
                <script>
                  window.onload = function() {
                    setTimeout(function() {
                      window.print();
                    }, 500);
                  }
                </script>
              </body>
            </html>
          `)
          printWindow.document.close()
        }
      }, index * 1000)
    })
  }

  const exportIndividualPDF = async (memberReport: any) => {
    try {
      console.log('Starting PDF export for:', memberReport.member.fullName)
      
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = generateS21HTML(memberReport)
      tempDiv.style.cssText = `
        position: absolute;
        left: -9999px;
        width: 800px;
        font-family: Arial, sans-serif;
        background-color: #ffffff;
        color: #000000;
      `
      document.body.appendChild(tempDiv)
      
      // Remove any CSS variables or lab() colors
      const allElements = tempDiv.querySelectorAll('*')
      allElements.forEach(el => {
        const element = el as HTMLElement
        element.style.backgroundColor = element.style.backgroundColor || '#ffffff'
        element.style.color = element.style.color || '#000000'
      })
      
      console.log('Created temp div, generating canvas...')
      
      const canvas = await html2canvas(tempDiv, {
        scale: 1.2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        ignoreElements: (element) => {
          return element.tagName === 'INPUT' && element.getAttribute('type') === 'checkbox'
        }
      })
      
      console.log('Canvas generated, creating PDF...')
      
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight)
      
      const fileName = `S-21_${memberReport.member.fullName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
      console.log('Saving PDF as:', fileName)
      
      pdf.save(fileName)
      
      document.body.removeChild(tempDiv)
      console.log('PDF export completed successfully')
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Error exporting PDF. Using print fallback.')
      // Fallback to print
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        const s21Content = generateS21HTML(memberReport)
        printWindow.document.write(`
          <html>
            <head>
              <title>S-21 Record - ${memberReport.member.fullName}</title>
              <style>
                @page { size: A4; margin: 20mm; }
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: white; color: black; }
                * { background-color: white !important; color: black !important; }
                .s21-container { max-width: 100%; margin: 0 auto; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 2px solid #000; padding: 8px; text-align: left; }
                th { background-color: #f5f5f5; font-weight: bold; }
                input[type="checkbox"] { width: 15px; height: 15px; }
              </style>
            </head>
            <body>
              ${s21Content}
              <script>window.onload = function() { setTimeout(function() { window.print(); }, 500); }</script>
            </body>
          </html>
        `)
        printWindow.document.close()
      }
    }
  }

  const generateS21HTML = (memberReport: any) => {
    return `
      <div class="s21-container">
        <div class="header">
          <h2>CONGREGATION'S PUBLISHER RECORD</h2>
        </div>

        <div class="personal-info" style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px;">
          <div>
            <div style="margin-bottom: 15px;">
              <strong>Name:</strong>
              <span style="border-bottom: 1px dotted #000; padding-bottom: 2px; display: inline-block; min-width: 200px;">${memberReport.member.fullName}</span>
            </div>
            <div style="margin-bottom: 15px;">
              <strong>Date of birth:</strong>
              <span style="border-bottom: 1px dotted #000; padding-bottom: 2px; display: inline-block; min-width: 150px;">${memberReport.member.dateOfBirth}</span>
            </div>
            <div style="margin-bottom: 15px;">
              <strong>Date of baptism:</strong>
              <span style="border-bottom: 1px dotted #000; padding-bottom: 2px; display: inline-block; min-width: 150px;">${memberReport.member.dateOfBaptism}</span>
            </div>
          </div>

          <div>
            <div style="margin-bottom: 15px;">
              <input type="checkbox" ${memberReport.member.gender === 'male' ? 'checked' : ''} style="margin-right: 8px;" />
              <strong>Male</strong>
              <input type="checkbox" ${memberReport.member.gender === 'female' ? 'checked' : ''} style="margin-left: 40px; margin-right: 8px;" />
              <strong>Female</strong>
            </div>
            <div style="margin-bottom: 15px;">
              <input type="checkbox" ${memberReport.member.privileges.otherSheep ? 'checked' : ''} style="margin-right: 8px;" />
              <strong>Other sheep</strong>
              <input type="checkbox" ${memberReport.member.privileges.anointed ? 'checked' : ''} style="margin-left: 40px; margin-right: 8px;" />
              <strong>Anointed</strong>
            </div>
          </div>
        </div>

        <div class="privileges" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px; margin-bottom: 30px; font-size: 14px;">
          <div>
            <input type="checkbox" ${memberReport.member.privileges.elder ? 'checked' : ''} style="margin-right: 8px;" />
            <strong>Elder</strong>
          </div>
          <div>
            <input type="checkbox" ${memberReport.member.privileges.ministerialServant ? 'checked' : ''} style="margin-right: 8px;" />
            <strong>Ministerial servant</strong>
          </div>
          <div>
            <input type="checkbox" ${memberReport.member.privileges.regularPioneer ? 'checked' : ''} style="margin-right: 8px;" />
            <strong>Regular pioneer</strong>
          </div>
          <div>
            <input type="checkbox" ${memberReport.member.privileges.specialPioneer ? 'checked' : ''} style="margin-right: 8px;" />
            <strong>Special pioneer</strong>
          </div>
          <div>
            <input type="checkbox" ${memberReport.member.privileges.fieldMissionary ? 'checked' : ''} style="margin-right: 8px;" />
            <strong>Field missionary</strong>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Service Year</th>
              <th>Shared in Ministry</th>
              <th>Bible Studies</th>
              <th>Auxiliary Pioneer</th>
              <th>Hours<br/>(If pioneer or field missionary)</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${['September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August'].map(month => {
              const report = memberReport.reports.find((r: any) => {
                const reportDate = new Date(r.month + '-01')
                return reportDate.toLocaleDateString('en-US', { month: 'long' }) === month
              })
              return `
                <tr>
                  <td>${month}</td>
                  <td style="text-align: center;">
                    <input type="checkbox" ${report ? 'checked' : ''} />
                  </td>
                  <td style="text-align: center;">${report?.bibleStudies || ''}</td>
                  <td style="text-align: center;">
                    <input type="checkbox" ${report?.auxiliaryPioneer ? 'checked' : ''} />
                  </td>
                  <td style="text-align: center;">${report?.hours || ''}</td>
                  <td>${report?.comments || ''}</td>
                </tr>
              `
            }).join('')}
            <tr style="font-weight: bold;">
              <td>Total</td>
              <td></td>
              <td style="text-align: center;">${memberReport.totals.bibleStudies}</td>
              <td></td>
              <td style="text-align: center;">${memberReport.totals.hours}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    `
  }

  const exportAllS21PDFs = async () => {
    if (!reportData?.memberReports) {
      alert('No report data available')
      return
    }
    
    try {
      console.log('Creating single PDF with all pages')
      
      // Create single window with all content
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        let allContent = `
          <html>
            <head>
              <title>Complete Field Service Report</title>
              <style>
                @page { size: A4; margin: 20mm; }
                body { font-family: Arial, sans-serif; margin: 0; background: white; color: black; }
                * { background-color: white !important; color: black !important; }
                .page { page-break-after: always; min-height: 90vh; padding: 20px; }
                .page:last-child { page-break-after: auto; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                th { background-color: #f5f5f5 !important; font-weight: bold; }
                .stat-card { border: 2px solid #000; padding: 15px; margin: 10px; text-align: center; display: inline-block; width: 150px; }
                .stat-number { font-size: 24px; font-weight: bold; }
                h1, h3 { text-align: center; }
                .export-content { max-width: 100%; margin: 0 auto; }
                .header { text-align: center; margin-bottom: 30px; }
                .personal-info { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 24px; }
                .privileges { margin-bottom: 24px; }
                .privileges > div { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
                input[type="checkbox"] { width: 15px; height: 15px; }
                strong { font-weight: bold; }
              </style>
            </head>
            <body>
        `
        
        // Add summary page
        allContent += `
          <div class="page">
            <h1>FIELD SERVICE REPORT SUMMARY</h1>
            <p><strong>Report Period:</strong> ${reportData.filters.startMonth} to ${reportData.filters.endMonth}</p>
            <p><strong>Filter:</strong> ${reportData.filters.filterType === 'all' ? 'All Members' : reportData.filters.filterType}</p>
            <p><strong>Generated:</strong> ${new Date(reportData.generatedAt).toLocaleDateString()} by ${reportData.generatedBy}</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div class="stat-card">
                <div class="stat-number">${reportData.summary.totalMembers}</div>
                <div>Total Publishers</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${reportData.summary.totalHours}</div>
                <div>Total Hours</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${reportData.summary.totalBibleStudies}</div>
                <div>Bible Studies</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${reportData.summary.reportingPercentage.toFixed(1)}%</div>
                <div>Reporting Rate</div>
              </div>
            </div>
            
            <h3>Publisher Summary</h3>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Total Hours</th>
                  <th>Bible Studies</th>
                  <th>Months Reported</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.memberReports.map((member: any) => `
                  <tr>
                    <td>${member.member.fullName}</td>
                    <td>${member.totals.hours}</td>
                    <td>${member.totals.bibleStudies}</td>
                    <td>${member.reports.length}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `
        
        // Add each S-21 page
        reportData.memberReports.forEach((memberReport: any) => {
          allContent += `
            <div class="page">
              <div class="export-content">
                <div class="header">
                  <h1>CONGREGATION'S PUBLISHER RECORD</h1>
                </div>

                <div class="personal-info">
                  <div>
                    <div style="margin-bottom: 12px;">
                      <strong>Name:</strong>
                      <span style="border-bottom: 1px dotted #000; padding-bottom: 4px; display: inline-block; min-width: 200px;">${memberReport.member.fullName}</span>
                    </div>
                    <div style="margin-bottom: 12px;">
                      <strong>Date of birth:</strong>
                      <span style="border-bottom: 1px dotted #000; padding-bottom: 4px; display: inline-block; min-width: 150px;">${memberReport.member.dateOfBirth || ''}</span>
                    </div>
                    <div style="margin-bottom: 12px;">
                      <strong>Date of baptism:</strong>
                      <span style="border-bottom: 1px dotted #000; padding-bottom: 4px; display: inline-block; min-width: 150px;">${memberReport.member.dateOfBaptism || ''}</span>
                    </div>
                  </div>

                  <div>
                    <div style="margin-bottom: 12px;">
                      <input type="checkbox" ${memberReport.member.gender === 'male' ? 'checked' : ''} />
                      <strong>Male</strong>
                      <input type="checkbox" ${memberReport.member.gender === 'female' ? 'checked' : ''} style="margin-left: 32px;" />
                      <strong>Female</strong>
                    </div>
                    <div style="margin-bottom: 12px;">
                      <input type="checkbox" ${memberReport.member.privileges.otherSheep ? 'checked' : ''} />
                      <strong>Other sheep</strong>
                      <input type="checkbox" ${memberReport.member.privileges.anointed ? 'checked' : ''} style="margin-left: 32px;" />
                      <strong>Anointed</strong>
                    </div>
                  </div>
                </div>

                <div class="privileges">
                  <div>
                    <div>
                      <input type="checkbox" ${memberReport.member.privileges.elder ? 'checked' : ''} />
                      <strong>Elder</strong>
                    </div>
                    <div>
                      <input type="checkbox" ${memberReport.member.privileges.ministerialServant ? 'checked' : ''} />
                      <strong>Ministerial servant</strong>
                    </div>
                    <div>
                      <input type="checkbox" ${memberReport.member.privileges.regularPioneer ? 'checked' : ''} />
                      <strong>Regular pioneer</strong>
                    </div>
                    <div>
                      <input type="checkbox" ${memberReport.member.privileges.specialPioneer ? 'checked' : ''} />
                      <strong>Special pioneer</strong>
                    </div>
                    <div>
                      <input type="checkbox" ${memberReport.member.privileges.fieldMissionary ? 'checked' : ''} />
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
                      <th>Hours<br/>(If pioneer or field missionary)</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${['September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August'].map(month => {
                      const report = memberReport.reports.find((r: any) => {
                        const reportDate = new Date(r.month + '-01')
                        return reportDate.toLocaleDateString('en-US', { month: 'long' }) === month
                      })
                      return `
                        <tr>
                          <td>${month}</td>
                          <td style="text-align: center;">
                            <input type="checkbox" ${report ? 'checked' : ''} />
                          </td>
                          <td style="text-align: center;">${report?.bibleStudies || ''}</td>
                          <td style="text-align: center;">
                            <input type="checkbox" ${report?.auxiliaryPioneer ? 'checked' : ''} />
                          </td>
                          <td style="text-align: center;">${report?.hours || ''}</td>
                          <td>${report?.comments || ''}</td>
                        </tr>
                      `
                    }).join('')}
                    <tr style="font-weight: bold;">
                      <td>Total</td>
                      <td></td>
                      <td style="text-align: center;">${memberReport.totals.bibleStudies}</td>
                      <td></td>
                      <td style="text-align: center;">${memberReport.totals.hours}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          `
        })
        
        // Close HTML and add print script
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
      
      alert(`Opening complete field service report with summary and all ${reportData.memberReports.length} S-21 records in a single PDF. Use 'Save as PDF' from the print dialog.`)
      
    } catch (error) {
      console.error('Error creating complete PDF:', error)
      alert('Error creating complete PDF: ' + error.message)
    }
  }

  const generateSummaryHTML = () => {
    return `
      <div class="page">
        <div class="summary-container">
          <div class="header">
            <h1>FIELD SERVICE REPORT SUMMARY</h1>
            <p>Report Period: ${reportData.filters.startMonth} to ${reportData.filters.endMonth}</p>
            <p>Filter: ${reportData.filters.filterType === 'all' ? 'All Members' : reportData.filters.filterType}</p>
            <p>Generated: ${new Date(reportData.generatedAt).toLocaleDateString()}</p>
            <p>Generated by: ${reportData.generatedBy}</p>
          </div>
          
          <div class="summary-stats">
            <div class="stat-card">
              <div class="stat-number">${reportData.summary.totalMembers}</div>
              <div>Total Publishers</div>
              <div style="font-size: 12px;">In selected filter</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${reportData.summary.totalHours}</div>
              <div>Total Hours</div>
              <div style="font-size: 12px;">Avg: ${reportData.summary.averageHours.toFixed(1)} hrs/publisher</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${reportData.summary.totalBibleStudies}</div>
              <div>Bible Studies</div>
              <div style="font-size: 12px;">Conducted during period</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${reportData.summary.reportingPercentage.toFixed(1)}%</div>
              <div>Reporting Rate</div>
              <div style="font-size: 12px;">${reportData.summary.totalReports} of ${reportData.summary.totalMembers} reported</div>
            </div>
          </div>
          
          <div style="margin-top: 40px;">
            <h3>Publisher List</h3>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Total Hours</th>
                  <th>Bible Studies</th>
                  <th>Months Reported</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.memberReports.map((member: any) => `
                  <tr>
                    <td>${member.member.fullName}</td>
                    <td>${member.totals.hours}</td>
                    <td>${member.totals.bibleStudies}</td>
                    <td>${member.reports.length}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Field Service Report</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startMonth">Start Month</Label>
                <Input type="month" {...register('startMonth')} />
                {errors.startMonth && <p className="text-red-500 text-sm">{errors.startMonth.message}</p>}
              </div>
              <div>
                <Label htmlFor="endMonth">End Month</Label>
                <Input type="month" {...register('endMonth')} />
                {errors.endMonth && <p className="text-red-500 text-sm">{errors.endMonth.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="filterType">Filter By</Label>
                <Select onValueChange={(value) => setValue('filterType', value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Members</SelectItem>
                    <SelectItem value="role">Role</SelectItem>
                    <SelectItem value="group">Group</SelectItem>
                    <SelectItem value="privilege">Privilege</SelectItem>
                    <SelectItem value="member">Individual Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {filterType !== 'all' && (
                <div>
                  <Label htmlFor="filterValue">Select {filterType}</Label>
                  <Select onValueChange={(value) => setValue('filterValue', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {filterType === 'role' && roles.map(role => (
                        <SelectItem key={role._id} value={role._id}>{role.name}</SelectItem>
                      ))}
                      {filterType === 'group' && groups.map(group => (
                        <SelectItem key={group._id} value={group._id}>{group.name}</SelectItem>
                      ))}
                      {filterType === 'privilege' && privileges.map(privilege => (
                        <SelectItem key={privilege._id} value={privilege._id}>{privilege.name}</SelectItem>
                      ))}
                      {filterType === 'member' && members.map(member => (
                        <SelectItem key={member._id} value={member._id}>{member.fullName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Button type="submit" disabled={isGenerating} className="w-full">
              {isGenerating ? 'Generating...' : 'Generate Report'}
              <FileText className="h-4 w-4 ml-2" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {reportData && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Report Preview</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" onClick={exportToPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Print Full Report
                </Button>
                <Button onClick={() => exportAllS21PDFs()}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Individual S-21 PDFs
                </Button>
                <Button variant="secondary" onClick={() => exportAllS21Simple()}>
                  <Download className="h-4 w-4 mr-2" />
                  Simple Export (Print)
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="print:p-0" id="report-content">
              <div className="mb-8 print:hidden">
                <h3 className="text-xl font-bold mb-6 text-center">Field Service Report Summary</h3>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-600 mb-1">Total Publishers</p>
                        <p className="text-3xl font-bold text-blue-600">{reportData.summary.totalMembers}</p>
                        <p className="text-xs text-gray-500">In selected filter</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-600 mb-1">Total Hours</p>
                        <p className="text-3xl font-bold text-green-600">{reportData.summary.totalHours}</p>
                        <p className="text-xs text-gray-500">Average: {reportData.summary.averageHours.toFixed(1)} hrs/publisher</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-600 mb-1">Bible Studies</p>
                        <p className="text-3xl font-bold text-orange-600">{reportData.summary.totalBibleStudies}</p>
                        <p className="text-xs text-gray-500">Conducted during period</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-600 mb-1">Reporting Rate</p>
                        <p className="text-3xl font-bold text-purple-600">{reportData.summary.reportingPercentage.toFixed(1)}%</p>
                        <p className="text-xs text-gray-500">{reportData.summary.totalReports} of {reportData.summary.totalMembers} reported</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pioneer Totals Section */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="text-lg font-semibold mb-4 text-center">Pioneer Totals</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
                        <h5 className="font-semibold text-green-700 mb-2">Regular Pioneers</h5>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-green-600">{reportData.summary.pioneerTotals.regularPioneers?.count}</p>
                            <p className="text-xs text-gray-500">Publishers</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-green-600">{reportData.summary.pioneerTotals.regularPioneers.totalHours}</p>
                            <p className="text-xs text-gray-500">Total Hours</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-green-600">{reportData.summary.pioneerTotals.regularPioneers.totalBibleStudies}</p>
                            <p className="text-xs text-gray-500">Bible Studies</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                        <h5 className="font-semibold text-blue-700 mb-2">Auxiliary Pioneers</h5>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-blue-600">{reportData.summary.pioneerTotals.auxiliaryPioneers.count}</p>
                            <p className="text-xs text-gray-500">Publishers</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-blue-600">{reportData.summary.pioneerTotals.auxiliaryPioneers.totalHours}</p>
                            <p className="text-xs text-gray-500">Total Hours</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-blue-600">{reportData.summary.pioneerTotals.auxiliaryPioneers.totalBibleStudies}</p>
                            <p className="text-xs text-gray-500">Bible Studies</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-medium text-gray-700">Report Period</p>
                        <p className="text-gray-600">{reportData.filters.startMonth} to {reportData.filters.endMonth}</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-700">Filter Applied</p>
                        <p className="text-gray-600 capitalize">{reportData.filters.filterType === 'all' ? 'All Members' : reportData.filters.filterType}</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-700">Generated</p>
                        <p className="text-gray-600">{new Date(reportData.generatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Individual Publisher Records (S-21)</h3>
                <div className="space-y-8">
                  {reportData.memberReports.map((memberReport: any) => (
                    <div key={memberReport.member._id} className="bg-white border-2 border-black p-6 break-inside-avoid">
                      <div className="text-center mb-6">
                        <h2 className="text-xl font-bold">CONGREGATION'S PUBLISHER RECORD</h2>
                      </div>

                      <div className="grid grid-cols-2 gap-8 mb-6">
                        <div>
                          <div className="mb-3">
                            <strong>Name:</strong>{" "}
                            <span className="border-b border-dotted border-black pb-1 inline-block min-w-[200px]">{memberReport.member.fullName}</span>
                          </div>
                          <div className="mb-3">
                            <strong>Date of birth:</strong>{" "}
                            <span className="border-b border-dotted border-black pb-1 inline-block min-w-[150px]">{memberReport.member.dateOfBirth}</span>
                          </div>
                          <div className="mb-3">
                            <strong>Date of baptism:</strong>{" "}
                            <span className="border-b border-dotted border-black pb-1 inline-block min-w-[150px]">{memberReport.member.dateOfBaptism}</span>
                          </div>
                        </div>

                        <div>
                          <div className="mb-3">
                            <input type="checkbox" checked={memberReport.member.gender === 'male'} readOnly className="mr-2" />
                            <strong>Male</strong>
                            <input type="checkbox" checked={memberReport.member.gender === 'female'} readOnly className="ml-8 mr-2" />
                            <strong>Female</strong>
                          </div>
                          <div className="mb-3">
                            <input type="checkbox" checked={memberReport.member.privileges.otherSheep} readOnly className="mr-2" />
                            <strong>Other sheep</strong>
                            <input type="checkbox" checked={memberReport.member.privileges.anointed} readOnly className="ml-8 mr-2" />
                            <strong>Anointed</strong>
                          </div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <div className="grid grid-cols-5 gap-4 text-sm">
                          <div>
                            <input type="checkbox" checked={memberReport.member.privileges.elder} readOnly className="mr-2" />
                            <strong>Elder</strong>
                          </div>
                          <div>
                            <input type="checkbox" checked={memberReport.member.privileges.ministerialServant} readOnly className="mr-2" />
                            <strong>Ministerial servant</strong>
                          </div>
                          <div>
                            <input type="checkbox" checked={memberReport.member.privileges.regularPioneer} readOnly className="mr-2" />
                            <strong>Regular pioneer</strong>
                          </div>
                          <div>
                            <input type="checkbox" checked={memberReport.member.privileges.auxiliaryPioneer} readOnly className="mr-2" />
                            <strong>Auxiliary pioneer</strong>
                          </div>
                          <div>
                            <input type="checkbox" checked={memberReport.member.privileges.specialPioneer} readOnly className="mr-2" />
                            <strong>Special pioneer</strong>
                          </div>
                          <div>
                            <input type="checkbox" checked={memberReport.member.privileges.fieldMissionary} readOnly className="mr-2" />
                            <strong>Field missionary</strong>
                          </div>
                        </div>
                      </div>

                      <table className="w-full border-collapse border-2 border-black">
                        <thead>
                          <tr>
                            <th className="border border-black p-2 bg-gray-100 font-bold">Service Year</th>
                            <th className="border border-black p-2 bg-gray-100 font-bold">Shared in Ministry</th>
                            <th className="border border-black p-2 bg-gray-100 font-bold">Bible Studies</th>
                            <th className="border border-black p-2 bg-gray-100 font-bold">Auxiliary Pioneer</th>
                            <th className="border border-black p-2 bg-gray-100 font-bold">
                              Hours<br />
                              (If pioneer or field missionary)
                            </th>
                            <th className="border border-black p-2 bg-gray-100 font-bold">Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {['September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August'].map((month) => {
                            const report = memberReport.reports.find((r: any) => {
                              const reportDate = new Date(r.month + '-01')
                              return reportDate.toLocaleDateString('en-US', { month: 'long' }) === month
                            })
                            return (
                              <tr key={month}>
                                <td className="border border-black p-2">{month}</td>
                                <td className="border border-black p-2 text-center">
                                  <input type="checkbox" checked={!!report} readOnly />
                                </td>
                                <td className="border border-black p-2 text-center">{report?.bibleStudies || ''}</td>
                                <td className="border border-black p-2 text-center">
                                  <input type="checkbox" checked={report?.auxiliaryPioneer || false} readOnly />
                                </td>
                                <td className="border border-black p-2 text-center">{report?.hours || ''}</td>
                                <td className="border border-black p-2">{report?.comments || ''}</td>
                              </tr>
                            )
                          })}
                          <tr className="font-bold">
                            <td className="border border-black p-2">Total</td>
                            <td className="border border-black p-2"></td>
                            <td className="border border-black p-2 text-center">{memberReport.totals.bibleStudies}</td>
                            <td className="border border-black p-2"></td>
                            <td className="border border-black p-2 text-center">{memberReport.totals.hours}</td>
                            <td className="border border-black p-2"></td>
                          </tr>
                        </tbody>
                      </table>
                      
                      <div className="mt-4 text-center print:hidden">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => exportIndividualPDF(memberReport)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Export PDF
                          </Button>
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => {
                              const printWindow = window.open('', '_blank')
                              if (printWindow) {
                                const s21Content = generateS21HTML(memberReport)
                                printWindow.document.write(`
                                  <html>
                                    <head>
                                      <title>S-21 Record - ${memberReport.member.fullName}</title>
                                      <style>
                                        @page { size: A4; margin: 20mm; }
                                        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                                        .s21-container { max-width: 100%; margin: 0 auto; }
                                        table { width: 100%; border-collapse: collapse; }
                                        th, td { border: 2px solid #000; padding: 8px; text-align: left; }
                                        th { background-color: #f5f5f5; font-weight: bold; }
                                        .header { text-align: center; margin-bottom: 20px; }
                                        .personal-info { margin-bottom: 20px; }
                                        .privileges { margin-bottom: 20px; }
                                        input[type="checkbox"] { width: 15px; height: 15px; }
                                      </style>
                                    </head>
                                    <body>
                                      ${s21Content}
                                      <script>
                                        window.onload = function() {
                                          setTimeout(function() {
                                            window.print();
                                          }, 500);
                                        }
                                      </script>
                                    </body>
                                  </html>
                                `)
                                printWindow.document.close()
                              }
                            }}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Print
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t text-sm text-muted-foreground">
                <p>Generated on {new Date(reportData.generatedAt).toLocaleString()}</p>
                <p>Generated by {reportData.generatedBy}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}