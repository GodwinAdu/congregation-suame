interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  data?: any
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
  tag?: string
  requireInteraction?: boolean
  silent?: boolean
}

export class PushNotificationService {
  private static vapidKeys = {
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HI2BN4EMgAINkDOovHK_Ae2zgCkMLwTKnjSQx4IFgXqJFuwGcqojpXK_11',
    privateKey: process.env.VAPID_PRIVATE_KEY || 'tUxbf-Ww-8Q1Q9QFfk3P38S_wIiT6L3RBrSKckrdjbE'
  }

  // Initialize push notifications on client
  static async initializePushNotifications(): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported')
      return null
    }

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js')
      
      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription()
      
      if (!subscription) {
        // Subscribe to push notifications
        const applicationServerKey = this.urlBase64ToUint8Array(this.vapidKeys.publicKey)
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey.buffer as ArrayBuffer
        })
      }

      // Save subscription to server
      await this.saveSubscription(subscription)
      
      return {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
        }
      }
    } catch (error) {
      console.error('Failed to initialize push notifications:', error)
      return null
    }
  }

  // Send push notification to specific user
  static async sendPushToUser(userId: string, payload: PushNotificationPayload): Promise<boolean> {
    try {
      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, payload })
      })
      return response.ok
    } catch (error) {
      console.error('Failed to send push notification:', error)
      return false
    }
  }

  // Send push notification to multiple users
  static async sendPushToUsers(userIds: string[], payload: PushNotificationPayload): Promise<void> {
    const promises = userIds.map(userId => this.sendPushToUser(userId, payload))
    await Promise.allSettled(promises)
  }

  // Request notification permission
  static async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied'
    }

    if (Notification.permission === 'default') {
      return await Notification.requestPermission()
    }

    return Notification.permission
  }

  // Show local notification (fallback)
  static showLocalNotification(payload: PushNotificationPayload): void {
    if (Notification.permission === 'granted') {
      new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icon-192x192.png',
        badge: payload.badge || '/icon-192x192.png',
        data: payload.data,
        tag: payload.tag,
        requireInteraction: payload.requireInteraction,
        silent: payload.silent
      })
    }
  }

  // Unsubscribe from push notifications
  static async unsubscribe(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        const subscription = await registration.pushManager.getSubscription()
        if (subscription) {
          await subscription.unsubscribe()
          await this.removeSubscription()
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Failed to unsubscribe:', error)
      return false
    }
  }

  // Helper methods
  private static urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  private static async saveSubscription(subscription: globalThis.PushSubscription): Promise<void> {
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
        }
      })
    })
  }

  private static async removeSubscription(): Promise<void> {
    await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
  }
}