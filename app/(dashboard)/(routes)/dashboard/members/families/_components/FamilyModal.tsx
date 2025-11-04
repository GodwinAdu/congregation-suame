"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, X, Crown } from 'lucide-react'
import { createFamily, updateFamily } from '@/lib/actions/family.actions'
import { fetchAllMembers } from '@/lib/actions/user.actions'
import { toast } from 'sonner'

interface Member {
    _id: string
    fullName: string
}

interface FamilyMember {
    memberId: string
    memberName: string
    relationship: string
    isHead: boolean
}

interface FamilyModalProps {
    open: boolean
    onClose: () => void
    onSuccess: () => void
    family?: {
        _id: string
        familyName: string
        headOfFamily: {
            _id: string
            fullName: string
        }
        members: Array<{
            memberId: {
                _id: string
                fullName: string
            }
            relationship: string
            isHead: boolean
        }>
    }
}

const relationships = [
    'father', 'mother', 'son', 'daughter', 'husband', 'wife', 
    'brother', 'sister', 'grandfather', 'grandmother', 
    'grandson', 'granddaughter', 'other'
]

const FamilyModal = ({ open, onClose, onSuccess, family }: FamilyModalProps) => {
    const [loading, setLoading] = useState(false)
    const [members, setMembers] = useState<Member[]>([])
    const [formData, setFormData] = useState({
        familyName: '',
        headOfFamily: ''
    })
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])

    useEffect(() => {
        if (open) {
            fetchMembersList()
            if (family) {
                setFormData({
                    familyName: family.familyName,
                    headOfFamily: family.headOfFamily?._id || ''
                })
                setFamilyMembers(family.members.map(m => ({
                    memberId: m.memberId._id,
                    memberName: m.memberId.fullName,
                    relationship: m.relationship,
                    isHead: m.isHead
                })))
            } else {
                setFormData({ familyName: '', headOfFamily: '' })
                setFamilyMembers([])
            }
        }
    }, [open, family])

    const fetchMembersList = async () => {
        try {
            const data = await fetchAllMembers()
            setMembers(data)
        } catch (error) {
            console.error('Error fetching members:', error)
        }
    }

    const addFamilyMember = () => {
        setFamilyMembers([...familyMembers, { 
            memberId: '', 
            memberName: '', 
            relationship: 'other', 
            isHead: false 
        }])
    }

    const removeFamilyMember = (index: number) => {
        setFamilyMembers(familyMembers.filter((_, i) => i !== index))
    }

    const updateFamilyMember = (index: number, field: string, value: string | boolean) => {
        const updated = [...familyMembers]
        if (field === 'memberId') {
            const member = members.find(m => m._id === value)
            updated[index] = { 
                ...updated[index], 
                memberId: value as string, 
                memberName: member?.fullName || '' 
            }
        } else if (field === 'isHead') {
            // Only one head per family
            updated.forEach((m, i) => m.isHead = i === index ? value as boolean : false)
            if (value) {
                setFormData({ ...formData, headOfFamily: updated[index].memberId })
            }
        } else {
            updated[index] = { ...updated[index], [field]: value }
        }
        setFamilyMembers(updated)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.familyName || familyMembers.length === 0) {
            toast.error('Please fill in family name and add at least one member')
            return
        }

        setLoading(true)
        try {
            const familyData = {
                familyName: formData.familyName,
                headOfFamily: formData.headOfFamily,
                members: familyMembers.filter(m => m.memberId).map(m => ({
                    memberId: m.memberId,
                    relationship: m.relationship,
                    isHead: m.isHead
                }))
            }

            if (family) {
                await updateFamily(family._id, familyData)
                toast.success('Family updated successfully')
            } else {
                await createFamily(familyData)
                toast.success('Family created successfully')
            }
            onSuccess()
            onClose()
        } catch (error) {
            toast.error(family ? 'Failed to update family' : 'Failed to create family')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{family ? 'Edit' : 'Create'} Family</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="familyName">Family Name *</Label>
                        <Input
                            id="familyName"
                            value={formData.familyName}
                            onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
                            placeholder="e.g., Smith Family"
                            required
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label>Family Members</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addFamilyMember}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Member
                            </Button>
                        </div>
                        
                        {familyMembers.map((member, index) => (
                            <div key={index} className="flex gap-2 items-end p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <Label className="text-xs">Member</Label>
                                    <Select
                                        value={member.memberId}
                                        onValueChange={(value) => updateFamilyMember(index, 'memberId', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select member" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {members.map((m) => (
                                                <SelectItem key={m._id} value={m._id}>
                                                    {m.fullName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-32">
                                    <Label className="text-xs">Relationship</Label>
                                    <Select
                                        value={member.relationship}
                                        onValueChange={(value) => updateFamilyMember(index, 'relationship', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {relationships.map((rel) => (
                                                <SelectItem key={rel} value={rel}>
                                                    {rel.charAt(0).toUpperCase() + rel.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-col items-center">
                                    <Label className="text-xs mb-1">Head</Label>
                                    <Button
                                        type="button"
                                        variant={member.isHead ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => updateFamilyMember(index, 'isHead', !member.isHead)}
                                        className="h-8 w-8 p-0"
                                    >
                                        <Crown className="w-4 h-4" />
                                    </Button>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeFamilyMember(index)}
                                    className="h-8 w-8 p-0"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : (family ? 'Update' : 'Create')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default FamilyModal