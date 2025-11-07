"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
    Plus, 
    PieChart, 
    TrendingUp, 
    TrendingDown, 
    Calendar,
    Target,
    AlertTriangle,
    CheckCircle,
    Trash2
} from "lucide-react"
import { createBudget, fetchFinancialSummary, fetchBudgets } from "@/lib/actions/financial.actions"
import { toast } from "sonner"

interface Budget {
    _id: string
    year: number
    month?: number
    categories: Array<{
        name: string
        budgeted: number
        spent: number
        remaining: number
        description?: string
    }>
    totalBudget: number
    totalSpent: number
    approvedBy: { fullName: string }
    status: 'draft' | 'approved' | 'active'
    createdAt: string
}

const defaultCategories = [
    { name: 'Utilities', description: 'Electricity, water, internet' },
    { name: 'Maintenance', description: 'Building repairs and upkeep' },
    { name: 'Supplies', description: 'Office and cleaning supplies' },
    { name: 'Literature', description: 'Publications and materials' },
    { name: 'Assembly Expenses', description: 'Circuit assembly costs' },
    { name: 'CO Visit', description: 'Circuit overseer expenses' },
    { name: 'Sound Equipment', description: 'Audio/visual equipment' },
    { name: 'Other', description: 'Miscellaneous expenses' }
]

export function BudgetManager() {
    const [budgets, setBudgets] = useState<Budget[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [formData, setFormData] = useState({
        year: new Date().getFullYear(),
        month: '0',
        categories: defaultCategories.map(cat => ({ ...cat, budgeted: 0 }))
    })
    const [financialData, setFinancialData] = useState<any>(null)

    useEffect(() => {
        loadData()
    }, [selectedYear])

    const loadData = async () => {
        try {
            const [summary, budgetData] = await Promise.all([
                fetchFinancialSummary(selectedYear),
                fetchBudgets(selectedYear)
            ])
            setFinancialData(summary)
            setBudgets(budgetData)
        } catch (error) {
            toast.error('Failed to load budget data')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const budgetData = {
                year: formData.year,
                month: formData.month !== '0' ? parseInt(formData.month) : undefined,
                categories: formData.categories.filter(cat => cat.budgeted > 0)
            }
            
            await createBudget(budgetData)
            toast.success('Budget created successfully')
            setIsCreateModalOpen(false)
            loadData()
        } catch (error) {
            toast.error('Failed to create budget')
        }
    }

    const updateCategoryBudget = (index: number, amount: string) => {
        const newCategories = [...formData.categories]
        newCategories[index].budgeted = parseFloat(amount) || 0
        setFormData({ ...formData, categories: newCategories })
    }

    const totalBudgeted = formData.categories.reduce((sum, cat) => sum + cat.budgeted, 0)

    const getProgressColor = (percentage: number) => {
        if (percentage > 100) return 'bg-red-500'
        if (percentage > 80) return 'bg-yellow-500'
        return 'bg-green-500'
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft':
                return <Badge variant="outline">Draft</Badge>
            case 'approved':
                return <Badge variant="secondary">Approved</Badge>
            case 'active':
                return <Badge variant="default">Active</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    if (loading) {
        return <div className="flex justify-center py-12">Loading budget data...</div>
    }

    const currentBudget = budgets.find(b => b.year === selectedYear)

    return (
        <div className="space-y-6">
            {/* Year Selection */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold">Budget Management</h2>
                    <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                        <SelectTrigger className="w-32">
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
                </div>
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create Budget
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create New Budget</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="year">Year</Label>
                                    <Select value={formData.year.toString()} onValueChange={(value) => setFormData({...formData, year: parseInt(value)})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: 5 }, (_, i) => {
                                                const year = new Date().getFullYear() + i
                                                return (
                                                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                                )
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="month">Month (Optional)</Label>
                                    <Select value={formData.month} onValueChange={(value) => setFormData({...formData, month: value})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">Annual Budget</SelectItem>
                                            {Array.from({ length: 12 }, (_, i) => {
                                                const month = i + 1
                                                const monthName = new Date(2024, i).toLocaleString('default', { month: 'long' })
                                                return (
                                                    <SelectItem key={month} value={month.toString()}>{monthName}</SelectItem>
                                                )
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="font-semibold mb-4">Budget Categories</h3>
                                <div className="space-y-4">
                                    {formData.categories.map((category, index) => (
                                        <div key={index} className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                                            <div>
                                                <Label className="font-medium">{category.name}</Label>
                                                <p className="text-sm text-muted-foreground">{category.description}</p>
                                            </div>
                                            <div>
                                                <Label htmlFor={`budget-${index}`}>Budget Amount (₵)</Label>
                                                <Input
                                                    id={`budget-${index}`}
                                                    type="number"
                                                    step="0.01"
                                                    value={category.budgeted || ''}
                                                    onChange={(e) => updateCategoryBudget(index, e.target.value)}
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 p-4 bg-muted rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">Total Budget:</span>
                                        <span className="text-xl font-bold">₵{totalBudgeted.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-2 pt-4">
                                <Button type="submit" className="flex-1">Create Budget</Button>
                                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Budget Overview */}
            {currentBudget ? (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <Target className="h-4 w-4 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Budget</p>
                                        <p className="font-semibold">₵{currentBudget.totalBudget.toLocaleString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <TrendingDown className="h-4 w-4 text-red-600" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Spent</p>
                                        <p className="font-semibold">₵{currentBudget.totalSpent.toLocaleString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Remaining</p>
                                        <p className="font-semibold">₵{(currentBudget.totalBudget - currentBudget.totalSpent).toLocaleString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <PieChart className="h-4 w-4 text-purple-600" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Usage</p>
                                        <p className="font-semibold">{((currentBudget.totalSpent / currentBudget.totalBudget) * 100).toFixed(1)}%</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Budget Details */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="flex items-center gap-2">
                                    <PieChart className="h-5 w-5" />
                                    Budget vs Actual ({selectedYear})
                                </CardTitle>
                                {getStatusBadge(currentBudget.status)}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {currentBudget.categories.map((category, index) => {
                                    const spentPercentage = category.budgeted > 0 ? (category.spent / category.budgeted * 100) : 0
                                    const isOverBudget = spentPercentage > 100
                                    const isNearLimit = spentPercentage > 80
                                    
                                    return (
                                        <div key={index} className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{category.name}</span>
                                                    {isOverBudget && <AlertTriangle className="h-4 w-4 text-red-500" />}
                                                    {!isOverBudget && isNearLimit && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold">
                                                        ₵{category.spent.toLocaleString()} / ₵{category.budgeted.toLocaleString()}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {spentPercentage.toFixed(1)}% used
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div 
                                                    className={`h-3 rounded-full transition-all ${getProgressColor(spentPercentage)}`}
                                                    style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-sm text-muted-foreground">
                                                <span>₵{category.remaining.toLocaleString()} remaining</span>
                                                <span className={isOverBudget ? 'text-red-600 font-medium' : ''}>
                                                    {isOverBudget ? `₵${(category.spent - category.budgeted).toLocaleString()} over budget` : ''}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <Card>
                    <CardContent className="text-center py-12">
                        <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No budget for {selectedYear}</h3>
                        <p className="text-muted-foreground mb-4">Create a budget to track expenses and plan spending</p>
                        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create {selectedYear} Budget
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}