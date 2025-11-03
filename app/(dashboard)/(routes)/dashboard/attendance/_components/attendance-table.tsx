"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2 } from "lucide-react"
import { updateAttendance, deleteAttendance } from "@/lib/actions/attendance.actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface AttendanceTableProps {
    searchTerm: string
    attendanceData: any[]
}

export function AttendanceTable({ searchTerm, attendanceData }: AttendanceTableProps) {
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editValue, setEditValue] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const filteredRecords = attendanceData.filter(
        (record) =>
            record.meetingType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            new Date(record.date).toLocaleDateString().includes(searchTerm) ||
            record.attendance.toString().includes(searchTerm)
    )

    const handleEdit = (id: string, currentValue: number) => {
        setEditingId(id)
        setEditValue(currentValue.toString())
    }

    const handleSave = async (id: string) => {
        const newValue = parseInt(editValue);
        
        if (isNaN(newValue) || newValue < 0) {
            toast.error("Please enter a valid attendance number");
            return;
        }
        
        if (newValue > 1000) {
            toast.error("Attendance seems too high, please verify");
            return;
        }
        
        setLoading(true)
        try {
            await updateAttendance(id, { attendance: newValue })
            router.refresh()
            setEditingId(null)
            setEditValue("")
            toast.success("Attendance updated successfully")
        } catch (error: any) {
            const errorMessage = error?.message || "Failed to update attendance";
            toast.error(errorMessage)
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        setEditingId(null)
        setEditValue("")
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this attendance record?")) return
        
        setLoading(true)
        try {
            await deleteAttendance(id)
            toast.success("Attendance record deleted successfully")
            router.refresh()
        } catch (error) {
            toast.error("Failed to delete attendance record")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const getTotalByType = (type: "Midweek" | "Weekend") => {
        return attendanceData.filter((record) => record.meetingType === type).reduce((sum, record) => sum + record.attendance, 0)
    }

    const getAverageByType = (type: "Midweek" | "Weekend") => {
        const typeRecords = attendanceData.filter((record) => record.meetingType === type)
        if (typeRecords.length === 0) return 0
        return Math.round(getTotalByType(type) / typeRecords.length)
    }

    return (
        <div className="space-y-6">
            {/* Modern Table */}
            <div className="overflow-hidden rounded-lg border border-border bg-card">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Meeting Type</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Week</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Date</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Attendance</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredRecords.map((record, index) => (
                                <tr
                                    key={record._id}
                                    className={`hover:bg-muted/30 transition-colors ${index % 2 === 0 ? "bg-background" : "bg-muted/10"}`}
                                >
                                    <td className="px-6 py-4">
                                        <Badge
                                            variant={record.meetingType === "Weekend" ? "default" : "secondary"}
                                            className={
                                                record.meetingType === "Weekend"
                                                    ? "bg-secondary text-secondary-foreground"
                                                    : "bg-primary text-primary-foreground"
                                            }
                                        >
                                            {record.meetingType || "Midweek"}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-foreground">Week {record.week || 1}</td>
                                    <td className="px-6 py-4 text-sm text-foreground">{new Date(record.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        {editingId === record._id ? (
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    className="w-20 h-8"
                                                    autoFocus
                                                    disabled={loading}
                                                    min="0"
                                                    max="1000"
                                                />
                                                <Button 
                                                    size="sm" 
                                                    onClick={() => handleSave(record._id)} 
                                                    className="h-8 px-2"
                                                    disabled={loading}
                                                >
                                                    {loading ? "Saving..." : "Save"}
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={handleCancel}
                                                    className="h-8 px-2"
                                                    disabled={loading}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        ) : (
                                            <span className="text-lg font-semibold text-foreground">{record.attendance}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(record._id, record.attendance)}
                                                className="h-8 w-8 p-0"
                                                disabled={loading}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(record._id)}
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                disabled={loading}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {attendanceData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    No attendance records found.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-card-foreground mb-4">Midweek Meeting Summary</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Attendance:</span>
                                <span className="font-semibold text-foreground">{getTotalByType("Midweek")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Average:</span>
                                <span className="font-semibold text-foreground">{getAverageByType("Midweek")}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-card-foreground mb-4">Weekend Meeting Summary</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Attendance:</span>
                                <span className="font-semibold text-foreground">{getTotalByType("Weekend")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Average:</span>
                                <span className="font-semibold text-foreground">{getAverageByType("Weekend")}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}