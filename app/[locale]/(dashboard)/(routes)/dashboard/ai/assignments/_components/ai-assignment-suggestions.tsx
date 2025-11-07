"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Bot, Users, TrendingUp, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { getAssignmentSuggestions, detectSchedulingConflicts, getWorkloadBalance } from "@/lib/actions/ai-assistant.actions"

interface Suggestion {
    memberId: string
    memberName: string
    confidence: number
    reasons: string[]
}

export function AIAssignmentSuggestions() {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [conflicts, setConflicts] = useState<any[]>([])
    const [workloadData, setWorkloadData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedAssignmentType, setSelectedAssignmentType] = useState("")
    const [selectedWeek, setSelectedWeek] = useState("")

    const assignmentTypes = [
        "Watchtower Reader",
        "Bible Student Reader", 
        "Life and Ministry",
        "Public Talk Speaker"
    ]

    const getCurrentWeek = () => {
        const today = new Date()
        const monday = new Date(today)
        monday.setDate(today.getDate() - today.getDay() + 1)
        return monday.toISOString().split('T')[0]
    }

    const handleGetSuggestions = async () => {
        if (!selectedAssignmentType || !selectedWeek) {
            toast.error("Please select assignment type and week")
            return
        }

        setIsLoading(true)
        try {
            const [suggestionsData, conflictsData, workloadInfo] = await Promise.all([
                getAssignmentSuggestions(selectedAssignmentType, selectedWeek),
                detectSchedulingConflicts(selectedWeek),
                getWorkloadBalance('month')
            ])

            setSuggestions(suggestionsData)
            setConflicts(conflictsData.conflicts)
            setWorkloadData(workloadInfo)
            
            toast.success("AI analysis completed")
        } catch (error: any) {
            toast.error(error.message || "Failed to get suggestions")
        } finally {
            setIsLoading(false)
        }
    }

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.8) return "bg-green-500"
        if (confidence >= 0.6) return "bg-yellow-500"
        return "bg-red-500"
    }

    return (
        <div className="space-y-6">
            {/* Controls */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5" />
                        AI Assignment Assistant
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Assignment Type</label>
                            <Select value={selectedAssignmentType} onValueChange={setSelectedAssignmentType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select assignment type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {assignmentTypes.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Week</label>
                            <input
                                type="date"
                                value={selectedWeek}
                                onChange={(e) => setSelectedWeek(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                        </div>
                        
                        <div className="flex items-end">
                            <Button 
                                onClick={handleGetSuggestions}
                                disabled={isLoading}
                                className="w-full"
                            >
                                {isLoading ? "Analyzing..." : "Get AI Suggestions"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Suggestions */}
            {isLoading ? (
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="border rounded-lg p-4 space-y-2">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ) : suggestions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Recommended Members
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {suggestions.map((suggestion, index) => (
                            <div key={suggestion.memberId} className="border rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline">#{index + 1}</Badge>
                                        <h3 className="font-semibold">{suggestion.memberName}</h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${getConfidenceColor(suggestion.confidence)}`} />
                                        <span className="text-sm font-medium">
                                            {Math.round(suggestion.confidence * 100)}% match
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Reasons:</p>
                                    <ul className="text-sm space-y-1">
                                        {suggestion.reasons.map((reason, i) => (
                                            <li key={i} className="flex items-center gap-2">
                                                <div className="w-1 h-1 bg-primary rounded-full" />
                                                {reason}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Conflicts & Workload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {conflicts.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-orange-600">
                                <AlertTriangle className="h-5 w-5" />
                                Scheduling Conflicts
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {conflicts.map((conflict, index) => (
                                <div key={index} className="border-l-4 border-orange-500 pl-4 py-2">
                                    <p className="font-medium">{conflict.type}</p>
                                    <p className="text-sm text-muted-foreground">{conflict.description}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {workloadData && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Workload Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-600">{workloadData.totalAssignments}</p>
                                    <p className="text-sm text-muted-foreground">Total Assignments</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-blue-600">
                                        {workloadData.averagePerMember.toFixed(1)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Avg per Member</p>
                                </div>
                            </div>
                            
                            {workloadData.recommendations.length > 0 && (
                                <div className="space-y-2">
                                    <p className="font-medium">Recommendations:</p>
                                    {workloadData.recommendations.map((rec: string, i: number) => (
                                        <p key={i} className="text-sm text-muted-foreground">• {rec}</p>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}