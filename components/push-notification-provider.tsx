'use client'

import { useEffect } from 'react'
import { PushNotificationService } from '@/lib/services/push-notification.service'

export function PushNotificationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize push notifications on app load
    const initializePush = async () => {
      try {
        // Check if user has already granted permission
        if (Notification.permission === 'granted') {
          await PushNotificationService.initializePushNotifications()
        }
      } catch (error) {
        console.error('Error initializing push notifications:', error)
      }
    }

    // Only run on client side
    if (typeof window !== 'undefined') {
      initializePush()
    }
  }, [])

  return <>{children}</>
}