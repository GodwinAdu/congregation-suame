"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Loader2, BookOpen, Clock, Calendar } from "lucide-react"
import { toast } from "sonner"
import { submitFieldServiceReport } from "@/lib/actions/publisher.actions"
import { format, subMonths } from "date-fns"

interface FieldServiceReportModalProps {
    open: boolean
    onClose: () => void
    currentMonth: string
    existingReport?: any
}

export function FieldServiceReportModal({ 
    open, 
    onClose, 
    currentMonth, 
    existingReport 
}: FieldServiceReportModalProps) {
    const [selectedMonth, setSelectedMonth] = useState(currentMonth)
    
    // Update selectedMonth when currentMonth changes (when modal opens with specific month)
    useEffect(() => {
        setSelectedMonth(currentMonth)
    }, [currentMonth])
    const [formData, setFormData] = useState({
        hours: existingReport?.hours || 0,
        bibleStudents: existingReport?.bibleStudents || 0,
        auxiliaryPioneer: existingReport?.auxiliaryPioneer || false,
        comments: existingReport?.comments || ""
    })
    const [loading, setLoading] = useState(false)
    
    const monthOptions = Array.from({ length: 12 }, (_, i) => {
        const date = subMonths(new Date(), 6 - i)
        return {
            value: format(date, 'yyyy-MM'),
            label: format(date, 'MMMM yyyy')
        }
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        setLoading(true)
        try {
            await submitFieldServiceReport({
                month: selectedMonth,
                ...formData
            })
            
            toast.success("Field service report submitted successfully!")
            onClose()
            window.location.reload() // Refresh to show updated data
        } catch (error) {
            toast.error("Failed to submit report. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const getMonthName = (monthStr: string) => {
        const [year, month] = monthStr.split('-')
        return format(new Date(parseInt(year), parseInt(month) - 1), 'MMMM yyyy')
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Field Service Report
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="month" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            Report Month
                        </Label>
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {monthOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="hours" className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-blue-600" />
                                Hours
                            </Label>
                            <Input
                                id="hours"
                                type="number"
                                min="0"
                                step="0.5"
                                value={formData.hours}
                                onChange={(e) => setFormData(prev => ({ 
                                    ...prev, 
                                    hours: parseFloat(e.target.value) || 0 
                                }))}
                                placeholder="0"
                                className="text-center text-lg font-semibold"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bibleStudents" className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-purple-600" />
                                Bible Studies
                            </Label>
                            <Input
                                id="bibleStudents"
                                type="number"
                                min="0"
                                value={formData.bibleStudents}
                                onChange={(e) => setFormData(prev => ({ 
                                    ...prev, 
                                    bibleStudents: parseInt(e.target.value) || 0 
                                }))}
                                placeholder="0"
                                className="text-center text-lg font-semibold"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="auxiliaryPioneer"
                            checked={formData.auxiliaryPioneer}
                            onCheckedChange={(checked) => setFormData(prev => ({ 
                                ...prev, 
                                auxiliaryPioneer: checked as boolean 
                            }))}
                        />
                        <Label htmlFor="auxiliaryPioneer" className="text-sm font-medium">
                            I served as an Auxiliary Pioneer this month
                        </Label>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="comments">Comments (Optional)</Label>
                        <Textarea
                            id="comments"
                            value={formData.comments}
                            onChange={(e) => setFormData(prev => ({ 
                                ...prev, 
                                comments: e.target.value 
                            }))}
                            placeholder="Any additional comments about your field service..."
                            rows={3}
                        />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">Report Summary</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Hours:</span>
                                <span className="font-semibold ml-2">{formData.hours}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Studies:</span>
                                <span className="font-semibold ml-2">{formData.bibleStudents}</span>
                            </div>
                        </div>
                        {formData.auxiliaryPioneer && (
                            <div className="mt-2 text-sm">
                                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                                    Auxiliary Pioneer
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <FileText className="h-4 w-4 mr-2" />
                                    {existingReport ? 'Update Report' : 'Submit Report'}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}