"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Bell, CheckCircle, AlertTriangle, Info, XCircle, Loader2, Check, Trash2 } from "lucide-react"
import { io } from "socket.io-client"
import axios, { AxiosError } from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"

interface Notification {
    _id: string
    message: string
    type: "info" | "success" | "error" | "warning"
    read: boolean
    createdAt: string
    sender?: {
        name: string
        avatar: string
    }
}

export default function NotificationDropdown({ userId }: { userId: string }) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [open, setOpen] = useState(false)
    const socket = io("http://localhost:3000") // Replace with production server

    useEffect(() => {
        fetchNotifications()

        socket.on(`notify-${userId}`, (data: Notification) => {
            setNotifications((prev) => [data, ...prev])
            toast({
                title: data.sender?.name || "System",
                description: data.message,
                // type: data.type,
            })
        })

        return () => {
            socket.disconnect()
        }
    }, [userId, socket])

    const fetchNotifications = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await axios.get(`/api/notifications?userId=${userId}&page=1`)
            const data = response.data
            if (Array.isArray(data)) {
                setNotifications(data)
            } else {
                throw new Error("Invalid data format received")
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error)
            if (error instanceof AxiosError) {
                setError(`Failed to load notifications: ${error.message}`)
            } else {
                setError("Failed to load notifications: Unknown error")
            }
            toast({
                title: "Failed to load notifications",
                description: error.message,
            })
        } finally {
            setIsLoading(false)
        }
    }

    const markAsRead = async (id?: string) => {
        try {
            const notificationIds = id ? [id] : notifications.filter((n) => !n.read).map((n) => n._id)
            if (notificationIds.length > 0) {
                await axios.patch("/api/notifications", { notificationIds })
                setNotifications((prev) => prev.map((n) => (notificationIds.includes(n._id) ? { ...n, read: true } : n)))
            }
        } catch (error) {
            console.error("Failed to mark notifications as read:", error)
            toast({
                title: "Failed to mark notifications as read",
                description: error.message,
            variant: "destructive",
            })
        }
    }

    const deleteNotification = async (id: string) => {
        try {
            await axios.delete(`/api/notifications/${id}`)
            setNotifications((prev) => prev.filter((n) => n._id !== id))
            toast({
                title: "Notification deleted",
                description: "Notification deleted successfully",
            })
        } catch (error) {
            console.error("Failed to delete notification:", error)
            toast({
                title: "Failed to delete notification",
                description: error.message,
                variant: "destructive",
            })
        }
    }

    const clearAll = async () => {
        try {
            await axios.delete(`/api/notifications?userId=${userId}`)
            setNotifications([])
            toast({
                title: "All notifications cleared",
                description: "All notifications have been deleted",
            })
        } catch (error) {
            console.error("Failed to clear notifications:", error)
            toast({
                title: "Failed to clear all notifications",
                description: error.message,
                variant: "destructive",
            })
        }
    }

    const unreadCount = notifications.filter((n) => !n.read).length

    const getIcon = (type: Notification["type"]) => {
        switch (type) {
            case "success":
                return <CheckCircle className="w-4 h-4 text-green-500" />
            case "error":
                return <XCircle className="w-4 h-4 text-red-500" />
            case "warning":
                return <AlertTriangle className="w-4 h-4 text-yellow-500" />
            case "info":
                return <Info className="w-4 h-4 text-blue-500" />
        }
    }

    const formatDate = (date: string) => {
        const now = new Date()
        const notificationDate = new Date(date)
        const diffTime = Math.abs(now.getTime() - notificationDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 0) {
            return notificationDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        } else if (diffDays === 1) {
            return "Yesterday"
        } else if (diffDays <= 7) {
            return notificationDate.toLocaleDateString([], { weekday: "long" })
        } else {
            return notificationDate.toLocaleDateString([], { month: "short", day: "numeric" })
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <Badge variant="destructive" className="absolute -top-2 -right-2 px-1 min-w-[1.25rem] h-5">
                            {unreadCount}
                        </Badge>
                    )}
                    <span className="sr-only">Toggle notifications</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0">
                <Tabs defaultValue="all" className="w-full">
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-lg font-semibold">Notifications</h2>
                        <TabsList className="grid w-full grid-cols-2 h-8 items-stretch">
                            <TabsTrigger value="all" className="text-xs">
                                All
                            </TabsTrigger>
                            <TabsTrigger value="unread" className="text-xs">
                                Unread
                            </TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="all" className="p-0 m-0">
                        <NotificationList
                            notifications={notifications}
                            isLoading={isLoading}
                            error={error}
                            onMarkAsRead={markAsRead}
                            onDelete={deleteNotification}
                            getIcon={getIcon}
                            formatDate={formatDate}
                        />
                    </TabsContent>
                    <TabsContent value="unread" className="p-0 m-0">
                        <NotificationList
                            notifications={notifications.filter((n) => !n.read)}
                            isLoading={isLoading}
                            error={error}
                            onMarkAsRead={markAsRead}
                            onDelete={deleteNotification}
                            getIcon={getIcon}
                            formatDate={formatDate}
                        />
                    </TabsContent>
                </Tabs>
                <Separator />
                <div className="p-4 flex justify-between items-center">
                    <Button variant="outline" size="sm" onClick={() => markAsRead()} disabled={unreadCount === 0}>
                        Mark all as read
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearAll} disabled={notifications.length === 0}>
                        Clear all
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}

function NotificationList({
    notifications,
    isLoading,
    error,
    onMarkAsRead,
    onDelete,
    getIcon,
    formatDate,
}: {
    notifications: Notification[]
    isLoading: boolean
    error: string | null
    onMarkAsRead: (id?: string) => void
    onDelete: (id: string) => void
    getIcon: (type: Notification["type"]) => React.ReactNode
    formatDate: (date: string) => string
}) {
    return (
        <ScrollArea className="h-[400px]">
            {isLoading ? (
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin" />
                </div>
            ) : error ? (
                <div className="text-center text-red-500 p-4">
                    <p>{error}</p>
                    <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="mt-2">
                        Retry
                    </Button>
                </div>
            ) : notifications.length === 0 ? (
                <p className="text-center text-muted-foreground p-4">No notifications</p>
            ) : (
                <AnimatePresence>
                    {notifications.map((notification) => (
                        <motion.div
                            key={notification._id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`flex items-start space-x-4 p-4 hover:bg-muted/50 transition-colors ${!notification.read ? "bg-muted/20" : ""
                                }`}
                        >
                            <Avatar className="w-10 h-10">
                                {notification.sender?.avatar ? (
                                    <img src={notification.sender.avatar || "/placeholder.svg"} alt={notification.sender.name} />
                                ) : (
                                    getIcon(notification.type)
                                )}
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <p className={`text-sm ${notification.read ? "text-muted-foreground" : "font-medium"}`}>
                                    {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {notification.sender?.name && `${notification.sender.name} • `}
                                    {formatDate(notification.createdAt)}
                                </p>
                            </div>
                            <div className="flex space-x-2">
                                {!notification.read && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => onMarkAsRead(notification._id)}
                                    >
                                        <Check className="h-4 w-4" />
                                        <span className="sr-only">Mark as read</span>
                                    </Button>
                                )}
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(notification._id)}>
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            )}
        </ScrollArea>
    )
}

