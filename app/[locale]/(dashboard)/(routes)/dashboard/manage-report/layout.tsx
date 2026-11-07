import { requirePermission } from '@/lib/helpers/server-permission-check'

// Guards every page in this section. Rules live in lib/helpers/route-access.ts.
export default async function Layout({ children }: { children: React.ReactNode }) {
  await requirePermission('/dashboard/manage-report')
  return <>{children}</>
}
