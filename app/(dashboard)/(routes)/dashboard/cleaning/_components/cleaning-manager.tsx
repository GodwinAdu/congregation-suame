"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Package, Plus, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { updateCleaningTask, updateInventoryItem } from "@/lib/actions/cleaning.actions"
import { AddTaskModal } from "./add-task-modal"
import { AddInventoryModal } from "./add-inventory-modal"

interface CleaningTask {
    _id: string
    area: string
    task: string
    frequency: string
    assignedTo?: { _id: string; fullName: string }
    dueDate: string
    completedDate?: string
    status: "Pending" | "In Progress" | "Completed" | "Overdue"
    priority: "Low" | "Medium" | "High"
    notes?: string
}

interface InventoryItem {
    _id: string
    name: string
    category: string
    quantity: number
    unit: string
    minQuantity: number
    location: string
    supplier?: string
    cost?: number
    lastRestocked?: string
    notes?: string
}

interface Member {
    _id: string
    fullName: string
}

interface CleaningManagerProps {
    initialTasks: CleaningTask[]
    initialInventory: InventoryItem[]
    members: Member[]
}

export function CleaningManager({ initialTasks, initialInventory, members }: CleaningManagerProps) {
    const [tasks, setTasks] = useState<CleaningTask[]>(initialTasks)
    const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory)
    const [showTaskModal, setShowTaskModal] = useState(false)
    const [showInventoryModal, setShowInventoryModal] = useState(false)

    const handleTaskStatusUpdate = async (taskId: string, status: string) => {
        try {
            const updatedTask = await updateCleaningTask(taskId, {
                status: status as any,
                completedDate: status === "Completed" ? new Date() : undefined
            })

            setTasks(prev => prev.map(task =>
                task._id === taskId ? { ...task, status: status as any, completedDate: updatedTask.completedDate } : task
            ))

            toast.success("Task status updated")
        } catch (error: any) {
            toast.error(error.message || "Failed to update task")
        }
    }

    const handleAssignTask = async (taskId: string, memberId: string) => {
        try {
            await updateCleaningTask(taskId, { assignedTo: memberId })

            const member = members.find(m => m._id === memberId)
            setTasks(prev => prev.map(task =>
                task._id === taskId ? { ...task, assignedTo: member } : task
            ))

            toast.success("Task assigned successfully")
        } catch (error: any) {
            toast.error(error.message || "Failed to assign task")
        }
    }

    const handleInventoryUpdate = async (itemId: string, quantity: number) => {
        try {
            await updateInventoryItem(itemId, { quantity })

            setInventory(prev => prev.map(item =>
                item._id === itemId ? { ...item, quantity } : item
            ))

            toast.success("Inventory updated")
        } catch (error: any) {
            toast.error(error.message || "Failed to update inventory")
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Completed": return "bg-green-100 text-green-800"
            case "In Progress": return "bg-blue-100 text-blue-800"
            case "Overdue": return "bg-red-100 text-red-800"
            default: return "bg-gray-100 text-gray-800"
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "High": return "bg-red-100 text-red-800"
            case "Medium": return "bg-yellow-100 text-yellow-800"
            default: return "bg-green-100 text-green-800"
        }
    }

    const lowStockItems = inventory.filter(item => item.quantity <= item.minQuantity)

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Sparkles className="h-8 w-8 text-primary" />
                        </div>
                        <h1 className="text-4xl font-bold text-foreground">Kingdom Hall Management</h1>
                    </div>
                    <p className="text-muted-foreground text-lg">
                        Manage cleaning tasks and inventory for the Kingdom Hall
                    </p>
                </div>

                <Tabs defaultValue="tasks" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="tasks">Cleaning Tasks</TabsTrigger>
                        <TabsTrigger value="inventory">Inventory</TabsTrigger>
                    </TabsList>

                    <TabsContent value="tasks" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-semibold">Cleaning Tasks</h2>
                            <Button onClick={() => setShowTaskModal(true)} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add Task
                            </Button>
                        </div>

                        <div className="grid gap-4">
                            {tasks.map((task) => (
                                <Card key={task._id}>
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold">{task.task}</h3>
                                                    <Badge className={getStatusColor(task.status)}>
                                                        {task.status}
                                                    </Badge>
                                                    <Badge className={getPriorityColor(task.priority)}>
                                                        {task.priority}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Area: {task.area} • Frequency: {task.frequency}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Due: {new Date(task.dueDate).toLocaleDateString()}
                                                </p>
                                                {task.notes && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Notes: {task.notes}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <Select
                                                    value={task.assignedTo?._id || ""}
                                                    onValueChange={(value) => handleAssignTask(task._id, value)}
                                                >
                                                    <SelectTrigger className="w-40">
                                                        <SelectValue placeholder="Assign to" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {members.map((member) => (
                                                            <SelectItem key={member._id} value={member._id}>
                                                                {member.fullName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                <Select
                                                    value={task.status}
                                                    onValueChange={(value) => handleTaskStatusUpdate(task._id, value)}
                                                >
                                                    <SelectTrigger className="w-40">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Pending">Pending</SelectItem>
                                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                                        <SelectItem value="Completed">Completed</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="inventory" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-semibold">Inventory Management</h2>
                            <Button onClick={() => setShowInventoryModal(true)} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add Item
                            </Button>
                        </div>

                        {lowStockItems.length > 0 && (
                            <Card className="border-orange-200 bg-orange-50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-orange-800">
                                        <AlertTriangle className="h-5 w-5" />
                                        Low Stock Alert
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {lowStockItems.map((item) => (
                                            <p key={item._id} className="text-sm text-orange-700">
                                                {item.name}: {item.quantity} {item.unit} (Min: {item.minQuantity})
                                            </p>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="grid gap-4">
                            {inventory.map((item) => (
                                <Card key={item._id}>
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold">{item.name}</h3>
                                                    <Badge variant="outline">{item.category}</Badge>
                                                    {item.quantity <= item.minQuantity && (
                                                        <Badge className="bg-orange-100 text-orange-800">
                                                            Low Stock
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Location: {item.location}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Current: {item.quantity} {item.unit} • Min: {item.minQuantity} {item.unit}
                                                </p>
                                                {item.supplier && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Supplier: {item.supplier}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => handleInventoryUpdate(item._id, parseInt(e.target.value) || 0)}
                                                    className="w-20 px-2 py-1 border rounded text-center"
                                                />
                                                <span className="text-sm text-muted-foreground">{item.unit}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>

                <AddTaskModal
                    open={showTaskModal}
                    onClose={() => setShowTaskModal(false)}
                    members={members}
                    onSuccess={() => window.location.reload()}
                />

                <AddInventoryModal
                    open={showInventoryModal}
                    onClose={() => setShowInventoryModal(false)}
                    onSuccess={() => window.location.reload()}
                />
            </div>
        </div>
    )
}