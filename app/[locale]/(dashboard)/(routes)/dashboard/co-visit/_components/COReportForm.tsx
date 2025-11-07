"use client"

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Trash2 } from 'lucide-react'
import { createCOReport } from '@/lib/actions/co-report.actions'

const coReportSchema = z.object({
  visitId: z.string().min(1, 'Visit ID is required'),
  congregation: z.string().min(1, 'Congregation is required'),
  visitDates: z.object({
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required')
  }),
  appointmentRecommendations: z.array(z.object({
    brotherName: z.string().min(1, 'Brother name is required'),
    currentPosition: z.string(),
    recommendedPosition: z.string(),
    recommendationType: z.string(),
    qualifications: z.string().optional(),
    spiritualProgress: z.string().optional(),
    serviceRecord: z.string().optional(),
    personalHistory: z.string().optional(),
    bodyRecommendation: z.string().optional()
  })),
  eldersAgendaItems: z.array(z.object({
    topic: z.string().min(1, 'Topic is required'),
    description: z.string().optional(),
    priority: z.string(),
    estimatedTime: z.number().optional(),
    category: z.string()
  })),
  shepherdingVisits: z.array(z.object({
    publisherName: z.string().min(1, 'Publisher name is required'),
    reason: z.string().min(1, 'Reason is required'),
    priority: z.string(),
    accompaniedBy: z.string().optional(),
    notes: z.string().optional()
  })),
  hostInformation: z.object({
    hostName: z.string().optional(),
    contactPhone: z.string().optional(),
    contactEmail: z.string().optional(),
    address: z.string().optional(),
    specialArrangements: z.string().optional()
  }),
  mealArrangements: z.array(z.object({
    date: z.string().min(1, 'Date is required'),
    mealType: z.string(),
    hostFamily: z.string().min(1, 'Host family is required'),
    contactInfo: z.string().min(1, 'Contact info is required'),
    specialRequests: z.string().optional(),
    guestCount: z.number().min(1)
  })),
  fieldServiceSchedule: z.array(z.object({
    date: z.string().min(1, 'Date is required'),
    time: z.string().min(1, 'Time is required'),
    location: z.string().min(1, 'Location is required'),
    type: z.string(),
    accompaniedBy: z.string().optional(),
    notes: z.string().optional()
  })),
  specialNeeds: z.string().optional(),
  congregationChallenges: z.string().optional(),
  positiveHighlights: z.string().optional(),
  followUpItems: z.string().optional()
})

type COReportFormData = z.infer<typeof coReportSchema>

interface COReportFormProps {
  visitId?: string
}

export function COReportForm({ visitId }: COReportFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { register, handleSubmit, control, formState: { errors }, setValue, watch } = useForm<COReportFormData>({
    resolver: zodResolver(coReportSchema),
    defaultValues: {
      visitId: visitId || '',
      appointmentRecommendations: [],
      eldersAgendaItems: [],
      shepherdingVisits: [],
      mealArrangements: [],
      fieldServiceSchedule: []
    }
  })

  const { fields: appointmentFields, append: appendAppointment, remove: removeAppointment } = useFieldArray({
    control,
    name: 'appointmentRecommendations'
  })

  const { fields: agendaFields, append: appendAgenda, remove: removeAgenda } = useFieldArray({
    control,
    name: 'eldersAgendaItems'
  })

  const { fields: shepherdingFields, append: appendShepherding, remove: removeShepherding } = useFieldArray({
    control,
    name: 'shepherdingVisits'
  })

  const { fields: mealFields, append: appendMeal, remove: removeMeal } = useFieldArray({
    control,
    name: 'mealArrangements'
  })

  const { fields: fieldServiceFields, append: appendFieldService, remove: removeFieldService } = useFieldArray({
    control,
    name: 'fieldServiceSchedule'
  })

  const onSubmit = async (data: COReportFormData) => {
    setIsSubmitting(true)
    try {
      await createCOReport(data)
    } catch (error) {
      console.error('Error creating CO report:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
          <TabsTrigger value="shepherding">Shepherding</TabsTrigger>
          <TabsTrigger value="arrangements">Arrangements</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="congregation">Congregation</Label>
                  <Input {...register('congregation')} />
                  {errors.congregation && <p className="text-red-500 text-sm">{errors.congregation.message}</p>}
                </div>
                <div>
                  <Label htmlFor="visitId">Visit ID</Label>
                  <Input {...register('visitId')} />
                  {errors.visitId && <p className="text-red-500 text-sm">{errors.visitId.message}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="visitDates.startDate">Start Date</Label>
                  <Input type="date" {...register('visitDates.startDate')} />
                </div>
                <div>
                  <Label htmlFor="visitDates.endDate">End Date</Label>
                  <Input type="date" {...register('visitDates.endDate')} />
                </div>
              </div>

              <div>
                <Label htmlFor="specialNeeds">Special Needs</Label>
                <Textarea {...register('specialNeeds')} />
              </div>

              <div>
                <Label htmlFor="congregationChallenges">Congregation Challenges</Label>
                <Textarea {...register('congregationChallenges')} />
              </div>

              <div>
                <Label htmlFor="positiveHighlights">Positive Highlights</Label>
                <Textarea {...register('positiveHighlights')} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Appointment Recommendations (S-62)</CardTitle>
                <Button type="button" onClick={() => appendAppointment({
                  brotherName: '',
                  currentPosition: 'publisher',
                  recommendedPosition: 'ministerial_servant',
                  recommendationType: 'appointment'
                })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Recommendation
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {appointmentFields.map((field, index) => (
                <div key={field.id} className="border p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Recommendation {index + 1}</h4>
                    <Button type="button" variant="destructive" size="sm" onClick={() => removeAppointment(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Brother Name</Label>
                      <Input {...register(`appointmentRecommendations.${index}.brotherName`)} />
                    </div>
                    <div>
                      <Label>Current Position</Label>
                      <Select onValueChange={(value) => setValue(`appointmentRecommendations.${index}.currentPosition`, value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="publisher">Publisher</SelectItem>
                          <SelectItem value="ministerial_servant">Ministerial Servant</SelectItem>
                          <SelectItem value="elder">Elder</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Recommended Position</Label>
                      <Select onValueChange={(value) => setValue(`appointmentRecommendations.${index}.recommendedPosition`, value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ministerial_servant">Ministerial Servant</SelectItem>
                          <SelectItem value="elder">Elder</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Recommendation Type</Label>
                      <Select onValueChange={(value) => setValue(`appointmentRecommendations.${index}.recommendationType`, value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="appointment">Appointment</SelectItem>
                          <SelectItem value="deletion">Deletion</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Label>Qualifications</Label>
                    <Textarea {...register(`appointmentRecommendations.${index}.qualifications`)} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agenda">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Elders Meeting Agenda</CardTitle>
                <Button type="button" onClick={() => appendAgenda({
                  topic: '',
                  priority: 'medium',
                  category: 'organizational'
                })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {agendaFields.map((field, index) => (
                <div key={field.id} className="border p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Agenda Item {index + 1}</h4>
                    <Button type="button" variant="destructive" size="sm" onClick={() => removeAgenda(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Topic</Label>
                      <Input {...register(`eldersAgendaItems.${index}.topic`)} />
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <Select onValueChange={(value) => setValue(`eldersAgendaItems.${index}.priority`, value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Label>Description</Label>
                    <Textarea {...register(`eldersAgendaItems.${index}.description`)} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shepherding">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Shepherding Visits</CardTitle>
                <Button type="button" onClick={() => appendShepherding({
                  publisherName: '',
                  reason: '',
                  priority: 'medium'
                })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Visit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {shepherdingFields.map((field, index) => (
                <div key={field.id} className="border p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Shepherding Visit {index + 1}</h4>
                    <Button type="button" variant="destructive" size="sm" onClick={() => removeShepherding(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Publisher Name</Label>
                      <Input {...register(`shepherdingVisits.${index}.publisherName`)} />
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <Select onValueChange={(value) => setValue(`shepherdingVisits.${index}.priority`, value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Label>Reason</Label>
                    <Textarea {...register(`shepherdingVisits.${index}.reason`)} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="arrangements">
          <Card>
            <CardHeader>
              <CardTitle>Accommodations & Arrangements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-4">Host Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Host Name</Label>
                    <Input {...register('hostInformation.hostName')} />
                  </div>
                  <div>
                    <Label>Contact Phone</Label>
                    <Input {...register('hostInformation.contactPhone')} />
                  </div>
                  <div>
                    <Label>Contact Email</Label>
                    <Input {...register('hostInformation.contactEmail')} />
                  </div>
                  <div>
                    <Label>Address</Label>
                    <Input {...register('hostInformation.address')} />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Meal Arrangements</h4>
                  <Button type="button" onClick={() => appendMeal({
                    date: '',
                    mealType: 'lunch',
                    hostFamily: '',
                    contactInfo: '',
                    guestCount: 2
                  })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Meal
                  </Button>
                </div>
                
                {mealFields.map((field, index) => (
                  <div key={field.id} className="border p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="font-medium">Meal {index + 1}</h5>
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeMeal(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Date</Label>
                        <Input type="date" {...register(`mealArrangements.${index}.date`)} />
                      </div>
                      <div>
                        <Label>Meal Type</Label>
                        <Select onValueChange={(value) => setValue(`mealArrangements.${index}.mealType`, value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="breakfast">Breakfast</SelectItem>
                            <SelectItem value="lunch">Lunch</SelectItem>
                            <SelectItem value="dinner">Dinner</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Guest Count</Label>
                        <Input type="number" {...register(`mealArrangements.${index}.guestCount`, { valueAsNumber: true })} />
                      </div>
                      <div>
                        <Label>Host Family</Label>
                        <Input {...register(`mealArrangements.${index}.hostFamily`)} />
                      </div>
                      <div>
                        <Label>Contact Info</Label>
                        <Input {...register(`mealArrangements.${index}.contactInfo`)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Required Documents Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="publisherRecords" />
                    <Label htmlFor="publisherRecords">Publisher Records (S-21)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="attendanceRecords" />
                    <Label htmlFor="attendanceRecords">Attendance Records (S-88)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="congregationAccounts" />
                    <Label htmlFor="congregationAccounts">Congregation Accounts</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="auditReports" />
                    <Label htmlFor="auditReports">Audit Reports</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="khOperatingAccounts" />
                    <Label htmlFor="khOperatingAccounts">KH Operating Accounts</Label>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="publisherContactInfo" />
                    <Label htmlFor="publisherContactInfo">Publisher Contact Info</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="territoryRecords" />
                    <Label htmlFor="territoryRecords">Territory Records (S-13)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="literatureMovement" />
                    <Label htmlFor="literatureMovement">Literature Movement (S-28)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="territoryVariety" />
                    <Label htmlFor="territoryVariety">Territory Variety</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="publicWitnessingList" />
                    <Label htmlFor="publicWitnessingList">Public Witnessing List</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline">Save Draft</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Report'}
        </Button>
      </div>
    </form>
  )
}