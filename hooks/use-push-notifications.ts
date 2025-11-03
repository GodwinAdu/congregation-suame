'use client'

import { useState, useEffect } from 'react'
import { PushNotificationService } from '@/lib/services/push-notification.service'

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkSupport = () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window
      setIsSupported(supported)
      
      if (supported) {
        setPermission(Notification.permission)
        checkSubscriptionStatus()
      }
    }

    checkSupport()
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

  const requestPermission = async () => {
    if (!isSupported) return false

    setLoading(true)
    try {
      const newPermission = await PushNotificationService.requestPermission()
      setPermission(newPermission)
      return newPermission === 'granted'
    } catch (error) {
      console.error('Error requesting permission:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const subscribe = async () => {
    if (!isSupported || permission !== 'granted') return false

    setLoading(true)
    try {
      const subscription = await PushNotificationService.initializePushNotifications()
      if (subscription) {
        setIsSubscribed(true)
        return true
      }
      return false
    } catch (error) {
      console.error('Error subscribing:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const unsubscribe = async () => {
    if (!isSupported) return false

    setLoading(true)
    try {
      const success = await PushNotificationService.unsubscribe()
      if (success) {
        setIsSubscribed(false)
      }
      return success
    } catch (error) {
      console.error('Error unsubscribing:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const sendTestNotification = async () => {
    if (!isSubscribed) return false

    try {
      const success = await PushNotificationService.sendPushToUser('self', {
        title: 'Test Notification',
        body: 'This is a test push notification',
        icon: '/icon-192x192.png'
      })

      if (!success) {
        // Fallback to local notification
        PushNotificationService.showLocalNotification({
          title: 'Test Notification',
          body: 'This is a test push notification',
          icon: '/icon-192x192.png'
        })
      }

      return true
    } catch (error) {
      console.error('Error sending test notification:', error)
      return false
    }
  }

  return {
    isSupported,
    permission,
    isSubscribed,
    loading,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
    checkSubscriptionStatus
  }
}