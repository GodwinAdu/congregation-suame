import { redirect } from 'next/navigation';
import { currentUser } from './session';
import { currentUserRole } from './get-user-role';
import { ruleForPath, satisfiesRule, type RouteRule } from './route-access';

/**
 * Server-side page guard. Call it at the top of a page or layout.
 *
 * `target` is either a dashboard route (e.g. '/dashboard/members', resolved through
 * ROUTE_ACCESS) or a role permission key (e.g. 'coVisitManage').
 *
 * Signed-out users go to sign-in; users whose role lacks the permission are sent to
 * their publisher dashboard (or the profile page when that is what is being guarded,
 * so the redirect can never loop).
 */
export async function requirePermission(target: string) {
  const user = await currentUser();
  if (!user) {
    redirect('/sign-in');
  }

  let rule: RouteRule | undefined;
  if (target.startsWith('/')) {
    rule = ruleForPath(target);
    if (rule === undefined) {
      console.warn(`requirePermission: no access rule covers ${target}`);
      return user;
    }
  } else {
    rule = target;
  }

  const userRole = await currentUserRole();
  if (!satisfiesRule(rule, userRole?.permissions)) {
    const guardingHome = target === '/dashboard/publisher' || target.startsWith('/dashboard/publisher/');
    redirect(guardingHome ? '/dashboard/profile' : '/dashboard/publisher');
  }
  return user;
}
