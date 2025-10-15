"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, MessageSquare, Send, Inbox, Reply, Trash2, Clock } from "lucide-react"
import { toast } from "sonner"
import { ComposeMessageModal } from "./compose-message-modal"
import { deleteMessage } from "@/lib/actions/communication.actions"

interface Message {
    _id: string
    from: { _id: string; fullName: string }
    to: Array<{ _id: string; fullName: string }>
    subject: string
    content: string
    type: string
    priority: string
    createdAt: string
    readBy: Array<{ userId: string; readAt: string }>
}

interface Member {
    _id: string
    fullName: string
}

interface MessageCenterProps {
    messages: Message[]
    members: Member[]
    currentUser: { _id: string; fullName: string }
}

export function MessageCenter({ messages: initialMessages, members, currentUser }: MessageCenterProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [showComposeModal, setShowComposeModal] = useState(false)
    const [activeTab, setActiveTab] = useState("inbox")

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

    const inboxMessages = messages.filter(msg => 
        msg.to.some(recipient => recipient._id === currentUser._id)
    )

    const sentMessages = messages.filter(msg => 
        msg.from._id === currentUser._id
    )

    const renderMessageList = (messageList: Message[], emptyMessage: string, emptyIcon: React.ReactNode) => {
        if (messageList.length === 0) {
            return (
                <Card>
                    <CardContent className="text-center py-12">
                        {emptyIcon}
                        <h3 className="text-lg font-semibold mb-2">{emptyMessage}</h3>
                        <p className="text-muted-foreground">
                            {activeTab === 'inbox' ? 'Your inbox is empty' : 'You haven\'t sent any messages yet'}
                        </p>
                    </CardContent>
                </Card>
            )
        }

        return (
            <div className="space-y-4">
                {messageList.map((message) => (
                    <Card key={message._id} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-primary/10">
                                        {getInitials(activeTab === 'sent' ? message.to[0]?.fullName || 'Unknown' : message.from.fullName)}
                                    </AvatarFallback>
                                </Avatar>
                                
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold">
                                                {activeTab === 'sent' 
                                                    ? `To: ${message.to.map(t => t.fullName).join(', ')}` 
                                                    : `From: ${message.from.fullName}`
                                                }
                                            </h4>
                                            <Badge className={`${getPriorityColor(message.priority)} text-white text-xs`}>
                                                {message.priority}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            {new Date(message.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    
                                    <h5 className="font-medium">{message.subject}</h5>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {message.content}
                                    </p>
                                    
                                    <div className="flex items-center justify-between pt-2">
                                        <Badge variant="outline" className="text-xs">
                                            {message.type}
                                        </Badge>
                                        <div className="flex gap-2">
                                            {activeTab === 'inbox' && (
                                                <Button variant="ghost" size="sm" className="gap-1">
                                                    <Reply className="h-4 w-4" />
                                                    Reply
                                                </Button>
                                            )}
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="gap-1"
                                                onClick={async () => {
                                                    try {
                                                        await deleteMessage(message._id)
                                                        setMessages(prev => prev.filter(m => m._id !== message._id))
                                                        toast.success("Message deleted successfully")
                                                    } catch (error) {
                                                        toast.error("Failed to delete message")
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Messages</h2>
                <Button onClick={() => setShowComposeModal(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Message
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="inbox" className="gap-2">
                        <Inbox className="h-4 w-4" />
                        Inbox ({inboxMessages.length})
                    </TabsTrigger>
                    <TabsTrigger value="sent" className="gap-2">
                        <Send className="h-4 w-4" />
                        Sent ({sentMessages.length})
                    </TabsTrigger>
                    <TabsTrigger value="drafts" className="gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Drafts (0)
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="inbox">
                    {renderMessageList(
                        inboxMessages,
                        "No messages",
                        <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    )}
                </TabsContent>

                <TabsContent value="sent">
                    {renderMessageList(
                        sentMessages,
                        "No sent messages",
                        <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    )}
                </TabsContent>

                <TabsContent value="drafts">
                    <Card>
                        <CardContent className="text-center py-12">
                            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No drafts</h3>
                            <p className="text-muted-foreground">No draft messages saved</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <ComposeMessageModal
                open={showComposeModal}
                onClose={() => setShowComposeModal(false)}
                members={members}
                onSuccess={(newMessage) => {
                    setMessages(prev => [newMessage, ...prev])
                    setShowComposeModal(false)
                }}
            />
        </div>
    )
}