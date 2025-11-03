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

    await connectToDB()

    // Deactivate user's push subscription
    await PushSubscription.findOneAndUpdate(
      { userId: user._id },
      { isActive: false }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}