"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { fetchRegularPioneers } from "@/lib/actions/field-service-report.actions"
import { Users, Download, Search, Clock, CheckCircle2, AlertTriangle, XCircle } from "lucide-react"
import { format } from "date-fns"

interface Pioneer {
  id: string
  fullName: string
  phone: string
  group: string
  pioneerStartDate: string | null
  hours: number
  bibleStudents: number
  comments: string
  submitted: boolean
  metRequirement: boolean
  shortfall: number
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i)
const HOUR_REQUIREMENT = 50

export function RegularPioneersClient() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [data, setData] = useState<Pioneer[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [search, setSearch] = useState("")

  const monthStr = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`
  const monthLabel = `${MONTHS[selectedMonth - 1]} ${selectedYear}`

  const handleFetch = async () => {
    setLoading(true)
    try {
      const result = await fetchRegularPioneers(monthStr)
      setData(result)
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }

  const filtered = data.filter(p =>
    p.fullName.toLowerCase().includes(search.toLowerCase()) ||
    p.group.toLowerCase().includes(search.toLowerCase())
  )

  const metCount = filtered.filter(p => p.metRequirement).length
  const notSubmitted = filtered.filter(p => !p.submitted).length
  const totalHours = filtered.reduce((s, p) => s + p.hours, 0)

  const handleDownloadPDF = () => {
    const win = window.open("", "_blank")
    if (!win) return
    const rows = filtered.map((p, i) => `
      <tr style="background:${p.metRequirement ? '#f0fdf4' : !p.submitted ? '#fef2f2' : i % 2 === 0 ? '#fff' : '#f9fafb'}">
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-weight:600">${p.fullName}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${p.group}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:700;color:${p.metRequirement ? '#059669' : '#dc2626'}">${p.hours}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;color:${p.shortfall > 0 ? '#dc2626' : '#059669'}">${p.shortfall > 0 ? '-' + p.shortfall : '✓'}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center">${p.bibleStudents}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:600;color:${p.metRequirement ? '#059669' : !p.submitted ? '#dc2626' : '#d97706'}">${p.metRequirement ? 'Met' : !p.submitted ? 'Not Submitted' : 'Below Req.'}</td>
      </tr>`).join("")
    win.document.write(`<!DOCTYPE html><html><head><title>Regular Pioneers ${monthLabel}</title>
      <style>@page{size:A4 landscape;margin:15mm}body{font-family:'Segoe UI',Arial,sans-serif;color:#111}
      .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #059669}
      .header h1{margin:0 0 4px;font-size:22px;color:#14532d}
      .stats{display:flex;gap:16px;margin-bottom:20px}
      .stat{flex:1;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 16px;text-align:center}
      .stat-value{font-size:24px;font-weight:700;color:#059669}.stat-label{font-size:11px;color:#6b7280;margin-top:2px}
      table{width:100%;border-collapse:collapse;font-size:13px}thead tr{background:#14532d;color:#fff}
      thead th{padding:10px 12px;text-align:left;font-weight:600}
      .footer{margin-top:24px;padding-top:12px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;font-size:11px;color:#9ca3af}
      </style></head><body>
      <div class="header"><div><h1>Regular Pioneer Tracker — ${monthLabel}</h1><p>50-hour monthly requirement tracking</p></div>
      <div style="text-align:right"><div style="font-size:18px;font-weight:700;color:#059669">${filtered.length} Pioneers</div>
      <div style="font-size:11px;color:#9ca3af">Generated: ${format(new Date(), 'PPP')}</div></div></div>
      <div class="stats">
        <div class="stat"><div class="stat-value">${filtered.length}</div><div class="stat-label">Total Pioneers</div></div>
        <div class="stat"><div class="stat-value">${metCount}</div><div class="stat-label">Met Requirement</div></div>
        <div class="stat"><div class="stat-value">${filtered.length - metCount}</div><div class="stat-label">Below Requirement</div></div>
        <div class="stat"><div class="stat-value">${totalHours}</div><div class="stat-label">Total Hours</div></div>
      </div>
      <table><thead><tr><th>Name</th><th>Group</th><th style="text-align:center">Hours</th><th style="text-align:center">Shortfall</th><th style="text-align:center">Studies</th><th style="text-align:center">Status</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <div class="footer"><span>Regular Pioneer Tracker — ${monthLabel} (Req: ${HOUR_REQUIREMENT}hrs)</span><span>Confidential — For congregation use only</span></div>
      <script>window.onload=()=>setTimeout(()=>window.print(),500)</script></body></html>`)
    win.document.close()
  }

  return (
    <div className="space-y-4 max-w-5xl">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-600" />
            Select Month & Year
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Month</label>
              <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}
                className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Year</label>
              <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
                className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <Button onClick={handleFetch} disabled={loading} className="bg-green-600 hover:bg-green-700 h-9">
              {loading ? <span className="flex items-center gap-2"><div className="h-3 w-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />Loading...</span>
                : <span className="flex items-center gap-2"><Search className="h-4 w-4" />View Report</span>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {searched && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Users, label: "Total Pioneers", value: filtered.length, color: "green" },
              { icon: CheckCircle2, label: "Met 50hrs", value: metCount, color: "blue" },
              { icon: AlertTriangle, label: "Below Req.", value: filtered.length - metCount - notSubmitted, color: "orange" },
              { icon: XCircle, label: "Not Submitted", value: notSubmitted, color: "red" },
            ].map(({ icon: Icon, label, value, color }) => (
              <Card key={label} className={`bg-gradient-to-br from-${color}-50 to-${color}-100 border-${color}-200`}>
                <CardContent className="p-4 text-center">
                  <Icon className={`h-5 w-5 text-${color}-600 mx-auto mb-1`} />
                  <div className={`text-2xl font-bold text-${color}-700`}>{value}</div>
                  <div className={`text-xs text-${color}-600`}>{label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  Regular Pioneers
                  <Badge className="bg-green-100 text-green-700">{monthLabel}</Badge>
                  <Badge variant="outline" className="text-xs">Req: {HOUR_REQUIREMENT}hrs</Badge>
                </CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                      className="pl-8 pr-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 w-36" />
                  </div>
                  <Button onClick={handleDownloadPDF} disabled={filtered.length === 0} size="sm" className="bg-green-600 hover:bg-green-700 gap-1.5">
                    <Download className="h-3.5 w-3.5" />PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filtered.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium">No regular pioneers found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-y">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">#</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">Group</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Hours</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Progress</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground hidden md:table-cell">Studies</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((p, i) => (
                        <tr key={p.id} className={`border-b last:border-0 hover:bg-gray-50 ${p.metRequirement ? 'bg-green-50/30' : !p.submitted ? 'bg-red-50/30' : ''}`}>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{i + 1}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-xs ${p.metRequirement ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                {p.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{p.fullName}</p>
                                <p className="text-xs text-muted-foreground sm:hidden">{p.group}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{p.group}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`font-bold text-base ${p.metRequirement ? 'text-green-600' : 'text-red-600'}`}>{p.hours}</span>
                            <span className="text-xs text-muted-foreground">/{HOUR_REQUIREMENT}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="w-full bg-gray-100 rounded-full h-2 min-w-[60px]">
                              <div className={`h-2 rounded-full transition-all ${p.metRequirement ? 'bg-green-500' : 'bg-orange-400'}`}
                                style={{ width: `${Math.min((p.hours / HOUR_REQUIREMENT) * 100, 100)}%` }} />
                            </div>
                            {p.shortfall > 0 && <p className="text-[10px] text-red-500 mt-0.5 text-center">-{p.shortfall}hrs</p>}
                          </td>
                          <td className="px-4 py-3 text-center text-muted-foreground hidden md:table-cell">{p.bibleStudents}</td>
                          <td className="px-4 py-3 text-center">
                            {p.metRequirement
                              ? <Badge className="bg-green-100 text-green-700 gap-1"><CheckCircle2 className="h-3 w-3" />Met</Badge>
                              : !p.submitted
                              ? <Badge className="bg-red-100 text-red-700">Not Submitted</Badge>
                              : <Badge className="bg-orange-100 text-orange-700">Below Req.</Badge>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
