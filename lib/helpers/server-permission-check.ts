import { redirect } from 'next/navigation';
import { currentUser } from './session';
import { currentUserRole } from './get-user-role';
import { routePermissions } from './permission-check';

export async function requirePermission(pathname: string) {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  const permissionKey = routePermissions[pathname];
  
  if (!permissionKey) {
    return user; // No specific permission required
  }

  const userRole = await currentUserRole();
  
  if (!userRole || !userRole.permissions[permissionKey]) {
    redirect('/dashboard/publisher');
  }

  return user;
}