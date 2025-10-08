"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { updateMember } from '@/lib/actions/user.actions'

interface EditMemberFormProps {
    member: any
    groups: any[]
    privileges: any[]
}

export function EditMemberForm({ member, groups, privileges }: EditMemberFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        fullName: member.fullName || '',
        email: member.email || '',
        phone: member.phone || '',
        gender: member.gender || '',
        dob: member.dob ? new Date(member.dob).toISOString().split('T')[0] : '',
        address: member.address || '',
        emergencyContact: member.emergencyContact || '',
        role: member.role || 'publisher',
        groupId: member.groupId?._id || 'none',
        privileges: member.privileges?.map((p: any) => p._id) || []
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await updateMember(member._id, {
                ...formData,
                groupId: formData.groupId === 'none' ? null : formData.groupId,
                dob: formData.dob ? new Date(formData.dob) : undefined
            })
            toast.success('Member updated successfully')
            router.push('/dashboard/members')
        } catch (error: any) {
            toast.error(error.message || 'Failed to update member')
        } finally {
            setLoading(false)
        }
    }

    const handlePrivilegeChange = (privilegeId: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            privileges: checked 
                ? [...prev.privileges, privilegeId]
                : prev.privileges.filter(id => id !== privilegeId)
        }))
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="fullName">Full Name *</Label>
                            <Input
                                id="fullName"
                                value={formData.fullName}
                                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label htmlFor="phone">Phone *</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="gender">Gender *</Label>
                            <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="dob">Date of Birth</Label>
                            <Input
                                id="dob"
                                type="date"
                                value={formData.dob}
                                onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label htmlFor="emergencyContact">Emergency Contact</Label>
                            <Input
                                id="emergencyContact"
                                value={formData.emergencyContact}
                                onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Congregation Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="role">Role</Label>
                            <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="publisher">Publisher</SelectItem>
                                    <SelectItem value="elder">Elder</SelectItem>
                                    <SelectItem value="ministerial_servant">Ministerial Servant</SelectItem>
                                    <SelectItem value="pioneer">Pioneer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="group">Group</Label>
                            <Select value={formData.groupId} onValueChange={(value) => setFormData(prev => ({ ...prev, groupId: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select group">
                                        {formData.groupId && formData.groupId !== 'none' ? groups.find(g => g._id === formData.groupId)?.name : formData.groupId === 'none' ? "No Group" : "Select group"}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Group</SelectItem>
                                    {groups.map((group) => (
                                        <SelectItem key={group._id} value={group._id}>
                                            {group.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <div>
                        <Label>Privileges</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                            {privileges.map((privilege) => (
                                <div key={privilege._id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={privilege._id}
                                        checked={formData.privileges.includes(privilege._id)}
                                        onCheckedChange={(checked) => handlePrivilegeChange(privilege._id, checked as boolean)}
                                    />
                                    <Label htmlFor={privilege._id} className="text-sm">
                                        {privilege.name}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Member'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                </Button>
            </div>
        </form>
    )
}