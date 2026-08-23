"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
    Users, Plus, Edit, Trash2, MoreVertical, Crown,
    Search, Loader2, UserCircle, Heart
} from 'lucide-react'
import { fetchFamilies, deleteFamily } from '@/lib/actions/family.actions'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import FamilyModal from './FamilyModal'
import { toast } from 'sonner'

interface FamilyMember {
    memberId: {
        _id: string
        fullName: string
        phone?: string
        gender?: string
        profileImage?: string
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
        phone?: string
        gender?: string
        profileImage?: string
    }
    members: FamilyMember[]
    createdAt: string
}

const FamilyGrid = () => {
    const [families, setFamilies] = useState<Family[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingFamily, setEditingFamily] = useState<Family | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    const fetchFamilyData = async () => {
        try {
            setLoading(true)
            const data = await fetchFamilies()
            setFamilies(data)
        } catch (error) {
            console.error('Error fetching families:', error)
            toast.error('Failed to load families')
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
        const colors: Record<string, string> = {
            father: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            mother: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
            husband: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            wife: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
            son: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            daughter: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
            brother: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
            sister: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            grandfather: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
            grandmother: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
            grandson: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
            granddaughter: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/30 dark:text-fuchsia-300',
        }
        return colors[relationship] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    const getGenderColor = (gender?: string) => {
        if (gender === 'male') return 'bg-blue-500'
        if (gender === 'female') return 'bg-pink-500'
        return 'bg-gray-500'
    }

    const filteredFamilies = families.filter(family =>
        family.familyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        family.headOfFamily?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        family.members.some(m => m.memberId?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-muted-foreground">Loading families...</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div className="flex items-center gap-3 flex-1">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search families..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Badge variant="secondary" className="hidden sm:flex">
                        {families.length} {families.length === 1 ? 'family' : 'families'}
                    </Badge>
                </div>
                <Button onClick={() => setShowModal(true)} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Family
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card>
                    <CardContent className="pt-4 pb-3 px-4">
                        <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-red-500" />
                            <div>
                                <p className="text-lg font-bold">{families.length}</p>
                                <p className="text-xs text-muted-foreground">Total Families</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 pb-3 px-4">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-500" />
                            <div>
                                <p className="text-lg font-bold">
                                    {families.reduce((acc, f) => acc + f.members.length, 0)}
                                </p>
                                <p className="text-xs text-muted-foreground">Total Members</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 pb-3 px-4">
                        <div className="flex items-center gap-2">
                            <UserCircle className="h-4 w-4 text-green-500" />
                            <div>
                                <p className="text-lg font-bold">
                                    {Math.round(families.reduce((acc, f) => acc + f.members.length, 0) / Math.max(families.length, 1))}
                                </p>
                                <p className="text-xs text-muted-foreground">Avg. Size</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 pb-3 px-4">
                        <div className="flex items-center gap-2">
                            <Crown className="h-4 w-4 text-yellow-500" />
                            <div>
                                <p className="text-lg font-bold">
                                    {families.filter(f => f.headOfFamily).length}
                                </p>
                                <p className="text-xs text-muted-foreground">With Head</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Family Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredFamilies.map((family) => (
                    <Card key={family._id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Users className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">{family.familyName}</CardTitle>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {family.members.length} {family.members.length === 1 ? 'member' : 'members'}
                                        </p>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleEdit(family)}>
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit Family
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleDelete(family._id)}
                                            className="text-red-600 focus:text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete Family
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            {/* Head of Family */}
                            {family.headOfFamily && (
                                <>
                                    <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800/30">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className={`text-xs text-white ${getGenderColor(family.headOfFamily.gender)}`}>
                                                {getInitials(family.headOfFamily.fullName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{family.headOfFamily.fullName}</p>
                                            {family.headOfFamily.phone && (
                                                <p className="text-xs text-muted-foreground">{family.headOfFamily.phone}</p>
                                            )}
                                        </div>
                                        <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700 dark:text-yellow-400 flex-shrink-0">
                                            <Crown className="h-3 w-3 mr-1" />
                                            Head
                                        </Badge>
                                    </div>
                                    <Separator />
                                </>
                            )}

                            {/* Family Members */}
                            <div className="space-y-2">
                                {family.members
                                    .filter(m => m.memberId?._id !== family.headOfFamily?._id)
                                    .map((member, index) => (
                                        <div key={index} className="flex items-center gap-2 py-1">
                                            <Avatar className="h-7 w-7">
                                                <AvatarFallback className={`text-xs text-white ${getGenderColor(member.memberId?.gender)}`}>
                                                    {member.memberId?.fullName ? getInitials(member.memberId.fullName) : '?'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm flex-1 truncate">
                                                {member.memberId?.fullName || 'Unknown'}
                                            </span>
                                            <Badge
                                                variant="secondary"
                                                className={`text-xs capitalize flex-shrink-0 ${getRelationshipColor(member.relationship)}`}
                                            >
                                                {member.relationship}
                                            </Badge>
                                        </div>
                                    ))}

                                {/* Show head in the list too if they're also in members array */}
                                {family.members
                                    .filter(m => m.memberId?._id === family.headOfFamily?._id && m.memberId?._id)
                                    .length === 0 && family.members.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-2">
                                        No additional members
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Empty State */}
            {filteredFamilies.length === 0 && !loading && (
                <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                        <Users className="w-8 h-8 text-muted-foreground" />
                    </div>
                    {searchQuery ? (
                        <>
                            <h3 className="text-lg font-medium mb-2">No families found</h3>
                            <p className="text-muted-foreground mb-4">
                                No families match &quot;{searchQuery}&quot;. Try a different search.
                            </p>
                        </>
                    ) : (
                        <>
                            <h3 className="text-lg font-medium mb-2">No families created yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Start by creating your first family group to organize members
                            </p>
                            <Button onClick={() => setShowModal(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Family
                            </Button>
                        </>
                    )}
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
