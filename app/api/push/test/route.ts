import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/helpers/session'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Simple test notification
    const testPayload = {
      title: 'Test Push Notification',
      body: 'This is a test from the server',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      data: { test: true, timestamp: Date.now() }
    }

    // Send to self for testing
    const response = await fetch(`${request.nextUrl.origin}/api/push/send`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || ''
      },
      body: JSON.stringify({ 
        userId: session.user.id, 
        payload: testPayload 
      })
    })

    if (response.ok) {
      return NextResponse.json({ success: true, message: 'Test notification sent' })
    } else {
      const error = await response.text()
      return NextResponse.json({ error: `Failed to send: ${error}` }, { status: 500 })
    }
  } catch (error) {
    console.error('Test notification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}