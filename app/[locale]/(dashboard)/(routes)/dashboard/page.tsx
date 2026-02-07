
import { currentUser } from '@/lib/helpers/session'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, AlertTriangle, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'
import DashboardAnalytics from './_components/DashboardAnalytics'
import AttendantAnalytics from './_components/AttendantAnalytics'
import GroupAssistantAnalytics from './_components/GroupAssistantAnalytics'
import Heading from '@/components/commons/Header'
import { Separator } from '@/components/ui/separator'
import UniversalAnalytics from './_components/UniversalAnalytics'
import { requirePermission } from '@/lib/helpers/server-permission-check'
import { BackupModal } from './_components/BackupModal'

const page = async () => {
  await requirePermission('dashboard')
  const user = await currentUser()

  // Check user roles
  const isAdmin = user?.role === 'admin' || user?.role === 'coordinator'
  const isAttendant = user?.role === "attendant"
  const isGroupAssistant = user?.role === "group assistant(Attendant)"

  const hasAccess = isAdmin || isAttendant || isGroupAssistant

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] p-3 sm:p-6">
        <Card className="w-full max-w-lg border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-amber-100 border-2 border-orange-200">
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-orange-800">Dashboard Access</CardTitle>
            <CardDescription className="text-sm sm:text-base text-orange-700">
              This section is reserved for congregation leadership and administrative roles.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="p-4 bg-white/60 rounded-lg border border-orange-200">
              <div className="text-sm text-orange-800 mb-2">
                <span className="font-medium">Your Role:</span> {user?.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Publisher'}
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-orange-600">
                <Shield className="h-4 w-4" />
                <span>Contact your group overseer for dashboard access</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-orange-700">
                You can still access your personal features:
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button asChild variant="outline" className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-100">
                  <Link href="/dashboard/publisher">
                    My Publisher
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Determine which analytics to show based on role
  const getAnalyticsComponent = () => {
    if (isAdmin) {
      return <UniversalAnalytics />
    } else if (isGroupAssistant) {
      return <GroupAssistantAnalytics />
    } else if (isAttendant) {
      return <AttendantAnalytics />
    }
    return null
  }

  const getDashboardTitle = () => {
    if (isAdmin) return "Dashboard Analytics"
    if (isGroupAssistant) return "Group & Attendance Analytics"
    if (isAttendant) return "Attendance Analytics"
    return "Dashboard"
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <Heading title={getDashboardTitle()} />
        <div className="flex items-center gap-2">
          {isAdmin && <BackupModal />}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
            {isAdmin ? "Full insights" : isGroupAssistant ? "Group insights" : "Attendance insights"}
          </div>
        </div>
      </div>
      <Separator />
      <div className="py-2 sm:py-4">
        {getAnalyticsComponent()}
      </div>
    </>
  )
}

export default page
