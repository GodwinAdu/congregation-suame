import { currentUser } from '@/lib/helpers/session';
import { redirect } from 'next/navigation';
import { getExpenses, getPendingApprovals, getExpenseStats } from '@/lib/actions/expense.actions';
import ExpensesClient from './ExpensesClient';

export default async function ExpensesPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  const [expensesResult, pendingResult, statsResult] = await Promise.all([
    getExpenses(''),
    getPendingApprovals(user._id as string, ''),
    getExpenseStats('')
  ]);

  return (
    <ExpensesClient
      expenses={expensesResult.expenses || []}
      pendingApprovals={pendingResult.expenses || []}
      stats={statsResult.stats || { pending: 0, approved: 0, rejected: 0, paid: 0, monthlyTotal: 0 }}
      userId={user._id as string}
      congregationId={''}
    />
  );
}
