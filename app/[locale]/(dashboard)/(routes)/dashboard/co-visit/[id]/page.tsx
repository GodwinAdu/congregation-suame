import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { currentUser } from '@/lib/helpers/session'
import { currentUserRole } from '@/lib/helpers/get-user-role'
import { getCOVisitPacket } from '@/lib/actions/co-visit-packet.actions'
import { PacketClient } from './_components/PacketClient'
import { SECTION_PERMISSION, type ChecklistSection } from '@/lib/constants/co-visit-checklist'

export default async function COVisitPacketPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const role = await currentUserRole()
  if (!role?.permissions?.coVisitView) redirect('/dashboard/publisher')

  const { id } = await params
  let data: any = null
  try {
    data = await getCOVisitPacket(id)
  } catch {
    notFound()
  }
  if (!data) notFound()

  const perms: Record<string, boolean> = role.permissions
  const canEdit = Object.fromEntries(
    (Object.keys(SECTION_PERMISSION) as ChecklistSection[]).map((section) => [
      section,
      !!(perms.coVisitManage || perms[SECTION_PERMISSION[section]]),
    ])
  ) as Record<ChecklistSection, boolean>

  return (
    <div className="p-6 space-y-4">
      <Button asChild variant="outline" size="sm">
        <Link href="/dashboard/co-visit">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to visits
        </Link>
      </Button>
      <PacketClient
        initialVisit={data.visit}
        members={data.members}
        canEdit={canEdit}
      />
    </div>
  )
}
