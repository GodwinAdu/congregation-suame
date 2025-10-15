"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Users, Calendar, Plus, Eye } from "lucide-react"
import { toast } from "sonner"
import { assignTerritory } from "@/lib/actions/territory.actions"
import { CreateTerritoryModal } from "./create-territory-modal"

interface Territory {
    _id: string
    number: string
    name?: string
    type: 'residential' | 'business' | 'rural' | 'foreign'
    assignedTo?: { _id: string; fullName: string }
    assignedDate?: Date
    lastWorked?: Date
    status: 'available' | 'assigned' | 'completed' | 'do-not-call'
    difficulty: 'easy' | 'medium' | 'hard'
    notes?: string
}

interface Member {
    _id: string
    fullName: string
}

interface TerritoryManagerProps {
    territories: Territory[]
    members: Member[]
}

export function TerritoryManager({ territories: initialTerritories, members }: TerritoryManagerProps) {
    const [territories, setTerritories] = useState<Territory[]>(initialTerritories)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [selectedFilter, setSelectedFilter] = useState<string>("all")

    const handleAssignTerritory = async (territoryId: string, publisherId: string) => {
        try {
            const updatedTerritory = await assignTerritory(territoryId, publisherId)
            
            setTerritories(prev => prev.map(t => 
                t._id === territoryId ? updatedTerritory : t
            ))
            
            toast.success("Territory assigned successfully")
        } catch (error: any) {
            toast.error(error.message || "Failed to assign territory")
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available': return 'bg-green-500'
            case 'assigned': return 'bg-blue-500'
            case 'completed': return 'bg-purple-500'
            case 'do-not-call': return 'bg-red-500'
            default: return 'bg-gray-500'
        }
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'text-green-600'
            case 'medium': return 'text-yellow-600'
            case 'hard': return 'text-red-600'
            default: return 'text-gray-600'
        }
    }

    const filteredTerritories = territories.filter(territory => {
        if (selectedFilter === "all") return true
        return territory.status === selectedFilter
    })

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Territories</SelectItem>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="assigned">Assigned</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="do-not-call">Do Not Call</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Territory
                </Button>
            </div>

            {/* Territory Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTerritories.map((territory) => (
                    <Card key={territory._id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Territory {territory.number}
                                </CardTitle>
                                <Badge className={`${getStatusColor(territory.status)} text-white`}>
                                    {territory.status}
                                </Badge>
                            </div>
                            {territory.name && (
                                <p className="text-sm text-muted-foreground">{territory.name}</p>
                            )}
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Type</p>
                                    <p className="font-medium capitalize">{territory.type}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Difficulty</p>
                                    <p className={`font-medium capitalize ${getDifficultyColor(territory.difficulty)}`}>
                                        {territory.difficulty}
                                    </p>
                                </div>
                            </div>

                            {territory.assignedTo && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Assigned to:</span>
                                    </div>
                                    <p className="font-medium">{territory.assignedTo.fullName}</p>
                                    {territory.assignedDate && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(territory.assignedDate).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            )}

                            {territory.lastWorked && (
                                <div className="text-sm">
                                    <p className="text-muted-foreground">Last worked:</p>
                                    <p>{new Date(territory.lastWorked).toLocaleDateString()}</p>
                                </div>
                            )}

                            {territory.notes && (
                                <div className="text-sm">
                                    <p className="text-muted-foreground">Notes:</p>
                                    <p className="text-xs bg-muted p-2 rounded">{territory.notes}</p>
                                </div>
                            )}

                            <div className="flex gap-2 pt-2">
                                {territory.status === 'available' && (
                                    <Select onValueChange={(value) => handleAssignTerritory(territory._id, value)}>
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="Assign to..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {members.map(member => (
                                                <SelectItem key={member._id} value={member._id}>
                                                    {member.fullName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Eye className="h-4 w-4" />
                                    View
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredTerritories.length === 0 && (
                <Card>
                    <CardContent className="text-center py-12">
                        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No territories found</h3>
                        <p className="text-muted-foreground mb-4">
                            {selectedFilter === "all" 
                                ? "Start by adding your first territory"
                                : `No territories with status: ${selectedFilter}`
                            }
                        </p>
                        {selectedFilter === "all" && (
                            <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add Territory
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            <CreateTerritoryModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={(newTerritory) => {
                    setTerritories(prev => [...prev, newTerritory])
                    setShowCreateModal(false)
                }}
            />
        </div>
    )
}