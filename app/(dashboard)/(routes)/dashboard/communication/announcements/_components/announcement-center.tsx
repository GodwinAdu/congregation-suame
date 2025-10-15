"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Megaphone, Clock, Users, Trash2, Edit } from "lucide-react"
import { CreateAnnouncementModal } from "./create-announcement-modal"

interface Announcement {
    _id: string
    title: string
    content: string
    author: { _id: string; fullName: string }
    targetAudience: {
        type: string
        groups?: string[]
        roles?: string[]
    }
    priority: string
    createdAt: string
    expiresAt?: string
}

interface Member {
    _id: string
    fullName: string
}

interface AnnouncementCenterProps {
    announcements: Announcement[]
    members: Member[]
}

export function AnnouncementCenter({ announcements: initialAnnouncements, members }: AnnouncementCenterProps) {
    const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements)
    const [showCreateModal, setShowCreateModal] = useState(false)

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-500'
            case 'high': return 'bg-orange-500'
            case 'medium': return 'bg-yellow-500'
            case 'low': return 'bg-green-500'
            default: return 'bg-gray-500'
        }
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }

    const getAudienceText = (audience: Announcement['targetAudience']) => {
        switch (audience.type) {
            case 'all': return 'All Members'
            case 'elders': return 'Elders'
            case 'servants': return 'Ministerial Servants'
            case 'publishers': return 'Publishers'
            case 'group': return 'Specific Groups'
            default: return 'Custom'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Announcements</h2>
                <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Announcement
                </Button>
            </div>

            {announcements.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No announcements</h3>
                        <p className="text-muted-foreground">Create your first announcement</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {announcements.map((announcement) => (
                        <Card key={announcement._id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-primary/10">
                                            {getInitials(announcement.author.fullName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-semibold">{announcement.title}</h3>
                                                <Badge className={`${getPriorityColor(announcement.priority)} text-white text-xs`}>
                                                    {announcement.priority}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        
                                        <p className="text-muted-foreground">{announcement.content}</p>
                                        
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-4 w-4" />
                                                    {getAudienceText(announcement.targetAudience)}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {new Date(announcement.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="text-xs">
                                                By {announcement.author.fullName}
                                            </div>
                                        </div>
                                        
                                        {announcement.expiresAt && (
                                            <Badge variant="outline" className="text-xs">
                                                Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <CreateAnnouncementModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                members={members}
                onSuccess={(newAnnouncement) => {
                    setAnnouncements(prev => [newAnnouncement, ...prev])
                    setShowCreateModal(false)
                }}
            />
        </div>
    )
}