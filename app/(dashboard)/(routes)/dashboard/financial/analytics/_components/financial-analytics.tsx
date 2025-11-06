"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    PieChart,
    Calendar,
    FileText,
    Download,
    Presentation,
    BarChart3,
    Target,
    Copy,
    Check
} from "lucide-react"
import { fetchFinancialSummary, generateMonthlyReport } from "@/lib/actions/financial.actions"
import { toast } from "sonner"
import { format } from "date-fns"

interface MonthlyData {
    month: number
    year: number
    totalContributions: number
    totalExpenses: number
    balance: number
    contributionsByType: Record<string, number>
    expensesByCategory: Record<string, number>
}

const contributionTypes = [
    { key: 'worldwide-work', label: 'Worldwide Work', color: 'bg-blue-500' },
    { key: 'local-congregation-expenses', label: 'Local Expenses', color: 'bg-green-500' },
    { key: 'kingdom-hall-construction', label: 'Kingdom Hall', color: 'bg-purple-500' },
    { key: 'circuit-assembly-expenses', label: 'Circuit Assembly', color: 'bg-orange-500' },
    { key: 'co-visit-expenses', label: 'CO Visit', color: 'bg-red-500' },
    { key: 'other', label: 'Other', color: 'bg-gray-500' }
]

const expenseCategories = [
    { key: 'utilities', label: 'Utilities', color: 'bg-yellow-500' },
    { key: 'maintenance', label: 'Maintenance', color: 'bg-blue-500' },
    { key: 'supplies', label: 'Supplies', color: 'bg-green-500' },
    { key: 'literature', label: 'Literature', color: 'bg-purple-500' },
    { key: 'other', label: 'Other', color: 'bg-gray-500' }
]

export function FinancialAnalytics() {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
    const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null)
    const [yearlyData, setYearlyData] = useState<any>(null)
    const [monthlyTrends, setMonthlyTrends] = useState<MonthlyData[]>([])
    const [loading, setLoading] = useState(true)
    const [isReportModalOpen, setIsReportModalOpen] = useState(false)
    const [isPresentationModalOpen, setIsPresentationModalOpen] = useState(false)
    const [generatedReport, setGeneratedReport] = useState<any>(null)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        loadAnalytics()
    }, [selectedYear, selectedMonth])

    const loadAnalytics = async () => {
        try {
            setLoading(true)
            
            // Load current month and year data
            const [currentMonth, currentYear] = await Promise.all([
                fetchFinancialSummary(selectedYear, selectedMonth),
                fetchFinancialSummary(selectedYear)
            ])
            
            setMonthlyData({
                month: selectedMonth,
                year: selectedYear,
                totalContributions: currentMonth.totalContributions,
                totalExpenses: currentMonth.totalExpenses,
                balance: currentMonth.balance,
                contributionsByType: currentMonth.contributionsByType,
                expensesByCategory: currentMonth.expensesByCategory
            })
            setYearlyData(currentYear)
            
            // Load 12 months trend data
            const trends = []
            for (let i = 0; i < 12; i++) {
                let month = selectedMonth - i
                let year = selectedYear
                if (month <= 0) {
                    month += 12
                    year -= 1
                }
                
                try {
                    const data = await fetchFinancialSummary(year, month)
                    trends.unshift({
                        month,
                        year,
                        totalContributions: data.totalContributions,
                        totalExpenses: data.totalExpenses,
                        balance: data.balance,
                        contributionsByType: data.contributionsByType,
                        expensesByCategory: data.expensesByCategory
                    })
                } catch (error) {
                    // Skip months with no data
                }
            }
            setMonthlyTrends(trends)
            
        } catch (error) {
            toast.error('Failed to load analytics data')
        } finally {
            setLoading(false)
        }
    }

    const handleGenerateReport = async () => {
        try {
            const report = await generateMonthlyReport(selectedYear, selectedMonth)
            setGeneratedReport(report)
            setIsReportModalOpen(true)
            toast.success('Monthly report generated successfully')
        } catch (error) {
            toast.error('Failed to generate report')
        }
    }

    const handleCopyPresentation = async () => {
        const presentationText = generatePresentationText()
        try {
            await navigator.clipboard.writeText(presentationText)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
            toast.success('Presentation text copied to clipboard')
        } catch (error) {
            toast.error('Failed to copy to clipboard')
        }
    }

    const generatePresentationText = () => {
        const monthName = getMonthName(selectedMonth)
        const largestContribution = contributionTypes.find(t => 
            t.key === Object.keys(monthlyData?.contributionsByType || {}).reduce((a, b) => 
                (monthlyData?.contributionsByType[a] || 0) > (monthlyData?.contributionsByType[b] || 0) ? a : b, '')
        )?.label || 'N/A'
        
        const largestExpense = expenseCategories.find(c => 
            c.key === Object.keys(monthlyData?.expensesByCategory || {}).reduce((a, b) => 
                (monthlyData?.expensesByCategory[a] || 0) > (monthlyData?.expensesByCategory[b] || 0) ? a : b, '')
        )?.label || 'N/A'

        return `FINANCIAL REPORT - ${monthName.toUpperCase()} ${selectedYear}

Dear Brothers and Sisters,

I'm pleased to present our congregation's financial report for ${monthName} ${selectedYear}:

CONTRIBUTIONS RECEIVED:
• Total contributions: ₵${monthlyData?.totalContributions.toLocaleString() || 0}
• ${contributionGrowth >= 0 ? 'Increase' : 'Decrease'} of ${Math.abs(contributionGrowth).toFixed(1)}% from last month
• Largest category: ${largestContribution}

EXPENSES:
• Total expenses: ₵${monthlyData?.totalExpenses.toLocaleString() || 0}
• ${expenseGrowth >= 0 ? 'Increase' : 'Decrease'} of ${Math.abs(expenseGrowth).toFixed(1)}% from last month
• Largest category: ${largestExpense}

NET POSITION:
• Monthly balance: ₵${monthlyData?.balance.toLocaleString() || 0}
• Year-to-date balance: ₵${yearlyData?.balance.toLocaleString() || 0}

CONTRIBUTION BREAKDOWN:
${contributionTypes.map(type => {
    const amount = monthlyData?.contributionsByType[type.key] || 0
    const percentage = monthlyData?.totalContributions ? (amount / monthlyData.totalContributions * 100).toFixed(1) : '0'
    return `• ${type.label}: ₵${amount.toLocaleString()} (${percentage}%)`
}).join('\n')}

We thank Jehovah for your generous contributions and faithful support of the Kingdom work. Your contributions help us maintain our place of worship and support the worldwide preaching work.

May Jehovah continue to bless our congregation's efforts in His service.

[Account Overseer Name]
Account Overseer`
    }

    const downloadReport = () => {
        if (!generatedReport) return
        
        const reportData = {
            title: `Monthly Financial Report - ${getMonthName(selectedMonth)} ${selectedYear}`,
            generatedDate: new Date().toLocaleDateString(),
            period: `${getMonthName(selectedMonth)} ${selectedYear}`,
            summary: {
                openingBalance: generatedReport.openingBalance,
                totalContributions: generatedReport.totalContributions,
                totalExpenses: generatedReport.totalExpenses,
                closingBalance: generatedReport.closingBalance
            },
            contributionBreakdown: generatedReport.contributionBreakdown,
            expenseBreakdown: generatedReport.expenseBreakdown
        }
        
        const dataStr = JSON.stringify(reportData, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `financial-report-${selectedYear}-${selectedMonth.toString().padStart(2, '0')}.json`
        link.click()
        URL.revokeObjectURL(url)
    }

    const getMonthName = (month: number) => {
        return new Date(2024, month - 1).toLocaleString('default', { month: 'long' })
    }

    const calculateGrowth = (current: number, previous: number) => {
        if (previous === 0) return 0
        return ((current - previous) / previous) * 100
    }

    const previousMonthData = monthlyTrends.find(trend => 
        trend.month === (selectedMonth === 1 ? 12 : selectedMonth - 1) &&
        trend.year === (selectedMonth === 1 ? selectedYear - 1 : selectedYear)
    )

    const contributionGrowth = previousMonthData ? 
        calculateGrowth(monthlyData?.totalContributions || 0, previousMonthData.totalContributions) : 0
    
    const expenseGrowth = previousMonthData ? 
        calculateGrowth(monthlyData?.totalExpenses || 0, previousMonthData.totalExpenses) : 0

    if (loading) {
        return <div className="flex justify-center py-12">Loading analytics...</div>
    }

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                    <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                        <SelectTrigger className="w-full sm:w-32">
                            <Calendar className="h-4 w-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 5 }, (_, i) => {
                                const year = new Date().getFullYear() - 2 + i
                                return (
                                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                )
                            })}
                        </SelectContent>
                    </Select>
                    <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => {
                                const month = i + 1
                                return (
                                    <SelectItem key={month} value={month.toString()}>
                                        {getMonthName(month)}
                                    </SelectItem>
                                )
                            })}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={handleGenerateReport} className="gap-2 flex-1 sm:flex-none">
                                <FileText className="h-4 w-4" />
                                <span className="hidden sm:inline">Generate </span>Report
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Monthly Financial Report - {getMonthName(selectedMonth)} {selectedYear}</DialogTitle>
                            </DialogHeader>
                            {generatedReport && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="font-medium">Opening Balance:</p>
                                            <p>₵{generatedReport.openingBalance?.toLocaleString() || 0}</p>
                                        </div>
                                        <div>
                                            <p className="font-medium">Closing Balance:</p>
                                            <p>₵{generatedReport.closingBalance?.toLocaleString() || 0}</p>
                                        </div>
                                        <div>
                                            <p className="font-medium">Total Contributions:</p>
                                            <p className="text-green-600">₵{generatedReport.totalContributions?.toLocaleString() || 0}</p>
                                        </div>
                                        <div>
                                            <p className="font-medium">Total Expenses:</p>
                                            <p className="text-red-600">₵{generatedReport.totalExpenses?.toLocaleString() || 0}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-4">
                                        <Button onClick={downloadReport} className="gap-2">
                                            <Download className="h-4 w-4" />
                                            Download Report
                                        </Button>
                                        <Button variant="outline" onClick={() => setIsReportModalOpen(false)}>Close</Button>
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                    
                    <Dialog open={isPresentationModalOpen} onOpenChange={setIsPresentationModalOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2 flex-1 sm:flex-none">
                                <Presentation className="h-4 w-4" />
                                <span className="hidden sm:inline">Present to </span>Congregation
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Congregation Presentation - {getMonthName(selectedMonth)} {selectedYear}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="bg-muted p-4 rounded-lg">
                                    <pre className="whitespace-pre-wrap text-sm font-mono">{generatePresentationText()}</pre>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleCopyPresentation} className="gap-2">
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        {copied ? 'Copied!' : 'Copy Text'}
                                    </Button>
                                    <Button variant="outline" onClick={() => setIsPresentationModalOpen(false)}>Close</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Monthly Contributions</p>
                                <p className="text-2xl font-bold">₵{monthlyData?.totalContributions.toLocaleString() || 0}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    {contributionGrowth >= 0 ? (
                                        <TrendingUp className="h-3 w-3 text-green-600" />
                                    ) : (
                                        <TrendingDown className="h-3 w-3 text-red-600" />
                                    )}
                                    <span className={`text-xs ${contributionGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {Math.abs(contributionGrowth).toFixed(1)}% from last month
                                    </span>
                                </div>
                            </div>
                            <DollarSign className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Monthly Expenses</p>
                                <p className="text-2xl font-bold">₵{monthlyData?.totalExpenses.toLocaleString() || 0}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    {expenseGrowth >= 0 ? (
                                        <TrendingUp className="h-3 w-3 text-red-600" />
                                    ) : (
                                        <TrendingDown className="h-3 w-3 text-green-600" />
                                    )}
                                    <span className={`text-xs ${expenseGrowth >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {Math.abs(expenseGrowth).toFixed(1)}% from last month
                                    </span>
                                </div>
                            </div>
                            <TrendingDown className="h-8 w-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Net Balance</p>
                                <p className="text-2xl font-bold">₵{monthlyData?.balance.toLocaleString() || 0}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {monthlyData?.balance && monthlyData.balance >= 0 ? 'Surplus' : 'Deficit'}
                                </p>
                            </div>
                            <BarChart3 className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Year to Date</p>
                                <p className="text-2xl font-bold">₵{yearlyData?.balance.toLocaleString() || 0}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Total for {selectedYear}
                                </p>
                            </div>
                            <Target className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contributions Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChart className="h-5 w-5" />
                            Contributions by Type - {getMonthName(selectedMonth)} {selectedYear}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {contributionTypes.map(type => {
                                const amount = monthlyData?.contributionsByType[type.key] || 0
                                const percentage = monthlyData?.totalContributions ? 
                                    (amount / monthlyData.totalContributions * 100).toFixed(1) : '0'
                                
                                return (
                                    <div key={type.key} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-4 h-4 rounded-full ${type.color}`} />
                                            <span className="font-medium">{type.label}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold">₵{amount.toLocaleString()}</div>
                                            <div className="text-sm text-muted-foreground">{percentage}%</div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Expenses Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Expenses by Category - {getMonthName(selectedMonth)} {selectedYear}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {expenseCategories.map(category => {
                                const amount = monthlyData?.expensesByCategory[category.key] || 0
                                const percentage = monthlyData?.totalExpenses ? 
                                    (amount / monthlyData.totalExpenses * 100).toFixed(1) : '0'
                                
                                return (
                                    <div key={category.key} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-4 h-4 rounded-full ${category.color}`} />
                                            <span className="font-medium">{category.label}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold">₵{amount.toLocaleString()}</div>
                                            <div className="text-sm text-muted-foreground">{percentage}%</div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 12-Month Trend */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        12-Month Financial Trend
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {monthlyTrends.map((trend, index) => {
                            const monthName = getMonthName(trend.month)
                            const isCurrentMonth = trend.month === selectedMonth && trend.year === selectedYear
                            
                            return (
                                <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${isCurrentMonth ? 'bg-muted' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="text-sm font-medium w-20">
                                            {monthName} {trend.year}
                                        </div>
                                        {isCurrentMonth && <Badge variant="default">Current</Badge>}
                                    </div>
                                    <div className="flex items-center gap-6 text-sm">
                                        <div className="text-right">
                                            <div className="text-green-600 font-medium">+₵{trend.totalContributions.toLocaleString()}</div>
                                            <div className="text-xs text-muted-foreground">Contributions</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-red-600 font-medium">-₵{trend.totalExpenses.toLocaleString()}</div>
                                            <div className="text-xs text-muted-foreground">Expenses</div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`font-medium ${trend.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                ₵{trend.balance.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-muted-foreground">Net</div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Congregation Presentation Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Presentation className="h-5 w-5" />
                        Congregation Presentation Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 text-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold mb-2">Financial Highlights for {getMonthName(selectedMonth)} {selectedYear}:</h4>
                                <ul className="space-y-1 text-muted-foreground">
                                    <li>• Total contributions received: ₵{monthlyData?.totalContributions.toLocaleString()}</li>
                                    <li>• Total expenses: ₵{monthlyData?.totalExpenses.toLocaleString()}</li>
                                    <li>• Net balance for the month: ₵{monthlyData?.balance.toLocaleString()}</li>
                                    <li>• Year-to-date balance: ₵{yearlyData?.balance.toLocaleString()}</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Key Observations:</h4>
                                <ul className="space-y-1 text-muted-foreground">
                                    <li>• Contributions {contributionGrowth >= 0 ? 'increased' : 'decreased'} by {Math.abs(contributionGrowth).toFixed(1)}% from last month</li>
                                    <li>• Expenses {expenseGrowth >= 0 ? 'increased' : 'decreased'} by {Math.abs(expenseGrowth).toFixed(1)}% from last month</li>
                                    <li>• Largest contribution category: {contributionTypes.find(t => t.key === Object.keys(monthlyData?.contributionsByType || {}).reduce((a, b) => (monthlyData?.contributionsByType[a] || 0) > (monthlyData?.contributionsByType[b] || 0) ? a : b, ''))?.label}</li>
                                    <li>• Largest expense category: {expenseCategories.find(c => c.key === Object.keys(monthlyData?.expensesByCategory || {}).reduce((a, b) => (monthlyData?.expensesByCategory[a] || 0) > (monthlyData?.expensesByCategory[b] || 0) ? a : b, ''))?.label}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}