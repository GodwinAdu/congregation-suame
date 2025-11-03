"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Users, Calendar } from "lucide-react"
import { toast } from "sonner"
import { updateBroadcast } from "@/lib/actions/communication.actions"

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

interface EditBroadcastModalProps {
    open: boolean
    onClose: () => void
    broadcast: Broadcast
    members: Member[]
    groups: Group[]
    onSuccess: (broadcast: Broadcast) => void
}

export function EditBroadcastModal({ 
    open, 
    onClose, 
    broadcast,
    members, 
    groups, 
    onSuccess 
}: EditBroadcastModalProps) {
    const [formData, setFormData] = useState({
        title: broadcast.title,
        content: broadcast.content,
        targetAudience: {
            type: broadcast.targetAudience.type,
            groups: broadcast.targetAudience.groups || [],
            roles: broadcast.targetAudience.roles || [],
            privileges: broadcast.targetAudience.privileges || []
        },
        deliveryMethod: broadcast.deliveryMethod,
        scheduledFor: broadcast.scheduledFor ? new Date(broadcast.scheduledFor).toISOString().slice(0, 16) : ''
    })
    const [loading, setLoading] = useState(false)
    const [availableRoles, setAvailableRoles] = useState<string[]>([])
    const [availablePrivileges, setAvailablePrivileges] = useState<string[]>([])

    useEffect(() => {
        const fetchRolesAndPrivileges = async () => {
            try {
                const data = await getRolesAndPrivileges()
                setAvailableRoles(data.roles)
                setAvailablePrivileges(data.privileges)
            } catch (error) {
                console.error('Error fetching roles and privileges:', error)
            }
        }
        
        if (open) {
            setFormData({
                title: broadcast.title,
                content: broadcast.content,
                targetAudience: {
                    type: broadcast.targetAudience.type,
                    groups: broadcast.targetAudience.groups || [],
                    roles: broadcast.targetAudience.roles || [],
                    privileges: broadcast.targetAudience.privileges || []
                },
                deliveryMethod: broadcast.deliveryMethod,
                scheduledFor: broadcast.scheduledFor ? new Date(broadcast.scheduledFor).toISOString().slice(0, 16) : ''
            })
            fetchRolesAndPrivileges()
        }
    }, [broadcast, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!formData.title.trim() || !formData.content.trim()) {
            toast.error("Title and content are required")
            return
        }

        if (formData.deliveryMethod.length === 0) {
            toast.error("Please select at least one delivery method")
            return
        }

        setLoading(true)
        try {
            const updatedBroadcast = await updateBroadcast(broadcast._id, {
                title: formData.title,
                content: formData.content,
                targetAudience: formData.targetAudience,
                deliveryMethod: formData.deliveryMethod as ('email' | 'sms')[],
                scheduledFor: formData.scheduledFor ? new Date(formData.scheduledFor) : undefined
            })
            
            toast.success("Broadcast updated successfully!")
            onSuccess(updatedBroadcast)
        } catch (error) {
            toast.error("Failed to update broadcast")
        } finally {
            setLoading(false)
        }
    }

    const handleDeliveryMethodChange = (method: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            deliveryMethod: checked 
                ? [...prev.deliveryMethod, method]
                : prev.deliveryMethod.filter(m => m !== method)
        }))
    }

    const handleGroupChange = (groupId: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            targetAudience: {
                ...prev.targetAudience,
                groups: checked 
                    ? [...prev.targetAudience.groups, groupId]
                    : prev.targetAudience.groups.filter(g => g !== groupId)
            }
        }))
    }

    const handleRoleChange = (role: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            targetAudience: {
                ...prev.targetAudience,
                roles: checked 
                    ? [...prev.targetAudience.roles, role]
                    : prev.targetAudience.roles.filter(r => r !== role)
            }
        }))
    }

    const getRecipientCount = () => {
        if (formData.targetAudience.type === 'all') {
            return members.length
        } else if (formData.targetAudience.type === 'group') {
            return formData.targetAudience.groups.length * 10 // Estimate
        } else if (formData.targetAudience.type === 'role') {
            return formData.targetAudience.roles.length * 5 // Estimate
        }
        return 0
    }



    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Edit Broadcast
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Broadcast title"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Message Content</Label>
                        <Textarea
                            id="content"
                            value={formData.content}
                            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                            placeholder="Enter your broadcast message..."
                            rows={4}
                            required
                        />
                    </div>

                    <div className="space-y-4">
                        <Label>Target Audience</Label>
                        <Select 
                            value={formData.targetAudience.type} 
                            onValueChange={(value) => setFormData(prev => ({
                                ...prev,
                                targetAudience: { ...prev.targetAudience, type: value, groups: [], roles: [] }
                            }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select audience" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Members</SelectItem>
                                <SelectItem value="group">Specific Groups</SelectItem>
                                <SelectItem value="role">Specific Roles</SelectItem>
                                <SelectItem value="privilege">Specific Privileges</SelectItem>
                            </SelectContent>
                        </Select>

                        {formData.targetAudience.type === 'group' && (
                            <Card>
                                <CardContent className="p-4">
                                    <Label className="text-sm font-medium">Select Groups</Label>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        {groups.map((group) => (
                                            <div key={group._id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`group-${group._id}`}
                                                    checked={formData.targetAudience.groups.includes(group._id)}
                                                    onCheckedChange={(checked) => handleGroupChange(group._id, checked as boolean)}
                                                />
                                                <Label htmlFor={`group-${group._id}`} className="text-sm">
                                                    {group.name}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {formData.targetAudience.type === 'role' && (
                            <Card>
                                <CardContent className="p-4">
                                    <Label className="text-sm font-medium">Select Roles</Label>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        {availableRoles.map((role) => (
                                            <div key={role} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`role-${role}`}
                                                    checked={formData.targetAudience.roles.includes(role)}
                                                    onCheckedChange={(checked) => handleRoleChange(role, checked as boolean)}
                                                />
                                                <Label htmlFor={`role-${role}`} className="text-sm capitalize">
                                                    {role.replace('_', ' ')}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {formData.targetAudience.type === 'privilege' && (
                            <Card>
                                <CardContent className="p-4">
                                    <Label className="text-sm font-medium">Select Privileges</Label>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        {['Watchtower Reader', 'Sound System', 'Microphone Handler', 'Literature Servant', 'Accounts Servant', 'Secretary', 'Service Overseer', 'School Overseer'].map((privilege) => (
                                            <div key={privilege} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`privilege-${privilege}`}
                                                    checked={formData.targetAudience.privileges.includes(privilege)}
                                                    onCheckedChange={(checked) => {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            targetAudience: {
                                                                ...prev.targetAudience,
                                                                privileges: checked 
                                                                    ? [...prev.targetAudience.privileges, privilege]
                                                                    : prev.targetAudience.privileges.filter(p => p !== privilege)
                                                            }
                                                        }))
                                                    }}
                                                />
                                                <Label htmlFor={`privilege-${privilege}`} className="text-sm">
                                                    {privilege}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-4">
                        <Label>Delivery Methods</Label>
                        <Card>
                            <CardContent className="p-4">
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { id: 'email', label: 'Email' },
                                        { id: 'sms', label: 'SMS' }
                                    ].map((method) => (
                                        <div key={method.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`delivery-${method.id}`}
                                                checked={formData.deliveryMethod.includes(method.id)}
                                                onCheckedChange={(checked) => handleDeliveryMethodChange(method.id, checked as boolean)}
                                            />
                                            <Label htmlFor={`delivery-${method.id}`} className="text-sm">
                                                {method.label}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="scheduledFor" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Schedule For (Optional)
                        </Label>
                        <Input
                            id="scheduledFor"
                            type="datetime-local"
                            value={formData.scheduledFor}
                            onChange={(e) => setFormData(prev => ({ ...prev, scheduledFor: e.target.value }))}
                            min={new Date().toISOString().slice(0, 16)}
                        />
                    </div>

                    <Card className="bg-blue-50">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">Broadcast Summary</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Estimated recipients: <Badge variant="outline">{getRecipientCount()}</Badge>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">
                                        Status: <Badge>{broadcast.status}</Badge>
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Updating...
                                </>
                            ) : (
                                'Update Broadcast'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}