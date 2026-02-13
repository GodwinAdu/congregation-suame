"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, RefreshCw, AlertCircle, Plus, MessageSquare } from 'lucide-react'
import { fetchMembersWithReportStatus, fetchAllGroups } from '@/lib/actions/field-service.actions'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import MonthSelection from '@/components/commons/MonthSelection'
import { AddReportModal } from './AddReportModal'
import { ReportDetailsModal } from './ReportDetailsModal'
import SMSModal from './SMSModal'
import { createColumns, MemberWithReportStatus } from './column'
import { DataTable } from '@/components/table/data-table'

const ReportGrid = () => {
    const [membersData, setMembersData] = useState<MemberWithReportStatus[]>([])
    const [selectedMonth, setSelectedMonth] = useState(new Date())
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showAddModal, setShowAddModal] = useState(false)
    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [selectedMember, setSelectedMember] = useState<MemberWithReportStatus | null>(null)
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
    const [groups, setGroups] = useState<Array<{ _id: string; name: string }>>([])
    const [groupsLoading, setGroupsLoading] = useState(true)
    const [editMode, setEditMode] = useState(false)
    const [showSMSModal, setShowSMSModal] = useState(false)
    const [smsRecipient, setSmsRecipient] = useState<{ phone: string; name: string; month: string; recipientId: string } | null>(null)
    const [smsRecipients, setSmsRecipients] = useState<Array<{ phone: string; name: string; month: string; recipientId: string }>>([])  
    const [smsMessage, setSmsMessage] = useState('')

    const fetchData = useCallback(async (monthDate: Date) => {
        setLoading(true)
        setError(null)
        
        try {
            const monthStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`
            const data = await fetchMembersWithReportStatus(monthStr)
            setMembersData(data)
        } catch (err) {
            setError('Failed to fetch members data. Please try again.')
            console.error('Error fetching members:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchGroups = useCallback(async () => {
        try {
            const data = await fetchAllGroups()
            setGroups(data)
        } catch (err) {
            console.error('Error fetching groups:', err)
        } finally {
            setGroupsLoading(false)
        }
    }, [])



    useEffect(() => {
        fetchData(selectedMonth)
        fetchGroups()
    }, [selectedMonth, fetchData, fetchGroups])

    const handleMonthChange = (date: Date) => {
        setSelectedMonth(date)
    }

    const handleRefresh = () => {
        fetchData(selectedMonth)
    }

    const handleRemindAll = () => {
        const nonReporters = membersData.filter(m => !m.hasReported && m.phone);
        if (nonReporters.length === 0) return;
        
        const monthName = selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const message = `Dear Brothers and Sisters, this is a friendly reminder to submit your field service report for ${monthName}. You can send your report directly to +233 551556650. Thank you for your faithful service!`;
        
        setSmsRecipients(nonReporters.map(m => ({ phone: m.phone, name: m.fullName, month: m.month, recipientId: m._id })));
        setSmsMessage(message);
        setSmsRecipient(null);
        setShowSMSModal(true);
    };

    const handleSendSMS = (member: MemberWithReportStatus) => {
        const monthName = new Date(member.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const message = `Dear ${member.fullName}, this is a friendly reminder to submit your field service report for ${monthName}. You can send your report directly to +233 551556650. Thank you for your faithful service!`;
        
        setSmsRecipient({ phone: member.phone, name: member.fullName, month: member.month, recipientId: member._id });
        setSmsRecipients([]);
        setSmsMessage(message);
        setShowSMSModal(true);
    };

    const handleAddReport = (member: MemberWithReportStatus) => {
        setSelectedMember(member)
        setShowAddModal(true)
    }

    const handleCloseModal = () => {
        setShowAddModal(false)
        setSelectedMember(null)
    }
     const handleEditReport = (reportId: string) => {
        const member = membersData.find(m => m.reportId === reportId)
        if (member) {
            setSelectedMember(member)
            setSelectedReportId(reportId)
            setEditMode(true)
            setShowAddModal(true)
        }
    }

    const handleViewReport = (reportId: string) => {
        setSelectedReportId(reportId)
        setShowDetailsModal(true)
    }

    const handleCloseDetailsModal = () => {
        setShowDetailsModal(false)
        setSelectedReportId(null)
    }

    const LoadingSkeleton = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-4">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Filter Controls */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                        <Calendar className="w-5 h-5 text-primary" />
                        Field Service Reports
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex gap-4 items-center">
                            <Label className="font-bold text-sm hidden lg:block">Select Month</Label>
                            <MonthSelection
                                selectedMonth={handleMonthChange}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRemindAll}
                                disabled={loading || membersData.filter(m => !m.hasReported && m.phone).length === 0}
                                className="shrink-0"
                            >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Remind All ({membersData.filter(m => !m.hasReported && m.phone).length})
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleRefresh}
                                disabled={loading}
                                className="shrink-0"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Error State */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Data Table */}
            {loading ? (
                <LoadingSkeleton />
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Field Service Reports - {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={createColumns({ 
                                onAddReport: handleAddReport,
                                onViewReport: handleViewReport,
                                onEditReport: handleEditReport,
                                onSendSMS: handleSendSMS
                            })}
                            data={membersData}
                            searchKey="fullName"
                            filterGroups={[
                                {
                                    id: "groupId",
                                    label: "Group",
                                    options: groups.map(group => ({
                                        _id: group._id,
                                        label: group.name
                                    }))
                                }
                            ]}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Add Report Modal */}
            <AddReportModal
                open={showAddModal}
                onClose={handleCloseModal}
                member={selectedMember}
                selectedMonth={selectedMonth.toISOString().slice(0, 7)}
                onSuccess={handleRefresh}
                editMode={editMode}
                reportId={selectedReportId}
            />

            <ReportDetailsModal
                open={showDetailsModal}
                onClose={handleCloseDetailsModal}
                reportId={selectedReportId}
            />

            <SMSModal
                open={showSMSModal}
                onClose={() => setShowSMSModal(false)}
                recipient={smsRecipient || undefined}
                recipients={smsRecipients.length > 0 ? smsRecipients : undefined}
                defaultMessage={smsMessage}
            />
        </div>
    )
}

export default ReportGrid