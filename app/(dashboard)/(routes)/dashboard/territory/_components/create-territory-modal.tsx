"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { createTerritory } from "@/lib/actions/territory.actions"

interface CreateTerritoryModalProps {
    open: boolean
    onClose: () => void
    onSuccess: (territory: any) => void
}

export function CreateTerritoryModal({ open, onClose, onSuccess }: CreateTerritoryModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        number: "",
        name: "",
        type: "residential" as 'residential' | 'business' | 'rural' | 'foreign',
        difficulty: "medium" as 'easy' | 'medium' | 'hard',
        notes: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!formData.number.trim()) {
            toast.error("Territory number is required")
            return
        }

        setIsLoading(true)
        try {
            const territory = await createTerritory(formData)
            onSuccess(territory)
            toast.success("Territory created successfully")
            
            // Reset form
            setFormData({
                number: "",
                name: "",
                type: "residential",
                difficulty: "medium",
                notes: ""
            })
        } catch (error: any) {
            toast.error(error.message || "Failed to create territory")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New Territory</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="number">Territory Number *</Label>
                        <Input
                            id="number"
                            value={formData.number}
                            onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                            placeholder="e.g., T-001"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Territory Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Downtown Area"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select 
                                value={formData.type} 
                                onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="residential">Residential</SelectItem>
                                    <SelectItem value="business">Business</SelectItem>
                                    <SelectItem value="rural">Rural</SelectItem>
                                    <SelectItem value="foreign">Foreign Language</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Difficulty</Label>
                            <Select 
                                value={formData.difficulty} 
                                onValueChange={(value: any) => setFormData(prev => ({ ...prev, difficulty: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="easy">Easy</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="hard">Hard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Any special instructions or notes..."
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Creating..." : "Create Territory"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}