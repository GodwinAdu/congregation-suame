"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Download, FileSpreadsheet, FileText, MapPin, Search, Users, Shield, Award, BookOpen } from 'lucide-react'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface MemberLocation {
    _id: string
    fullName: string
    phone: string
    address: string
    role: string
    privileges?: Array<{ _id: string; name: string }>
    groupId?: { _id: string; name: string }
    location: {
        latitude: number
        longitude: number
        address: string | null
        isPublic: boolean
        lastUpdated: string | null
    }
}

interface MemberLocationsClientProps {
    members: MemberLocation[]
}

function getCategory(member: MemberLocation): string {
    const privNames = member.privileges?.map(p => p.name.toLowerCase()) || []

    if (privNames.some(n => n.includes('elder'))) return 'Elder'
    if (privNames.some(n => n.includes('ministerial servant') || n.includes('ms'))) return 'Ministerial Servant'
    if (privNames.some(n => n.includes('pioneer') || n.includes('regular pioneer') || n.includes('special pioneer'))) return 'Pioneer'
    return 'Publisher'
}

const CATEGORY_ORDER = ['Elder', 'Ministerial Servant', 'Pioneer', 'Publisher']

function groupByCategory(members: MemberLocation[]): Record<string, MemberLocation[]> {
    const groups: Record<string, MemberLocation[]> = {}
    CATEGORY_ORDER.forEach(cat => { groups[cat] = [] })

    members.forEach(member => {
        const cat = getCategory(member)
        groups[cat].push(member)
    })

    return groups
}

export function MemberLocationsClient({ members }: MemberLocationsClientProps) {
    const [searchQuery, setSearchQuery] = useState('')

    const filteredMembers = members.filter(member =>
        member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.location.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.groupId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const grouped = groupByCategory(filteredMembers)

    const exportToCSV = () => {
        const rows: any[] = []
        let counter = 1

        CATEGORY_ORDER.forEach(category => {
            const categoryMembers = grouped[category]
            if (categoryMembers.length === 0) return

            // Section header row
            rows.push({ 'No.': '', 'Full Name': `--- ${category.toUpperCase()}S (${categoryMembers.length}) ---`, 'Phone': '', 'Home Address': '', 'Latitude': '', 'Longitude': '' })

            categoryMembers.forEach(member => {
                rows.push({
                    'No.': counter++,
                    'Full Name': member.fullName,
                    'Phone': member.phone || '-',
                    'Home Address': member.address || member.location.address || '-',
                    'Latitude': member.location.latitude,
                    'Longitude': member.location.longitude,
                })
            })

            // Empty row between groups
            rows.push({ 'No.': '', 'Full Name': '', 'Phone': '', 'Home Address': '', 'Latitude': '', 'Longitude': '' })
        })

        const worksheet = XLSX.utils.json_to_sheet(rows)
        const csv = XLSX.utils.sheet_to_csv(worksheet)
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        saveAs(blob, `member-locations-${new Date().toISOString().split('T')[0]}.csv`)
    }

    const exportToExcel = () => {
        const workbook = XLSX.utils.book_new()

        // Create one sheet per category
        CATEGORY_ORDER.forEach(category => {
            const categoryMembers = grouped[category]
            if (categoryMembers.length === 0) return

            const data = categoryMembers.map((member, index) => ({
                'No.': index + 1,
                'Full Name': member.fullName,
                'Phone': member.phone || '-',
                'Home Address': member.address || member.location.address || '-',
                'Latitude': member.location.latitude,
                'Longitude': member.location.longitude,
            }))

            const worksheet = XLSX.utils.json_to_sheet(data)
            const colWidths = Object.keys(data[0] || {}).map(key => ({
                wch: Math.max(key.length, ...data.map(row => String(row[key as keyof typeof row] || '').length))
            }))
            worksheet['!cols'] = colWidths

            // Sheet name max 31 chars
            const sheetName = category.length > 31 ? category.slice(0, 31) : category
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
        })

        XLSX.writeFile(workbook, `member-locations-${new Date().toISOString().split('T')[0]}.xlsx`)
    }

    const exportToPDF = () => {
        const doc = new jsPDF({ orientation: 'landscape' })

        doc.setFontSize(16)
        doc.text('Member Locations - Suame Congregation', 14, 15)
        doc.setFontSize(10)
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 22)
        doc.text(`Total Members with Location: ${filteredMembers.length}`, 14, 28)

        let startY = 34

        CATEGORY_ORDER.forEach((category, catIndex) => {
            const categoryMembers = grouped[category]
            if (categoryMembers.length === 0) return

            // Check if we need a new page
            if (startY > 170) {
                doc.addPage()
                startY = 15
            }

            // Category header
            doc.setFontSize(12)
            doc.setFont('helvetica', 'bold')
            doc.text(`${category}s (${categoryMembers.length})`, 14, startY)
            doc.setFont('helvetica', 'normal')
            startY += 4

            const tableData = categoryMembers.map((member, index) => [
                index + 1,
                member.fullName,
                member.phone || '-',
                member.address || member.location.address || '-',
                member.location.latitude.toFixed(6),
                member.location.longitude.toFixed(6),
            ])

            const colors: Record<string, number[]> = {
                'Elder': [59, 130, 246],
                'Ministerial Servant': [16, 185, 129],
                'Pioneer': [245, 158, 11],
                'Publisher': [107, 114, 128],
            }

            autoTable(doc, {
                startY,
                head: [['#', 'Full Name', 'Phone', 'Address', 'Latitude', 'Longitude']],
                body: tableData,
                styles: { fontSize: 8 },
                headStyles: { fillColor: colors[category] || [107, 114, 128] },
                margin: { left: 14 },
            })

            startY = (doc as any).lastAutoTable?.finalY + 10 || startY + 40
        })

        doc.save(`member-locations-${new Date().toISOString().split('T')[0]}.pdf`)
    }

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Elder': return <Shield className="h-4 w-4 text-blue-600" />
            case 'Ministerial Servant': return <Award className="h-4 w-4 text-green-600" />
            case 'Pioneer': return <BookOpen className="h-4 w-4 text-yellow-600" />
            default: return <Users className="h-4 w-4 text-gray-600" />
        }
    }

    const getCategoryCount = (category: string) => grouped[category]?.length || 0

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card>
                    <CardContent className="pt-4 pb-3 px-4">
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-blue-600" />
                            <div>
                                <p className="text-lg font-bold">{getCategoryCount('Elder')}</p>
                                <p className="text-xs text-muted-foreground">Elders</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 pb-3 px-4">
                        <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-green-600" />
                            <div>
                                <p className="text-lg font-bold">{getCategoryCount('Ministerial Servant')}</p>
                                <p className="text-xs text-muted-foreground">Min. Servants</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 pb-3 px-4">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-yellow-600" />
                            <div>
                                <p className="text-lg font-bold">{getCategoryCount('Pioneer')}</p>
                                <p className="text-xs text-muted-foreground">Pioneers</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 pb-3 px-4">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-600" />
                            <div>
                                <p className="text-lg font-bold">{getCategoryCount('Publisher')}</p>
                                <p className="text-xs text-muted-foreground">Publishers</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                All Member Locations
                            </CardTitle>
                            <CardDescription>
                                {filteredMembers.length} members grouped by privilege
                            </CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" onClick={exportToCSV}>
                                <Download className="h-4 w-4 mr-1.5" />
                                CSV
                            </Button>
                            <Button variant="outline" size="sm" onClick={exportToExcel}>
                                <FileSpreadsheet className="h-4 w-4 mr-1.5" />
                                Excel
                            </Button>
                            <Button variant="outline" size="sm" onClick={exportToPDF}>
                                <FileText className="h-4 w-4 mr-1.5" />
                                PDF
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Search */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, address, or group..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Grouped Tables */}
                    <div className="space-y-6">
                        {CATEGORY_ORDER.map(category => {
                            const categoryMembers = grouped[category]
                            if (categoryMembers.length === 0) return null

                            return (
                                <div key={category}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {getCategoryIcon(category)}
                                        <h3 className="font-semibold text-sm">{category}s</h3>
                                        <Badge variant="secondary" className="text-xs">{categoryMembers.length}</Badge>
                                    </div>
                                    <div className="rounded-md border overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-10">#</TableHead>
                                                        <TableHead>Full Name</TableHead>
                                                        <TableHead className="hidden md:table-cell">Phone</TableHead>
                                                        <TableHead className="hidden lg:table-cell">Address</TableHead>
                                                        <TableHead>Latitude</TableHead>
                                                        <TableHead>Longitude</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {categoryMembers.map((member, index) => (
                                                        <TableRow key={member._id}>
                                                            <TableCell className="text-muted-foreground text-sm">{index + 1}</TableCell>
                                                            <TableCell className="font-medium">{member.fullName}</TableCell>
                                                            <TableCell className="hidden md:table-cell text-sm">{member.phone || '-'}</TableCell>
                                                            <TableCell className="hidden lg:table-cell text-sm max-w-[200px] truncate">
                                                                {member.address || member.location.address || '-'}
                                                            </TableCell>
                                                            <TableCell className="font-mono text-sm">{member.location.latitude.toFixed(6)}</TableCell>
                                                            <TableCell className="font-mono text-sm">{member.location.longitude.toFixed(6)}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
