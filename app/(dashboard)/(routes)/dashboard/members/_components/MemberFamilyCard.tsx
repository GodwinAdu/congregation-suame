"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Crown } from 'lucide-react'
import { fetchMemberById } from '@/lib/actions/user.actions'

interface FamilyRelationship {
    memberId: {
        _id: string
        fullName: string
    }
    relationship: string
}

interface Member {
    _id: string
    fullName: string
    familyRelationships: FamilyRelationship[]
    isFamilyHead: boolean
}

interface MemberFamilyCardProps {
    memberId: string
}

const MemberFamilyCard = ({ memberId }: MemberFamilyCardProps) => {
    const [member, setMember] = useState<Member | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchMember = async () => {
            try {
                const data = await fetchMemberById(memberId)
                setMember(data)
            } catch (error) {
                console.error('Error fetching member:', error)
            } finally {
                setLoading(false)
            }
        }

        if (memberId) {
            fetchMember()
        }
    }, [memberId])

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
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Family Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground">Loading...</div>
                </CardContent>
            </Card>
        )
    }

    if (!member || !member.familyRelationships || member.familyRelationships.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Family Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground">
                        No family relationships added
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Family Relationships
                    {member.isFamilyHead && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                            <Crown className="w-3 h-3 mr-1" />
                            Family Head
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <h4 className="font-medium text-sm">Family Members:</h4>
                    {member.familyRelationships.map((relationship, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm">{relationship.memberId.fullName}</span>
                            <Badge className={getRelationshipColor(relationship.relationship)} size="sm">
                                {relationship.relationship}
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export default MemberFamilyCard