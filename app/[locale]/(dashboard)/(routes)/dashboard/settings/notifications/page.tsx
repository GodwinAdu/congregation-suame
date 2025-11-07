import { PushNotificationSetup } from '@/components/push-notification-setup'
import { PushNotificationTest } from '@/components/push-notification-test'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell } from 'lucide-react'

export default function NotificationSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notification Settings</h1>
        <p className="text-muted-foreground">
          Manage how you receive notifications from the congregation
        </p>
      </div>

      <div className="grid gap-6">
        <PushNotificationSetup />
        
        <PushNotificationTest />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Choose what types of notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Additional notification preferences will be available soon.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}