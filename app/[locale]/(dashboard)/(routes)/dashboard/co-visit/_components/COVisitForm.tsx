"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createCOVisit } from '@/lib/actions/co-visit.actions'

const coVisitSchema = z.object({
  coName: z.string().min(1, 'CO name is required'),
  congregation: z.string().min(1, 'Congregation is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  duration: z.number().min(1, 'Duration must be at least 1 day'),
  purpose: z.string().optional(),
  notes: z.string().optional(),
})

type COVisitFormData = z.infer<typeof coVisitSchema>

export function COVisitForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<COVisitFormData>({
    resolver: zodResolver(coVisitSchema)
  })

  const onSubmit = async (data: COVisitFormData) => {
    setIsSubmitting(true)
    try {
      await createCOVisit(data)
      // Reset form or redirect
    } catch (error) {
      console.error('Error creating CO visit:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule CO Visit</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="coName">Circuit Overseer Name</Label>
              <Input {...register('coName')} />
              {errors.coName && <p className="text-red-500 text-sm">{errors.coName.message}</p>}
            </div>
            <div>
              <Label htmlFor="congregation">Congregation</Label>
              <Input {...register('congregation')} />
              {errors.congregation && <p className="text-red-500 text-sm">{errors.congregation.message}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input type="date" {...register('startDate')} />
              {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate.message}</p>}
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input type="date" {...register('endDate')} />
              {errors.endDate && <p className="text-red-500 text-sm">{errors.endDate.message}</p>}
            </div>
            <div>
              <Label htmlFor="duration">Duration (days)</Label>
              <Input type="number" {...register('duration', { valueAsNumber: true })} />
              {errors.duration && <p className="text-red-500 text-sm">{errors.duration.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="purpose">Purpose</Label>
            <Input {...register('purpose')} placeholder="Regular visit, special needs, etc." />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea {...register('notes')} placeholder="Additional notes..." />
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Schedule Visit'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}