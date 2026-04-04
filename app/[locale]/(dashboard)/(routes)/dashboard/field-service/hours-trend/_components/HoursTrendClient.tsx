"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { fetchHoursTrend } from "@/lib/actions/field-service-report.actions"
import { TrendingUp, Clock, BookOpen, Users, Download, Search } from "lucide-react"
import { format } from "date-fns"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, LabelList, Cell,
} from "recharts"

interface MonthData {
  month: string
  label: string
  totalHours: number
  totalStudies: number
  publishers: number
  auxiliaryPioneers: number
}

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i)

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-800 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: p.fill }} />
          <span className="text-gray-600">{p.name}:</span>
          <span className="font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export function HoursTrendClient() {
  const [year, setYear] = useState(currentYear)
  const [data, setData] = useState<MonthData[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [view, setView] = useState<"grouped" | "hours" | "studies" | "publishers">("grouped")

  const handleFetch = async () => {
    setLoading(true)
    try {
      const result = await fetchHoursTrend(year)
      setData(result)
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }

  const totalHours = data.reduce((s, d) => s + d.totalHours, 0)
  const totalStudies = data.reduce((s, d) => s + d.totalStudies, 0)
  const activeMonths = data.filter(d => d.publishers > 0)
  const avgPublishers = activeMonths.length > 0 ? Math.round(activeMonths.reduce((s, d) => s + d.publishers, 0) / activeMonths.length) : 0
  const peakMonth = data.reduce((best, d) => d.totalHours > (best?.totalHours ?? 0) ? d : best, data[0])

  const handleDownloadPDF = () => {
    const win = window.open("", "_blank")
    if (!win) return
    const rows = data.map((d, i) => `
      <tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'}${d.month === peakMonth?.month ? ';border-left:4px solid #2563eb' : ''}">
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-weight:600">${d.label}${d.month === peakMonth?.month ? ' ⭐' : ''}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:700;color:#2563eb">${d.totalHours}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:700;color:#7c3aed">${d.totalStudies}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;color:#059669">${d.publishers}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;color:#d97706">${d.auxiliaryPioneers}</td>
      </tr>`).join("")
    win.document.write(`<!DOCTYPE html><html><head><title>Hours Trend ${year}</title>
      <style>@page{size:A4;margin:15mm}body{font-family:'Segoe UI',Arial,sans-serif;color:#111}
      .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #2563eb}
      .header h1{margin:0 0 4px;font-size:22px;color:#1e3a8a}.stats{display:flex;gap:16px;margin-bottom:20px}
      .stat{flex:1;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:12px 16px;text-align:center}
      .stat-value{font-size:24px;font-weight:700;color:#2563eb}.stat-label{font-size:11px;color:#6b7280;margin-top:2px}
      table{width:100%;border-collapse:collapse;font-size:13px}thead tr{background:#1e3a8a;color:#fff}
      thead th{padding:10px 12px;text-align:left;font-weight:600}
      tfoot tr{background:#1e3a8a;color:#fff;font-weight:700}tfoot td{padding:10px 12px}
      .footer{margin-top:24px;padding-top:12px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;font-size:11px;color:#9ca3af}
      </style></head><body>
      <div class="header"><div><h1>Hours Trend Report — ${year}</h1><p>Monthly congregation field service statistics</p></div>
      <div style="text-align:right"><div style="font-size:18px;font-weight:700;color:#2563eb">${year}</div>
      <div style="font-size:11px;color:#9ca3af">Generated: ${format(new Date(), 'PPP')}</div></div></div>
      <div class="stats">
        <div class="stat"><div class="stat-value">${totalHours}</div><div class="stat-label">Total Hours</div></div>
        <div class="stat"><div class="stat-value">${totalStudies}</div><div class="stat-label">Total Studies</div></div>
        <div class="stat"><div class="stat-value">${avgPublishers}</div><div class="stat-label">Avg Publishers/Month</div></div>
        <div class="stat"><div class="stat-value">${peakMonth?.label ?? '—'}</div><div class="stat-label">Peak Month</div></div>
      </div>
      <table><thead><tr><th>Month</th><th style="text-align:center">Hours</th><th style="text-align:center">Bible Studies</th><th style="text-align:center">Publishers</th><th style="text-align:center">Aux. Pioneers</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td>Total / Average</td><td style="text-align:center">${totalHours}</td><td style="text-align:center">${totalStudies}</td><td style="text-align:center">${avgPublishers} avg</td><td style="text-align:center">—</td></tr></tfoot>
      </table>
      <div class="footer"><span>Hours Trend — ${year}</span><span>Confidential — For congregation use only</span></div>
      <script>window.onload=()=>setTimeout(()=>window.print(),500)</script></body></html>`)
    win.document.close()
  }

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Year selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            Select Year
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 items-end">
            <div className="flex gap-2">
              {YEARS.map(y => (
                <button key={y} onClick={() => setYear(y)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                    year === y ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  {y}
                </button>
              ))}
            </div>
            <Button onClick={handleFetch} disabled={loading} className="bg-blue-600 hover:bg-blue-700 h-9">
              {loading
                ? <span className="flex items-center gap-2"><div className="h-3 w-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />Loading...</span>
                : <span className="flex items-center gap-2"><Search className="h-4 w-4" />View Trend</span>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {searched && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Clock,      label: "Total Hours",      value: totalHours,            color: "blue" },
              { icon: BookOpen,   label: "Total Studies",    value: totalStudies,          color: "purple" },
              { icon: Users,      label: "Avg Publishers",   value: avgPublishers,         color: "green" },
              { icon: TrendingUp, label: "Peak Month",       value: peakMonth?.label ?? "—", color: "orange" },
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

          {/* Chart card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  Monthly Trend — {year}
                </CardTitle>
                <div className="flex gap-2 flex-wrap">
                  {(["grouped", "hours", "studies", "publishers"] as const).map(v => (
                    <button key={v} onClick={() => setView(v)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors capitalize ${
                        view === v ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                      {v === "grouped" ? "Hours + Studies" : v === "hours" ? "Hours" : v === "studies" ? "Studies" : "Publishers"}
                    </button>
                  ))}
                  <Button onClick={handleDownloadPDF} size="sm" className="bg-green-600 hover:bg-green-700 gap-1.5">
                    <Download className="h-3.5 w-3.5" />PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                {view === "grouped" ? (
                  <BarChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }} barCategoryGap="25%" barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} width={35} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f3f4f6" }} />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                    <Bar dataKey="totalHours" name="Hours" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="totalHours" position="top" style={{ fontSize: 10, fill: "#374151", fontWeight: 600 }}
                        formatter={(v: number) => v > 0 ? v : ""} />
                    </Bar>
                    <Bar dataKey="totalStudies" name="Bible Studies" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="totalStudies" position="top" style={{ fontSize: 10, fill: "#374151", fontWeight: 600 }}
                        formatter={(v: number) => v > 0 ? v : ""} />
                    </Bar>
                  </BarChart>
                ) : view === "publishers" ? (
                  <BarChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} width={35} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f3f4f6" }} />
                    <Bar dataKey="publishers" name="Publishers" radius={[4, 4, 0, 0]}>
                      {data.map((d, i) => (
                        <Cell key={d.month} fill={d.month === peakMonth?.month ? "#16a34a" : "#22c55e"} />
                      ))}
                      <LabelList dataKey="publishers" position="top" style={{ fontSize: 10, fill: "#374151", fontWeight: 600 }}
                        formatter={(v: number) => v > 0 ? v : ""} />
                    </Bar>
                  </BarChart>
                ) : (
                  <BarChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} width={35} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f3f4f6" }} />
                    <Bar
                      dataKey={view === "hours" ? "totalHours" : "totalStudies"}
                      name={view === "hours" ? "Hours" : "Bible Studies"}
                      radius={[4, 4, 0, 0]}
                    >
                      {data.map((d) => (
                        <Cell
                          key={d.month}
                          fill={d.month === peakMonth?.month
                            ? (view === "hours" ? "#1d4ed8" : "#6d28d9")
                            : (view === "hours" ? "#3b82f6" : "#8b5cf6")}
                        />
                      ))}
                      <LabelList
                        dataKey={view === "hours" ? "totalHours" : "totalStudies"}
                        position="top"
                        style={{ fontSize: 10, fill: "#374151", fontWeight: 600 }}
                        formatter={(v: number) => v > 0 ? v : ""}
                      />
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>

              {/* Table */}
              <div className="overflow-x-auto mt-6 border-t pt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-y">
                      <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Month</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Hours</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Studies</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Publishers</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Aux. Pioneers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((d, i) => (
                      <tr key={d.month} className={`border-b last:border-0 ${
                        d.month === peakMonth?.month ? 'bg-blue-50' : i % 2 === 0 ? '' : 'bg-gray-50/50'
                      }`}>
                        <td className="px-3 py-2 font-medium">
                          <span className="flex items-center gap-1.5">
                            {d.label}
                            {d.month === peakMonth?.month && (
                              <Badge className="bg-blue-100 text-blue-700 text-[10px] px-1">Peak</Badge>
                            )}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center"><Badge className="bg-blue-100 text-blue-700">{d.totalHours}</Badge></td>
                        <td className="px-3 py-2 text-center"><Badge className="bg-purple-100 text-purple-700">{d.totalStudies}</Badge></td>
                        <td className="px-3 py-2 text-center text-muted-foreground">{d.publishers}</td>
                        <td className="px-3 py-2 text-center text-muted-foreground">{d.auxiliaryPioneers}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 border-t-2 font-semibold">
                      <td className="px-3 py-2 text-xs text-muted-foreground">Total / Avg</td>
                      <td className="px-3 py-2 text-center"><Badge className="bg-blue-600 text-white">{totalHours}</Badge></td>
                      <td className="px-3 py-2 text-center"><Badge className="bg-purple-600 text-white">{totalStudies}</Badge></td>
                      <td className="px-3 py-2 text-center text-muted-foreground">{avgPublishers} avg</td>
                      <td className="px-3 py-2 text-center text-muted-foreground">—</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

