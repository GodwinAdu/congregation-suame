"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { ExternalLink, Loader2, Plus, Trash2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  RECOMMENDATION_ACTIONS,
  STATUS_LABELS,
  type ChecklistItemDef,
  type ChecklistStatus,
} from '@/lib/constants/co-visit-checklist'
import {
  savePacketSection,
  saveShepherdingCalls,
  setChecklistStatus,
} from '@/lib/actions/co-visit-packet.actions'
import { getChecklistStatus } from './packet-pdf'

interface Member { _id: string; fullName: string; phone?: string }

interface Props {
  item: ChecklistItemDef | null
  visit: any
  members: Member[]
  canManage: boolean
  review: any
  reviewLoading: boolean
  loadReview: () => Promise<any>
  patchPacket: (fn: (v: any) => any) => void
  setVisit: (v: any) => void
  onClose: () => void
}

const toInputDate = (d?: string | Date | null) => (d ? new Date(d).toISOString().slice(0, 10) : '')
const fmt = (d?: string | Date | null) => (d ? new Date(d).toLocaleDateString() : '')

const selectClass =
  'h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

export function ItemPanel(props: Props) {
  const { item, onClose } = props
  return (
    <Sheet open={!!item} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        {item && <PanelBody {...props} item={item} />}
      </SheetContent>
    </Sheet>
  )
}

function PanelBody({ item, visit, members, canManage, review, reviewLoading, loadReview, patchPacket, setVisit }: Props & { item: ChecklistItemDef }) {
  const needsReview = ['s21', 's88', 'contacts', 's13', 'visitTerritories'].includes(item.panel)
  useEffect(() => {
    if (needsReview) loadReview()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.key])

  return (
    <div className="px-4 pb-6 space-y-5">
      <SheetHeader className="px-0">
        <SheetTitle>{item.label}</SheetTitle>
        <SheetDescription>{item.hint || 'Review the information, then mark the item ready.'}</SheetDescription>
      </SheetHeader>

      {item.href && (
        <Button asChild variant="outline" size="sm">
          <Link href={item.href} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" aria-hidden />
            {item.hrefLabel || 'Open page'}
          </Link>
        </Button>
      )}

      {needsReview && reviewLoading && !review && (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading...
        </p>
      )}

      {item.panel === 'recommendations' && (
        <RecommendationsEditor visit={visit} members={members} canManage={canManage} patchPacket={patchPacket} />
      )}
      {item.panel === 'agenda' && <AgendaEditor visit={visit} canManage={canManage} patchPacket={patchPacket} />}
      {item.panel === 'shepherding' && (
        <ShepherdingEditor visit={visit} members={members} canManage={canManage} setVisit={setVisit} />
      )}
      {item.panel === 'host' && <HostEditor visit={visit} canManage={canManage} patchPacket={patchPacket} />}
      {item.panel === 'meals' && <MealsEditor visit={visit} canManage={canManage} patchPacket={patchPacket} />}
      {item.panel === 'fieldMinistry' && (
        <FieldMinistryEditor visit={visit} members={members} canManage={canManage} patchPacket={patchPacket} />
      )}
      {item.panel === 'visitTerritories' && review && (
        <TerritoriesEditor visit={visit} review={review} canManage={canManage} patchPacket={patchPacket} />
      )}

      {item.panel === 's21' && review && <S21Review review={review} />}
      {item.panel === 's88' && review && <S88Review review={review} />}
      {item.panel === 'contacts' && review && <ContactsReview review={review} />}
      {item.panel === 's13' && review && <S13Review review={review} />}

      <Separator />
      <ReadinessControl item={item} visit={visit} canManage={canManage} patchPacket={patchPacket} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Ready / Not ready control (present on every item)
// ---------------------------------------------------------------------------

function ReadinessControl({ item, visit, canManage, patchPacket }: { item: ChecklistItemDef; visit: any; canManage: boolean; patchPacket: Props['patchPacket'] }) {
  const current = getChecklistStatus(visit, item.key)
  const savedNote = visit.packet?.checklist?.find((c: any) => c.key === item.key)?.note || ''
  const [note, setNote] = useState<string>(savedNote)
  const [saving, setSaving] = useState(false)

  const options: ChecklistStatus[] = item.naAllowed ? ['ready', 'not_ready', 'na'] : ['ready', 'not_ready']

  const set = async (status: ChecklistStatus) => {
    setSaving(true)
    try {
      await setChecklistStatus(visit._id, item.key, status, note)
      patchPacket((v) => {
        v.packet = v.packet || {}
        v.packet.checklist = v.packet.checklist || []
        const existing = v.packet.checklist.find((c: any) => c.key === item.key)
        if (existing) {
          existing.status = status
          existing.note = note
        } else {
          v.packet.checklist.push({ key: item.key, status, note })
        }
        return v
      })
      toast.success(`Marked ${STATUS_LABELS[status].toLowerCase()}`)
    } catch (e: any) {
      toast.error(e?.message || 'Could not update the status')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label className="text-sm">Status</Label>
        <Badge variant={current === 'ready' ? 'default' : 'outline'}>{STATUS_LABELS[current]}</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <Button
            key={opt}
            size="sm"
            variant={current === opt ? 'default' : 'outline'}
            disabled={!canManage || saving}
            onClick={() => set(opt)}
          >
            {STATUS_LABELS[opt]}
          </Button>
        ))}
      </div>
      <div className="space-y-1">
        <Label htmlFor="item-note" className="text-sm">Note</Label>
        <Textarea
          id="item-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={!canManage}
          placeholder="Optional note for the elders"
        />
        <p className="text-xs text-muted-foreground">The note is saved when you choose a status.</p>
      </div>
      {!canManage && (
        <p className="text-xs text-muted-foreground">You can view this item but not change it.</p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Editors
// ---------------------------------------------------------------------------

function SaveBar({ onSave, saving, canManage }: { onSave: () => void; saving: boolean; canManage: boolean }) {
  if (!canManage) return null
  return (
    <Button size="sm" onClick={onSave} disabled={saving}>
      {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
      Save
    </Button>
  )
}

function useSection(visit: any, section: string, patchPacket: Props['patchPacket']) {
  const [saving, setSaving] = useState(false)
  const save = async (data: any) => {
    setSaving(true)
    try {
      await savePacketSection(visit._id, section as any, data)
      patchPacket((v) => {
        v.packet = v.packet || {}
        v.packet[section] = data
        return v
      })
      toast.success('Saved')
    } catch (e: any) {
      toast.error(e?.message || 'Could not save')
    } finally {
      setSaving(false)
    }
  }
  return { saving, save }
}

function RecommendationsEditor({ visit, members, canManage, patchPacket }: { visit: any; members: Member[]; canManage: boolean; patchPacket: Props['patchPacket'] }) {
  const [rows, setRows] = useState<any[]>(visit.packet?.recommendations || [])
  const [s62, setS62] = useState(toInputDate(visit.packet?.s62SubmittedOn))
  const rec = useSection(visit, 'recommendations', patchPacket)
  const s62Section = useSection(visit, 's62SubmittedOn', patchPacket)

  const startDate = new Date(visit.visitDates.startDate)
  const deadline = new Date(startDate)
  deadline.setMonth(deadline.getMonth() - 1)
  const late = !s62 && rows.length > 0 && new Date() > deadline

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="s62">S-62 submitted on</Label>
        <div className="flex gap-2">
          <Input id="s62" type="date" value={s62} disabled={!canManage} onChange={(e) => setS62(e.target.value)} />
          <SaveBar canManage={canManage} saving={s62Section.saving} onSave={() => s62Section.save(s62 ? new Date(s62) : null)} />
        </div>
        <p className="text-xs text-muted-foreground">
          Due by {deadline.toLocaleDateString()} (one month before the visit).
        </p>
        {late && <p className="text-xs text-amber-600">The S-62 deadline has passed and no submission date is recorded.</p>}
      </div>

      {rows.map((r, i) => (
        <div key={r._id || i} className="border rounded-md p-3 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select
              className={selectClass}
              aria-label="Brother"
              disabled={!canManage}
              value={r.memberId || ''}
              onChange={(e) => {
                const m = members.find((x) => x._id === e.target.value)
                setRows(rows.map((x, j) => (j === i ? { ...x, memberId: m?._id, memberName: m?.fullName || '' } : x)))
              }}
            >
              <option value="">Select brother</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>{m.fullName}</option>
              ))}
            </select>
            <select
              className={selectClass}
              aria-label="Recommendation"
              disabled={!canManage}
              value={r.action}
              onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, action: e.target.value } : x)))}
            >
              {Object.entries(RECOMMENDATION_ACTIONS).map(([k, label]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Notes"
              aria-label="Notes"
              disabled={!canManage}
              value={r.notes || ''}
              onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, notes: e.target.value } : x)))}
            />
            {canManage && (
              <Button variant="ghost" size="icon" aria-label="Remove" onClick={() => setRows(rows.filter((_, j) => j !== i))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}

      {canManage && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setRows([...rows, { action: 'appoint_ms', memberName: '' }])}>
            <Plus className="h-4 w-4 mr-1" /> Add brother
          </Button>
          <SaveBar
            canManage={canManage}
            saving={rec.saving}
            onSave={() => {
              if (rows.some((r) => !r.memberName)) return toast.error('Select a brother for every row')
              rec.save(rows)
            }}
          />
        </div>
      )}
      {rows.length === 0 && <p className="text-sm text-muted-foreground">No brothers recommended.</p>}
      <p className="text-xs text-muted-foreground">
        The circuit overseer reads each brother's S-21 record. Share any pertinent history with him on Tuesday.
      </p>
    </div>
  )
}

function AgendaEditor({ visit, canManage, patchPacket }: { visit: any; canManage: boolean; patchPacket: Props['patchPacket'] }) {
  const [items, setItems] = useState<string[]>(visit.packet?.agendaItems || [])
  const { saving, save } = useSection(visit, 'agendaItems', patchPacket)
  return (
    <div className="space-y-3">
      {items.map((a, i) => (
        <div key={i} className="flex gap-2">
          <Input
            aria-label={`Agenda item ${i + 1}`}
            value={a}
            disabled={!canManage}
            onChange={(e) => setItems(items.map((x, j) => (j === i ? e.target.value : x)))}
          />
          {canManage && (
            <Button variant="ghost" size="icon" aria-label="Remove" onClick={() => setItems(items.filter((_, j) => j !== i))}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      {items.length === 0 && <p className="text-sm text-muted-foreground">No agenda items yet.</p>}
      {canManage && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setItems([...items, ''])}>
            <Plus className="h-4 w-4 mr-1" /> Add item
          </Button>
          <SaveBar canManage={canManage} saving={saving} onSave={() => save(items.map((i) => i.trim()).filter(Boolean))} />
        </div>
      )}
    </div>
  )
}

function ShepherdingEditor({ visit, members, canManage, setVisit }: { visit: any; members: Member[]; canManage: boolean; setVisit: (v: any) => void }) {
  const [rows, setRows] = useState<any[]>(
    (visit.shepherdingCalls || []).map((c: any) => ({ ...c, memberId: c.memberId?._id || c.memberId, date: toInputDate(c.date) }))
  )
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (rows.some((r) => !r.memberId || !r.date || !r.time || !r.purpose)) {
      return toast.error('Fill in the brother, date, time and purpose for every visit')
    }
    setSaving(true)
    try {
      await saveShepherdingCalls(visit._id, rows)
      setVisit({ ...visit, shepherdingCalls: rows.map((r) => ({ ...r, date: new Date(r.date).toISOString() })) })
      toast.success('Saved')
    } catch (e: any) {
      toast.error(e?.message || 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      {rows.map((r, i) => (
        <div key={r._id || i} className="border rounded-md p-3 space-y-2">
          <select
            className={selectClass}
            aria-label="Brother or sister"
            disabled={!canManage}
            value={r.memberId || ''}
            onChange={(e) => {
              const m = members.find((x) => x._id === e.target.value)
              setRows(rows.map((x, j) => (j === i ? { ...x, memberId: m?._id, memberName: m?.fullName || '' } : x)))
            }}
          >
            <option value="">Select publisher</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>{m.fullName}</option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <Input type="date" aria-label="Date" disabled={!canManage} value={r.date || ''} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, date: e.target.value } : x)))} />
            <Input type="time" aria-label="Time" disabled={!canManage} value={r.time || ''} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, time: e.target.value } : x)))} />
          </div>
          <Input placeholder="Purpose" aria-label="Purpose" disabled={!canManage} value={r.purpose || ''} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, purpose: e.target.value } : x)))} />
          <div className="flex items-center gap-2">
            <Input placeholder="Notes" aria-label="Notes" disabled={!canManage} value={r.notes || ''} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, notes: e.target.value } : x)))} />
            {canManage && (
              <Button variant="ghost" size="icon" aria-label="Remove" onClick={() => setRows(rows.filter((_, j) => j !== i))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={!!r.completed}
              disabled={!canManage}
              onCheckedChange={(v) => setRows(rows.map((x, j) => (j === i ? { ...x, completed: v === true } : x)))}
            />
            Visit completed
          </label>
        </div>
      ))}
      {rows.length === 0 && <p className="text-sm text-muted-foreground">No shepherding visits scheduled.</p>}
      {canManage && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setRows([...rows, { memberId: '', memberName: '', date: '', time: '', purpose: '', completed: false }])}>
            <Plus className="h-4 w-4 mr-1" /> Add visit
          </Button>
          <SaveBar canManage={canManage} saving={saving} onSave={save} />
        </div>
      )}
    </div>
  )
}

function HostEditor({ visit, canManage, patchPacket }: { visit: any; canManage: boolean; patchPacket: Props['patchPacket'] }) {
  const [host, setHost] = useState<any>(visit.packet?.host || {})
  const { saving, save } = useSection(visit, 'host', patchPacket)
  const field = (key: string, label: string, area = false) => (
    <div className="space-y-1">
      <Label htmlFor={`host-${key}`}>{label}</Label>
      {area ? (
        <Textarea id={`host-${key}`} disabled={!canManage} value={host[key] || ''} onChange={(e) => setHost({ ...host, [key]: e.target.value })} />
      ) : (
        <Input id={`host-${key}`} disabled={!canManage} value={host[key] || ''} onChange={(e) => setHost({ ...host, [key]: e.target.value })} />
      )}
    </div>
  )
  return (
    <div className="space-y-3">
      {field('name', 'Host name')}
      {field('phone', 'Phone')}
      {field('address', 'Address')}
      {field('notes', 'Notes', true)}
      <SaveBar canManage={canManage} saving={saving} onSave={() => save(host)} />
    </div>
  )
}

function MealsEditor({ visit, canManage, patchPacket }: { visit: any; canManage: boolean; patchPacket: Props['patchPacket'] }) {
  const [rows, setRows] = useState<any[]>((visit.packet?.meals || []).map((m: any) => ({ ...m, date: toInputDate(m.date) })))
  const { saving, save } = useSection(visit, 'meals', patchPacket)
  return (
    <div className="space-y-3">
      {rows.map((r, i) => (
        <div key={r._id || i} className="border rounded-md p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Input type="date" aria-label="Date" disabled={!canManage} value={r.date || ''} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, date: e.target.value } : x)))} />
            <Input placeholder="Host name" aria-label="Host name" disabled={!canManage} value={r.hostName || ''} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, hostName: e.target.value } : x)))} />
          </div>
          <div className="flex gap-2">
            <Input placeholder="Phone" aria-label="Phone" disabled={!canManage} value={r.phone || ''} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, phone: e.target.value } : x)))} />
            <Input placeholder="Notes" aria-label="Notes" disabled={!canManage} value={r.notes || ''} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, notes: e.target.value } : x)))} />
            {canManage && (
              <Button variant="ghost" size="icon" aria-label="Remove" onClick={() => setRows(rows.filter((_, j) => j !== i))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
      {rows.length === 0 && <p className="text-sm text-muted-foreground">No meal hosts yet.</p>}
      {canManage && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setRows([...rows, { date: '', hostName: '', phone: '' }])}>
            <Plus className="h-4 w-4 mr-1" /> Add meal host
          </Button>
          <SaveBar
            canManage={canManage}
            saving={saving}
            onSave={() => {
              if (rows.some((r) => !r.hostName)) return toast.error('Enter a host name for every row')
              save(rows.map((r) => ({ ...r, date: r.date ? new Date(r.date) : undefined })))
            }}
          />
        </div>
      )}
    </div>
  )
}

function FieldMinistryEditor({ visit, members, canManage, patchPacket }: { visit: any; members: Member[]; canManage: boolean; patchPacket: Props['patchPacket'] }) {
  const [rows, setRows] = useState<any[]>((visit.packet?.fieldMinistry || []).map((m: any) => ({ ...m, date: toInputDate(m.date) })))
  const { saving, save } = useSection(visit, 'fieldMinistry', patchPacket)
  return (
    <div className="space-y-3">
      {rows.map((r, i) => (
        <div key={r._id || i} className="border rounded-md p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Input type="date" aria-label="Date" disabled={!canManage} value={r.date || ''} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, date: e.target.value } : x)))} />
            <Input placeholder="Period (e.g. Morning)" aria-label="Period" disabled={!canManage} value={r.period || ''} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, period: e.target.value } : x)))} />
          </div>
          <select
            className={selectClass}
            aria-label="Partner"
            disabled={!canManage}
            value={r.memberId || ''}
            onChange={(e) => {
              const m = members.find((x) => x._id === e.target.value)
              setRows(rows.map((x, j) => (j === i ? { ...x, memberId: m?._id, partnerName: m?.fullName || '' } : x)))
            }}
          >
            <option value="">Select publisher</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>{m.fullName}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <Input placeholder="Notes" aria-label="Notes" disabled={!canManage} value={r.notes || ''} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, notes: e.target.value } : x)))} />
            {canManage && (
              <Button variant="ghost" size="icon" aria-label="Remove" onClick={() => setRows(rows.filter((_, j) => j !== i))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
      {rows.length === 0 && <p className="text-sm text-muted-foreground">Nobody scheduled yet.</p>}
      {canManage && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setRows([...rows, { date: '', period: '', partnerName: '' }])}>
            <Plus className="h-4 w-4 mr-1" /> Add partner
          </Button>
          <SaveBar
            canManage={canManage}
            saving={saving}
            onSave={() => {
              if (rows.some((r) => !r.partnerName)) return toast.error('Select a publisher for every row')
              save(rows.map((r) => ({ ...r, date: r.date ? new Date(r.date) : undefined })))
            }}
          />
        </div>
      )}
    </div>
  )
}

function TerritoriesEditor({ visit, review, canManage, patchPacket }: { visit: any; review: any; canManage: boolean; patchPacket: Props['patchPacket'] }) {
  const [selected, setSelected] = useState<string[]>((visit.packet?.visitTerritories || []).map((t: any) => t.territoryId))
  const [filter, setFilter] = useState('')
  const { saving, save } = useSection(visit, 'visitTerritories', patchPacket)
  const list = review.territories.filter((t: any) =>
    `${t.number} ${t.name}`.toLowerCase().includes(filter.toLowerCase())
  )
  return (
    <div className="space-y-3">
      <Input placeholder="Search territories" aria-label="Search territories" value={filter} onChange={(e) => setFilter(e.target.value)} />
      <p className="text-sm text-muted-foreground">{selected.length} selected</p>
      <div className="max-h-80 overflow-y-auto border rounded-md divide-y">
        {list.map((t: any) => (
          <label key={t._id} className="flex items-center gap-3 px-3 py-2 text-sm">
            <Checkbox
              checked={selected.includes(t._id)}
              disabled={!canManage}
              onCheckedChange={(v) =>
                setSelected(v === true ? [...selected, t._id] : selected.filter((id) => id !== t._id))
              }
            />
            <span className="flex-1">{t.number} - {t.name}</span>
            <span className="text-xs text-muted-foreground">
              {t.lastWorked ? `Last worked ${fmt(t.lastWorked)}` : 'Never recorded'}
            </span>
          </label>
        ))}
        {list.length === 0 && <p className="p-3 text-sm text-muted-foreground">No territories found.</p>}
      </div>
      <SaveBar
        canManage={canManage}
        saving={saving}
        onSave={() =>
          save(
            review.territories
              .filter((t: any) => selected.includes(t._id))
              .map((t: any) => ({ territoryId: t._id, number: t.number, name: t.name }))
          )
        }
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Review panels (live data from existing modules)
// ---------------------------------------------------------------------------

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border rounded-md p-3">
      <div className="text-xl font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

function S21Review({ review }: { review: any }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Stat label="Publishers" value={review.s21.total} />
        <Stat label="Baptized" value={review.s21.baptized} />
        <Stat label="Regular pioneers" value={review.s21.regularPioneers} />
        <Stat label={`Reported in ${review.serviceYear}`} value={review.s21.withReports} />
      </div>
      <p className="text-sm text-muted-foreground">
        Open Publisher Records to review or print each publisher's S-21 card. Check that every record is complete before marking this ready.
      </p>
    </div>
  )
}

function S88Review({ review }: { review: any }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Midweek average" value={review.s88.midweekAverage} />
        <Stat label="Weekend average" value={review.s88.weekendAverage} />
        <Stat label={`Meetings (${review.serviceYear})`} value={review.s88.meetings} />
      </div>
      <div className="max-h-72 overflow-y-auto border rounded-md">
        <table className="w-full text-sm">
          <thead className="bg-muted sticky top-0">
            <tr>
              <th className="text-left p-2">Date</th>
              <th className="text-left p-2">Meeting</th>
              <th className="text-right p-2">Attendance</th>
            </tr>
          </thead>
          <tbody>
            {review.s88.rows.map((r: any, i: number) => (
              <tr key={i} className="border-t">
                <td className="p-2">{fmt(r.date)}</td>
                <td className="p-2">{r.meetingType}</td>
                <td className="p-2 text-right">{r.attendance}</td>
              </tr>
            ))}
            {review.s88.rows.length === 0 && (
              <tr><td colSpan={3} className="p-3 text-muted-foreground">No attendance recorded this service year.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ContactsReview({ review }: { review: any }) {
  const { list, missingPhone, missingEmergency } = review.contacts
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Publishers" value={list.length} />
        <Stat label="Missing phone" value={missingPhone} />
        <Stat label="Missing emergency contact" value={missingEmergency} />
      </div>
      {(missingPhone > 0 || missingEmergency > 0) && (
        <p className="text-sm text-amber-600">
          Contact and emergency information should be complete for every publisher (disaster preparedness).
        </p>
      )}
      <div className="max-h-80 overflow-y-auto border rounded-md">
        <table className="w-full text-sm">
          <thead className="bg-muted sticky top-0">
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Phone</th>
              <th className="text-left p-2">Emergency</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c: any) => (
              <tr key={c._id} className="border-t">
                <td className="p-2">{c.fullName}</td>
                <td className={`p-2 ${c.phone ? '' : 'text-amber-600'}`}>{c.phone || 'Missing'}</td>
                <td className={`p-2 ${c.emergency ? '' : 'text-amber-600'}`}>
                  {c.emergency ? `${c.emergency.name} ${c.emergency.phone}` : 'Missing'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function S13Review({ review }: { review: any }) {
  return (
    <div className="space-y-3">
      <div className="max-h-72 overflow-y-auto border rounded-md">
        <table className="w-full text-sm">
          <thead className="bg-muted sticky top-0">
            <tr>
              <th className="text-left p-2">Territory</th>
              <th className="text-left p-2">Publisher</th>
              <th className="text-left p-2">Assigned</th>
              <th className="text-left p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {review.s13.map((a: any, i: number) => (
              <tr key={i} className="border-t">
                <td className="p-2">{a.territory}</td>
                <td className="p-2">{a.publisher}</td>
                <td className="p-2">{fmt(a.assignedDate)}</td>
                <td className="p-2">{a.status}</td>
              </tr>
            ))}
            {review.s13.length === 0 && (
              <tr><td colSpan={4} className="p-3 text-muted-foreground">No territories are currently assigned.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-muted-foreground">
        Open Territory Assignments for the full assignment history that makes up the S-13.
      </p>
    </div>
  )
}
