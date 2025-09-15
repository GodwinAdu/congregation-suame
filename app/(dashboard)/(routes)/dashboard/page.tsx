
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

const page = async () => {
  const user = await currentUser()

  // Check user roles
  const isAdmin = user?.role === 'admin' || user?.role === 'coordinator'
  const isAttendant = user?.role === "attendant"
  const isGroupAssistant = user?.role === "group assistant(attendant)"
  
  const hasAccess = isAdmin || isAttendant || isGroupAssistant

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl font-semibold">Access Restricted</CardTitle>
            <CardDescription>
              You don't have permission to view the dashboard. Only authorized roles can access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-sm text-muted-foreground">
              Your current role: <span className="font-medium">{user?.role || 'Unknown'}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              Required roles: Admin, Coordinator, Attendant, or Group Assistant
            </div>
            <Button asChild className="w-full">
              <Link href="/dashboard/todos">
                Go to My Todos
              </Link>
            </Button>
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
      <div className="flex justify-between items-center">
        <Heading title={getDashboardTitle()} />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BarChart3 className="h-4 w-4" />
          {isAdmin ? "Full insights" : isGroupAssistant ? "Group insights" : "Attendance insights"}
        </div>
      </div>
      <Separator />
      <div className="py-4">
        {getAnalyticsComponent()}
      </div>
    </>
  )
}

export default page
