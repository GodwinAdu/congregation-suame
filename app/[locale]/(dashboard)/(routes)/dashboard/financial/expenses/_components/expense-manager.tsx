"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
    Plus, 
    DollarSign, 
    Receipt, 
    CheckCircle, 
    XCircle, 
    Clock, 
    Eye,
    Trash2,
    Filter
} from "lucide-react"
import { createExpense, fetchExpenses, approveExpense, markExpensePaid, deleteExpense } from "@/lib/actions/financial.actions"
import { toast } from "sonner"
import { format } from "date-fns"

interface Expense {
    _id: string
    category: string
    description: string
    amount: number
    requestedBy: { fullName: string }
    approvedBy?: { fullName: string }
    paidTo: string
    receiptUrl?: string
    invoiceNumber?: string
    dueDate?: string
    status: 'pending' | 'approved' | 'paid' | 'rejected'
    paymentDate?: string
    notes?: string
    createdAt: string
}

const expenseCategories = [
    { value: 'utilities', label: 'Utilities' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'supplies', label: 'Supplies' },
    { value: 'literature', label: 'Literature' },
    { value: 'assembly-expenses', label: 'Assembly Expenses' },
    { value: 'co-visit', label: 'CO Visit' },
    { value: 'cleaning-supplies', label: 'Cleaning Supplies' },
    { value: 'sound-equipment', label: 'Sound Equipment' },
    { value: 'other', label: 'Other' }
]

export function ExpenseManager() {
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [filter, setFilter] = useState('all')
    const [formData, setFormData] = useState({
        category: '',
        description: '',
        amount: '',
        paidTo: '',
        receiptUrl: '',
        invoiceNumber: '',
        dueDate: '',
        notes: ''
    })

    useEffect(() => {
        loadExpenses()
    }, [])

    const loadExpenses = async () => {
        try {
            const data = await fetchExpenses()
            setExpenses(data)
        } catch (error) {
            toast.error('Failed to load expenses')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await createExpense({
                category: formData.category,
                description: formData.description,
                amount: parseFloat(formData.amount),
                paidTo: formData.paidTo,
                receiptUrl: formData.receiptUrl || undefined,
                invoiceNumber: formData.invoiceNumber || undefined,
                dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
                notes: formData.notes || undefined
            })
            toast.success('Expense created successfully')
            setIsAddModalOpen(false)
            setFormData({
                category: '',
                description: '',
                amount: '',
                paidTo: '',
                receiptUrl: '',
                invoiceNumber: '',
                dueDate: '',
                notes: ''
            })
            loadExpenses()
        } catch (error) {
            toast.error('Failed to create expense')
        }
    }

    const handleApprove = async (expenseId: string, approved: boolean) => {
        try {
            await approveExpense(expenseId, approved)
            toast.success(`Expense ${approved ? 'approved' : 'rejected'} successfully`)
            loadExpenses()
        } catch (error) {
            toast.error(`Failed to ${approved ? 'approve' : 'reject'} expense`)
        }
    }

    const handleMarkPaid = async (expenseId: string) => {
        try {
            await markExpensePaid(expenseId, new Date())
            toast.success('Expense marked as paid')
            loadExpenses()
        } catch (error) {
            toast.error('Failed to mark expense as paid')
        }
    }

    const handleDelete = async (expenseId: string) => {
        if (!confirm('Are you sure you want to delete this expense?')) return
        
        try {
            await deleteExpense(expenseId)
            toast.success('Expense deleted successfully')
            loadExpenses()
        } catch (error) {
            toast.error('Failed to delete expense')
        }
    }

    const filteredExpenses = expenses.filter(expense => {
        if (filter === 'all') return true
        return expense.status === filter
    })

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>
            case 'approved':
                return <Badge variant="secondary" className="gap-1"><CheckCircle className="h-3 w-3" />Approved</Badge>
            case 'paid':
                return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" />Paid</Badge>
            case 'rejected':
                return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const totalsByStatus = expenses.reduce((acc, expense) => {
        acc[expense.status] = (acc[expense.status] || 0) + expense.amount
        return acc
    }, {} as Record<string, number>)

    if (loading) {
        return <div className="flex justify-center py-12">Loading expenses...</div>
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-yellow-600" />
                            <div>
                                <p className="text-sm text-muted-foreground">Pending</p>
                                <p className="font-semibold">₵{(totalsByStatus.pending || 0).toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                            <div>
                                <p className="text-sm text-muted-foreground">Approved</p>
                                <p className="font-semibold">₵{(totalsByStatus.approved || 0).toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <div>
                                <p className="text-sm text-muted-foreground">Paid</p>
                                <p className="font-semibold">₵{(totalsByStatus.paid || 0).toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <div>
                                <p className="text-sm text-muted-foreground">Rejected</p>
                                <p className="font-semibold">₵{(totalsByStatus.rejected || 0).toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl sm:text-2xl font-bold">Expense Management</h2>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-full sm:w-32">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 w-full sm:w-auto">
                                <Plus className="h-4 w-4" />
                                Add Expense
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Create New Expense</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {expenseCategories.map(cat => (
                                                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        placeholder="Expense description"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="amount">Amount (₵)</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="paidTo">Paid To</Label>
                                    <Input
                                        id="paidTo"
                                        value={formData.paidTo}
                                        onChange={(e) => setFormData({...formData, paidTo: e.target.value})}
                                        placeholder="Vendor/Supplier name"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="invoiceNumber">Invoice Number</Label>
                                    <Input
                                        id="invoiceNumber"
                                        value={formData.invoiceNumber}
                                        onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
                                        placeholder="Optional"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="dueDate">Due Date</Label>
                                    <Input
                                        id="dueDate"
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                        placeholder="Additional notes"
                                        rows={3}
                                    />
                                </div>
                                <div className="flex gap-2 pt-4">
                                    <Button type="submit" className="flex-1">Create Expense</Button>
                                    <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Expenses List */}
            {filteredExpenses.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No expenses found</h3>
                        <p className="text-muted-foreground">
                            {filter === 'all' ? 'Start by adding your first expense' : `No ${filter} expenses found`}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredExpenses.map((expense) => (
                        <Card key={expense._id}>
                            <CardContent className="p-6">
                                <div className="flex flex-col sm:flex-row justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-semibold text-lg">{expense.description}</h3>
                                            {getStatusBadge(expense.status)}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                                            <p><span className="font-medium">Category:</span> {expense.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                                            <p><span className="font-medium">Amount:</span> ₵{expense.amount.toLocaleString()}</p>
                                            <p><span className="font-medium">Paid To:</span> {expense.paidTo}</p>
                                            <p><span className="font-medium">Requested By:</span> {expense.requestedBy.fullName}</p>
                                            {expense.invoiceNumber && (
                                                <p><span className="font-medium">Invoice:</span> {expense.invoiceNumber}</p>
                                            )}
                                            {expense.dueDate && (
                                                <p><span className="font-medium">Due Date:</span> {format(new Date(expense.dueDate), 'MMM dd, yyyy')}</p>
                                            )}
                                            {expense.approvedBy && (
                                                <p><span className="font-medium">Approved By:</span> {expense.approvedBy.fullName}</p>
                                            )}
                                            {expense.paymentDate && (
                                                <p><span className="font-medium">Paid On:</span> {format(new Date(expense.paymentDate), 'MMM dd, yyyy')}</p>
                                            )}
                                        </div>
                                        {expense.notes && (
                                            <p className="text-sm text-muted-foreground mt-2">
                                                <span className="font-medium">Notes:</span> {expense.notes}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {expense.status === 'pending' && (
                                            <>
                                                <Button size="sm" onClick={() => handleApprove(expense._id, true)} className="gap-1">
                                                    <CheckCircle className="h-3 w-3" />Approve
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleApprove(expense._id, false)} className="gap-1">
                                                    <XCircle className="h-3 w-3" />Reject
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => handleDelete(expense._id)} className="gap-1">
                                                    <Trash2 className="h-3 w-3" />Delete
                                                </Button>
                                            </>
                                        )}
                                        {expense.status === 'approved' && (
                                            <Button size="sm" onClick={() => handleMarkPaid(expense._id)} className="gap-1">
                                                <DollarSign className="h-3 w-3" />Mark Paid
                                            </Button>
                                        )}
                                        {expense.receiptUrl && (
                                            <Button size="sm" variant="outline" asChild className="gap-1">
                                                <a href={expense.receiptUrl} target="_blank" rel="noopener noreferrer">
                                                    <Eye className="h-3 w-3" />Receipt
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}