import { currentUser } from '@/lib/helpers/session';
import { redirect } from 'next/navigation';
import { getBudgetReport } from '@/lib/actions/expense.actions';
import BudgetClient from './BudgetClient';

export default async function BudgetPage({ searchParams }: { searchParams: { year?: string } }) {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  const year = searchParams.year ? parseInt(searchParams.year) : new Date().getFullYear();
  const result = await getBudgetReport('', year);

  return <BudgetClient report={result.report || { byCategory: {}, total: 0, paid: 0, pending: 0 }} year={year} />;
}
