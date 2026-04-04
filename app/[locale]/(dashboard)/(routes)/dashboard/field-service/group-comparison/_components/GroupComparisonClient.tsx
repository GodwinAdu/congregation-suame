"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { fetchGroupComparison } from "@/lib/actions/field-service-report.actions"
import { Users, Download, Search, Clock, BookOpen, TrendingUp, Award } from "lucide-react"
import { format } from "date-fns"

interface GroupStat {
  id: string
  name: string
  totalMembers: number
  reportCount: number
  totalHours: number
  totalStudies: number
  auxiliaryPioneers: number
  participationRate: number
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i)

export function GroupComparisonClient() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [data, setData] = useState<GroupStat[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const monthStr = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`
  const monthLabel = `${MONTHS[selectedMonth - 1]} ${selectedYear}`

  const handleFetch = async () => {
    setLoading(true)
    try {
      const result = await fetchGroupComparison(monthStr)
      setData(result)
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }

  const maxHours = Math.max(...data.map(g => g.totalHours), 1)
  const topGroup = data[0]

  const handleDownloadPDF = () => {
    const win = window.open("", "_blank")
    if (!win) return
    const rows = data.map((g, i) => `
      <tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'}${i === 0 ? ';border-left:4px solid #2563eb' : ''}">
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-weight:600">${g.name}${i === 0 ? ' 🏆' : ''}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center">${g.totalMembers}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center">${g.reportCount}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:700;color:#2563eb">${g.totalHours}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:700;color:#7c3aed">${g.totalStudies}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center">${g.auxiliaryPioneers}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:600;color:${g.participationRate >= 80 ? '#059669' : g.participationRate >= 50 ? '#d97706' : '#dc2626'}">${g.participationRate}%</td>
      </tr>`).join("")
    win.document.write(`<!DOCTYPE html><html><head><title>Group Comparison ${monthLabel}</title>
      <style>@page{size:A4 landscape;margin:15mm}body{font-family:'Segoe UI',Arial,sans-serif;color:#111}
      .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #2563eb}
      .header h1{margin:0 0 4px;font-size:22px;color:#1e3a8a}
      table{width:100%;border-collapse:collapse;font-size:13px}thead tr{background:#1e3a8a;color:#fff}
      thead th{padding:10px 12px;text-align:left;font-weight:600}
      .footer{margin-top:24px;padding-top:12px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;font-size:11px;color:#9ca3af}
      </style></head><body>
      <div class="header"><div><h1>Group Comparison — ${monthLabel}</h1><p>Field service statistics by congregation group</p></div>
      <div style="text-align:right"><div style="font-size:18px;font-weight:700;color:#2563eb">${data.length} Groups</div>
      <div style="font-size:11px;color:#9ca3af">Generated: ${format(new Date(), 'PPP')}</div></div></div>
      <table><thead><tr><th>Group</th><th style="text-align:center">Members</th><th style="text-align:center">Reports</th><th style="text-align:center">Hours</th><th style="text-align:center">Studies</th><th style="text-align:center">Aux. Pioneers</th><th style="text-align:center">Participation</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <div class="footer"><span>Group Comparison — ${monthLabel}</span><span>Confidential — For congregation use only</span></div>
      <script>window.onload=()=>setTimeout(()=>window.print(),500)</script></body></html>`)
    win.document.close()
  }

  return (
    <div className="space-y-4 max-w-5xl">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            Select Month & Year
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Month</label>
              <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}
                className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Year</label>
              <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
                className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <Button onClick={handleFetch} disabled={loading} className="bg-blue-600 hover:bg-blue-700 h-9">
              {loading ? <span className="flex items-center gap-2"><div className="h-3 w-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />Loading...</span>
                : <span className="flex items-center gap-2"><Search className="h-4 w-4" />Compare Groups</span>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {searched && (
        <>
          {/* Group Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.map((g, i) => (
              <Card key={g.id} className={`relative overflow-hidden ${i === 0 ? 'ring-2 ring-blue-400' : ''}`}>
                {i === 0 && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-yellow-100 text-yellow-700 gap-1"><Award className="h-3 w-3" />Top</Badge>
                  </div>
                )}
                <CardContent className="p-4">
                  <h3 className="font-semibold text-base mb-3">{g.name}</h3>
                  {/* Hours bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Hours</span><span className="font-semibold text-blue-700">{g.totalHours}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(g.totalHours / maxHours) * 100}%` }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-purple-50 rounded p-2">
                      <div className="font-bold text-purple-700">{g.totalStudies}</div>
                      <div className="text-muted-foreground">Studies</div>
                    </div>
                    <div className="bg-green-50 rounded p-2">
                      <div className="font-bold text-green-700">{g.reportCount}/{g.totalMembers}</div>
                      <div className="text-muted-foreground">Reports</div>
                    </div>
                    <div className={`rounded p-2 ${g.participationRate >= 80 ? 'bg-green-50' : g.participationRate >= 50 ? 'bg-yellow-50' : 'bg-red-50'}`}>
                      <div className={`font-bold ${g.participationRate >= 80 ? 'text-green-700' : g.participationRate >= 50 ? 'text-yellow-700' : 'text-red-700'}`}>{g.participationRate}%</div>
                      <div className="text-muted-foreground">Part.</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Table */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  Detailed Comparison
                  <Badge className="bg-blue-100 text-blue-700">{monthLabel}</Badge>
                </CardTitle>
                <Button onClick={handleDownloadPDF} disabled={data.length === 0} size="sm" className="bg-green-600 hover:bg-green-700 gap-1.5">
                  <Download className="h-3.5 w-3.5" />PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-y">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Group</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Members</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Reports</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Hours</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Studies</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground hidden sm:table-cell">Aux. Pioneers</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Participation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((g, i) => (
                      <tr key={g.id} className={`border-b last:border-0 hover:bg-gray-50 ${i === 0 ? 'bg-blue-50/50' : ''}`}>
                        <td className="px-4 py-3 font-medium flex items-center gap-2">
                          {i === 0 && <Award className="h-3.5 w-3.5 text-yellow-500" />}
                          {g.name}
                        </td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{g.totalMembers}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{g.reportCount}</td>
                        <td className="px-4 py-3 text-center"><Badge className="bg-blue-100 text-blue-700 font-semibold">{g.totalHours}</Badge></td>
                        <td className="px-4 py-3 text-center"><Badge className="bg-purple-100 text-purple-700 font-semibold">{g.totalStudies}</Badge></td>
                        <td className="px-4 py-3 text-center text-muted-foreground hidden sm:table-cell">{g.auxiliaryPioneers}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge className={`${g.participationRate >= 80 ? 'bg-green-100 text-green-700' : g.participationRate >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            {g.participationRate}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
