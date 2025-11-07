"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Member {
    _id: string
    fullName: string
    role?: string
    gender?: string
}

interface EligibleMemberSelectProps {
    assignmentType: string
    value: string
    onValueChange: (value: string) => void
    getEligibleMembers: (assignmentType: string) => Promise<Member[]>
    placeholder?: string
}

export function EligibleMemberSelect({ 
    assignmentType, 
    value, 
    onValueChange, 
    getEligibleMembers, 
    placeholder = "Select member" 
}: EligibleMemberSelectProps) {
    const [eligibleMembers, setEligibleMembers] = useState<Member[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const fetchEligibleMembers = async () => {
            if (!assignmentType) return
            
            setIsLoading(true)
            try {
                const members = await getEligibleMembers(assignmentType)
                setEligibleMembers(members)
            } catch (error) {
                console.error('Error fetching eligible members:', error)
                setEligibleMembers([])
            } finally {
                setIsLoading(false)
            }
        }

        fetchEligibleMembers()
    }, [assignmentType, getEligibleMembers])

    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Loading..." : placeholder} />
            </SelectTrigger>
            <SelectContent>
                {eligibleMembers.length > 0 ? (
                    eligibleMembers.map((member) => (
                        <SelectItem key={member._id} value={member._id}>
                            {member.fullName} {member.role && `(${member.role})`}
                        </SelectItem>
                    ))
                ) : (
                    <SelectItem value="no-members" disabled>
                        {isLoading ? "Loading..." : "No eligible members found"}
                    </SelectItem>
                )}
            </SelectContent>
        </Select>
    )
}