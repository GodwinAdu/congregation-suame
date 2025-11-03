"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2, Radio, Mail, MessageSquare, Bell, Smartphone } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { createBroadcast, getRolesAndPrivileges } from "@/lib/actions/communication.actions"

interface Member {
    _id: string
    fullName: string
}

interface Group {
    _id: string
    name: string
}

interface CreateBroadcastModalProps {
    open: boolean
    onClose: () => void
    members: Member[]
    groups: Group[]
    onSuccess: (broadcast: any) => void
}

export function CreateBroadcastModal({ open, onClose, members, groups, onSuccess }: CreateBroadcastModalProps) {
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        targetAudience: {
            type: "all" as "all" | "group" | "role" | "privilege",
            groups: [] as string[],
            roles: [] as string[],
            privileges: [] as string[]
        },
        deliveryMethod: ["email"] as ("email" | "sms")[],
        scheduledFor: undefined as Date | undefined
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
            fetchRolesAndPrivileges()
        }
    }, [open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.title || !formData.content || formData.deliveryMethod.length === 0) {
            toast.error("Please fill in all required fields")
            return
        }

        setLoading(true)
        try {
            const broadcast = await createBroadcast(formData)
            toast.success("Broadcast created successfully")
            onSuccess(broadcast)
            setFormData({
                title: "",
                content: "",
                targetAudience: { type: "all", groups: [], roles: [], privileges: [] },
                deliveryMethod: ["email"],
                scheduledFor: undefined
            })
        } catch (error) {
            toast.error("Failed to create broadcast")
        } finally {
            setLoading(false)
        }
    }

    const handleDeliveryMethodChange = (method: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            deliveryMethod: checked 
                ? [...prev.deliveryMethod, method as any]
                : prev.deliveryMethod.filter(m => m !== method)
        }))
    }

    const deliveryOptions = [
        { value: "email", label: "Email", icon: Mail },
        { value: "sms", label: "SMS", icon: MessageSquare }
    ]

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Radio className="h-5 w-5" />
                        Create Broadcast
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Title</label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Enter broadcast title"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Content</label>
                        <Textarea
                            value={formData.content}
                            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                            placeholder="Enter broadcast content"
                            rows={4}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Target Audience</label>
                        <Select 
                            value={formData.targetAudience.type} 
                            onValueChange={(value: any) => setFormData(prev => ({ 
                                ...prev, 
                                targetAudience: { ...prev.targetAudience, type: value }
                            }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Members</SelectItem>
                                <SelectItem value="group">Specific Groups</SelectItem>
                                <SelectItem value="role">Specific Roles</SelectItem>
                                <SelectItem value="privilege">Specific Privileges</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {formData.targetAudience.type === "group" && (
                        <div>
                            <label className="text-sm font-medium">Select Groups</label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {groups.map(group => (
                                    <div key={group._id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`group-${group._id}`}
                                            checked={formData.targetAudience.groups.includes(group._id)}
                                            onCheckedChange={(checked) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    targetAudience: {
                                                        ...prev.targetAudience,
                                                        groups: checked 
                                                            ? [...prev.targetAudience.groups, group._id]
                                                            : prev.targetAudience.groups.filter(g => g !== group._id)
                                                    }
                                                }))
                                            }}
                                        />
                                        <label htmlFor={`group-${group._id}`} className="text-sm cursor-pointer">
                                            {group.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {formData.targetAudience.type === "role" && (
                        <div>
                            <label className="text-sm font-medium">Select Roles</label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {availableRoles.map(role => (
                                    <div key={role} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`role-${role}`}
                                            checked={formData.targetAudience.roles.includes(role)}
                                            onCheckedChange={(checked) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    targetAudience: {
                                                        ...prev.targetAudience,
                                                        roles: checked 
                                                            ? [...prev.targetAudience.roles, role]
                                                            : prev.targetAudience.roles.filter(r => r !== role)
                                                    }
                                                }))
                                            }}
                                        />
                                        <label htmlFor={`role-${role}`} className="text-sm cursor-pointer capitalize">
                                            {role.replace('_', ' ')}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {formData.targetAudience.type === "privilege" && (
                        <div>
                            <label className="text-sm font-medium">Select Privileges</label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {availablePrivileges.map(privilege => (
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
                                        <label htmlFor={`privilege-${privilege}`} className="text-sm cursor-pointer">
                                            {privilege}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-medium">Delivery Methods</label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            {deliveryOptions.map(option => {
                                const Icon = option.icon
                                return (
                                    <div key={option.value} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={option.value}
                                            checked={formData.deliveryMethod.includes(option.value as any)}
                                            onCheckedChange={(checked) => handleDeliveryMethodChange(option.value, checked as boolean)}
                                        />
                                        <label htmlFor={option.value} className="flex items-center gap-2 text-sm cursor-pointer">
                                            <Icon className="h-4 w-4" />
                                            {option.label}
                                        </label>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Schedule For Later (Optional)</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {formData.scheduledFor ? format(formData.scheduledFor, "PPP") : "Send immediately"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={formData.scheduledFor}
                                    onSelect={(date) => setFormData(prev => ({ ...prev, scheduledFor: date }))}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radio className="h-4 w-4" />}
                            {formData.scheduledFor ? "Schedule Broadcast" : "Send Broadcast"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}