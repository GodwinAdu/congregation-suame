"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { fetchInactivePublishers } from "@/lib/actions/field-service-report.actions"
import { Users, Download, Search, AlertTriangle, Clock, ChevronDown, ChevronUp } from "lucide-react"
import { format } from "date-fns"

interface InactivePublisher {
  id: string
  fullName: string
  phone: string
  group: string
  lastReport: string | null
  monthsInactive: number | null
}

const MONTH_OPTIONS = [1, 2, 3, 4, 6, 12]

export function InactivePublishersClient() {
  const [months, setMonths] = useState(3)
  const [data, setData] = useState<InactivePublisher[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [search, setSearch] = useState("")
  const [sortField, setSortField] = useState<"fullName" | "group" | "lastReport">("lastReport")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  const handleFetch = async () => {
    setLoading(true)
    try {
      const result = await fetchInactivePublishers(months)
      setData(result)
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortField(field); setSortDir("asc") }
  }

  const filtered = data
    .filter(p => p.fullName.toLowerCase().includes(search.toLowerCase()) || p.group.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1
      if (sortField === "lastReport") {
        if (!a.lastReport) return -1 * mul
        if (!b.lastReport) return 1 * mul
        return mul * a.lastReport.localeCompare(b.lastReport)
      }
      return mul * (a[sortField] ?? "").localeCompare(b[sortField] ?? "")
    })

  const SortIcon = ({ field }: { field: typeof sortField }) =>
    sortField === field ? (sortDir === "asc" ? <ChevronUp className="h-3 w-3 inline ml-1" /> : <ChevronDown className="h-3 w-3 inline ml-1" />) : null

  const neverReported = filtered.filter(p => !p.lastReport).length
  const longInactive = filtered.filter(p => p.monthsInactive !== null && p.monthsInactive >= 6).length

  const handleDownloadPDF = () => {
    const win = window.open("", "_blank")
    if (!win) return
    const rows = filtered.map((p, i) => `
      <tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'}">
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${i + 1}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-weight:600">${p.fullName}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${p.group}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${p.phone || "—"}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;color:${!p.lastReport ? '#dc2626' : '#d97706'}">${p.lastReport ? new Date(p.lastReport + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Never'}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:600;color:#dc2626">${p.monthsInactive !== null ? p.monthsInactive + ' mo' : '—'}</td>
      </tr>`).join("")
    win.document.write(`<!DOCTYPE html><html><head><title>Inactive Publishers</title>
      <style>@page{size:A4 landscape;margin:15mm}body{font-family:'Segoe UI',Arial,sans-serif;color:#111}
      .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #dc2626}
      .header h1{margin:0 0 4px;font-size:22px;color:#7f1d1d}.header p{margin:0;font-size:13px;color:#6b7280}
      .stats{display:flex;gap:16px;margin-bottom:20px}.stat{flex:1;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px 16px;text-align:center}
      .stat-value{font-size:24px;font-weight:700;color:#dc2626}.stat-label{font-size:11px;color:#6b7280;margin-top:2px}
      table{width:100%;border-collapse:collapse;font-size:13px}thead tr{background:#7f1d1d;color:#fff}
      thead th{padding:10px 12px;text-align:left;font-weight:600}
      .footer{margin-top:24px;padding-top:12px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;font-size:11px;color:#9ca3af}
      </style></head><body>
      <div class="header"><div><h1>Inactive Publishers Report</h1><p>Publishers inactive for ${months}+ months</p></div>
      <div style="text-align:right"><div style="font-size:18px;font-weight:700;color:#dc2626">${filtered.length} Publishers</div>
      <div style="font-size:11px;color:#9ca3af">Generated: ${format(new Date(), 'PPP')}</div></div></div>
      <div class="stats">
        <div class="stat"><div class="stat-value">${filtered.length}</div><div class="stat-label">Total Inactive</div></div>
        <div class="stat"><div class="stat-value">${neverReported}</div><div class="stat-label">Never Reported</div></div>
        <div class="stat"><div class="stat-value">${longInactive}</div><div class="stat-label">6+ Months Inactive</div></div>
      </div>
      <table><thead><tr><th>#</th><th>Name</th><th>Group</th><th>Phone</th><th>Last Report</th><th>Months Inactive</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <div class="footer"><span>Inactive Publishers — ${months}+ months</span><span>Confidential — For congregation use only</span></div>
      <script>window.onload=()=>setTimeout(()=>window.print(),500)</script></body></html>`)
    win.document.close()
  }

  return (
    <div className="space-y-4 max-w-5xl">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            Filter by Inactivity Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 items-end">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Inactive for at least</label>
              <div className="flex gap-2">
                {MONTH_OPTIONS.map(m => (
                  <button key={m} onClick={() => setMonths(m)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${months === m ? 'bg-red-600 text-white border-red-600' : 'border-gray-200 hover:border-gray-300'}`}>
                    {m}mo
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handleFetch} disabled={loading} className="bg-red-600 hover:bg-red-700 h-9">
              {loading ? <span className="flex items-center gap-2"><div className="h-3 w-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />Loading...</span>
                : <span className="flex items-center gap-2"><Search className="h-4 w-4" />View Report</span>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {searched && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardContent className="p-4 text-center">
                <Users className="h-5 w-5 text-red-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-red-700">{filtered.length}</div>
                <div className="text-xs text-red-600">Total Inactive</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-4 text-center">
                <AlertTriangle className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-orange-700">{neverReported}</div>
                <div className="text-xs text-orange-600">Never Reported</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardContent className="p-4 text-center">
                <Clock className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-yellow-700">{longInactive}</div>
                <div className="text-xs text-yellow-600">6+ Months Inactive</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-red-600" />
                  Inactive Publishers
                  <Badge className="bg-red-100 text-red-700">{months}+ months</Badge>
                </CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                      className="pl-8 pr-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 w-36" />
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
                  <p className="font-medium">No inactive publishers found</p>
                  <p className="text-sm text-muted-foreground mt-1">All publishers have submitted reports within {months} months</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-y">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground w-8">#</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground cursor-pointer hover:text-gray-900 select-none" onClick={() => handleSort("fullName")}>
                          Name <SortIcon field="fullName" />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground cursor-pointer hover:text-gray-900 select-none hidden sm:table-cell" onClick={() => handleSort("group")}>
                          Group <SortIcon field="group" />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">Phone</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground cursor-pointer hover:text-gray-900 select-none" onClick={() => handleSort("lastReport")}>
                          Last Report <SortIcon field="lastReport" />
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Inactive</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((p, i) => (
                        <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-muted-foreground text-xs">{i + 1}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-red-700 font-semibold text-xs">
                                {p.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{p.fullName}</p>
                                <p className="text-xs text-muted-foreground sm:hidden">{p.group}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{p.group}</td>
                          <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{p.phone || "—"}</td>
                          <td className="px-4 py-3 text-center">
                            {p.lastReport
                              ? <Badge variant="outline" className="text-orange-600 border-orange-300">
                                  {new Date(p.lastReport + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </Badge>
                              : <Badge className="bg-red-100 text-red-700">Never</Badge>}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {p.monthsInactive !== null
                              ? <Badge className={`${p.monthsInactive >= 6 ? 'bg-red-600' : 'bg-orange-500'} text-white`}>{p.monthsInactive}mo</Badge>
                              : <Badge className="bg-gray-600 text-white">—</Badge>}
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
