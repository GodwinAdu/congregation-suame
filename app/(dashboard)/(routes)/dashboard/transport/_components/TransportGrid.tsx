"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertCircle, Car, DollarSign, Users, CheckCircle, RotateCcw } from 'lucide-react'
import { fetchAllMembersTransport, getTransportConfig, resetAllTransportData } from '@/lib/actions/transport.actions'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DataTable } from '@/components/table/data-table'
import { createColumns, MemberTransport } from './column'
import { PaymentModal } from './PaymentModal'
import { SetAmountModal } from './SetAmountModal'
import { GlobalAmountModal } from './GlobalAmountModal'
import { toast } from 'sonner'

const TransportGrid = () => {
    const [membersData, setMembersData] = useState<MemberTransport[]>([])
    const [transportConfig, setTransportConfig] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [showGlobalAmountModal, setShowGlobalAmountModal] = useState(false)
    const [selectedMember, setSelectedMember] = useState<MemberTransport | null>(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const [data, config] = await Promise.all([
                fetchAllMembersTransport(),
                getTransportConfig()
            ])
            setMembersData(data)
            setTransportConfig(config)
        } catch (err) {
            setError('Failed to fetch transport data. Please try again.')
            console.error('Error fetching transport data:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleRefresh = () => {
        fetchData()
    }

    const handleAddPayment = (member: MemberTransport) => {
        setSelectedMember(member)
        setShowPaymentModal(true)
    }



    const handleCloseModals = () => {
        setShowPaymentModal(false)
        setShowGlobalAmountModal(false)
        setSelectedMember(null)
    }

    const handleSetGlobalAmount = () => {
        setShowGlobalAmountModal(true)
    }

    const handleReset = async () => {
        if (!confirm('Are you sure you want to reset all transport data? This will clear all payments, participation status, and card numbers. This action cannot be undone.')) {
            return
        }

        setLoading(true)
        try {
            await resetAllTransportData()
            toast.success('All transport data has been reset successfully')
            fetchData()
        } catch (error) {
            toast.error('Failed to reset transport data')
            console.error('Reset error:', error)
        } finally {
            setLoading(false)
        }
    }

    // Calculate statistics
    const totalMembers = membersData.length
    const participatingMembers = membersData.filter(m => m.transport.carStatus).length
    const fullyPaidMembers = membersData.filter(m => m.transport.carStatus && m.transport.payed).length
    const totalCollected = membersData.reduce((sum, m) => sum + (m.transport.amount || 0), 0)
    const expectedRevenue = transportConfig ? participatingMembers * transportConfig.transportAmount : 0

    const LoadingSkeleton = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-4">
                            <Skeleton className="h-8 w-16 mb-2" />
                            <Skeleton className="h-4 w-24" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            <div>
                                <div className="text-2xl font-bold text-blue-600">{totalMembers}</div>
                                <div className="text-sm text-muted-foreground">Total Members</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Car className="w-5 h-5 text-green-600" />
                            <div>
                                <div className="text-2xl font-bold text-green-600">{participatingMembers}</div>
                                <div className="text-sm text-muted-foreground">Participating</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-purple-600" />
                            <div>
                                <div className="text-2xl font-bold text-purple-600">{fullyPaidMembers}</div>
                                <div className="text-sm text-muted-foreground">Fully Paid</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <DollarSign className="w-5 h-5 text-orange-600" />
                            <div>
                                <div className="text-2xl font-bold text-orange-600">₵{totalCollected}</div>
                                <div className="text-sm text-muted-foreground">Collected / ₵{expectedRevenue}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Header */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-card-foreground">
                            <Car className="w-5 h-5 text-primary" />
                            Transport Management
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button
                                variant="default"
                                onClick={handleSetGlobalAmount}
                                disabled={loading || participatingMembers === 0}
                                className="shrink-0"
                            >
                                <DollarSign className="w-4 h-4 mr-2" />
                                Set Amount for All
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleReset}
                                disabled={loading || totalMembers === 0}
                                className="shrink-0"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reset All
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
                </CardHeader>
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
                        <CardTitle>Member Transport Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            searchKey='fullName'
                            columns={createColumns({
                                onAddPayment: handleAddPayment,
                                onRefresh: handleRefresh
                            })}
                            data={membersData}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Modals */}
            <PaymentModal
                open={showPaymentModal}
                onClose={handleCloseModals}
                member={selectedMember}
                onSuccess={handleRefresh}
            />

            <GlobalAmountModal
                open={showGlobalAmountModal}
                onClose={handleCloseModals}
                participatingCount={participatingMembers}
                onSuccess={handleRefresh}
            />
        </div>
    )
}

export default TransportGrid