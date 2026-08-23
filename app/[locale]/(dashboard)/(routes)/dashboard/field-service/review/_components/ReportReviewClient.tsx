"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import {
    CheckCircle2, AlertTriangle, XCircle, Search, Loader2,
    Clock, Users, FileCheck, Eye, Edit2, Check, X, RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import { fetchReportsForReview, bulkCheckReports, quickUpdateReport } from '@/lib/actions/field-service.actions'

interface SubmittedReport {
    _id: string
    memberId: string
    memberName: string
    phone: string
    group: string
    pioneerStatus: string
    hours: number
    bibleStudents: number
    auxiliaryPioneer: boolean
    check: boolean
    comments: string
    issues: string[]
    hasIssues: boolean
    submittedAt: string
}

interface NotSubmitted {
    memberId: string
    memberName: string
    phone: string
    group: string
    pioneerStatus: string
}

interface ReviewData {
    month: string
    summary: {
        totalMembers: number
        totalSubmitted: number
        notSubmittedCount: number
        checkedCount: number
        uncheckedCount: number
        withIssues: number
        zeroHours: number
        pioneerNoStudies: number
        auxLowHours: number
    }
    submitted: SubmittedReport[]
    notSubmitted: NotSubmitted[]
}

export function ReportReviewClient() {
    const [month, setMonth] = useState(() => {
        const now = new Date()
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    })
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<ReviewData | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState<'all' | 'unchecked' | 'issues' | 'checked'>('all')
    const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set())
    const [editingReport, setEditingReport] = useState<SubmittedReport | null>(null)
    const [editForm, setEditForm] = useState({ hours: 0, bibleStudents: 0, auxiliaryPioneer: false, comments: '', check: false })
    const [saving, setSaving] = useState(false)

    const loadData = async () => {
        setLoading(true)
        try {
            const result = await fetchReportsForReview(month)
            setData(result)
            setSelectedReports(new Set())
        } catch (error) {
            toast.error('Failed to load reports')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [month])

    const getFilteredReports = (): SubmittedReport[] => {
        if (!data) return []
        let reports = data.submitted

        // Filter by status
        if (filterStatus === 'unchecked') reports = reports.filter(r => !r.check)
        else if (filterStatus === 'issues') reports = reports.filter(r => r.hasIssues)
        else if (filterStatus === 'checked') reports = reports.filter(r => r.check)

        // Filter by search
        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            reports = reports.filter(r =>
                r.memberName.toLowerCase().includes(q) ||
                r.group.toLowerCase().includes(q) ||
                r.phone.includes(q)
            )
        }

        return reports
    }

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const filtered = getFilteredReports()
            setSelectedReports(new Set(filtered.map(r => r._id)))
        } else {
            setSelectedReports(new Set())
        }
    }

    const handleSelectReport = (id: string, checked: boolean) => {
        const newSet = new Set(selectedReports)
        if (checked) newSet.add(id)
        else newSet.delete(id)
        setSelectedReports(newSet)
    }

    const handleBulkCheck = async () => {
        if (selectedReports.size === 0) return
        setSaving(true)
        try {
            const result = await bulkCheckReports(Array.from(selectedReports))
            toast.success(`${result.modifiedCount} reports marked as checked`)
            await loadData()
        } catch (error) {
            toast.error('Failed to bulk check reports')
        } finally {
            setSaving(false)
        }
    }

    const handleEditOpen = (report: SubmittedReport) => {
        setEditingReport(report)
        setEditForm({
            hours: report.hours,
            bibleStudents: report.bibleStudents,
            auxiliaryPioneer: report.auxiliaryPioneer,
            comments: report.comments,
            check: report.check
        })
    }

    const handleEditSave = async () => {
        if (!editingReport) return
        setSaving(true)
        try {
            await quickUpdateReport(editingReport._id, editForm)
            toast.success(`Report for ${editingReport.memberName} updated`)
            setEditingReport(null)
            await loadData()
        } catch (error) {
            toast.error('Failed to update report')
        } finally {
            setSaving(false)
        }
    }

    const handleQuickCheck = async (reportId: string) => {
        try {
            await quickUpdateReport(reportId, { check: true })
            toast.success('Report marked as checked')
            await loadData()
        } catch (error) {
            toast.error('Failed to check report')
        }
    }

    const getIssueBadge = (issue: string) => {
        switch (issue) {
            case 'unchecked':
                return <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700 dark:text-yellow-400">Unchecked</Badge>
            case 'zero_hours':
                return <Badge variant="destructive" className="text-xs">0 Hours</Badge>
            case 'pioneer_no_studies':
                return <Badge variant="outline" className="text-xs border-orange-300 text-orange-700 dark:text-orange-400">No Studies (Pioneer)</Badge>
            case 'aux_low_hours':
                return <Badge variant="outline" className="text-xs border-red-300 text-red-700 dark:text-red-400">Low Hours (Aux)</Badge>
            default:
                return null
        }
    }

    const filteredReports = getFilteredReports()

    return (
        <div className="space-y-6">
            {/* Month Selector */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="month" className="whitespace-nowrap">Review Month:</Label>
                            <Input
                                id="month"
                                type="month"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                className="w-44"
                            />
                        </div>
                        <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
                            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span className="text-muted-foreground">Loading reports...</span>
                </div>
            )}

            {data && !loading && (
                <>
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                        <Card>
                            <CardContent className="pt-4 pb-3 px-4">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-blue-500" />
                                    <div>
                                        <p className="text-lg font-bold">{data.summary.totalSubmitted}/{data.summary.totalMembers}</p>
                                        <p className="text-xs text-muted-foreground">Submitted</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4 pb-3 px-4">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <div>
                                        <p className="text-lg font-bold">{data.summary.checkedCount}</p>
                                        <p className="text-xs text-muted-foreground">Checked</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4 pb-3 px-4">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-yellow-500" />
                                    <div>
                                        <p className="text-lg font-bold">{data.summary.uncheckedCount}</p>
                                        <p className="text-xs text-muted-foreground">Unchecked</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4 pb-3 px-4">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                                    <div>
                                        <p className="text-lg font-bold">{data.summary.withIssues}</p>
                                        <p className="text-xs text-muted-foreground">With Issues</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4 pb-3 px-4">
                                <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4 text-red-500" />
                                    <div>
                                        <p className="text-lg font-bold">{data.summary.notSubmittedCount}</p>
                                        <p className="text-xs text-muted-foreground">Not Submitted</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Issue Breakdown */}
                    {data.summary.withIssues > 0 && (
                        <Card className="border-yellow-200 dark:border-yellow-800/30 bg-yellow-50/50 dark:bg-yellow-900/10">
                            <CardContent className="pt-4 pb-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                    <span className="font-medium text-sm">Issues Detected</span>
                                </div>
                                <div className="flex flex-wrap gap-3 text-sm">
                                    {data.summary.zeroHours > 0 && (
                                        <span className="text-red-600 dark:text-red-400">
                                            {data.summary.zeroHours} with 0 hours
                                        </span>
                                    )}
                                    {data.summary.pioneerNoStudies > 0 && (
                                        <span className="text-orange-600 dark:text-orange-400">
                                            {data.summary.pioneerNoStudies} pioneers with no studies
                                        </span>
                                    )}
                                    {data.summary.auxLowHours > 0 && (
                                        <span className="text-red-600 dark:text-red-400">
                                            {data.summary.auxLowHours} auxiliary with low hours
                                        </span>
                                    )}
                                    {data.summary.uncheckedCount > 0 && (
                                        <span className="text-yellow-600 dark:text-yellow-400">
                                            {data.summary.uncheckedCount} unchecked reports
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Reports Tabs */}
                    <Tabs defaultValue="submitted">
                        <TabsList>
                            <TabsTrigger value="submitted" className="flex items-center gap-1.5">
                                <FileCheck className="h-3.5 w-3.5" />
                                Submitted ({data.summary.totalSubmitted})
                            </TabsTrigger>
                            <TabsTrigger value="missing" className="flex items-center gap-1.5">
                                <XCircle className="h-3.5 w-3.5" />
                                Not Submitted ({data.summary.notSubmittedCount})
                            </TabsTrigger>
                        </TabsList>

                        {/* Submitted Reports Tab */}
                        <TabsContent value="submitted" className="space-y-4 mt-4">
                            {/* Filters & Actions */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                                    <div className="relative w-full sm:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search by name or group..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                    <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
                                        <SelectTrigger className="w-full sm:w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Reports</SelectItem>
                                            <SelectItem value="unchecked">Unchecked</SelectItem>
                                            <SelectItem value="issues">With Issues</SelectItem>
                                            <SelectItem value="checked">Checked</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {selectedReports.size > 0 && (
                                    <Button
                                        onClick={handleBulkCheck}
                                        disabled={saving}
                                        size="sm"
                                        className="w-full sm:w-auto"
                                    >
                                        {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Check className="h-4 w-4 mr-1.5" />}
                                        Check Selected ({selectedReports.size})
                                    </Button>
                                )}
                            </div>

                            {/* Reports Table */}
                            <Card>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-10">
                                                        <Checkbox
                                                            checked={filteredReports.length > 0 && selectedReports.size === filteredReports.length}
                                                            onCheckedChange={handleSelectAll}
                                                        />
                                                    </TableHead>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead className="hidden sm:table-cell">Group</TableHead>
                                                    <TableHead className="text-center">Hours</TableHead>
                                                    <TableHead className="text-center">Studies</TableHead>
                                                    <TableHead className="text-center hidden md:table-cell">Aux</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead className="hidden lg:table-cell">Issues</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredReports.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                                            {searchQuery || filterStatus !== 'all'
                                                                ? 'No reports match your filters.'
                                                                : 'No reports submitted for this month.'}
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    filteredReports.map(report => (
                                                        <TableRow
                                                            key={report._id}
                                                            className={
                                                                report.check
                                                                    ? 'bg-green-50/50 dark:bg-green-900/5'
                                                                    : report.hasIssues
                                                                    ? 'bg-yellow-50/50 dark:bg-yellow-900/5'
                                                                    : ''
                                                            }
                                                        >
                                                            <TableCell>
                                                                <Checkbox
                                                                    checked={selectedReports.has(report._id)}
                                                                    onCheckedChange={(checked) => handleSelectReport(report._id, checked as boolean)}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <div>
                                                                    <span className="font-medium text-sm">{report.memberName}</span>
                                                                    {report.pioneerStatus !== 'none' && (
                                                                        <Badge variant="secondary" className="ml-2 text-xs capitalize">
                                                                            {report.pioneerStatus}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                                                                {report.group}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <span className={report.hours === 0 ? 'text-red-600 font-medium' : ''}>
                                                                    {report.hours}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                {report.bibleStudents}
                                                            </TableCell>
                                                            <TableCell className="text-center hidden md:table-cell">
                                                                {report.auxiliaryPioneer ? (
                                                                    <Badge variant="outline" className="text-xs">Yes</Badge>
                                                                ) : (
                                                                    <span className="text-muted-foreground text-xs">—</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                {report.check ? (
                                                                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs">
                                                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                                                        Checked
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant="outline" className="border-yellow-300 text-yellow-700 dark:text-yellow-400 text-xs">
                                                                        <Clock className="h-3 w-3 mr-1" />
                                                                        Pending
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="hidden lg:table-cell">
                                                                <div className="flex flex-wrap gap-1">
                                                                    {report.issues
                                                                        .filter(i => i !== 'unchecked')
                                                                        .map(issue => (
                                                                            <span key={issue}>{getIssueBadge(issue)}</span>
                                                                        ))}
                                                                    {report.issues.filter(i => i !== 'unchecked').length === 0 && !report.check && (
                                                                        <span className="text-xs text-muted-foreground">—</span>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    {!report.check && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-7 w-7 p-0 text-green-600 hover:text-green-700"
                                                                            onClick={() => handleQuickCheck(report._id)}
                                                                            title="Mark as checked"
                                                                        >
                                                                            <Check className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-7 w-7 p-0"
                                                                        onClick={() => handleEditOpen(report)}
                                                                        title="Edit report"
                                                                    >
                                                                        <Edit2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Not Submitted Tab */}
                        <TabsContent value="missing" className="space-y-4 mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <XCircle className="h-4 w-4 text-red-500" />
                                        Members Who Haven&apos;t Submitted
                                    </CardTitle>
                                    <CardDescription>
                                        {data.notSubmitted.length} members have not submitted their report for {month}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-10">#</TableHead>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Phone</TableHead>
                                                    <TableHead className="hidden sm:table-cell">Group</TableHead>
                                                    <TableHead className="hidden md:table-cell">Pioneer Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {data.notSubmitted.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                            All members have submitted their reports!
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    data.notSubmitted.map((member, index) => (
                                                        <TableRow key={member.memberId}>
                                                            <TableCell className="text-muted-foreground text-sm">{index + 1}</TableCell>
                                                            <TableCell className="font-medium text-sm">{member.memberName}</TableCell>
                                                            <TableCell className="text-sm">{member.phone || '—'}</TableCell>
                                                            <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{member.group}</TableCell>
                                                            <TableCell className="hidden md:table-cell">
                                                                {member.pioneerStatus !== 'none' ? (
                                                                    <Badge variant="secondary" className="text-xs capitalize">{member.pioneerStatus}</Badge>
                                                                ) : (
                                                                    <span className="text-xs text-muted-foreground">Publisher</span>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </>
            )}

            {/* Edit Dialog */}
            <Dialog open={!!editingReport} onOpenChange={() => setEditingReport(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Report — {editingReport?.memberName}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-hours">Hours</Label>
                                <Input
                                    id="edit-hours"
                                    type="number"
                                    min={0}
                                    value={editForm.hours}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, hours: Number(e.target.value) }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-studies">Bible Students</Label>
                                <Input
                                    id="edit-studies"
                                    type="number"
                                    min={0}
                                    value={editForm.bibleStudents}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, bibleStudents: Number(e.target.value) }))}
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="edit-comments">Comments</Label>
                            <Input
                                id="edit-comments"
                                value={editForm.comments}
                                onChange={(e) => setEditForm(prev => ({ ...prev, comments: e.target.value }))}
                                placeholder="Optional comments"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="edit-aux"
                                    checked={editForm.auxiliaryPioneer}
                                    onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, auxiliaryPioneer: checked as boolean }))}
                                />
                                <Label htmlFor="edit-aux" className="cursor-pointer text-sm">Auxiliary Pioneer</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="edit-check"
                                    checked={editForm.check}
                                    onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, check: checked as boolean }))}
                                />
                                <Label htmlFor="edit-check" className="cursor-pointer text-sm">Mark as Checked</Label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingReport(null)}>Cancel</Button>
                        <Button onClick={handleEditSave} disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Check className="h-4 w-4 mr-1.5" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
