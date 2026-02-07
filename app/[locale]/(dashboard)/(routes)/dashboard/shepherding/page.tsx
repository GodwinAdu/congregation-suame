"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Calendar, AlertTriangle, Users, Phone, MapPin, Clock, RefreshCw } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ShepherdingCallModal } from './_components/ShepherdingCallModal'
import {
    getShepherdingCalls,
    getOverdueFollowUps,
    getMembersNeedingShepherding,
    getEldersAndMS,
    getShepherdingStats,
    deleteShepherdingCall
} from '@/lib/actions/shepherding.actions'
import { fetchAllMembers } from '@/lib/actions/user.actions'
import { format } from 'date-fns'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

export default function ShepherdingPage() {
    const [loading, setLoading] = useState(false)
    const [calls, setCalls] = useState<any[]>([])
    const [overdueFollowUps, setOverdueFollowUps] = useState<any[]>([])
    const [membersNeeding, setMembersNeeding] = useState<any[]>([])
    const [stats, setStats] = useState<any>(null)
    const [members, setMembers] = useState<any[]>([])
    const [shepherds, setShepherds] = useState<any[]>([])
    const [showModal, setShowModal] = useState(false)
    const [selectedCall, setSelectedCall] = useState<any>(null)
    const [deleteDialog, setDeleteDialog] = useState<{open: boolean, callId: string}>({open: false, callId: ''})

    const fetchData = async () => {
        setLoading(true)
        try {
            const [callsData, followUpsData, needingData, statsData, membersData, shepherdsData] = await Promise.all([
                getShepherdingCalls(),
                getOverdueFollowUps(),
                getMembersNeedingShepherding(),
                getShepherdingStats(),
                fetchAllMembers(),
                getEldersAndMS()
            ])
            setCalls(callsData)
            setOverdueFollowUps(followUpsData)
            setMembersNeeding(needingData)
            setStats(statsData)
            setMembers(membersData)
            setShepherds(shepherdsData)
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleDelete = async () => {
        try {
            await deleteShepherdingCall(deleteDialog.callId)
            toast.success("Shepherding call deleted successfully")
            setDeleteDialog({open: false, callId: ''})
            fetchData()
        } catch (error: any) {
            toast.error(error.message || "Failed to delete shepherding call")
        }
    }

    const StatCard = ({ title, value, icon: Icon, color }: any) => (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">{title}</p>
                        <p className="text-2xl font-bold">{value}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${color}`} />
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Shepherding Calls</h1>
                    <p className="text-muted-foreground">Track and manage shepherding visits</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchData} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button onClick={() => { setSelectedCall(null); setShowModal(true) }}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Call
                    </Button>
                </div>
            </div>

            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard title="Total Calls" value={stats.total} icon={Users} color="text-blue-600" />
                    <StatCard title="Completed" value={stats.completed} icon={Calendar} color="text-green-600" />
                    <StatCard title="Scheduled" value={stats.scheduled} icon={Clock} color="text-orange-600" />
                    <StatCard title="Follow-ups Needed" value={stats.followUpNeeded} icon={AlertTriangle} color="text-red-600" />
                </div>
            )}

            <Tabs defaultValue="calls">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="calls">All Calls ({calls.length})</TabsTrigger>
                    <TabsTrigger value="followups">Overdue Follow-ups ({overdueFollowUps.length})</TabsTrigger>
                    <TabsTrigger value="needing">Need Visit ({membersNeeding.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="calls" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Shepherding Calls</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {calls.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">No shepherding calls recorded</p>
                                ) : (
                                    calls.map(call => (
                                        <Card key={call._id}>
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-medium">{call.memberId?.fullName}</h4>
                                                            <Badge variant={
                                                                call.status === 'completed' ? 'default' :
                                                                call.status === 'scheduled' ? 'secondary' :
                                                                'outline'
                                                            }>
                                                                {call.status}
                                                            </Badge>
                                                            {call.isConfidential && (
                                                                <Badge variant="destructive">Confidential</Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-4 text-sm text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {format(new Date(call.visitDate), 'MMM dd, yyyy')}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Users className="h-3 w-3" />
                                                                {call.shepherds.map((s: any) => s.fullName).join(', ')}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="h-3 w-3" />
                                                                {call.location}
                                                            </span>
                                                        </div>
                                                        {call.followUpNeeded && (
                                                            <Badge variant="outline" className="gap-1">
                                                                <AlertTriangle className="h-3 w-3" />
                                                                Follow-up: {format(new Date(call.followUpDate), 'MMM dd')}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => { setSelectedCall(call); setShowModal(true) }}>
                                                            Edit
                                                        </Button>
                                                        <Button size="sm" variant="ghost" onClick={() => setDeleteDialog({open: true, callId: call._id})}>
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="followups" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Overdue Follow-ups</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {overdueFollowUps.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">No overdue follow-ups</p>
                                ) : (
                                    overdueFollowUps.map(call => (
                                        <Card key={call._id} className="border-orange-200">
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-2">
                                                        <h4 className="font-medium">{call.memberId?.fullName}</h4>
                                                        <div className="flex gap-4 text-sm text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <Phone className="h-3 w-3" />
                                                                {call.memberId?.phone}
                                                            </span>
                                                            <span className="flex items-center gap-1 text-orange-600">
                                                                <AlertTriangle className="h-3 w-3" />
                                                                Due: {format(new Date(call.followUpDate), 'MMM dd, yyyy')}
                                                            </span>
                                                        </div>
                                                        {call.followUpNotes && (
                                                            <p className="text-sm">{call.followUpNotes}</p>
                                                        )}
                                                    </div>
                                                    <Button size="sm" onClick={() => { setSelectedCall(call); setShowModal(true) }}>
                                                        Schedule
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="needing" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Members Needing Shepherding</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {membersNeeding.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">All members have recent shepherding calls</p>
                                ) : (
                                    membersNeeding.map(member => (
                                        <Card key={member._id} className={member.priority === 'high' ? 'border-red-200' : ''}>
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-medium">{member.name}</h4>
                                                            <Badge variant={
                                                                member.priority === 'high' ? 'destructive' :
                                                                member.priority === 'medium' ? 'default' :
                                                                'secondary'
                                                            }>
                                                                {member.priority} priority
                                                            </Badge>
                                                        </div>
                                                        <div className="flex gap-4 text-sm text-muted-foreground">
                                                            {member.phone && (
                                                                <span className="flex items-center gap-1">
                                                                    <Phone className="h-3 w-3" />
                                                                    {member.phone}
                                                                </span>
                                                            )}
                                                            <span>
                                                                {member.lastCallDate 
                                                                    ? `Last visit: ${member.daysSinceLastCall} days ago`
                                                                    : 'No recorded visits'
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Button size="sm" onClick={() => {
                                                        setSelectedCall({ 
                                                            memberId: member._id,
                                                            status: 'scheduled',
                                                            visitType: 'routine',
                                                            location: 'home'
                                                        })
                                                        setShowModal(true)
                                                    }}>
                                                        Schedule Visit
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <ShepherdingCallModal
                open={showModal}
                onClose={() => { setShowModal(false); setSelectedCall(null) }}
                call={selectedCall}
                members={members}
                shepherds={shepherds}
                onSuccess={fetchData}
            />

            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({...prev, open}))}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Shepherding Call</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this shepherding call? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
