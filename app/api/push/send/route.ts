import { NextRequest, NextResponse } from 'next/server'
import { connectToDB } from '@/lib/mongoose'
import PushSubscription from '@/lib/models/push-subscription.models'

import webpush from 'web-push'
import { currentUser } from '@/lib/helpers/session'

// Configure web-push
webpush.setVapidDetails(
  'mailto:admin@suame.org',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HI2BN4EMgAINkDOovHK_Ae2zgCkMLwTKnjSQx4IFgXqJFuwGcqojpXK_11',
  process.env.VAPID_PRIVATE_KEY || 'tUxbf-Ww-8Q1Q9QFfk3P38S_wIiT6L3RBrSKckrdjbE'
)

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, payload } = await request.json()

    if (!userId || !payload) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await connectToDB()

    // Handle 'self' userId for testing
    const targetUserId = userId === 'self' ? user._id : userId

    // Get user's push subscription
    const subscription = await PushSubscription.findOne({ 
      userId: targetUserId, 
      isActive: true 
    })

    if (!subscription) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }

    // Send push notification
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
      }
    }

    try {
      await webpush.sendNotification(
        pushSubscription,
        JSON.stringify(payload)
      )

      // Update last used timestamp
      subscription.lastUsed = new Date()
      await subscription.save()

      return NextResponse.json({ success: true })
    } catch (pushError: any) {
      console.error('Push notification error:', pushError)
      
      // Handle expired subscriptions
      if (pushError.statusCode === 410) {
        await PushSubscription.findOneAndUpdate(
          { userId: targetUserId },
          { isActive: false }
        )
      }
      
      return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error sending push notification:', error)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}