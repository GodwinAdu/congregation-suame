"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
    AlertCircle, RefreshCw, Printer, Users, BookOpen,
    FileWarning, ChevronDown, ChevronUp, Filter, Download
} from 'lucide-react'
import { fetchMembersNeedingHelp, fetchAllGroups } from '@/lib/actions/field-service.actions'
import MonthSelection from '@/components/commons/MonthSelection'
import { generateGroupPDF } from '@/lib/utils/generateGroupPDF'

export type MemberNeedingHelp = {
    _id: string
    fullName: string
    phone: string
    hasReported: boolean
    bibleStudents: number
    category: 'consistently-not-reporting' | 'no-bible-students' | 'irregular'
    helpReason: 'Consistently Not Reporting' | 'No Bible Students' | 'Irregular Reporter'
    reportedMonths: number
    missedMonths: number
    monthsWithStudents: number
    month: string
    privileges: Array<{ _id: string; name: string }>
    groupId?: { _id: string; name: string } | null
}

type CategoryGroup = {
    category: 'consistently-not-reporting' | 'no-bible-students' | 'irregular'
    label: string
    members: MemberNeedingHelp[]
    color: string
}

type GroupedMembers = {
    groupName: string
    groupId: string
    categories: CategoryGroup[]
    totalMembers: number
}

type FilterType = 'all' | 'not-reporting' | 'no-bible-students'

export default function FieldServiceHelpClient() {
    const [members, setMembers] = useState<MemberNeedingHelp[]>([])
    const [groups, setGroups] = useState<Array<{ _id: string; name: string }>>([])
    const [selectedMonth, setSelectedMonth] = useState(new Date())
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filter, setFilter] = useState<FilterType>('all')
    const [selectedGroup, setSelectedGroup] = useState<string>('all')
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
    const [exportingGroup, setExportingGroup] = useState<string | null>(null)

    const fetchData = useCallback(async (monthDate: Date) => {
        setLoading(true)
        setError(null)
        try {
            const monthStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`
            const data = await fetchMembersNeedingHelp(monthStr)
            setMembers(data)
            // Auto-expand all groups
            const groupIds = new Set<string>(data.map((m: MemberNeedingHelp) => m.groupId?._id || 'no-group'))
            setExpandedGroups(groupIds)
        } catch {
            setError('Failed to fetch data. Please try again.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData(selectedMonth)
        fetchAllGroups().then(setGroups).catch(console.error)
    }, [selectedMonth, fetchData])

    const filtered = members.filter(m => {
        const matchesFilter =
            filter === 'all' ||
            (filter === 'not-reporting' && m.category === 'consistently-not-reporting') ||
            (filter === 'no-bible-students' && m.category === 'no-bible-students')
        const matchesGroup =
            selectedGroup === 'all' || m.groupId?._id === selectedGroup
        return matchesFilter && matchesGroup
    })

    const grouped: GroupedMembers[] = (() => {
        const map = new Map<string, GroupedMembers>()
        filtered.forEach(m => {
            const key = m.groupId?._id || 'no-group'
            const name = m.groupId?.name || 'No Group Assigned'
            if (!map.has(key)) {
                map.set(key, {
                    groupName: name,
                    groupId: key,
                    categories: [],
                    totalMembers: 0
                })
            }
        })

        // Build categories for each group
        map.forEach((group, groupId) => {
            const groupMembers = filtered.filter(m => (m.groupId?._id || 'no-group') === groupId)
            group.totalMembers = groupMembers.length

            const categories: CategoryGroup[] = ([
                {
                    category: 'consistently-not-reporting' as const,
                    label: 'Consistently Not Reporting',
                    members: groupMembers.filter(m => m.category === 'consistently-not-reporting'),
                    color: 'red'
                },
                {
                    category: 'no-bible-students' as const,
                    label: 'No Bible Students',
                    members: groupMembers.filter(m => m.category === 'no-bible-students'),
                    color: 'amber'
                },
                {
                    category: 'irregular' as const,
                    label: 'Irregular Reporter',
                    members: groupMembers.filter(m => m.category === 'irregular'),
                    color: 'orange'
                }
            ] as CategoryGroup[]).filter(cat => cat.members.length > 0)

            group.categories = categories
        })

        return Array.from(map.values())
            .filter(g => g.totalMembers > 0)
            .sort((a, b) => a.groupName.localeCompare(b.groupName))
    })()

    const toggleGroup = (id: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    const handlePrint = () => {
        window.print()
    }

    const handleExportGroupPDF = async (group: GroupedMembers) => {
        setExportingGroup(group.groupId)
        try {
            generateGroupPDF(group, monthLabel)
        } finally {
            setExportingGroup(null)
        }
    }

    const monthLabel = selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    const consistentlyNotReportingCount = members.filter(m => m.category === 'consistently-not-reporting').length
    const noBibleStudentsCount = members.filter(m => m.category === 'no-bible-students').length
    const irregularCount = members.filter(m => m.category === 'irregular').length

    if (loading) return <LoadingSkeleton />

    return (
        <div className="space-y-6">
            {/* Controls */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileWarning className="w-5 h-5 text-orange-500" />
                        Publishers Needing Encouragement
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between flex-wrap">
                        <div className="flex flex-wrap gap-3 items-center">
                            <MonthSelection selectedMonth={(d) => setSelectedMonth(d)} />
                            <Select value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
                                <SelectTrigger className="w-[180px]">
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Issues</SelectItem>
                                    <SelectItem value="not-reporting">Not Reporting</SelectItem>
                                    <SelectItem value="no-bible-students">No Bible Students</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="All Groups" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Groups</SelectItem>
                                    {groups.map(g => (
                                        <SelectItem key={g._id} value={g._id}>{g.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => fetchData(selectedMonth)} disabled={loading}>
                                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <Button size="sm" onClick={handlePrint} disabled={filtered.length === 0}>
                                <Printer className="w-4 h-4 mr-2" />
                                Print Report
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-red-500">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                            <FileWarning className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-red-600">{consistentlyNotReportingCount}</div>
                            <div className="text-xs text-muted-foreground">Not Reporting</div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-amber-500">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <BookOpen className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-amber-600">{noBibleStudentsCount}</div>
                            <div className="text-xs text-muted-foreground">No Bible Students</div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                            <RefreshCw className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-orange-600">{irregularCount}</div>
                            <div className="text-xs text-muted-foreground">Irregular</div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-600">{grouped.length}</div>
                            <div className="text-xs text-muted-foreground">Groups Affected</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {filtered.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center text-muted-foreground">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No publishers needing help for {monthLabel}</p>
                        <p className="text-sm mt-1">Everyone is reporting and has bible students.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {grouped.map(group => (
                        <Card key={group.groupId} className="overflow-hidden">
                            <CardHeader
                                className="cursor-pointer py-3 px-4 hover:bg-muted/30 transition-colors"
                                onClick={() => toggleGroup(group.groupId)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Users className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">{group.groupName}</CardTitle>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {group.totalMembers} publisher{group.totalMembers !== 1 ? 's' : ''} need attention
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {group.categories.map(cat => (
                                            <Badge
                                                key={cat.category}
                                                className={`text-xs hidden sm:inline-flex ${
                                                    cat.color === 'red'
                                                        ? 'bg-red-100 text-red-700 border-red-200'
                                                        : cat.color === 'amber'
                                                        ? 'bg-amber-100 text-amber-700 border-amber-200'
                                                        : 'bg-orange-100 text-orange-700 border-orange-200'
                                                }`}
                                            >
                                                {cat.members.length} {cat.label.split(' ')[0].toLowerCase()}
                                            </Badge>
                                        ))}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 px-2 text-xs gap-1 shrink-0"
                                            disabled={exportingGroup === group.groupId}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleExportGroupPDF(group)
                                            }}
                                        >
                                            <Download className="w-3 h-3" />
                                            <span className="hidden sm:inline">Export PDF</span>
                                        </Button>
                                        {expandedGroups.has(group.groupId)
                                            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                            : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                        }
                                    </div>
                                </div>
                            </CardHeader>

                            {expandedGroups.has(group.groupId) && (
                                <CardContent className="p-0">
                                    <Separator />
                                    {group.categories.map((category, catIndex) => (
                                        <div key={category.category}>
                                            {/* Category Header */}
                                            <div className={`px-4 py-2 font-semibold text-sm ${
                                                category.color === 'red'
                                                    ? 'bg-red-50 text-red-800'
                                                    : category.color === 'amber'
                                                    ? 'bg-amber-50 text-amber-800'
                                                    : 'bg-orange-50 text-orange-800'
                                            }`}>
                                                {category.label} ({category.members.length})
                                            </div>
                                            {/* Members in this category */}
                                            <div className="divide-y">
                                                {category.members.map((member, i) => (
                                                    <div
                                                        key={member._id}
                                                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 ${i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                                                                {member.fullName.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-sm">{member.fullName}</p>
                                                                {member.phone && (
                                                                    <p className="text-xs text-muted-foreground">{member.phone}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 ml-11 sm:ml-0">
                                                            <span className="text-xs text-muted-foreground">
                                                                {member.reportedMonths}/6 months • {member.monthsWithStudents} with studies
                                                            </span>
                                                            {member.privileges.length > 0 && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    {member.privileges[0].name}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            {catIndex < group.categories.length - 1 && <Separator />}
                                        </div>
                                    ))}
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

function LoadingSkeleton() {
    return (
        <div className="space-y-6">
            <Card><CardContent className="p-6"><Skeleton className="h-10 w-full" /></CardContent></Card>
            <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <Card key={i}><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>)}
            </div>
            {[1, 2, 3].map(i => (
                <Card key={i}>
                    <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
                    <CardContent><Skeleton className="h-32 w-full" /></CardContent>
                </Card>
            ))}
        </div>
    )
}
