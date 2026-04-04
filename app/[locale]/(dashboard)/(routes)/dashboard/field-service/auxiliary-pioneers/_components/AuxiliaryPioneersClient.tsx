"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { fetchAuxiliaryPioneers } from "@/lib/actions/publisher.actions"
import {
  Users, Download, Search, Clock, BookOpen,
  FileText, ChevronDown, ChevronUp, Calendar,
} from "lucide-react"
import { format } from "date-fns"

interface Pioneer {
  id: string
  publisherId: string
  fullName: string
  email: string
  phone: string
  hours: number
  bibleStudents: number
  comments: string
  month: string
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i)

export function AuxiliaryPioneersClient() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [pioneers, setPioneers] = useState<Pioneer[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [search, setSearch] = useState("")
  const [sortField, setSortField] = useState<"fullName" | "hours" | "bibleStudents">("fullName")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const printRef = useRef<HTMLDivElement>(null)

  const monthStr = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`
  const monthLabel = `${MONTHS[selectedMonth - 1]} ${selectedYear}`

  const handleFetch = async () => {
    setLoading(true)
    try {
      const data = await fetchAuxiliaryPioneers(monthStr)
      setPioneers(data)
      setSearched(true)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  const filtered = pioneers
    .filter(p => p.fullName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1
      if (sortField === "fullName") return mul * a.fullName.localeCompare(b.fullName)
      return mul * (a[sortField] - b[sortField])
    })

  const totalHours = filtered.reduce((s, p) => s + p.hours, 0)
  const totalStudies = filtered.reduce((s, p) => s + p.bibleStudents, 0)

  const SortIcon = ({ field }: { field: typeof sortField }) =>
    sortField === field
      ? sortDir === "asc" ? <ChevronUp className="h-3 w-3 inline ml-1" /> : <ChevronDown className="h-3 w-3 inline ml-1" />
      : null

  const handleDownloadPDF = () => {
    const win = window.open("", "_blank")
    if (!win) return

    const rows = filtered.map((p, i) => `
      <tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'}">
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-weight:500">${i + 1}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-weight:600">${p.fullName}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#555">${p.phone || "—"}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:600;color:#2563eb">${p.hours}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:600;color:#7c3aed">${p.bibleStudents}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#555;font-size:12px">${p.comments || "—"}</td>
      </tr>
    `).join("")

    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Auxiliary Pioneers — ${monthLabel}</title>
        <style>
          @page { size: A4 landscape; margin: 15mm; }
          * { box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; color: #111; background: #fff; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 3px solid #2563eb; }
          .header-left h1 { margin: 0 0 4px; font-size: 22px; color: #1e3a8a; }
          .header-left p { margin: 0; font-size: 13px; color: #6b7280; }
          .header-right { text-align: right; }
          .header-right .month { font-size: 18px; font-weight: 700; color: #2563eb; }
          .header-right .generated { font-size: 11px; color: #9ca3af; margin-top: 4px; }
          .stats { display: flex; gap: 16px; margin-bottom: 20px; }
          .stat { flex: 1; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 12px 16px; text-align: center; }
          .stat.purple { background: #faf5ff; border-color: #d8b4fe; }
          .stat-value { font-size: 24px; font-weight: 700; color: #2563eb; }
          .stat.purple .stat-value { color: #7c3aed; }
          .stat-label { font-size: 11px; color: #6b7280; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          thead tr { background: #1e3a8a; color: #fff; }
          thead th { padding: 10px 12px; text-align: left; font-weight: 600; letter-spacing: 0.3px; }
          thead th.center { text-align: center; }
          tfoot tr { background: #1e3a8a; color: #fff; font-weight: 700; }
          tfoot td { padding: 10px 12px; }
          tfoot td.center { text-align: center; }
          .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-left">
            <h1>Auxiliary Pioneer Report</h1>
            <p>Congregation Field Service Records</p>
          </div>
          <div class="header-right">
            <div class="month">${monthLabel}</div>
            <div class="generated">Generated: ${format(new Date(), "PPP")}</div>
          </div>
        </div>

        <div class="stats">
          <div class="stat">
            <div class="stat-value">${filtered.length}</div>
            <div class="stat-label">Auxiliary Pioneers</div>
          </div>
          <div class="stat">
            <div class="stat-value">${totalHours}</div>
            <div class="stat-label">Total Hours</div>
          </div>
          <div class="stat purple">
            <div class="stat-value">${totalStudies}</div>
            <div class="stat-label">Bible Studies</div>
          </div>
          <div class="stat">
            <div class="stat-value">${filtered.length > 0 ? (totalHours / filtered.length).toFixed(1) : 0}</div>
            <div class="stat-label">Avg Hours / Pioneer</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Phone</th>
              <th class="center">Hours</th>
              <th class="center">Bible Studies</th>
              <th>Comments</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr>
              <td colspan="3">Total (${filtered.length} pioneers)</td>
              <td class="center">${totalHours}</td>
              <td class="center">${totalStudies}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>

        <div class="footer">
          <span>Auxiliary Pioneer Report — ${monthLabel}</span>
          <span>Confidential — For congregation use only</span>
        </div>

        <script>window.onload = () => setTimeout(() => window.print(), 500)</script>
      </body>
      </html>
    `)
    win.document.close()
  }

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Filter Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            Select Month & Year
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Month</label>
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(Number(e.target.value))}
                className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Year</label>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
                className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {YEARS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <Button onClick={handleFetch} disabled={loading} className="bg-blue-600 hover:bg-blue-700 h-9">
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="h-3 w-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Loading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  View Report
                </span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {searched && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4 text-center">
                <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-blue-700">{filtered.length}</div>
                <div className="text-xs text-blue-600">Pioneers</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4 text-center">
                <Clock className="h-5 w-5 text-green-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-green-700">{totalHours}</div>
                <div className="text-xs text-green-600">Total Hours</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4 text-center">
                <BookOpen className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-purple-700">{totalStudies}</div>
                <div className="text-xs text-purple-600">Bible Studies</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-4 text-center">
                <FileText className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-orange-700">
                  {filtered.length > 0 ? (totalHours / filtered.length).toFixed(1) : 0}
                </div>
                <div className="text-xs text-orange-600">Avg Hrs / Pioneer</div>
              </CardContent>
            </Card>
          </div>

          {/* Table Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-4 w-4 text-blue-600" />
                    Auxiliary Pioneers
                    <Badge className="bg-blue-100 text-blue-700 ml-1">{monthLabel}</Badge>
                  </CardTitle>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search name..."
                      className="pl-8 pr-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-40"
                    />
                  </div>
                  <Button
                    onClick={handleDownloadPDF}
                    disabled={filtered.length === 0}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filtered.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium text-gray-700">No auxiliary pioneers found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    No one served as auxiliary pioneer in {monthLabel}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-y">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground w-8">#</th>
                        <th
                          className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground cursor-pointer hover:text-gray-900 select-none"
                          onClick={() => handleSort("fullName")}
                        >
                          Name <SortIcon field="fullName" />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">
                          Phone
                        </th>
                        <th
                          className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground cursor-pointer hover:text-gray-900 select-none"
                          onClick={() => handleSort("hours")}
                        >
                          Hours <SortIcon field="hours" />
                        </th>
                        <th
                          className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground cursor-pointer hover:text-gray-900 select-none"
                          onClick={() => handleSort("bibleStudents")}
                        >
                          Studies <SortIcon field="bibleStudents" />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">
                          Comments
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((p, i) => (
                        <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-muted-foreground text-xs">{i + 1}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-700 font-semibold text-xs">
                                {p.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{p.fullName}</p>
                                <p className="text-xs text-muted-foreground sm:hidden">{p.phone || "—"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{p.phone || "—"}</td>
                          <td className="px-4 py-3 text-center">
                            <Badge className="bg-blue-100 text-blue-700 font-semibold">{p.hours}</Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge className="bg-purple-100 text-purple-700 font-semibold">{p.bibleStudents}</Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell max-w-[200px] truncate">
                            {p.comments || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 border-t-2 font-semibold">
                        <td className="px-4 py-3" colSpan={3}>
                          <span className="text-xs text-muted-foreground">Total ({filtered.length} pioneers)</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge className="bg-blue-600 text-white">{totalHours}</Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge className="bg-purple-600 text-white">{totalStudies}</Badge>
                        </td>
                        <td className="hidden md:table-cell" />
                      </tr>
                    </tfoot>
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
