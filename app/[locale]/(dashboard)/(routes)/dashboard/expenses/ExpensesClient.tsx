'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createExpense, approveExpense, rejectExpense, markExpensePaid } from '@/lib/actions/expense.actions';
import { DollarSign, Clock, CheckCircle, XCircle, Wallet } from 'lucide-react';
import { toast } from 'sonner';

export default function ExpensesClient({ expenses, pendingApprovals, stats, userId, congregationId }: any) {
  const [open, setOpen] = useState(false);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [comments, setComments] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const result = await createExpense({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      amount: parseFloat(formData.get('amount') as string),
      category: formData.get('category') as string,
      budgetCategory: formData.get('budgetCategory') as string,
      requestedBy: userId,
      congregationId,
      approvers: [
        { approverId: formData.get('approver1') as string, level: 1 },
        { approverId: formData.get('approver2') as string, level: 2 }
      ]
    });

    if (result.success) {
      toast.success('Expense request submitted');
      setOpen(false);
      window.location.reload();
    } else {
      toast.error(result.error);
    }
  };

  const handleApprove = async () => {
    const result = await approveExpense(selectedExpense._id, userId, comments);
    if (result.success) {
      toast.success('Expense approved');
      setApprovalOpen(false);
      window.location.reload();
    } else {
      toast.error(result.error);
    }
  };

  const handleReject = async () => {
    if (!comments) {
      toast.error('Comments required for rejection');
      return;
    }
    const result = await rejectExpense(selectedExpense._id, userId, comments);
    if (result.success) {
      toast.success('Expense rejected');
      setApprovalOpen(false);
      window.location.reload();
    } else {
      toast.error(result.error);
    }
  };

  const handleMarkPaid = async (expenseId: string) => {
    const result = await markExpensePaid(expenseId);
    if (result.success) {
      toast.success('Marked as paid');
      window.location.reload();
    } else {
      toast.error(result.error);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'paid': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Expense Management</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Submit Expense Request</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Expense Request</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input name="title" required />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea name="description" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount</Label>
                  <Input name="amount" type="number" step="0.01" required />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select name="category" required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="literature">Literature</SelectItem>
                      <SelectItem value="assembly">Assembly</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Budget Category (Optional)</Label>
                <Input name="budgetCategory" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Approver ID</Label>
                  <Input name="approver1" required />
                </div>
                <div>
                  <Label>Second Approver ID</Label>
                  <Input name="approver2" required />
                </div>
              </div>
              <Button type="submit" className="w-full">Submit Request</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <Wallet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paid}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.monthlyTotal.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Expenses</TabsTrigger>
          <TabsTrigger value="pending">Pending Approvals ({pendingApprovals.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {expenses.map((expense: any) => (
            <Card key={expense._id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{expense.title}</h3>
                      <Badge className={statusColor(expense.status)}>{expense.status}</Badge>
                      <Badge variant="outline">{expense.category}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{expense.description}</p>
                    <p className="text-sm">Requested by: {expense.requestedBy?.firstName} {expense.requestedBy?.lastName}</p>
                    <p className="text-sm">Date: {new Date(expense.requestDate).toLocaleDateString()}</p>
                    <div className="mt-2">
                      <p className="text-xs font-semibold mb-1">Approval Chain:</p>
                      {expense.approvals.map((approval: any, idx: number) => (
                        <div key={idx} className="text-xs flex items-center gap-2">
                          <span>Level {approval.level}: {approval.approverId?.firstName} {approval.approverId?.lastName}</span>
                          <Badge variant="outline" className={`text-xs ${
                            approval.status === 'approved' ? 'bg-green-100' :
                            approval.status === 'rejected' ? 'bg-red-100' : 'bg-gray-100'
                          }`}>
                            {approval.status}
                          </Badge>
                          {approval.comments && <span className="text-gray-500">- {approval.comments}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-2xl font-bold">${expense.amount.toFixed(2)}</p>
                    {expense.status === 'approved' && (
                      <Button size="sm" onClick={() => handleMarkPaid(expense._id)}>
                        Mark as Paid
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingApprovals.map((expense: any) => (
            <Card key={expense._id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{expense.title}</h3>
                    <p className="text-sm text-gray-600">{expense.description}</p>
                    <p className="text-sm">Requested by: {expense.requestedBy?.firstName} {expense.requestedBy?.lastName}</p>
                    <Badge variant="outline">{expense.category}</Badge>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-2xl font-bold">${expense.amount.toFixed(2)}</p>
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setSelectedExpense(expense);
                        setApprovalOpen(true);
                      }}
                    >
                      Review
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={approvalOpen} onOpenChange={setApprovalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Expense</DialogTitle>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{selectedExpense.title}</h3>
                <p className="text-sm text-gray-600">{selectedExpense.description}</p>
                <p className="text-2xl font-bold mt-2">${selectedExpense.amount.toFixed(2)}</p>
              </div>
              <div>
                <Label>Comments (Optional for approval, required for rejection)</Label>
                <Textarea 
                  value={comments} 
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Add your comments..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleApprove} className="flex-1 bg-green-600 hover:bg-green-700">
                  Approve
                </Button>
                <Button onClick={handleReject} variant="destructive" className="flex-1">
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
