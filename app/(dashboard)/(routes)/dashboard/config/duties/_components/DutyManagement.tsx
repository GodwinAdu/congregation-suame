"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
    Award, 
    Users, 
    Mic, 
    BookOpen, 
    Settings, 
    Star,
    RefreshCw,
    CheckCircle,
    AlertCircle
} from 'lucide-react'
import { getAllAvailableDuties, getMembersWithDuties } from '@/lib/actions/duty.actions'

const categoryIcons = {
    midweek_meeting: Mic,
    weekend_meeting: BookOpen,
    field_service: Users,
    administrative: Settings,
    special_events: Star
}

const categoryColors = {
    midweek_meeting: "bg-blue-100 text-blue-800",
    weekend_meeting: "bg-purple-100 text-purple-800", 
    field_service: "bg-green-100 text-green-800",
    administrative: "bg-orange-100 text-orange-800",
    special_events: "bg-red-100 text-red-800"
}

export default function DutyManagement() {
    const [duties, setDuties] = useState<any[]>([])
    const [members, setMembers] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [initializing, setInitializing] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [dutiesResult, membersResult] = await Promise.all([
                getAllAvailableDuties(),
                getMembersWithDuties()
            ])
            
            // Convert duties object to array
            const dutiesArray = Object.entries(dutiesResult).flatMap(([category, duties]) => 
                (duties as string[]).map(name => ({ name, category }))
            )
            setDuties(dutiesArray)
            setMembers(membersResult)
        } catch (error) {
            console.error('Error fetching data:', error)
            toast.error('Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    const handleInitializeDuties = async () => {
        setInitializing(true)
        try {
            toast.success('Duties are already available')
            fetchData()
        } catch (error) {
            console.error('Error initializing duties:', error)
            toast.error('Failed to initialize duties')
        } finally {
            setInitializing(false)
        }
    }

    const groupedDuties = duties.reduce((acc, duty) => {
        if (!acc[duty.category]) acc[duty.category] = []
        acc[duty.category].push(duty)
        return acc
    }, {} as Record<string, any[]>)

    const getMemberDutyCount = (memberId: string) => {
        const member = members.find(m => m._id === memberId)
        return member?.duties?.length || 0
    }

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Duty Management System
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div>
                            <p className="text-muted-foreground">
                                Manage congregation duties and member assignments
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                                <Badge variant="outline">
                                    {duties.length} Total Duties
                                </Badge>
                                <Badge variant="outline">
                                    {members.filter(m => m.duties?.length > 0).length} Members with Duties
                                </Badge>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={fetchData}
                                variant="outline"
                                disabled={loading}
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <Button
                                onClick={handleInitializeDuties}
                                disabled={initializing || duties.length > 0}
                            >
                                <Award className="h-4 w-4 mr-2" />
                                {initializing ? 'Initializing...' : 'Initialize Duties'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {duties.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Duties Configured</h3>
                        <p className="text-muted-foreground mb-4">
                            Initialize the default congregation duties to get started
                        </p>
                        <Button onClick={handleInitializeDuties} disabled={initializing}>
                            <Award className="h-4 w-4 mr-2" />
                            {initializing ? 'Initializing...' : 'Initialize Default Duties'}
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Duties by Category */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Duties by Category</h3>
                        {Object.entries(groupedDuties).map(([category, categoryDuties]) => {
                            const IconComponent = categoryIcons[category as keyof typeof categoryIcons]
                            const duties = categoryDuties as any[]
                            return (
                                <Card key={category}>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <IconComponent className="h-4 w-4" />
                                            {category.replace('_', ' ').toUpperCase()}
                                            <Badge variant="outline" className="ml-auto">
                                                {duties.length}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="space-y-2">
                                            {duties.map((duty, index) => (
                                                <div key={`${duty.name}-${index}`} className="p-3 rounded-lg border">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h4 className="font-medium text-sm">{duty.name}</h4>
                                                            <Badge className={categoryColors[category as keyof typeof categoryColors]} size="sm">
                                                                {category.replace('_', ' ')}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>

                    {/* Members with Duties */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Members with Duties</h3>
                        <Card>
                            <CardContent className="p-4">
                                <div className="space-y-3">
                                    {members
                                        .filter(member => member.duties?.length > 0)
                                        .sort((a, b) => (b.duties?.length || 0) - (a.duties?.length || 0))
                                        .map((member) => (
                                            <div key={member._id} className="flex items-center justify-between p-3 rounded-lg border">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-sm">{member.fullName}</h4>
                                                    <p className="text-xs text-muted-foreground">
                                                        {member.role} • {member.groupId?.name || 'No Group'}
                                                    </p>
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {member.duties?.slice(0, 3).map((duty: any) => (
                                                            <Badge key={duty._id} variant="outline" className="text-xs">
                                                                {duty.name}
                                                            </Badge>
                                                        ))}
                                                        {member.duties?.length > 3 && (
                                                            <Badge variant="outline" className="text-xs">
                                                                +{member.duties.length - 3} more
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <Badge className="bg-blue-100 text-blue-800">
                                                    {member.duties?.length || 0} duties
                                                </Badge>
                                            </div>
                                        ))}
                                    
                                    {members.filter(member => member.duties?.length > 0).length === 0 && (
                                        <div className="text-center py-8">
                                            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <p className="text-muted-foreground">No members have been assigned duties yet</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                    <div className="text-2xl font-bold">
                                        {members.filter(m => m.duties?.length > 0).length}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Members with Duties
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <AlertCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                                    <div className="text-2xl font-bold">
                                        {members.filter(m => !m.duties || m.duties.length === 0).length}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Members without Duties
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}