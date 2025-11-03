import { NextRequest, NextResponse } from 'next/server'
import { connectToDB } from '@/lib/mongoose'
import PushSubscription from '@/lib/models/push-subscription.models'
import { currentUser } from '@/lib/helpers/session'


export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { endpoint, keys } = await request.json()

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 })
    }

    await connectToDB()

    // Update or create subscription
    await PushSubscription.findOneAndUpdate(
      { userId: user._id },
      {
        endpoint,
        keys,
        userAgent: request.headers.get('user-agent') || '',
        lastUsed: new Date(),
        isActive: true
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving push subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}