"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Plus, Edit, Trash2, MoreVertical, Crown } from 'lucide-react'
import { fetchFamilies, deleteFamily } from '@/lib/actions/family.actions'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import FamilyModal from './FamilyModal'
import { toast } from 'sonner'

interface FamilyMember {
    memberId: {
        _id: string
        fullName: string
    }
    relationship: string
    isHead: boolean
}

interface Family {
    _id: string
    familyName: string
    headOfFamily: {
        _id: string
        fullName: string
    }
    members: FamilyMember[]
}

const FamilyGrid = () => {
    const [families, setFamilies] = useState<Family[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingFamily, setEditingFamily] = useState<Family | null>(null)

    const fetchFamilyData = async () => {
        try {
            const data = await fetchFamilies()
            setFamilies(data)
        } catch (error) {
            console.error('Error fetching families:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchFamilyData()
    }, [])

    const handleEdit = (family: Family) => {
        setEditingFamily(family)
        setShowModal(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this family?')) return
        
        try {
            await deleteFamily(id)
            toast.success('Family deleted successfully')
            fetchFamilyData()
        } catch (error) {
            toast.error('Failed to delete family')
        }
    }

    const handleModalClose = () => {
        setShowModal(false)
        setEditingFamily(null)
    }

    const getRelationshipColor = (relationship: string) => {
        const colors = {
            father: 'bg-blue-100 text-blue-800',
            mother: 'bg-pink-100 text-pink-800',
            husband: 'bg-blue-100 text-blue-800',
            wife: 'bg-pink-100 text-pink-800',
            son: 'bg-green-100 text-green-800',
            daughter: 'bg-purple-100 text-purple-800',
            brother: 'bg-orange-100 text-orange-800',
            sister: 'bg-yellow-100 text-yellow-800',
            default: 'bg-gray-100 text-gray-800'
        }
        return colors[relationship as keyof typeof colors] || colors.default
    }

    if (loading) {
        return <div className="text-center py-8">Loading families...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h2 className="text-xl lg:text-2xl font-bold">Family Management</h2>
                <Button onClick={() => setShowModal(true)} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Family
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {families.map((family) => (
                    <Card key={family._id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{family.familyName}</CardTitle>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleEdit(family)}>
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            onClick={() => handleDelete(family._id)}
                                            className="text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="w-4 h-4" />
                                {family.members.length} members
                            </div>
                            
                            {family.headOfFamily && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Crown className="w-4 h-4 text-yellow-600" />
                                    <span className="font-medium">{family.headOfFamily.fullName}</span>
                                    <Badge variant="outline" className="text-xs">Head</Badge>
                                </div>
                            )}

                            <div className="space-y-2">
                                {family.members.slice(0, 4).map((member, index) => (
                                    <div key={index} className="flex justify-between items-center text-sm">
                                        <span className="truncate">{member.memberId.fullName}</span>
                                        <Badge className={getRelationshipColor(member.relationship)} size="sm">
                                            {member.relationship}
                                        </Badge>
                                    </div>
                                ))}
                                {family.members.length > 4 && (
                                    <div className="text-xs text-muted-foreground text-center">
                                        +{family.members.length - 4} more members
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {families.length === 0 && (
                <div className="text-center py-12">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No families created</h3>
                    <p className="text-muted-foreground mb-4">
                        Start by creating your first family group
                    </p>
                    <Button onClick={() => setShowModal(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Family
                    </Button>
                </div>
            )}

            <FamilyModal 
                open={showModal} 
                onClose={handleModalClose}
                onSuccess={fetchFamilyData}
                family={editingFamily || undefined}
            />
        </div>
    )
}

export default FamilyGrid