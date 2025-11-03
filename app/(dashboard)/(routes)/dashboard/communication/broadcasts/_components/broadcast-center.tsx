"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Radio, Clock, Users, Send, Calendar, Trash2, Edit } from "lucide-react"
import { CreateBroadcastModal } from "./create-broadcast-modal"
import { EditBroadcastModal } from "./edit-broadcast-modal"
import { deleteBroadcast } from "@/lib/actions/communication.actions"
import { toast } from "sonner"

interface Broadcast {
    _id: string
    title: string
    content: string
    sender: { _id: string; fullName: string }
    targetAudience: {
        type: string
        groups?: string[]
        roles?: string[]
    }
    recipients: string[]
    status: string
    deliveryMethod: string[]
    scheduledFor?: string
    createdAt: string
}

interface Member {
    _id: string
    fullName: string
}

interface Group {
    _id: string
    name: string
}

interface BroadcastCenterProps {
    members: Member[]
    groups: Group[]
    broadcasts: Broadcast[]
}

export function BroadcastCenter({ members, groups, broadcasts: initialBroadcasts }: BroadcastCenterProps) {
    const [broadcasts, setBroadcasts] = useState<Broadcast[]>(initialBroadcasts)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingBroadcast, setEditingBroadcast] = useState<Broadcast | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'sent': return 'bg-green-500'
            case 'scheduled': return 'bg-blue-500'
            case 'draft': return 'bg-gray-500'
            case 'failed': return 'bg-red-500'
            default: return 'bg-gray-500'
        }
    }

    const getInitials = (name: string) => {
        if (!name) return '??'
        return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }

    const getAudienceText = (audience: Broadcast['targetAudience']) => {
        switch (audience.type) {
            case 'all': return 'All Members'
            case 'group': {
                if (audience.groups && audience.groups.length > 0) {
                    const groupNames = audience.groups.map(groupId => {
                        const group = groups.find(g => g._id === groupId)
                        return group?.name || 'Unknown Group'
                    })
                    return `Groups: ${groupNames.join(', ')}`
                }
                return 'Specific Groups'
            }
            case 'role': {
                if (audience.roles && audience.roles.length > 0) {
                    return `Roles: ${audience.roles.join(', ')}`
                }
                return 'Specific Roles'
            }
            case 'privilege': {
                if (audience.privileges && audience.privileges.length > 0) {
                    return `Privileges: ${audience.privileges.join(', ')}`
                }
                return 'Specific Privileges'
            }
            default: return 'Custom'
        }
    }

    const handleEdit = (broadcast: Broadcast) => {
        setEditingBroadcast(broadcast)
        setShowEditModal(true)
    }

    const handleDelete = async (broadcastId: string) => {
        if (!confirm('Are you sure you want to delete this broadcast?')) {
            return
        }

        setDeletingId(broadcastId)
        try {
            await deleteBroadcast(broadcastId)
            setBroadcasts(prev => prev.filter(b => b._id !== broadcastId))
            toast.success('Broadcast deleted successfully')
        } catch (error) {
            toast.error('Failed to delete broadcast')
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Broadcasts</h2>
                <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Broadcast
                </Button>
            </div>

            {broadcasts.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <Radio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No broadcasts</h3>
                        <p className="text-muted-foreground">Create your first broadcast message</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {broadcasts.map((broadcast) => (
                        <Card key={broadcast._id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-primary/10">
                                            {getInitials(broadcast.sender.fullName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-semibold">{broadcast.title}</h3>
                                                <Badge className={`${getStatusColor(broadcast.status)} text-white text-xs`}>
                                                    {broadcast.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => handleEdit(broadcast)}
                                                    disabled={broadcast.status === 'sent'}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => handleDelete(broadcast._id)}
                                                    disabled={deletingId === broadcast._id}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        
                                        <p className="text-muted-foreground">{broadcast.content}</p>
                                        
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-4 w-4" />
                                                    {getAudienceText(broadcast.targetAudience)} ({broadcast.recipients.length})
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Send className="h-4 w-4" />
                                                    {broadcast.deliveryMethod.join(', ')}
                                                </div>
                                                {broadcast.scheduledFor && (
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        {new Date(broadcast.scheduledFor).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-xs">
                                                By {broadcast.sender.fullName}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <CreateBroadcastModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                members={members}
                groups={groups}
                onSuccess={(newBroadcast) => {
                    setBroadcasts(prev => [newBroadcast, ...prev])
                    setShowCreateModal(false)
                }}
            />

            {editingBroadcast && (
                <EditBroadcastModal
                    open={showEditModal}
                    onClose={() => {
                        setShowEditModal(false)
                        setEditingBroadcast(null)
                    }}
                    broadcast={editingBroadcast}
                    members={members}
                    groups={groups}
                    onSuccess={(updatedBroadcast) => {
                        setBroadcasts(prev => prev.map(b => 
                            b._id === updatedBroadcast._id ? updatedBroadcast : b
                        ))
                        setShowEditModal(false)
                        setEditingBroadcast(null)
                    }}
                />
            )}
        </div>
    )
}