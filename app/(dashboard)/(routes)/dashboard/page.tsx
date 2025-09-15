
import { currentUser } from '@/lib/helpers/session'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

const page = async () => {
  const user = await currentUser()

  // Check if user has admin or moderator role
  const hasAccess = user?.role === 'admin' || user?.role === 'moderator'

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
              You don't have permission to view the dashboard. Only administrators and moderators can access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-sm text-muted-foreground">
              Your current role: <span className="font-medium">{user?.role || 'Unknown'}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              Required roles: Admin or Moderator
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

  return (
    <>
      <div className="">Testing Dashboard</div>
    </>
  )
}

export default page
