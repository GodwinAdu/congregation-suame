"use client"

import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle2, Circle, ChevronRight, Download, Loader2, MinusCircle, CalendarDays, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  CHECKLIST_ITEMS,
  QUESTIONNAIRE,
  SECTION_LABELS,
  type ChecklistItemDef,
  type ChecklistSection,
  type ChecklistStatus,
} from '@/lib/constants/co-visit-checklist'
import { getCOReviewData, setQuestionAnswer } from '@/lib/actions/co-visit-packet.actions'
import { ItemPanel } from './ItemPanel'
import { exportPacketPdf, getAnswer, getChecklistStatus } from './packet-pdf'

interface Props {
  initialVisit: any
  members: { _id: string; fullName: string; phone?: string }[]
  canEdit: Record<ChecklistSection, boolean>
}

const SECTIONS: ChecklistSection[] = ['coordinator', 'secretary', 'service_overseer']

function StatusIcon({ status }: { status: ChecklistStatus }) {
  if (status === 'ready') return <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" aria-hidden />
  if (status === 'na') return <MinusCircle className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden />
  return <Circle className="h-5 w-5 text-amber-500 shrink-0" aria-hidden />
}

export function PacketClient({ initialVisit, members, canEdit }: Props) {
  const [visit, setVisit] = useState<any>(initialVisit)
  const [review, setReview] = useState<any>(null)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [openKey, setOpenKey] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const loadReview = useCallback(async () => {
    if (review) return review
    setReviewLoading(true)
    try {
      const data = await getCOReviewData()
      setReview(data)
      return data
    } catch (e) {
      toast.error('Could not load the data for review')
      return null
    } finally {
      setReviewLoading(false)
    }
  }, [review])

  // Merge a change into the local copy of the visit so the UI updates instantly.
  const patchPacket = useCallback((patch: (v: any) => any) => {
    setVisit((v: any) => patch(structuredClone(v)))
  }, [])

  const applicable = CHECKLIST_ITEMS.filter((i) => getChecklistStatus(visit, i.key) !== 'na')
  const readyCount = applicable.filter((i) => getChecklistStatus(visit, i.key) === 'ready').length
  const percent = applicable.length ? Math.round((readyCount / applicable.length) * 100) : 100
  const answered = QUESTIONNAIRE.filter((q) => getAnswer(visit, q.key)).length

  const daysLeft = Math.ceil(
    (new Date(visit.visitDates.startDate).getTime() - Date.now()) / 86400000
  )

  const openItem = CHECKLIST_ITEMS.find((i) => i.key === openKey) || null

  const handleExport = async () => {
    setExporting(true)
    try {
      const data = await loadReview()
      exportPacketPdf(visit, data)
    } catch (e) {
      toast.error('Failed to create the PDF')
    } finally {
      setExporting(false)
    }
  }

  const answer = async (key: string, value: 'Y' | 'N' | 'NA' | null, note?: string) => {
    const previous = visit
    patchPacket((v) => {
      v.packet = v.packet || {}
      v.packet.questionnaire = v.packet.questionnaire || []
      const existing = v.packet.questionnaire.find((q: any) => q.key === key)
      if (existing) {
        existing.answer = value || undefined
        if (note !== undefined) existing.note = note
      } else {
        v.packet.questionnaire.push({ key, answer: value || undefined, note })
      }
      return v
    })
    try {
      await setQuestionAnswer(visit._id, key, value, note)
    } catch (e: any) {
      setVisit(previous)
      toast.error(e?.message || 'Could not save the answer')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            CO Visit #{visit.visitNumber} - {visit.circuitOverseer?.name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" aria-hidden />
              {new Date(visit.visitDates.startDate).toLocaleDateString()} -{' '}
              {new Date(visit.visitDates.endDate).toLocaleDateString()}
            </span>
            {visit.circuitOverseer?.phone && (
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" aria-hidden />
                {visit.circuitOverseer.phone}
              </span>
            )}
            {daysLeft > 0 ? (
              <Badge variant="secondary">{daysLeft} day{daysLeft === 1 ? '' : 's'} to go</Badge>
            ) : null}
          </div>
        </div>
        <Button onClick={handleExport} disabled={exporting}>
          {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
          Export PDF
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Packet readiness</span>
            <span>{readyCount} of {applicable.length} items ready ({percent}%)</span>
          </div>
          <Progress value={percent} aria-label="Packet readiness" />
          {daysLeft <= 7 && percent < 100 && daysLeft > -1 && (
            <p className="text-sm text-amber-600">
              The items must be given to the circuit overseer no later than Tuesday of his visit.
            </p>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="checklist">
        <TabsList>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="questions">
            Questions ({answered}/{QUESTIONNAIRE.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="checklist" className="space-y-4 mt-4">
          {SECTIONS.map((section) => (
            <Card key={section}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{SECTION_LABELS[section]}</CardTitle>
              </CardHeader>
              <CardContent className="divide-y">
                {CHECKLIST_ITEMS.filter((i) => i.section === section).map((item) => {
                  const status = getChecklistStatus(visit, item.key)
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setOpenKey(item.key)}
                      className="w-full flex items-center gap-3 py-3 text-left hover:bg-muted/50 rounded-md px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <StatusIcon status={status} />
                      <span className="flex-1 text-sm">
                        {item.label}
                        {item.hint && (
                          <span className="block text-xs text-muted-foreground mt-0.5">{item.hint}</span>
                        )}
                      </span>
                      <Badge variant={status === 'ready' ? 'default' : 'outline'}>
                        {status === 'ready' ? 'Ready' : status === 'na' ? 'N/A' : 'Not ready'}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
                    </button>
                  )
                })}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="questions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Questions to answer</CardTitle>
              <CardDescription>
                Every question on page 2 of the S-61 must be answered before the visit.
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              {QUESTIONNAIRE.map((q, idx) => {
                const current = getAnswer(visit, q.key)
                const note = visit.packet?.questionnaire?.find((x: any) => x.key === q.key)?.note || ''
                const options: ('Y' | 'N' | 'NA')[] = q.naAllowed ? ['Y', 'N', 'NA'] : ['Y', 'N']
                return (
                  <div key={q.key} className="py-3 space-y-2">
                    <p className="text-sm">
                      <span className="font-medium mr-1">{idx + 1}.</span>
                      {q.text}
                    </p>
                    <div className="flex flex-wrap items-start gap-3">
                      <div className="flex gap-1" role="radiogroup" aria-label={`Answer for question ${idx + 1}`}>
                        {options.map((opt) => (
                          <Button
                            key={opt}
                            type="button"
                            size="sm"
                            role="radio"
                            aria-checked={current === opt}
                            variant={current === opt ? 'default' : 'outline'}
                            disabled={!canEdit.coordinator}
                            onClick={() => answer(q.key, current === opt ? null : opt)}
                          >
                            {opt === 'NA' ? 'N/A' : opt === 'Y' ? 'Yes' : 'No'}
                          </Button>
                        ))}
                      </div>
                      <Textarea
                        defaultValue={note}
                        disabled={!canEdit.coordinator}
                        placeholder="Note (optional)"
                        aria-label={`Note for question ${idx + 1}`}
                        className="min-h-9 h-9 flex-1 min-w-48"
                        onBlur={(e) => {
                          if (e.target.value !== note) answer(q.key, (current as any) || null, e.target.value)
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ItemPanel
        item={openItem as ChecklistItemDef | null}
        visit={visit}
        members={members}
        canManage={openItem ? canEdit[openItem.section] : false}
        review={review}
        reviewLoading={reviewLoading}
        loadReview={loadReview}
        patchPacket={patchPacket}
        setVisit={setVisit}
        onClose={() => setOpenKey(null)}
      />
    </div>
  )
}
