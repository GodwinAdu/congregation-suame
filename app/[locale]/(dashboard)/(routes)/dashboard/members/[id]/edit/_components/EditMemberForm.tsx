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
import { updateMember, fetchAllMembers } from '@/lib/actions/user.actions'
import { Plus, X, Crown, Phone, Heart } from 'lucide-react'
import { useEffect } from 'react'
import { EmergencyContactsSection } from '@/app/[locale]/(dashboard)/(routes)/dashboard/members/_components/EmergencyContactsSection'
import { MedicalInfoSection } from '@/app/[locale]/(dashboard)/(routes)/dashboard/members/_components/MedicalInfoSection'

interface EditMemberFormProps {
    member: any
    groups: any[]
    privileges: any[]
    members: any[]
}

export function EditMemberForm({ member, groups, privileges, members }: EditMemberFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [familyRelationships, setFamilyRelationships] = useState<Array<{ memberId: string; memberName: string; relationship: string }>>([])
    const [isFamilyHead, setIsFamilyHead] = useState(false)
    const [emergencyContacts, setEmergencyContacts] = useState<Array<{ name: string; relationship: string; phone: string; email?: string; isPrimary: boolean }>>([])
    const [medicalInfo, setMedicalInfo] = useState<any>({})
    const [formData, setFormData] = useState({
        fullName: member.fullName || '',
        email: member.email || '',
        phone: member.phone || '',
        alternatePhone: member.alternatePhone || '',
        gender: member.gender || '',
        dob: member.dob ? new Date(member.dob).toISOString().split('T')[0] : '',
        baptizedDate: member.baptizedDate ? new Date(member.baptizedDate).toISOString().split('T')[0] : '',
        address: member.address || '',
        emergencyContact: member.emergencyContact || '',
        pioneerStatus: member.pioneerStatus || null,
        pioneerStartDate: member.pioneerStartDate ? new Date(member.pioneerStartDate).toISOString().split('T')[0] : '',
        role: member.role || 'publisher',
        groupId: member.groupId?._id || 'none',
        privileges: member.privileges?.map((p: any) => p._id) || []
    })

    useEffect(() => {
        if (member.familyRelationships) {
            setFamilyRelationships(member.familyRelationships.map((rel: any) => ({
                memberId: rel.memberId._id || rel.memberId,
                memberName: rel.memberId.fullName || members.find(m => m._id === rel.memberId)?.fullName || '',
                relationship: rel.relationship
            })))
        }
        setIsFamilyHead(member.isFamilyHead || false)
        setEmergencyContacts(member.emergencyContacts || [])
        setMedicalInfo(member.medicalInfo || {})
    }, [member, members])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await updateMember(member._id, {
                ...formData,
                groupId: formData.groupId === 'none' ? null : formData.groupId,
                dob: formData.dob ? new Date(formData.dob) : undefined,
                baptizedDate: formData.baptizedDate ? new Date(formData.baptizedDate) : undefined,
                pioneerStartDate: formData.pioneerStartDate ? new Date(formData.pioneerStartDate) : undefined,
                emergencyContacts,
                medicalInfo,
                familyRelationships: familyRelationships.filter(r => r.memberId).map(r => ({
                    memberId: r.memberId,
                    relationship: r.relationship
                })),
                isFamilyHead
            })
            toast.success('Member updated successfully')
            router.push('/dashboard/members')
        } catch (error: any) {
            toast.error(error?.message ?? 'Failed to update member')
        } finally {
            setLoading(false)
        }
    }

    const handlePrivilegeChange = (privilegeId: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            privileges: checked
                ? [...prev.privileges, privilegeId]
                : prev.privileges.filter((id: string) => id !== privilegeId)
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
                            <Label htmlFor="alternatePhone">Alternate Phone</Label>
                            <Input
                                id="alternatePhone"
                                value={formData.alternatePhone}
                                onChange={(e) => setFormData(prev => ({ ...prev, alternatePhone: e.target.value }))}
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
                            <Label htmlFor="baptizedDate">Baptized Date</Label>
                            <Input
                                id="baptizedDate"
                                type="date"
                                value={formData.baptizedDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, baptizedDate: e.target.value }))}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="pioneerStatus">Pioneer Status</Label>
                            <Select value={formData.pioneerStatus || 'none'} onValueChange={(value) => setFormData(prev => ({ ...prev, pioneerStatus: value === 'none' ? null : value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select pioneer status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="regular">Regular Pioneer</SelectItem>
                                    <SelectItem value="auxiliary">Auxiliary Pioneer</SelectItem>
                                    <SelectItem value="special">Special Pioneer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="pioneerStartDate">Pioneer Start Date</Label>
                            <Input
                                id="pioneerStartDate"
                                type="date"
                                value={formData.pioneerStartDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, pioneerStartDate: e.target.value }))}
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

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Phone className="h-5 w-5" />
                        Emergency Contacts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <EmergencyContactsSection
                        contacts={emergencyContacts}
                        onChange={setEmergencyContacts}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5" />
                        Medical Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <MedicalInfoSection
                        medicalInfo={medicalInfo}
                        onChange={setMedicalInfo}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Family Relationships</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">Manage family members and their relationships</p>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant={isFamilyHead ? "default" : "outline"}
                                size="sm"
                                onClick={() => setIsFamilyHead(!isFamilyHead)}
                            >
                                <Crown className="w-4 h-4 mr-2" />
                                {isFamilyHead ? "Family Head" : "Set as Family Head"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setFamilyRelationships([...familyRelationships, { memberId: '', memberName: '', relationship: 'other' }])}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Family Member
                            </Button>
                        </div>
                    </div>

                    {familyRelationships.map((relationship, index) => (
                        <div key={index} className="flex gap-2 items-end p-3 bg-muted/50 rounded-lg">
                            <div className="flex-1">
                                <Label className="text-xs font-medium text-muted-foreground">Family Member</Label>
                                <Select
                                    value={relationship.memberId}
                                    onValueChange={(value) => {
                                        const memberData = members.find(m => m._id === value)
                                        const updated = [...familyRelationships]
                                        updated[index] = { ...updated[index], memberId: value, memberName: memberData?.fullName || '' }
                                        setFamilyRelationships(updated)
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select member" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {members.filter(m => m._id !== member._id).map((memberOption) => (
                                            <SelectItem key={memberOption._id} value={memberOption._id}>
                                                {memberOption.fullName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-32">
                                <Label className="text-xs font-medium text-muted-foreground">Relationship</Label>
                                <Select
                                    value={relationship.relationship}
                                    onValueChange={(value) => {
                                        const updated = [...familyRelationships]
                                        updated[index] = { ...updated[index], relationship: value }
                                        setFamilyRelationships(updated)
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="father">Father</SelectItem>
                                        <SelectItem value="mother">Mother</SelectItem>
                                        <SelectItem value="son">Son</SelectItem>
                                        <SelectItem value="daughter">Daughter</SelectItem>
                                        <SelectItem value="husband">Husband</SelectItem>
                                        <SelectItem value="wife">Wife</SelectItem>
                                        <SelectItem value="brother">Brother</SelectItem>
                                        <SelectItem value="sister">Sister</SelectItem>
                                        <SelectItem value="grandfather">Grandfather</SelectItem>
                                        <SelectItem value="grandmother">Grandmother</SelectItem>
                                        <SelectItem value="grandson">Grandson</SelectItem>
                                        <SelectItem value="granddaughter">Granddaughter</SelectItem>
                                        <SelectItem value="uncle">Uncle</SelectItem>
                                        <SelectItem value="aunt">Aunt</SelectItem>
                                        <SelectItem value="nephew">Nephew</SelectItem>
                                        <SelectItem value="niece">Niece</SelectItem>
                                        <SelectItem value="cousin">Cousin</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setFamilyRelationships(familyRelationships.filter((_, i) => i !== index))}
                                className="h-8 w-8 p-0"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
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