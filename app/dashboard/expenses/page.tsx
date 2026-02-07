import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getExpenses, getPendingApprovals, getExpenseStats } from '@/lib/actions/expense.actions';
import ExpensesClient from './ExpensesClient';

export default async function ExpensesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.congregationId) {
    redirect('/auth/signin');
  }

  const [expensesResult, pendingResult, statsResult] = await Promise.all([
    getExpenses(session.user.congregationId),
    getPendingApprovals(session.user.id, session.user.congregationId),
    getExpenseStats(session.user.congregationId)
  ]);

  return (
    <ExpensesClient
      expenses={expensesResult.expenses || []}
      pendingApprovals={pendingResult.expenses || []}
      stats={statsResult.stats || { pending: 0, approved: 0, rejected: 0, paid: 0, monthlyTotal: 0 }}
      userId={session.user.id}
      congregationId={session.user.congregationId}
    />
  );
}
