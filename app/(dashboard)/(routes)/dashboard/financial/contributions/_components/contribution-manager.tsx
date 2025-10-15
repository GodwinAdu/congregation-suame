"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Plus, TrendingUp, PieChart } from "lucide-react"
import { toast } from "sonner"
import { RecordContributionModal } from "./record-contribution-modal"

interface Contribution {
    _id: string
    memberId?: { _id: string; fullName: string }
    amount: number
    type: string
    method: string
    anonymous: boolean
    receiptNumber: string
    createdAt: string
    notes?: string
}

interface Summary {
    totalContributions: number
    totalExpenses: number
    balance: number
    contributionsByType: Record<string, number>
    expensesByCategory: Record<string, number>
    year: number
}

interface Member {
    _id: string
    fullName: string
}

interface ContributionManagerProps {
    contributions: Contribution[]
    summary: Summary
    members: Member[]
}

export function ContributionManager({ contributions: initialContributions, summary, members }: ContributionManagerProps) {
    const [contributions, setContributions] = useState<Contribution[]>(initialContributions)
    const [showRecordModal, setShowRecordModal] = useState(false)

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
    }

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            'worldwide-work': 'bg-blue-500',
            'local-congregation': 'bg-green-500',
            'kingdom-hall': 'bg-purple-500',
            'circuit-assembly': 'bg-orange-500',
            'other': 'bg-gray-500'
        }
        return colors[type] || 'bg-gray-500'
    }

    const getMethodBadge = (method: string) => {
        const variants: Record<string, any> = {
            'cash': 'default',
            'check': 'secondary',
            'online': 'outline',
            'bank-transfer': 'destructive'
        }
        return variants[method] || 'default'
    }

    return (
        <div className="space-y-6">
            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(summary.totalContributions)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            For {summary.year}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {formatCurrency(summary.totalExpenses)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            For {summary.year}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Balance</CardTitle>
                        <PieChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(summary.balance)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Current balance
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Contributions</CardTitle>
                        <Badge variant="outline">{contributions.length}</Badge>
                    </CardHeader>
                    <CardContent>
                        <Button 
                            onClick={() => setShowRecordModal(true)}
                            className="w-full gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Record Contribution
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Contributions by Type */}
            <Card>
                <CardHeader>
                    <CardTitle>Contributions by Type</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {Object.entries(summary.contributionsByType).map(([type, amount]) => (
                            <div key={type} className="text-center p-4 border rounded-lg">
                                <div className={`w-4 h-4 rounded-full ${getTypeColor(type)} mx-auto mb-2`} />
                                <p className="text-sm font-medium capitalize">
                                    {type.replace('-', ' ')}
                                </p>
                                <p className="text-lg font-bold">{formatCurrency(amount)}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Contributions */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Contributions</CardTitle>
                    <Button variant="outline" size="sm">
                        View All
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {contributions.slice(0, 10).map((contribution) => (
                            <div key={contribution._id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className={`w-3 h-3 rounded-full ${getTypeColor(contribution.type)}`} />
                                    <div>
                                        <p className="font-medium">
                                            {contribution.anonymous 
                                                ? "Anonymous" 
                                                : contribution.memberId?.fullName || "Unknown"
                                            }
                                        </p>
                                        <p className="text-sm text-muted-foreground capitalize">
                                            {contribution.type.replace('-', ' ')}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="text-right">
                                    <p className="font-bold text-green-600">
                                        {formatCurrency(contribution.amount)}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={getMethodBadge(contribution.method)} className="text-xs">
                                            {contribution.method}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(contribution.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {contributions.length === 0 && (
                            <div className="text-center py-8">
                                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No contributions recorded</h3>
                                <p className="text-muted-foreground mb-4">
                                    Start by recording your first contribution
                                </p>
                                <Button onClick={() => setShowRecordModal(true)} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Record Contribution
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <RecordContributionModal
                open={showRecordModal}
                onClose={() => setShowRecordModal(false)}
                members={members}
                onSuccess={(newContribution) => {
                    setContributions(prev => [newContribution, ...prev])
                    setShowRecordModal(false)
                }}
            />
        </div>
    )
}