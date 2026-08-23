"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Download, FileSpreadsheet, FileText, MapPin, Search, Users } from 'lucide-react'
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

export function MemberLocationsClient({ members }: MemberLocationsClientProps) {
    const [searchQuery, setSearchQuery] = useState('')

    const filteredMembers = members.filter(member =>
        member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.location.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.groupId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getExportData = () => {
        return filteredMembers.map((member, index) => ({
            'No.': index + 1,
            'Full Name': member.fullName,
            'Phone': member.phone || '-',
            'Home Address': member.address || member.location.address || '-',
            'Role': member.role || '-',
            'Latitude': member.location.latitude,
            'Longitude': member.location.longitude,
            'Location Visible': member.location.isPublic ? 'Yes' : 'No',
            'Last Updated': member.location.lastUpdated
                ? new Date(member.location.lastUpdated).toLocaleDateString()
                : '-'
        }))
    }

    const exportToCSV = () => {
        const data = getExportData()
        const worksheet = XLSX.utils.json_to_sheet(data)
        const csv = XLSX.utils.sheet_to_csv(worksheet)
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        saveAs(blob, `member-locations-${new Date().toISOString().split('T')[0]}.csv`)
    }

    const exportToExcel = () => {
        const data = getExportData()
        const workbook = XLSX.utils.book_new()
        const worksheet = XLSX.utils.json_to_sheet(data)

        // Auto-size columns
        const colWidths = Object.keys(data[0] || {}).map(key => ({
            wch: Math.max(key.length, ...data.map(row => String(row[key as keyof typeof row] || '').length))
        }))
        worksheet['!cols'] = colWidths

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Member Locations')
        XLSX.writeFile(workbook, `member-locations-${new Date().toISOString().split('T')[0]}.xlsx`)
    }

    const exportToPDF = () => {
        const doc = new jsPDF({ orientation: 'landscape' })

        doc.setFontSize(16)
        doc.text('Member Locations - Suame Congregation', 14, 15)
        doc.setFontSize(10)
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 22)
        doc.text(`Total Members with Location: ${filteredMembers.length}`, 14, 28)

        const tableData = filteredMembers.map((member, index) => [
            index + 1,
            member.fullName,
            member.phone || '-',
            member.address || member.location.address || '-',
            member.location.latitude.toFixed(6),
            member.location.longitude.toFixed(6),
        ])

        autoTable(doc, {
            startY: 34,
            head: [['#', 'Full Name', 'Phone', 'Address', 'Latitude', 'Longitude']],
            body: tableData,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [59, 130, 246] },
        })

        doc.save(`member-locations-${new Date().toISOString().split('T')[0]}.pdf`)
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <MapPin className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{members.length}</p>
                                <p className="text-sm text-muted-foreground">Members with Location</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <Users className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {members.filter(m => m.location.isPublic).length}
                                </p>
                                <p className="text-sm text-muted-foreground">Public Locations</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                <MapPin className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {members.filter(m => !m.location.isPublic).length}
                                </p>
                                <p className="text-sm text-muted-foreground">Private Locations</p>
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
                                {filteredMembers.length} of {members.length} members shown
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

                    {/* Table */}
                    <div className="rounded-md border overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>Full Name</TableHead>
                                        <TableHead className="hidden md:table-cell">Phone</TableHead>
                                        <TableHead className="hidden lg:table-cell">Address</TableHead>
                                        <TableHead className="hidden sm:table-cell">Group</TableHead>
                                        <TableHead>Latitude</TableHead>
                                        <TableHead>Longitude</TableHead>
                                        <TableHead className="hidden md:table-cell">Visible</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredMembers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                                {searchQuery ? 'No members match your search.' : 'No members with location data found.'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredMembers.map((member, index) => (
                                            <TableRow key={member._id}>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {member.fullName}
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell text-sm">
                                                    {member.phone || '-'}
                                                </TableCell>
                                                <TableCell className="hidden lg:table-cell text-sm max-w-[200px] truncate">
                                                    {member.address || member.location.address || '-'}
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell text-sm">
                                                    {member.groupId?.name || '-'}
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    {member.location.latitude.toFixed(6)}
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    {member.location.longitude.toFixed(6)}
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <Badge variant={member.location.isPublic ? "default" : "secondary"} className="text-xs">
                                                        {member.location.isPublic ? 'Public' : 'Private'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
