"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Users, Crown, Shield, Award, ChevronRight, Mail, Phone } from 'lucide-react'

interface Member {
    _id: string
    fullName: string
    email?: string
    phone: string
    groupId?: { name: string }
    baptizedDate?: string
}

interface AnalyticsCategory {
    name: string
    count: number
    members: Member[]
}

interface AnalyticsData {
    totalMembers: number
    roles: AnalyticsCategory[]
    privileges: AnalyticsCategory[]
    baptizedOneYearAgo: Member[]
}

interface MemberAnalyticsProps {
    data: AnalyticsData
}

export function MemberAnalytics({ data }: MemberAnalyticsProps) {
    const [selectedCategory, setSelectedCategory] = useState<AnalyticsCategory | null>(null)
    const [showMembersDialog, setShowMembersDialog] = useState(false)

    const handleCategoryClick = (category: AnalyticsCategory) => {
        if (category.count > 0) {
            setSelectedCategory(category)
            setShowMembersDialog(true)
        }
    }

    const getRoleIcon = (roleName: string) => {
        switch (roleName.toLowerCase()) {
            case 'elders': return <Crown className="h-5 w-5" />
            case 'ministerial servants': return <Shield className="h-5 w-5" />
            case 'pioneers': return <Award className="h-5 w-5" />
            default: return <Users className="h-5 w-5" />
        }
    }

    return (
        <div className="space-y-6">
            {/* Total Members */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Total Members
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{data.totalMembers}</div>
                    <p className="text-muted-foreground">Active congregation members</p>
                </CardContent>
            </Card>

            {/* Roles */}
            <Card>
                <CardHeader>
                    <CardTitle>Members by Role</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {data.roles.map((role) => (
                            <div
                                key={role.name}
                                className={`p-4 border rounded-lg transition-colors ${
                                    role.count > 0 
                                        ? 'cursor-pointer hover:bg-muted/50' 
                                        : 'opacity-50'
                                }`}
                                onClick={() => handleCategoryClick(role)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {getRoleIcon(role.name)}
                                        <span className="font-medium">{role.name}</span>
                                    </div>
                                    {role.count > 0 && <ChevronRight className="h-4 w-4" />}
                                </div>
                                <div className="text-2xl font-bold mt-2">{role.count}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Privileges */}
            <Card>
                <CardHeader>
                    <CardTitle>Members by Privileges</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.privileges.map((privilege) => (
                            <div
                                key={privilege.name}
                                className={`p-4 border rounded-lg transition-colors ${
                                    privilege.count > 0 
                                        ? 'cursor-pointer hover:bg-muted/50' 
                                        : 'opacity-50'
                                }`}
                                onClick={() => handleCategoryClick(privilege)}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">{privilege.name}</span>
                                    {privilege.count > 0 && <ChevronRight className="h-4 w-4" />}
                                </div>
                                <div className="text-2xl font-bold mt-2">{privilege.count}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Baptized One Year Ago */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-blue-600" />
                        Baptism Anniversaries (1 Year)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {data.baptizedOneYearAgo.length > 0 ? (
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground mb-4">
                                Members celebrating their 1-year baptism anniversary (within 30 days)
                            </p>
                            {data.baptizedOneYearAgo.map((member) => (
                                <div key={member._id} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                                    <div>
                                        <p className="font-medium">{member.fullName}</p>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            {member.email && (
                                                <div className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3" />
                                                    {member.email}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1">
                                                <Phone className="h-3 w-3" />
                                                {member.phone}
                                            </div>
                                        </div>
                                        {member.groupId && (
                                            <Badge variant="outline" className="mt-1">
                                                {member.groupId.name}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <Badge className="bg-blue-600">
                                            {member.baptizedDate ? new Date(member.baptizedDate).toLocaleDateString() : 'N/A'}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">
                            No baptism anniversaries in the next 30 days
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Members Dialog */}
            <Dialog open={showMembersDialog} onOpenChange={setShowMembersDialog}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedCategory?.name} ({selectedCategory?.count})
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        {selectedCategory?.members.map((member) => (
                            <div key={member._id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="font-medium">{member.fullName}</p>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        {member.email && (
                                            <div className="flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                {member.email}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <Phone className="h-3 w-3" />
                                            {member.phone}
                                        </div>
                                    </div>
                                    {member.groupId && (
                                        <Badge variant="outline" className="mt-1">
                                            {member.groupId.name}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}