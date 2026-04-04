"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { fetchPioneerApplications } from "@/lib/actions/field-service-report.actions"
import { Users, Download, Search, Star, Award, Zap } from "lucide-react"
import { format } from "date-fns"

interface Pioneer {
  id: string
  fullName: string
  phone: string
  group: string
  pioneerStatus: "auxiliary" | "regular" | "special"
  pioneerStartDate: string | null
}

const STATUS_CONFIG = {
  regular: { label: "Regular Pioneer", color: "green", icon: Star },
  auxiliary: { label: "Auxiliary Pioneer", color: "blue", icon: Zap },
  special: { label: "Special Pioneer", color: "purple", icon: Award },
}

export function PioneerApplicationsClient() {
  const [data, setData] = useState<Pioneer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "regular" | "auxiliary" | "special">("all")

  useEffect(() => {
    fetchPioneerApplications().then(setData).finally(() => setLoading(false))
  }, [])

  const filtered = data.filter(p => {
    const matchSearch = p.fullName.toLowerCase().includes(search.toLowerCase()) || p.group.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || p.pioneerStatus === statusFilter
    return matchSearch && matchStatus
  })

  const counts = {
    regular: data.filter(p => p.pioneerStatus === "regular").length,
    auxiliary: data.filter(p => p.pioneerStatus === "auxiliary").length,
    special: data.filter(p => p.pioneerStatus === "special").length,
  }

  const handleDownloadPDF = () => {
    const win = window.open("", "_blank")
    if (!win) return
    const rows = filtered.map((p, i) => {
      const cfg = STATUS_CONFIG[p.pioneerStatus]
      return `
      <tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'}">
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-weight:600">${p.fullName}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${p.group}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${p.phone || "—"}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-weight:600">${cfg.label}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${p.pioneerStartDate ? new Date(p.pioneerStartDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}</td>
      </tr>`
    }).join("")
    win.document.write(`<!DOCTYPE html><html><head><title>Pioneer List</title>
      <style>@page{size:A4 landscape;margin:15mm}body{font-family:'Segoe UI',Arial,sans-serif;color:#111}
      .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #7c3aed}
      .header h1{margin:0 0 4px;font-size:22px;color:#4c1d95}
      .stats{display:flex;gap:16px;margin-bottom:20px}
      .stat{flex:1;background:#faf5ff;border:1px solid #d8b4fe;border-radius:8px;padding:12px 16px;text-align:center}
      .stat-value{font-size:24px;font-weight:700;color:#7c3aed}.stat-label{font-size:11px;color:#6b7280;margin-top:2px}
      table{width:100%;border-collapse:collapse;font-size:13px}thead tr{background:#4c1d95;color:#fff}
      thead th{padding:10px 12px;text-align:left;font-weight:600}
      .footer{margin-top:24px;padding-top:12px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;font-size:11px;color:#9ca3af}
      </style></head><body>
      <div class="header"><div><h1>Pioneer List</h1><p>All congregation pioneers by status</p></div>
      <div style="text-align:right"><div style="font-size:18px;font-weight:700;color:#7c3aed">${filtered.length} Pioneers</div>
      <div style="font-size:11px;color:#9ca3af">Generated: ${format(new Date(), 'PPP')}</div></div></div>
      <div class="stats">
        <div class="stat"><div class="stat-value">${counts.regular}</div><div class="stat-label">Regular Pioneers</div></div>
        <div class="stat"><div class="stat-value">${counts.auxiliary}</div><div class="stat-label">Auxiliary Pioneers</div></div>
        <div class="stat"><div class="stat-value">${counts.special}</div><div class="stat-label">Special Pioneers</div></div>
      </div>
      <table><thead><tr><th>Name</th><th>Group</th><th>Phone</th><th>Status</th><th>Start Date</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <div class="footer"><span>Pioneer List</span><span>Confidential — For congregation use only</span></div>
      <script>window.onload=()=>setTimeout(()=>window.print(),500)</script></body></html>`)
    win.document.close()
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
    </div>
  )

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="grid grid-cols-3 gap-3">
        {(["regular", "auxiliary", "special"] as const).map(status => {
          const { label, color, icon: Icon } = STATUS_CONFIG[status]
          return (
            <Card key={status} className={`bg-gradient-to-br from-${color}-50 to-${color}-100 border-${color}-200 cursor-pointer transition-all ${statusFilter === status ? `ring-2 ring-${color}-400` : ''}`}
              onClick={() => setStatusFilter(s => s === status ? "all" : status)}>
              <CardContent className="p-4 text-center">
                <Icon className={`h-5 w-5 text-${color}-600 mx-auto mb-1`} />
                <div className={`text-2xl font-bold text-${color}-700`}>{counts[status]}</div>
                <div className={`text-xs text-${color}-600`}>{label}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              Pioneer List
              {statusFilter !== "all" && (
                <Badge className={`bg-${STATUS_CONFIG[statusFilter].color}-100 text-${STATUS_CONFIG[statusFilter].color}-700`}>
                  {STATUS_CONFIG[statusFilter].label}
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                  className="pl-8 pr-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 w-36" />
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
              <p className="font-medium">No pioneers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-y">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">Group</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">Phone</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground hidden sm:table-cell">Since</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => {
                    const { label, color, icon: Icon } = STATUS_CONFIG[p.pioneerStatus]
                    return (
                      <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground text-xs">{i + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full bg-${color}-100 flex items-center justify-center flex-shrink-0 text-${color}-700 font-semibold text-xs`}>
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
                          <Badge className={`bg-${color}-100 text-${color}-700 gap-1`}>
                            <Icon className="h-3 w-3" />{label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center text-muted-foreground text-xs hidden sm:table-cell">
                          {p.pioneerStartDate ? new Date(p.pioneerStartDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "—"}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
