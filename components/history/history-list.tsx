"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Search, Filter, ChevronDown, X, Eye, Calendar, User, FileText, Clock, Trash2 } from "lucide-react"
import { deleteHistory, fetchAllHistories } from "@/lib/actions/history.actions"

interface HistoryItem {
    _id: string
    storeId: string
    actionType: string
    details: {
        itemId: string
        deletedAt?: string
    }
    performedBy: {
        fullName: string
    }
    entityId: string
    message: string
    entityType: string
    timestamp: string
    createdAt: string
    updatedAt: string
}

// Added mock data and functions directly in component to resolve import issues
// const mockHistories: HistoryItem[] = [
//   {
//     _id: "1",
//     storeId: "store1",
//     actionType: "CREATED",
//     details: { itemId: "item1" },
//     performedBy: { fullName: "John Doe" },
//     entityId: "entity1",
//     message: "Created new product 'Wireless Headphones' with SKU WH-001 in Electronics category",
//     entityType: "Product",
//     timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
//     createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
//     updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
//   },
//   {
//     _id: "2",
//     storeId: "store1",
//     actionType: "UPDATED",
//     details: { itemId: "item2" },
//     performedBy: { fullName: "Jane Smith" },
//     entityId: "entity2",
//     message: "Updated inventory quantity for 'Gaming Mouse' from 50 to 75 units",
//     entityType: "Inventory",
//     timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
//     createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
//     updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
//   },
//   {
//     _id: "3",
//     storeId: "store1",
//     actionType: "DELETED",
//     details: { itemId: "item3", deletedAt: new Date().toISOString() },
//     performedBy: { fullName: "Mike Johnson" },
//     entityId: "entity3",
//     message: "Deleted discontinued product 'Old Smartphone Model XYZ' from catalog",
//     entityType: "Product",
//     timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
//     createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
//     updatedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
//   },
//   {
//     _id: "4",
//     storeId: "store1",
//     actionType: "RESTORED",
//     details: { itemId: "item4" },
//     performedBy: { fullName: "Sarah Wilson" },
//     entityId: "entity4",
//     message: "Restored accidentally deleted customer order #12345 for premium subscription",
//     entityType: "Order",
//     timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
//     createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
//     updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
//   },
//   {
//     _id: "5",
//     storeId: "store1",
//     actionType: "CREATED",
//     details: { itemId: "item5" },
//     performedBy: { fullName: "Alex Brown" },
//     entityId: "entity5",
//     message: "Created new customer account for 'Premium Electronics Store' with business tier access",
//     entityType: "Customer",
//     timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
//     createdAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
//     updatedAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
//   },
//   {
//     _id: "6",
//     storeId: "store1",
//     actionType: "UPDATED",
//     details: { itemId: "item6" },
//     performedBy: { fullName: "Emma Davis" },
//     entityId: "entity6",
//     message: "Updated shipping policy to include free delivery for orders over $100",
//     entityType: "Policy",
//     timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
//     createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
//     updatedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
//   },
//   {
//     _id: "7",
//     storeId: "store1",
//     actionType: "DELETED",
//     details: { itemId: "item7", deletedAt: new Date().toISOString() },
//     performedBy: { fullName: "Chris Lee" },
//     entityId: "entity7",
//     message: "Deleted expired promotional campaign 'Summer Sale 2024' and associated discount codes",
//     entityType: "Campaign",
//     timestamp: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
//     createdAt: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
//     updatedAt: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
//   },
//   {
//     _id: "8",
//     storeId: "store1",
//     actionType: "CREATED",
//     details: { itemId: "item8" },
//     performedBy: { fullName: "Lisa Garcia" },
//     entityId: "entity8",
//     message: "Created new category 'Smart Home Devices' with automated product tagging rules",
//     entityType: "Category",
//     timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
//     createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
//     updatedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
//   },
// ]

// // Mock functions embedded directly in component
// const fetchAllHistories = async (lastId: string | null = null, limit = 10): Promise<HistoryItem[]> => {
//   await new Promise((resolve) => setTimeout(resolve, 500))

//   let startIndex = 0
//   if (lastId) {
//     const lastIndex = mockHistories.findIndex((h) => h._id === lastId)
//     startIndex = lastIndex + 1
//   }

//   return mockHistories.slice(startIndex, startIndex + limit)
// }

// const deleteHistory = async (id: string): Promise<void> => {
//   await new Promise((resolve) => setTimeout(resolve, 300))

//   const index = mockHistories.findIndex((h) => h._id === id)
//   if (index > -1) {
//     mockHistories.splice(index, 1)
//   }
// }

const actionTypes = ["CREATED", "UPDATED", "DELETED", "RESTORED"]

const getActionTypeColor = (actionType: string) => {
    if (actionType.includes("DELETED"))
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800"
    if (actionType.includes("CREATED"))
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
    if (actionType.includes("UPDATED"))
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
    if (actionType.includes("RESTORED"))
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
    return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
}

const getActionIcon = (actionType: string) => {
    if (actionType.includes("DELETED")) return "🗑️"
    if (actionType.includes("CREATED")) return "✨"
    if (actionType.includes("UPDATED")) return "📝"
    if (actionType.includes("RESTORED")) return "🔄"
    return "📋"
}

// Utility function to truncate messages with hover tooltip
const truncateMessage = (message: string, maxLength = 60) => {
    if (message.length <= maxLength) return message
    return message.substring(0, maxLength) + "..."
}

export function HistoryList() {
    const [histories, setHistories] = useState<HistoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedActionType, setSelectedActionType] = useState<string>("all")
    const [selectedEntityType, setSelectedEntityType] = useState<string>("all")
    const [filtersOpen, setFiltersOpen] = useState(false)
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
    // const [selectedHistory, setSelectedHistory] = useState<HistoryItem | null>(null)
    const observerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        loadHistories(true)
    }, [])

    const loadHistories = useCallback(
        async (reset = false) => {
            if (reset) {
                setLoading(true)
                setHistories([])
            } else {
                setLoadingMore(true)
            }

            try {
                const lastId = reset ? null : histories[histories.length - 1]?._id
                const newHistories = await fetchAllHistories(lastId, 10)

                if (reset) {
                    setHistories(newHistories)
                } else {
                    setHistories((prev) => [...prev, ...newHistories])
                }

                setHasMore(newHistories.length === 10)
            } catch (error) {
                console.error("Failed to load histories:", error)
            } finally {
                setLoading(false)
                setLoadingMore(false)
            }
        },
        [histories],
    )

    const handleDelete = async (id: string) => {
        setDeletingIds((prev) => new Set([...prev, id]))
        try {
            await deleteHistory(id)
            setHistories((prev) => prev.filter((h) => h._id !== id))
        } catch (error) {
            console.error("Failed to delete history:", error)
        } finally {
            setDeletingIds((prev) => {
                const newSet = new Set(prev)
                newSet.delete(id)
                return newSet
            })
        }
    }

    const filteredHistories = histories.filter((history) => {
        const matchesSearch =
            history.actionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
            history.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
            history.performedBy.fullName.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesActionType = selectedActionType === "all" || history.actionType === selectedActionType
        const matchesEntityType = selectedEntityType === "all" || history.entityType === selectedEntityType

        return matchesSearch && matchesActionType && matchesEntityType
    })

    const activeFiltersCount = [selectedActionType !== "all", selectedEntityType !== "all", searchTerm.length > 0].filter(
        Boolean,
    ).length

    const clearAllFilters = () => {
        setSearchTerm("")
        setSelectedActionType("all")
        setSelectedEntityType("all")
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const formatRelativeTime = (dateString: string) => {
        const now = new Date()
        const date = new Date(dateString)
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

        if (diffInMinutes < 1) return "Just now"
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
        return `${Math.floor(diffInMinutes / 1440)}d ago`
    }

    const HistoryDetailDialog = ({ history }: { history: HistoryItem }) => (
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <span className="text-2xl">{getActionIcon(history.actionType)}</span>
                    Action Details
                </DialogTitle>
                <DialogDescription>Complete information about this history entry</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
                {/* Action Summary */}
                <div className="flex items-center gap-3">
                    <Badge className={`${getActionTypeColor(history.actionType)} font-medium`}>{history.actionType}</Badge>
                    <Badge variant="outline" className="font-medium">
                        {history.entityType}
                    </Badge>
                </div>

                {/* Full Message */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        Description
                    </div>
                    <p className="text-sm leading-relaxed bg-muted/50 p-3 rounded-lg">{history.message}</p>
                </div>

                {/* User Information */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <User className="h-4 w-4" />
                        Performed By
                    </div>
                    <p className="text-sm font-medium">{history.performedBy.fullName}</p>
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            Timestamp
                        </div>
                        <div className="text-sm">
                            <p className="font-medium">{formatDate(history.timestamp)}</p>
                            <p className="text-muted-foreground">{formatRelativeTime(history.timestamp)}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            Created
                        </div>
                        <div className="text-sm">
                            <p className="font-medium">{formatDate(history.createdAt)}</p>
                        </div>
                    </div>
                </div>

                {/* Technical Details */}
                <div className="space-y-4 border-t pt-4">
                    <h4 className="font-medium text-sm text-muted-foreground">Technical Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-medium">Entity ID:</span>
                            <p className="text-muted-foreground font-mono">{history.entityId}</p>
                        </div>
                        <div>
                            <span className="font-medium">Store ID:</span>
                            <p className="text-muted-foreground font-mono">{history.storeId}</p>
                        </div>
                        <div>
                            <span className="font-medium">Item ID:</span>
                            <p className="text-muted-foreground font-mono">{history.details.itemId}</p>
                        </div>
                        {history.details.deletedAt && (
                            <div>
                                <span className="font-medium">Deleted At:</span>
                                <p className="text-muted-foreground">{formatDate(history.details.deletedAt)}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DialogContent>
    )

    if (loading) {
        return (
            <div className="w-full space-y-6">
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full max-w-sm" />
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="w-full space-y-6">
            {/* Search and Filters */}
            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search by action, entity, or user..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
                    <div className="flex items-center justify-between">
                        <CollapsibleTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                                <Filter className="h-4 w-4" />
                                Filters
                                {activeFiltersCount > 0 && (
                                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                                        {activeFiltersCount}
                                    </Badge>
                                )}
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </CollapsibleTrigger>

                        {activeFiltersCount > 0 && (
                            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="gap-2">
                                <X className="h-4 w-4" />
                                Clear all
                            </Button>
                        )}
                    </div>

                    <CollapsibleContent className="space-y-4 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Action Type</label>
                                <Select value={selectedActionType} onValueChange={setSelectedActionType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All actions" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All actions</SelectItem>
                                        {actionTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Entity Type</label>
                                <Select value={selectedEntityType} onValueChange={setSelectedEntityType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All entities" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All entities</SelectItem>
                                        {Array.from(new Set(histories.map((h) => h.entityType))).map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </div>

            {/* Results */}
            {filteredHistories.length === 0 ? (
                <Card className="p-12 text-center">
                    <CardContent className="space-y-4">
                        <div className="text-4xl">📋</div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">No history found</h3>
                            <p className="text-muted-foreground">
                                {activeFiltersCount > 0
                                    ? "Try adjusting your filters to see more results."
                                    : "No history entries have been recorded yet."}
                            </p>
                        </div>
                        {activeFiltersCount > 0 && (
                            <Button variant="outline" onClick={clearAllFilters}>
                                Clear filters
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block border rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/50 border-b">
                                    <tr>
                                        <th className="text-left p-4 font-medium">Action</th>
                                        <th className="text-left p-4 font-medium">Entity</th>
                                        <th className="text-left p-4 font-medium">Time</th>
                                        <th className="text-left p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredHistories.map((history) => (
                                        <tr key={history._id} className="border-b hover:bg-muted/25 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg">{getActionIcon(history.actionType)}</span>
                                                    <Badge className={`${getActionTypeColor(history.actionType)} font-medium`}>
                                                        {history.actionType}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="space-y-1">
                                                    <Badge variant="outline" className="font-medium">
                                                        {history.entityType}
                                                    </Badge>
                                                    <p className="text-sm text-muted-foreground font-mono">{history.entityId}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium">{formatRelativeTime(history.timestamp)}</p>
                                                    <p className="text-xs text-muted-foreground">{formatDate(history.timestamp)}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                                                                <Eye className="h-4 w-4" />
                                                                Details
                                                            </Button>
                                                        </DialogTrigger>
                                                        <HistoryDetailDialog history={history} />
                                                    </Dialog>

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(history._id)}
                                                        disabled={deletingIds.has(history._id)}
                                                        className="gap-2 text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        {deletingIds.has(history._id) ? "..." : "Delete"}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                        {filteredHistories.map((history) => (
                            <Card key={history._id} className="overflow-hidden">
                                <CardContent className="p-4 space-y-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 flex-1">
                                            <span className="text-lg">{getActionIcon(history.actionType)}</span>
                                            <div className="space-y-2">
                                                <div className="flex flex-wrap gap-2">
                                                    <Badge className={`${getActionTypeColor(history.actionType)} font-medium`}>
                                                        {history.actionType}
                                                    </Badge>
                                                    <Badge variant="outline" className="font-medium">
                                                        {history.entityType}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">{formatRelativeTime(history.timestamp)}</p>
                                        <p className="text-xs text-muted-foreground">{formatDate(history.timestamp)}</p>
                                    </div>

                                    <div className="flex gap-2 pt-2 border-t">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" className="gap-2 flex-1 bg-transparent">
                                                    <Eye className="h-4 w-4" />
                                                    Details
                                                </Button>
                                            </DialogTrigger>
                                            <HistoryDetailDialog history={history} />
                                        </Dialog>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(history._id)}
                                            disabled={deletingIds.has(history._id)}
                                            className="gap-2 text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            {deletingIds.has(history._id) ? "..." : "Delete"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {/* Load More */}
            {hasMore && filteredHistories.length > 0 && (
                <div ref={observerRef} className="flex justify-center py-4">
                    {loadingMore ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            Loading more...
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    )
}
