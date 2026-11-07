import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  CHECKLIST_ITEMS,
  QUESTIONNAIRE,
  RECOMMENDATION_ACTIONS,
  SECTION_LABELS,
  STATUS_LABELS,
  type ChecklistSection,
  type ChecklistStatus,
} from '@/lib/constants/co-visit-checklist'

const fmt = (d?: string | Date | null) => (d ? new Date(d).toLocaleDateString() : '')

export function getChecklistStatus(visit: any, key: string): ChecklistStatus {
  return visit.packet?.checklist?.find((c: any) => c.key === key)?.status || 'not_ready'
}

export function getAnswer(visit: any, key: string): string {
  return visit.packet?.questionnaire?.find((q: any) => q.key === key)?.answer || ''
}

/**
 * Builds the full CO packet PDF: the S-61 checklist and questionnaire, the details
 * the elders fill in, and printouts of the live data (attendance, contacts, territories).
 */
export function exportPacketPdf(visit: any, review: any) {
  const doc = new jsPDF()
  const packet = visit.packet || {}
  const pageHeight = doc.internal.pageSize.getHeight()

  const lastY = () => (doc as any).lastAutoTable?.finalY ?? 30
  let y = 15
  const heading = (text: string) => {
    if (y > pageHeight - 40) {
      doc.addPage()
      y = 15
    }
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text(text, 14, y)
    doc.setFont('helvetica', 'normal')
    y += 4
  }
  const table = (opts: Parameters<typeof autoTable>[1]) => {
    autoTable(doc, { startY: y, styles: { fontSize: 8 }, headStyles: { fillColor: [59, 130, 246] }, ...opts })
    y = lastY() + 10
  }

  // Cover
  doc.setFontSize(18)
  doc.text('Information Needed for Visit of Circuit Overseer', 14, y)
  y += 8
  doc.setFontSize(10)
  doc.text('Suame Congregation', 14, y)
  y += 6
  doc.text(
    `Circuit overseer: ${visit.circuitOverseer?.name || ''}   Visit #${visit.visitNumber}   ${fmt(visit.visitDates?.startDate)} - ${fmt(visit.visitDates?.endDate)}`,
    14,
    y
  )
  y += 5
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, y)
  y += 10

  // Checklist
  const sections: ChecklistSection[] = ['coordinator', 'secretary', 'service_overseer']
  sections.forEach((section) => {
    heading(SECTION_LABELS[section])
    table({
      head: [['Item', 'Status']],
      body: CHECKLIST_ITEMS.filter((i) => i.section === section).map((i) => [
        i.label,
        STATUS_LABELS[getChecklistStatus(visit, i.key)],
      ]),
      columnStyles: { 1: { cellWidth: 30 } },
    })
  })

  // Questionnaire
  heading('Questions to answer (page 2 of S-61)')
  table({
    head: [['Question', 'Answer', 'Note']],
    body: QUESTIONNAIRE.map((q) => {
      const note = packet.questionnaire?.find((x: any) => x.key === q.key)?.note || ''
      return [q.text, getAnswer(visit, q.key) || '-', note]
    }),
    columnStyles: { 0: { cellWidth: 110 }, 1: { cellWidth: 15 } },
  })

  // Recommendations
  heading('Brothers recommended for appointment or deletion')
  if (packet.s62SubmittedOn) {
    doc.setFontSize(9)
    doc.text(`S-62 submitted on ${fmt(packet.s62SubmittedOn)}`, 14, y + 2)
    y += 6
  }
  table({
    head: [['Name', 'Recommendation', 'Notes']],
    body: (packet.recommendations || []).map((r: any) => [
      r.memberName,
      RECOMMENDATION_ACTIONS[r.action] || r.action,
      r.notes || '',
    ]),
  })

  // Agenda
  heading('Suggested agenda for the meeting with the elders')
  table({
    head: [['#', 'Item']],
    body: (packet.agendaItems || []).map((a: string, i: number) => [String(i + 1), a]),
    columnStyles: { 0: { cellWidth: 10 } },
  })

  // Shepherding
  heading('Shepherding visits')
  table({
    head: [['Name', 'Date', 'Time', 'Purpose', 'Notes']],
    body: (visit.shepherdingCalls || []).map((c: any) => [
      c.memberName,
      fmt(c.date),
      c.time || '',
      c.purpose || '',
      c.notes || '',
    ]),
  })

  // Host & meals
  heading("Circuit overseer's host")
  const h = packet.host || {}
  table({
    head: [['Name', 'Phone', 'Address', 'Notes']],
    body: h.name ? [[h.name, h.phone || '', h.address || '', h.notes || '']] : [],
  })

  heading('Midday meal hosts')
  table({
    head: [['Date', 'Host', 'Phone', 'Notes']],
    body: (packet.meals || []).map((m: any) => [fmt(m.date), m.hostName, m.phone || '', m.notes || '']),
  })

  // Field ministry
  heading('Field ministry with the circuit overseer and his wife')
  table({
    head: [['Date', 'Period', 'Partner', 'Notes']],
    body: (packet.fieldMinistry || []).map((f: any) => [fmt(f.date), f.period || '', f.partnerName, f.notes || '']),
  })

  heading('Territories available for the week')
  table({
    head: [['Number', 'Name']],
    body: (packet.visitTerritories || []).map((t: any) => [t.number, t.name]),
  })

  // Attachments from live data
  if (review) {
    doc.addPage()
    y = 15
    heading(`Meeting attendance (S-88 summary) - service year ${review.serviceYear}`)
    table({
      head: [['Midweek average', 'Weekend average', 'Meetings recorded']],
      body: [[String(review.s88.midweekAverage), String(review.s88.weekendAverage), String(review.s88.meetings)]],
    })
    table({
      head: [['Date', 'Meeting', 'Attendance']],
      body: review.s88.rows.map((r: any) => [fmt(r.date), r.meetingType, String(r.attendance)]),
    })

    heading('Territory assignments currently out (S-13 summary)')
    table({
      head: [['Territory', 'Publisher', 'Assigned', 'Due', 'Status']],
      body: review.s13.map((a: any) => [a.territory, a.publisher, fmt(a.assignedDate), fmt(a.dueDate), a.status]),
    })

    heading('Contact information for all publishers')
    table({
      head: [['Name', 'Group', 'Phone', 'Address', 'Emergency contact']],
      body: review.contacts.list.map((c: any) => [
        c.fullName,
        c.group,
        [c.phone, c.alternatePhone].filter(Boolean).join(' / '),
        c.address,
        c.emergency ? `${c.emergency.name} (${c.emergency.relationship}) ${c.emergency.phone}` : '',
      ]),
    })
  }

  const total = doc.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.text(`Page ${i} of ${total}`, 14, pageHeight - 8)
  }

  doc.save(`co-visit-packet-${visit.visitNumber}.pdf`)
}
