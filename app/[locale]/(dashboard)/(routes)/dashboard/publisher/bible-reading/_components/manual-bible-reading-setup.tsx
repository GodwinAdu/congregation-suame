'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check } from 'lucide-react'

interface ManualBibleReadingSetupProps {
  onComplete: (startDate: string) => void
  onCancel: () => void
}

export default function ManualBibleReadingSetup({
  onComplete,
  onCancel,
}: ManualBibleReadingSetupProps) {
  const [startDate, setStartDate] = useState('')

  const handleComplete = () => {
    if (!startDate) return
    onComplete(startDate)
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium mb-2 block">Plan Start Date</label>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <p className="text-xs text-muted-foreground mt-1">
          This is just a reference date. You can select any chapters freely.
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={handleComplete}
          disabled={!startDate}
          className="flex-1 gap-2"
        >
          <Check className="h-4 w-4" />
          Start Manual Mode
        </Button>
      </div>
    </div>
  )
}
