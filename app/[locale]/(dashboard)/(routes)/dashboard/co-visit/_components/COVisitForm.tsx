"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createCOVisit } from '@/lib/actions/co-visit.actions'

const coVisitSchema = z.object({
  coName: z.string().min(1, 'CO name is required'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  visitNumber: z.number({ message: 'Visit number is required' }).min(1, 'Visit number must be at least 1'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  generalNotes: z.string().optional(),
}).refine((d) => !d.startDate || !d.endDate || d.endDate >= d.startDate, {
  message: 'End date must be on or after the start date',
  path: ['endDate'],
})

type COVisitFormData = z.infer<typeof coVisitSchema>

export function COVisitForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<COVisitFormData>({
    resolver: zodResolver(coVisitSchema)
  })

  const onSubmit = async (data: COVisitFormData) => {
    setIsSubmitting(true)
    try {
      const visit = await createCOVisit({
        visitNumber: data.visitNumber,
        circuitOverseer: {
          name: data.coName,
          email: data.email || undefined,
          phone: data.phone || undefined,
        },
        visitDates: {
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
        },
        generalNotes: data.generalNotes,
      })
      toast.success('Visit scheduled')
      router.push(`/dashboard/co-visit/${visit._id}`)
    } catch (error) {
      console.error('Error creating CO visit:', error)
      toast.error('Could not schedule the visit')
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="coName">Circuit Overseer Name</Label>
              <Input id="coName" {...register('coName')} />
              {errors.coName && <p className="text-red-500 text-sm">{errors.coName.message}</p>}
            </div>
            <div>
              <Label htmlFor="visitNumber">Visit Number</Label>
              <Input id="visitNumber" type="number" {...register('visitNumber', { valueAsNumber: true })} />
              {errors.visitNumber && <p className="text-red-500 text-sm">{errors.visitNumber.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register('phone')} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" {...register('startDate')} />
              {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate.message}</p>}
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" {...register('endDate')} />
              {errors.endDate && <p className="text-red-500 text-sm">{errors.endDate.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="generalNotes">Notes</Label>
            <Textarea id="generalNotes" {...register('generalNotes')} placeholder="Additional notes..." />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Scheduling...' : 'Schedule Visit'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
