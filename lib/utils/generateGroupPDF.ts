import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

type MemberNeedingHelp = {
    _id: string
    fullName: string
    phone: string
    reportedMonths: number
    monthsWithStudents: number
    category: 'consistently-not-reporting' | 'no-bible-students' | 'irregular'
    helpReason: string
    privileges: Array<{ _id: string; name: string }>
}

type CategoryGroup = {
    category: string
    label: string
    members: MemberNeedingHelp[]
    color: string
}

type GroupData = {
    groupName: string
    categories: CategoryGroup[]
    totalMembers: number
}

const CATEGORY_COLORS: Record<string, [number, number, number]> = {
    'consistently-not-reporting': [220, 38, 38],   // red
    'no-bible-students': [217, 119, 6],             // amber
    'irregular': [234, 88, 12],                     // orange
}

export function generateGroupPDF(group: GroupData, month: string) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const generatedAt = new Date().toLocaleDateString('en-US', { dateStyle: 'full' })

    // ── Header ──────────────────────────────────────────────────────────────
    doc.setFillColor(31, 41, 55) // gray-800
    doc.rect(0, 0, pageWidth, 28, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Field Service Help Needed', pageWidth / 2, 11, { align: 'center' })

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`${group.groupName}  •  ${month}`, pageWidth / 2, 18, { align: 'center' })
    doc.text(`Generated: ${generatedAt}  •  Based on 6-month history`, pageWidth / 2, 24, { align: 'center' })

    // ── Summary bar ─────────────────────────────────────────────────────────
    doc.setFillColor(243, 244, 246) // gray-100
    doc.rect(10, 32, pageWidth - 20, 14, 'F')
    doc.setTextColor(55, 65, 81)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(`Total publishers needing attention: ${group.totalMembers}`, 14, 40)

    const catSummary = group.categories.map(c => `${c.members.length} ${c.label}`).join('   |   ')
    doc.setFont('helvetica', 'normal')
    doc.text(catSummary, 14, 44)

    let yPos = 52

    // ── Categories ──────────────────────────────────────────────────────────
    group.categories.forEach((cat) => {
        const rgb = CATEGORY_COLORS[cat.category] || [100, 100, 100]

        // Category header
        doc.setFillColor(...rgb)
        doc.rect(10, yPos, pageWidth - 20, 8, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text(`${cat.label}  (${cat.members.length})`, 14, yPos + 5.5)
        yPos += 10

        // Table
        autoTable(doc, {
            startY: yPos,
            margin: { left: 10, right: 10 },
            head: [['#', 'Name', 'Phone', 'Reported', 'W/ Studies', 'Privilege', 'Notes']],
            body: cat.members.map((m, i) => [
                i + 1,
                m.fullName,
                m.phone || '—',
                `${m.reportedMonths}/6`,
                `${m.monthsWithStudents}/6`,
                m.privileges.length > 0 ? m.privileges[0].name : '—',
                '',
            ]),
            headStyles: {
                fillColor: [55, 65, 81],
                textColor: 255,
                fontSize: 8,
                fontStyle: 'bold',
                cellPadding: 2,
            },
            bodyStyles: {
                fontSize: 8,
                cellPadding: 2,
                textColor: [31, 41, 55],
            },
            alternateRowStyles: { fillColor: [249, 250, 251] },
            columnStyles: {
                0: { cellWidth: 8 },
                1: { cellWidth: 45 },
                2: { cellWidth: 28 },
                3: { cellWidth: 18, halign: 'center' },
                4: { cellWidth: 18, halign: 'center' },
                5: { cellWidth: 28 },
                6: { cellWidth: 'auto' },
            },
            didDrawPage: () => {
                // Re-draw header on new pages
                doc.setFillColor(31, 41, 55)
                doc.rect(0, 0, pageWidth, 12, 'F')
                doc.setTextColor(255, 255, 255)
                doc.setFontSize(8)
                doc.setFont('helvetica', 'normal')
                doc.text(`Field Service Help — ${group.groupName} — ${month}`, pageWidth / 2, 8, { align: 'center' })
            },
        })

        yPos = (doc as any).lastAutoTable.finalY + 8
    })

    // ── Overseer sign-off ────────────────────────────────────────────────────
    if (yPos > 250) {
        doc.addPage()
        yPos = 20
    }

    yPos += 6
    doc.setDrawColor(156, 163, 175)
    doc.setTextColor(55, 65, 81)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')

    doc.text('Group Overseer:', 14, yPos)
    doc.line(14, yPos + 8, 90, yPos + 8)

    doc.text('Date Reviewed:', pageWidth - 80, yPos)
    doc.line(pageWidth - 80, yPos + 8, pageWidth - 10, yPos + 8)

    // ── Footer ───────────────────────────────────────────────────────────────
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(7)
        doc.setTextColor(156, 163, 175)
        doc.setFont('helvetica', 'normal')
        doc.text(
            'This report is confidential and for congregation use only. Please follow up lovingly.',
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 6,
            { align: 'center' }
        )
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, doc.internal.pageSize.getHeight() - 6, { align: 'right' })
    }

    const safeName = group.groupName.replace(/[^a-z0-9]/gi, '_')
    doc.save(`Field_Service_Help_${safeName}_${month.replace(' ', '_')}.pdf`)
}
