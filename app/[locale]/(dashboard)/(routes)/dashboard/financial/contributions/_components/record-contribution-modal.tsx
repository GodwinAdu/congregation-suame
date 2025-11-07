"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { recordContribution } from "@/lib/actions/financial.actions"

interface Member {
    _id: string
    fullName: string
}

interface RecordContributionModalProps {
    open: boolean
    onClose: () => void
    members: Member[]
    onSuccess: (contribution: any) => void
}

export function RecordContributionModal({ open, onClose, members, onSuccess }: RecordContributionModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        memberId: "",
        amount: "",
        type: "worldwide-work",
        method: "cash" as 'cash' | 'check' | 'online' | 'bank-transfer',
        anonymous: false,
        meetingDate: new Date().toISOString().split('T')[0],
        notes: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            toast.error("Please enter a valid amount")
            return
        }

        setIsLoading(true)
        try {
            const contribution = await recordContribution({
                memberId: formData.anonymous ? undefined : formData.memberId || undefined,
                amount: parseFloat(formData.amount),
                type: formData.type,
                method: formData.method,
                anonymous: formData.anonymous,
                meetingDate: new Date(formData.meetingDate),
                notes: formData.notes || undefined
            })
            
            onSuccess(contribution)
            toast.success("Contribution recorded successfully")
            
            // Reset form
            setFormData({
                memberId: "",
                amount: "",
                type: "worldwide-work",
                method: "cash",
                anonymous: false,
                meetingDate: new Date().toISOString().split('T')[0],
                notes: ""
            })
        } catch (error: any) {
            toast.error(error.message || "Failed to record contribution")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Record Contribution</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount *</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.amount}
                            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                            placeholder="0.00"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Contribution Type *</Label>
                        <Select 
                            value={formData.type} 
                            onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="worldwide-work">Worldwide Work</SelectItem>
                                <SelectItem value="local-congregation-expenses">Local Congregation Expenses</SelectItem>
                                <SelectItem value="kingdom-hall-construction">Kingdom Hall Construction</SelectItem>
                                <SelectItem value="circuit-assembly-expenses">Circuit Assembly Expenses</SelectItem>
                                <SelectItem value="co-visit-expenses">CO Visit Expenses</SelectItem>
                                <SelectItem value="disaster-relief">Disaster Relief</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Payment Method *</Label>
                        <Select 
                            value={formData.method} 
                            onValueChange={(value: any) => setFormData(prev => ({ ...prev, method: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="check">Check</SelectItem>
                                <SelectItem value="online">Online</SelectItem>
                                <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="anonymous"
                            checked={formData.anonymous}
                            onCheckedChange={(checked) => 
                                setFormData(prev => ({ ...prev, anonymous: checked as boolean }))
                            }
                        />
                        <Label htmlFor="anonymous">Anonymous contribution</Label>
                    </div>

                    {!formData.anonymous && (
                        <div className="space-y-2">
                            <Label>Member (Optional)</Label>
                            <Select 
                                value={formData.memberId} 
                                onValueChange={(value) => setFormData(prev => ({ ...prev, memberId: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select member..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {members.map(member => (
                                        <SelectItem key={member._id} value={member._id}>
                                            {member.fullName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="meetingDate">Meeting Date *</Label>
                        <Input
                            id="meetingDate"
                            type="date"
                            value={formData.meetingDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, meetingDate: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Any additional notes..."
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Recording..." : "Record Contribution"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}