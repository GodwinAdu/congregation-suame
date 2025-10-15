"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Settings, TestTube, Mail, Smartphone, Volume2, Clock } from "lucide-react"
import { toast } from "sonner"
import { markNotificationAsRead, updateNotificationPreferences, sendTestNotification } from "@/lib/actions/notification.actions"

interface Notification {
    _id: string
    type: string
    title: string
    message: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
    createdAt: string
    readAt?: string
    metadata?: any
}

interface Preferences {
    _id: string
    assignments: boolean
    meetings: boolean
    fieldService: boolean
    announcements: boolean
    emergencies: boolean
    method: 'email' | 'sms' | 'push'
    quietHours: {
        enabled: boolean
        start: string
        end: string
    }
}

interface Stats {
    total: number
    unread: number
    byType: Record<string, number>
    byPriority: Record<string, number>
}

interface NotificationCenterProps {
    notifications: Notification[]
    preferences: Preferences
    stats: Stats
}

export function NotificationCenter({ notifications: initialNotifications, preferences: initialPreferences, stats }: NotificationCenterProps) {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
    const [preferences, setPreferences] = useState<Preferences>(initialPreferences)
    const [isUpdating, setIsUpdating] = useState(false)

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await markNotificationAsRead(notificationId)
            setNotifications(prev => prev.map(n => 
                n._id === notificationId ? { ...n, status: 'read', readAt: new Date().toISOString() } : n
            ))
            toast.success("Notification marked as read")
        } catch (error: any) {
            toast.error(error.message || "Failed to mark as read")
        }
    }

    const handleUpdatePreferences = async (updates: Partial<Preferences>) => {
        setIsUpdating(true)
        try {
            const updatedPreferences = await updateNotificationPreferences(updates)
            setPreferences(updatedPreferences)
            toast.success("Preferences updated successfully")
        } catch (error: any) {
            toast.error(error.message || "Failed to update preferences")
        } finally {
            setIsUpdating(false)
        }
    }

    const handleSendTest = async () => {
        try {
            await sendTestNotification()
            toast.success("Test notification sent!")
        } catch (error: any) {
            toast.error(error.message || "Failed to send test notification")
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-500'
            case 'high': return 'bg-orange-500'
            case 'medium': return 'bg-yellow-500'
            case 'low': return 'bg-green-500'
            default: return 'bg-gray-500'
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'read': return 'text-muted-foreground'
            case 'delivered': return 'text-green-600'
            case 'sent': return 'text-blue-600'
            case 'failed': return 'text-red-600'
            default: return 'text-foreground'
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'assignment': return '📋'
            case 'meeting': return '🏛️'
            case 'announcement': return '📢'
            case 'reminder': return '⏰'
            case 'emergency': return '🚨'
            default: return '📬'
        }
    }

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
                        <Bell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unread</CardTitle>
                        <Badge variant="destructive">{stats.unread}</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{stats.unread}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Delivery Method</CardTitle>
                        {preferences.method === 'email' && <Mail className="h-4 w-4 text-muted-foreground" />}
                        {preferences.method === 'sms' && <Smartphone className="h-4 w-4 text-muted-foreground" />}
                        {preferences.method === 'push' && <Volume2 className="h-4 w-4 text-muted-foreground" />}
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-medium capitalize">{preferences.method}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Quiet Hours</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm">
                            {preferences.quietHours.enabled 
                                ? `${preferences.quietHours.start} - ${preferences.quietHours.end}`
                                : "Disabled"
                            }
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="notifications" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="notifications" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Notifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {notifications.map((notification) => (
                                    <div 
                                        key={notification._id} 
                                        className={`p-4 border rounded-lg transition-colors ${
                                            notification.status === 'read' ? 'bg-muted/50' : 'bg-background'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3 flex-1">
                                                <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className={`font-semibold ${getStatusColor(notification.status)}`}>
                                                            {notification.title}
                                                        </h3>
                                                        <Badge className={`${getPriorityColor(notification.priority)} text-white text-xs`}>
                                                            {notification.priority}
                                                        </Badge>
                                                    </div>
                                                    <p className={`text-sm ${getStatusColor(notification.status)}`}>
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                        <span>{new Date(notification.createdAt).toLocaleString()}</span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {notification.status}
                                                        </Badge>
                                                        <Badge variant="outline" className="text-xs capitalize">
                                                            {notification.type}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {notification.status !== 'read' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleMarkAsRead(notification._id)}
                                                >
                                                    Mark as Read
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                
                                {notifications.length === 0 && (
                                    <div className="text-center py-12">
                                        <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                                        <p className="text-muted-foreground">
                                            You're all caught up! New notifications will appear here.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Notification Preferences
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Notification Types */}
                            <div className="space-y-4">
                                <h3 className="font-medium">Notification Types</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { key: 'assignments', label: 'Assignment Reminders', icon: '📋' },
                                        { key: 'meetings', label: 'Meeting Notifications', icon: '🏛️' },
                                        { key: 'fieldService', label: 'Field Service Updates', icon: '🚪' },
                                        { key: 'announcements', label: 'Announcements', icon: '📢' },
                                        { key: 'emergencies', label: 'Emergency Alerts', icon: '🚨' }
                                    ].map(({ key, label, icon }) => (
                                        <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{icon}</span>
                                                <Label htmlFor={key}>{label}</Label>
                                            </div>
                                            <Switch
                                                id={key}
                                                checked={preferences[key as keyof Preferences] as boolean}
                                                onCheckedChange={(checked) => 
                                                    handleUpdatePreferences({ [key]: checked })
                                                }
                                                disabled={isUpdating}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Delivery Method */}
                            <div className="space-y-4">
                                <h3 className="font-medium">Delivery Method</h3>
                                <Select 
                                    value={preferences.method} 
                                    onValueChange={(value: any) => handleUpdatePreferences({ method: value })}
                                    disabled={isUpdating}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="email">📧 Email</SelectItem>
                                        <SelectItem value="sms">📱 SMS</SelectItem>
                                        <SelectItem value="push">🔔 Push Notifications</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Quiet Hours */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium">Quiet Hours</h3>
                                    <Switch
                                        checked={preferences.quietHours.enabled}
                                        onCheckedChange={(checked) => 
                                            handleUpdatePreferences({ 
                                                quietHours: { ...preferences.quietHours, enabled: checked }
                                            })
                                        }
                                        disabled={isUpdating}
                                    />
                                </div>
                                
                                {preferences.quietHours.enabled && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Start Time</Label>
                                            <Input
                                                type="time"
                                                value={preferences.quietHours.start}
                                                onChange={(e) => 
                                                    handleUpdatePreferences({
                                                        quietHours: { ...preferences.quietHours, start: e.target.value }
                                                    })
                                                }
                                                disabled={isUpdating}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>End Time</Label>
                                            <Input
                                                type="time"
                                                value={preferences.quietHours.end}
                                                onChange={(e) => 
                                                    handleUpdatePreferences({
                                                        quietHours: { ...preferences.quietHours, end: e.target.value }
                                                    })
                                                }
                                                disabled={isUpdating}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Test Notification */}
                            <div className="pt-4 border-t">
                                <Button onClick={handleSendTest} variant="outline" className="gap-2">
                                    <TestTube className="h-4 w-4" />
                                    Send Test Notification
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}