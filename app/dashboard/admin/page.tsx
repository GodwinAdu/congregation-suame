import { currentUser } from '@/lib/helpers/session';
import { redirect } from 'next/navigation';
import { getRolesStatus } from '@/lib/actions/update-roles.actions';
import UpdateRolesClient from './UpdateRolesClient';

export default async function UpdateRolesPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  const result = await getRolesStatus();

  return <UpdateRolesClient roles={result.roles || []} />;
}
