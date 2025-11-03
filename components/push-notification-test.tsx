'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Bell, Send } from 'lucide-react'
import { PushNotificationService } from '@/lib/services/push-notification.service'
import { toast } from 'sonner'

export function PushNotificationTest() {
  const [testData, setTestData] = useState({
    title: 'Test Notification',
    body: 'This is a test push notification from Suame Congregation',
    userId: 'self'
  })
  const [loading, setLoading] = useState(false)

  const sendTestNotification = async () => {
    setLoading(true)
    try {
      // Try server-side push first
      const success = await PushNotificationService.sendPushToUser(testData.userId, {
        title: testData.title,
        body: testData.body,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        data: { test: true, timestamp: Date.now() },
        actions: [
          { action: 'view', title: 'View', icon: '/icon-192x192.png' },
          { action: 'close', title: 'Close', icon: '/icon-192x192.png' }
        ]
      })

      if (success) {
        toast.success('Push notification sent successfully')
      } else {
        // Fallback to local notification
        PushNotificationService.showLocalNotification({
          title: testData.title,
          body: testData.body,
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          data: { test: true, timestamp: Date.now() }
        })
        toast.success('Local notification shown (fallback)')
      }
    } catch (error) {
      console.error('Error sending test notification:', error)
      toast.error('Failed to send test notification')
    } finally {
      setLoading(false)
    }
  }

  const sendBulkTest = async () => {
    setLoading(true)
    try {
      await PushNotificationService.sendPushToUsers(['self'], {
        title: 'Bulk Test Notification',
        body: 'This is a bulk test notification',
        icon: '/icon-192x192.png',
        data: { bulk: true, timestamp: Date.now() }
      })
      toast.success('Bulk notification sent')
    } catch (error) {
      console.error('Error sending bulk notification:', error)
      toast.error('Failed to send bulk notification')
    } finally {
      setLoading(false)
    }
  }

  const sendServerTest = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/push/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        toast.success('Server test notification sent')
      } else {
        const error = await response.json()
        toast.error(`Server test failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Error sending server test:', error)
      toast.error('Failed to send server test')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notification Test
        </CardTitle>
        <CardDescription>
          Test push notifications with custom content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Title</label>
          <Input
            value={testData.title}
            onChange={(e) => setTestData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Notification title"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Message</label>
          <Textarea
            value={testData.body}
            onChange={(e) => setTestData(prev => ({ ...prev, body: e.target.value }))}
            placeholder="Notification message"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={sendTestNotification}
            disabled={loading}
            size="sm"
          >
            <Send className="h-4 w-4 mr-1" />
            Client Test
          </Button>
          
          <Button
            onClick={sendServerTest}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <Bell className="h-4 w-4 mr-1" />
            Server Test
          </Button>
          
          <Button
            onClick={sendBulkTest}
            disabled={loading}
            variant="secondary"
            size="sm"
          >
            <Bell className="h-4 w-4 mr-1" />
            Bulk Test
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>• Test notifications will appear if push notifications are enabled</p>
          <p>• If push fails, a local notification will be shown as fallback</p>
          <p>• Check browser console for detailed logs</p>
        </div>
      </CardContent>
    </Card>
  )
}