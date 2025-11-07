"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
    Plus, 
    MessageSquare, 
    Send, 
    Inbox, 
    Reply, 
    Trash2, 
    Clock, 
    Search,
    Filter,
    Star,
    Archive,
    MoreVertical,
    Eye,
    EyeOff,
    Forward,
    Download,
    AlertCircle,
    CheckCircle2
} from "lucide-react"
import { toast } from "sonner"
import { ComposeMessageModal } from "./compose-message-modal"
import { deleteMessage, markMessageAsRead } from "@/lib/actions/communication.actions"
import { format, isToday, isYesterday } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
    const [searchQuery, setSearchQuery] = useState("")
    const [filterPriority, setFilterPriority] = useState("all")
    const [selectedMessages, setSelectedMessages] = useState<string[]>([])
    const [viewMode, setViewMode] = useState<'list' | 'compact'>('list')

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

    const formatMessageDate = (date: string) => {
        const messageDate = new Date(date)
        if (isToday(messageDate)) return format(messageDate, 'HH:mm')
        if (isYesterday(messageDate)) return 'Yesterday'
        return format(messageDate, 'MMM dd')
    }

    const isMessageRead = (message: Message) => {
        return message.readBy.some(read => read.userId === currentUser._id)
    }

    const filteredMessages = useMemo(() => {
        let filtered = messages

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(msg => 
                msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                msg.from.fullName.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Filter by priority
        if (filterPriority !== 'all') {
            filtered = filtered.filter(msg => msg.priority === filterPriority)
        }

        return filtered
    }, [messages, searchQuery, filterPriority])

    const inboxMessages = filteredMessages.filter(msg => 
        msg.to.some(recipient => recipient._id === currentUser._id)
    )

    const sentMessages = filteredMessages.filter(msg => 
        msg.from._id === currentUser._id
    )

    const unreadCount = inboxMessages.filter(msg => !isMessageRead(msg)).length

    const handleMarkAsRead = async (messageId: string) => {
        try {
            await markMessageAsRead(messageId)
            setMessages(prev => prev.map(msg => 
                msg._id === messageId 
                    ? { ...msg, readBy: [...msg.readBy, { userId: currentUser._id, readAt: new Date().toISOString() }] }
                    : msg
            ))
        } catch (error) {
            toast.error("Failed to mark message as read")
        }
    }

    const renderMessageList = (messageList: Message[], emptyMessage: string, emptyIcon: React.ReactNode) => {
        if (messageList.length === 0) {
            return (
                <Card>
                    <CardContent className="text-center py-12">
                        {emptyIcon}
                        <h3 className="text-lg font-semibold mb-2">{emptyMessage}</h3>
                        <p className="text-muted-foreground text-sm">
                            {searchQuery ? 'No messages match your search criteria' : 
                             activeTab === 'inbox' ? 'Your inbox is empty' : 'You haven\'t sent any messages yet'}
                        </p>
                        {!searchQuery && (
                            <Button onClick={() => setShowComposeModal(true)} className="mt-4">
                                <Plus className="h-4 w-4 mr-2" />
                                {activeTab === 'inbox' ? 'Send your first message' : 'Compose message'}
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )
        }

        return (
            <div className="space-y-3 sm:space-y-4">
                {messageList.map((message) => {
                    const isRead = isMessageRead(message)
                    const isSelected = selectedMessages.includes(message._id)
                    
                    return (
                        <Card 
                            key={message._id} 
                            className={`hover:shadow-md transition-all duration-200 cursor-pointer ${
                                !isRead && activeTab === 'inbox' ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
                            } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                            onClick={() => {
                                if (!isRead && activeTab === 'inbox') {
                                    handleMarkAsRead(message._id)
                                }
                            }}
                        >
                            <CardContent className="p-3 sm:p-4">
                                <div className="flex items-start gap-3 sm:gap-4">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={(e) => {
                                                e.stopPropagation()
                                                setSelectedMessages(prev => 
                                                    e.target.checked 
                                                        ? [...prev, message._id]
                                                        : prev.filter(id => id !== message._id)
                                                )
                                            }}
                                            className="rounded"
                                        />
                                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                                            <AvatarFallback className={`text-xs sm:text-sm ${
                                                !isRead && activeTab === 'inbox' ? 'bg-blue-100 text-blue-700' : 'bg-primary/10'
                                            }`}>
                                                {getInitials(activeTab === 'sent' ? message.to[0]?.fullName || 'Unknown' : message.from.fullName)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                    
                                    <div className="flex-1 space-y-1 sm:space-y-2 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                <h4 className={`text-sm sm:text-base truncate ${
                                                    !isRead && activeTab === 'inbox' ? 'font-bold' : 'font-semibold'
                                                }`}>
                                                    {activeTab === 'sent' 
                                                        ? message.to.map(t => t.fullName).join(', ') 
                                                        : message.from.fullName
                                                    }
                                                </h4>
                                                {!isRead && activeTab === 'inbox' && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                                )}
                                                <Badge className={`${getPriorityColor(message.priority)} text-white text-xs flex-shrink-0`}>
                                                    {message.priority}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <div className="text-xs sm:text-sm text-muted-foreground">
                                                    {formatMessageDate(message.createdAt)}
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {activeTab === 'inbox' && (
                                                            <>
                                                                <DropdownMenuItem onClick={() => handleMarkAsRead(message._id)}>
                                                                    {isRead ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                                                                    Mark as {isRead ? 'unread' : 'read'}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>
                                                                    <Reply className="h-4 w-4 mr-2" />
                                                                    Reply
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>
                                                                    <Forward className="h-4 w-4 mr-2" />
                                                                    Forward
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                        <DropdownMenuItem>
                                                            <Star className="h-4 w-4 mr-2" />
                                                            Star
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Archive className="h-4 w-4 mr-2" />
                                                            Archive
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            className="text-red-600"
                                                            onClick={async (e) => {
                                                                e.stopPropagation()
                                                                try {
                                                                    await deleteMessage(message._id)
                                                                    setMessages(prev => prev.filter(m => m._id !== message._id))
                                                                    toast.success("Message deleted successfully")
                                                                } catch (error) {
                                                                    toast.error("Failed to delete message")
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                        
                                        <h5 className={`text-sm sm:text-base truncate ${
                                            !isRead && activeTab === 'inbox' ? 'font-semibold' : 'font-medium'
                                        }`}>
                                            {message.subject}
                                        </h5>
                                        
                                        {viewMode === 'list' && (
                                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                                                {message.content}
                                            </p>
                                        )}
                                        
                                        <div className="flex items-center justify-between pt-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {message.type}
                                                </Badge>
                                                {message.readBy.length > 0 && activeTab === 'sent' && (
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Read by {message.readBy.length}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        )
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold">Messages</h2>
                    <p className="text-sm text-muted-foreground">
                        {unreadCount > 0 && `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`}
                    </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setViewMode(viewMode === 'list' ? 'compact' : 'list')}
                        className="hidden sm:flex"
                    >
                        {viewMode === 'list' ? 'Compact' : 'Detailed'}
                    </Button>
                    <Button onClick={() => setShowComposeModal(true)} className="gap-2 flex-1 sm:flex-none">
                        <Plus className="h-4 w-4" />
                        <span className="sm:inline">New Message</span>
                    </Button>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-full sm:w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Bulk Actions */}
            {selectedMessages.length > 0 && (
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                                {selectedMessages.length} message{selectedMessages.length > 1 ? 's' : ''} selected
                            </span>
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline">
                                    <Archive className="h-4 w-4 mr-2" />
                                    Archive
                                </Button>
                                <Button size="sm" variant="outline">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => setSelectedMessages([])}
                                >
                                    Clear
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
                <TabsList className="grid w-full grid-cols-3 h-auto p-1">
                    <TabsTrigger value="inbox" className="flex items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
                        <Inbox className="h-4 w-4" />
                        <span className="hidden sm:inline">Inbox</span>
                        <span className="sm:hidden">Inbox</span>
                        <Badge className="bg-blue-500 text-white text-xs ml-1">
                            {inboxMessages.length}
                        </Badge>
                        {unreadCount > 0 && (
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="sent" className="flex items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
                        <Send className="h-4 w-4" />
                        <span className="hidden sm:inline">Sent</span>
                        <span className="sm:hidden">Sent</span>
                        <Badge className="bg-green-500 text-white text-xs ml-1">
                            {sentMessages.length}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="drafts" className="flex items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
                        <MessageSquare className="h-4 w-4" />
                        <span className="hidden sm:inline">Drafts</span>
                        <span className="sm:hidden">Drafts</span>
                        <Badge className="bg-gray-500 text-white text-xs ml-1">
                            0
                        </Badge>
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
                            <p className="text-muted-foreground text-sm">Draft messages will appear here</p>
                            <Button onClick={() => setShowComposeModal(true)} className="mt-4">
                                <Plus className="h-4 w-4 mr-2" />
                                Compose Message
                            </Button>
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