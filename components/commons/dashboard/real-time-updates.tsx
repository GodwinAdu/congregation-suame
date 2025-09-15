'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type Update = {
  id: string
  type: 'sale' | 'inventory' | 'customer'
  message: string
  timestamp: Date
}

export default function RealTimeUpdates() {
  const [updates, setUpdates] = useState<Update[]>([])

  useEffect(() => {
    // Simulating real-time updates
    const interval = setInterval(() => {
      const newUpdate: Update = {
        id: Math.random().toString(36).substr(2, 9),
        type: ['sale', 'inventory', 'customer'][Math.floor(Math.random() * 3)] as 'sale' | 'inventory' | 'customer',
        message: `New ${['sale', 'inventory update', 'customer registration'][Math.floor(Math.random() * 3)]}`,
        timestamp: new Date(),
      }
      setUpdates(prev => [newUpdate, ...prev.slice(0, 4)])
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Real-Time Updates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {updates.map(update => (
            <div key={update.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant={update.type === 'sale' ? 'default' : update.type === 'inventory' ? 'secondary' : 'outline'}>
                  {update.type}
                </Badge>
                <span>{update.message}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {update.timestamp.toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

