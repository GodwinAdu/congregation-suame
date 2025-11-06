import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
    DollarSign, 
    TrendingUp, 
    TrendingDown, 
    PieChart, 
    Receipt, 
    CreditCard,
    Calendar,
    FileText,
    Plus,
    Eye
} from 'lucide-react'
import { fetchFinancialSummary } from '@/lib/actions/financial.actions'
import Link from 'next/link'
import { OpeningBalanceModal } from './_components/opening-balance-modal'
import { requirePermission } from '@/lib/helpers/server-permission-check'

const FinancialDashboard = async () => {
    await requirePermission('/dashboard/financial')
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    
    const [yearlyData, monthlyData] = await Promise.all([
        fetchFinancialSummary(currentYear),
        fetchFinancialSummary(currentYear, currentMonth)
    ])

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

    return (
        <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Financial Management</h1>
                    <p className="text-muted-foreground text-sm sm:text-base">
                        Congregation financial overview and management
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <Link href="/dashboard/financial/contributions" className="flex-1 sm:flex-none">
                        <Button className="w-full sm:w-auto text-xs sm:text-sm">
                            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Record </span>Contribution
                        </Button>
                    </Link>
                    <Link href="/dashboard/financial/expenses" className="flex-1 sm:flex-none">
                        <Button variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">
                            <Receipt className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Add </span>Expense
                        </Button>
                    </Link>
                    <Link href="/dashboard/financial/analytics" className="flex-1 sm:flex-none">
                        <Button variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">
                            <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            Analytics
                        </Button>
                    </Link>
                    <OpeningBalanceModal />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Balance</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">
                            ₵{monthlyData.balance.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {monthlyData.balance >= 0 ? '+' : ''}₵{(monthlyData.balance - (yearlyData.balance - monthlyData.balance)).toLocaleString()} from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Contributions</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold text-green-600">
                            ₵{monthlyData.totalContributions.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {monthlyData.contributions.length} contributions this month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold text-red-600">
                            ₵{monthlyData.totalExpenses.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            ₵{monthlyData.pendingExpenses.toLocaleString()} pending approval
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Yearly Balance</CardTitle>
                        <PieChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">
                            ₵{yearlyData.balance.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total for {currentYear}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                    <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
                    <TabsTrigger value="contributions" className="text-xs sm:text-sm">Contributions</TabsTrigger>
                    <TabsTrigger value="expenses" className="text-xs sm:text-sm">Expenses</TabsTrigger>
                    <TabsTrigger value="reports" className="text-xs sm:text-sm">Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Contribution Breakdown */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PieChart className="h-5 w-5" />
                                    Monthly Contributions by Type
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {contributionTypes.map(type => {
                                        const amount = monthlyData.contributionsByType[type.key] || 0
                                        const percentage = monthlyData.totalContributions > 0 
                                            ? (amount / monthlyData.totalContributions * 100).toFixed(1)
                                            : '0'
                                        
                                        return (
                                            <div key={type.key} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full ${type.color}`} />
                                                    <span className="text-sm">{type.label}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold">₵{amount.toLocaleString()}</div>
                                                    <div className="text-xs text-muted-foreground">{percentage}%</div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Expense Breakdown */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Receipt className="h-5 w-5" />
                                    Monthly Expenses by Category
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {expenseCategories.map(category => {
                                        const amount = monthlyData.expensesByCategory[category.key] || 0
                                        const percentage = monthlyData.totalExpenses > 0 
                                            ? (amount / monthlyData.totalExpenses * 100).toFixed(1)
                                            : '0'
                                        
                                        return (
                                            <div key={category.key} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full ${category.color}`} />
                                                    <span className="text-sm">{category.label}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold">₵{amount.toLocaleString()}</div>
                                                    <div className="text-xs text-muted-foreground">{percentage}%</div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Budget Overview */}
                    {monthlyData.budget && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Budget vs Actual ({currentYear})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {monthlyData.budget.categories.map((category: any, index: number) => {
                                        const spentPercentage = category.budgeted > 0 
                                            ? (category.spent / category.budgeted * 100)
                                            : 0
                                        
                                        return (
                                            <div key={index} className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium">{category.name}</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        ₵{category.spent.toLocaleString()} / ₵{category.budgeted.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className={`h-2 rounded-full ${
                                                            spentPercentage > 100 ? 'bg-red-500' : 
                                                            spentPercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                                                        }`}
                                                        style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>{spentPercentage.toFixed(1)}% used</span>
                                                    <span>₵{category.remaining.toLocaleString()} remaining</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="contributions">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Contributions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {monthlyData.contributions.map((contribution: any) => (
                                    <div key={contribution._id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <div className="font-semibold">₵{contribution.amount.toLocaleString()}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {contribution.type.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(contribution.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="outline">{contribution.method}</Badge>
                                            {contribution.anonymous && (
                                                <div className="text-xs text-muted-foreground mt-1">Anonymous</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div className="text-center pt-4">
                                    <Link href="/dashboard/financial/contributions">
                                        <Button variant="outline">
                                            <Eye className="h-4 w-4 mr-2" />
                                            View All Contributions
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="expenses">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Expenses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {monthlyData.expenses.map((expense: any) => (
                                    <div key={expense._id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <div className="font-semibold">{expense.description}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {expense.category.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Requested by {expense.requestedBy?.fullName}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold">₵{expense.amount.toLocaleString()}</div>
                                            <Badge 
                                                variant={
                                                    expense.status === 'paid' ? 'default' :
                                                    expense.status === 'approved' ? 'secondary' :
                                                    expense.status === 'rejected' ? 'destructive' : 'outline'
                                                }
                                            >
                                                {expense.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                                <div className="text-center pt-4">
                                    <Link href="/dashboard/financial/expenses">
                                        <Button variant="outline">
                                            <Eye className="h-4 w-4 mr-2" />
                                            View All Expenses
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="reports">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Monthly Reports</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <Button className="w-full" variant="outline">
                                        <FileText className="h-4 w-4 mr-2" />
                                        Generate Monthly Report
                                    </Button>
                                    <Button className="w-full" variant="outline">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        View Previous Reports
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Budget Management</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <Link href="/dashboard/financial/budget">
                                        <Button className="w-full" variant="outline">
                                            <PieChart className="h-4 w-4 mr-2" />
                                            Manage Budget
                                        </Button>
                                    </Link>
                                    <Button className="w-full" variant="outline">
                                        <TrendingUp className="h-4 w-4 mr-2" />
                                        Budget Analysis
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default FinancialDashboard