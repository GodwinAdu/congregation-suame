"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DollarSign } from "lucide-react"
import { setOpeningBalance } from "@/lib/actions/financial.actions"
import { toast } from "sonner"

export function OpeningBalanceModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        amount: '',
        notes: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        
        try {
            await setOpeningBalance({
                year: formData.year,
                month: formData.month,
                amount: parseFloat(formData.amount),
                notes: formData.notes || undefined
            })
            
            toast.success('Opening balance set successfully')
            setIsOpen(false)
            setFormData({
                year: new Date().getFullYear(),
                month: new Date().getMonth() + 1,
                amount: '',
                notes: ''
            })
        } catch (error) {
            toast.error('Failed to set opening balance')
        } finally {
            setLoading(false)
        }
    }

    const getMonthName = (month: number) => {
        return new Date(2024, month - 1).toLocaleString('default', { month: 'long' })
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <DollarSign className="h-4 w-4" />
                    Set Opening Balance
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Set Opening Balance</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="year">Year</Label>
                            <Select value={formData.year.toString()} onValueChange={(value) => setFormData({...formData, year: parseInt(value)})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 5 }, (_, i) => {
                                        const year = new Date().getFullYear() - 2 + i
                                        return (
                                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                        )
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="month">Month</Label>
                            <Select value={formData.month.toString()} onValueChange={(value) => setFormData({...formData, month: parseInt(value)})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 12 }, (_, i) => {
                                        const month = i + 1
                                        return (
                                            <SelectItem key={month} value={month.toString()}>
                                                {getMonthName(month)}
                                            </SelectItem>
                                        )
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <div>
                        <Label htmlFor="amount">Opening Balance Amount (₵)</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData({...formData, amount: e.target.value})}
                            placeholder="0.00"
                            required
                        />
                    </div>
                    
                    <div>
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            placeholder="Additional notes about this opening balance"
                            rows={3}
                        />
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                        <Button type="submit" disabled={loading} className="flex-1">
                            {loading ? 'Setting...' : 'Set Opening Balance'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}