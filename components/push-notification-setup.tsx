'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Bell, BellOff } from 'lucide-react'
import { PushNotificationService } from '@/lib/services/push-notification.service'
import { toast } from 'sonner'

export function PushNotificationSetup() {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if push notifications are supported
    const supported = 'serviceWorker' in navigator && 'PushManager' in window
    setIsSupported(supported)
    
    if (supported) {
      setPermission(Notification.permission)
      checkSubscriptionStatus()
    }
  }, [])

  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        const subscription = await registration.pushManager.getSubscription()
        setIsSubscribed(!!subscription)
      }
    } catch (error) {
      console.error('Error checking subscription status:', error)
    }
  }

  const handleToggleNotifications = async () => {
    if (!isSupported) {
      toast.error('Push notifications are not supported in this browser')
      return
    }

    setLoading(true)

    try {
      if (isSubscribed) {
        // Unsubscribe
        const success = await PushNotificationService.unsubscribe()
        if (success) {
          setIsSubscribed(false)
          toast.success('Push notifications disabled')
        } else {
          toast.error('Failed to disable push notifications')
        }
      } else {
        // Subscribe
        const newPermission = await PushNotificationService.requestPermission()
        setPermission(newPermission)

        if (newPermission === 'granted') {
          const subscription = await PushNotificationService.initializePushNotifications()
          if (subscription) {
            setIsSubscribed(true)
            toast.success('Push notifications enabled')
          } else {
            toast.error('Failed to enable push notifications')
          }
        } else {
          toast.error('Permission denied for push notifications')
        }
      }
    } catch (error) {
      console.error('Error toggling notifications:', error)
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const sendTestNotification = async () => {
    if (!isSubscribed) {
      toast.error('Please enable push notifications first')
      return
    }

    try {
      const success = await PushNotificationService.sendPushToUser('self', {
        title: 'Test Notification',
        body: 'This is a test push notification from Suame Congregation',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        data: { test: true }
      })

      if (success) {
        toast.success('Test notification sent')
      } else {
        // Fallback to local notification
        PushNotificationService.showLocalNotification({
          title: 'Test Notification',
          body: 'This is a test push notification from Suame Congregation',
          icon: '/icon-192x192.png'
        })
        toast.success('Local test notification shown')
      }
    } catch (error) {
      console.error('Error sending test notification:', error)
      toast.error('Failed to send test notification')
    }
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Push notifications are not supported in this browser
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Receive instant notifications for important updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Enable Push Notifications</p>
            <p className="text-sm text-muted-foreground">
              Get notified about assignments, meetings, and announcements
            </p>
          </div>
          <Switch
            checked={isSubscribed}
            onCheckedChange={handleToggleNotifications}
            disabled={loading || permission === 'denied'}
          />
        </div>

        {permission === 'denied' && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            Push notifications are blocked. Please enable them in your browser settings.
          </div>
        )}

        {isSubscribed && (
          <Button
            onClick={sendTestNotification}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Send Test Notification
          </Button>
        )}

        <div className="text-xs text-muted-foreground">
          <p>Status: {permission === 'granted' ? 'Enabled' : permission === 'denied' ? 'Blocked' : 'Not enabled'}</p>
          <p>Subscription: {isSubscribed ? 'Active' : 'Inactive'}</p>
        </div>
      </CardContent>
    </Card>
  )
}