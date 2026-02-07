import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getBudgetReport } from '@/lib/actions/expense.actions';
import BudgetClient from './BudgetClient';

export default async function BudgetPage({ searchParams }: { searchParams: { year?: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.congregationId) {
    redirect('/auth/signin');
  }

  const year = searchParams.year ? parseInt(searchParams.year) : new Date().getFullYear();
  const result = await getBudgetReport(session.user.congregationId, year);

  return <BudgetClient report={result.report || { byCategory: {}, total: 0, paid: 0, pending: 0 }} year={year} />;
}
