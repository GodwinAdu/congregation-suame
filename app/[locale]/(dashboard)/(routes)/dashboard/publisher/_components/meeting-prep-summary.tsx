"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, CheckCircle2, Clock, ArrowRight, AlertCircle } from "lucide-react"
import Link from "next/link"
import { getAllChecklists, MEETING_TYPES, type MeetingChecklist } from "@/lib/db/meetingPrepDB"

export function MeetingPrepSummary() {
  const [data, setData] = useState<{
    activeChecklist: MeetingChecklist | null
    upcomingCount: number
    completedThisWeek: number
    hasChecklists: boolean
  } | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const checklists = await getAllChecklists()
        if (checklists.length === 0) {
          setData({ activeChecklist: null, upcomingCount: 0, completedThisWeek: 0, hasChecklists: false })
          return
        }

        // Find most recent incomplete checklist
        const activeChecklist = checklists.find(c => c.status !== "completed") || null
        
        // Count upcoming (future meetings)
        const today = new Date().toISOString().split('T')[0]
        const upcomingCount = checklists.filter(c => c.meetingDate >= today && c.status !== "completed").length
        
        // Count completed this week
        const weekStart = new Date()
        weekStart.setDate(weekStart.getDate() - weekStart.getDay())
        weekStart.setHours(0, 0, 0, 0)
        const completedThisWeek = checklists.filter(c => 
          c.status === "completed" && new Date(c.updatedAt) >= weekStart
        ).length

        setData({ activeChecklist, upcomingCount, completedThisWeek, hasChecklists: true })
      } catch (e) {
        console.error("Failed to load meeting prep summary:", e)
      }
    }
    load()
  }, [])

  if (!data) return null

  if (!data.hasChecklists) {
    return (
      <Link href="/dashboard/publisher/meeting-prep">
        <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed border-2">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Meeting Preparation</h3>
              <p className="text-xs text-muted-foreground">Create checklists to stay organized</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
      </Link>
    )
  }

  const { activeChecklist, upcomingCount, completedThisWeek } = data

  return (
    <Link href="/dashboard/publisher/meeting-prep">
      <Card className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-sm text-blue-900">Meeting Prep</span>
            </div>
            <div className="flex items-center gap-2">
              {upcomingCount > 0 && (
                <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {upcomingCount} upcoming
                </Badge>
              )}
              {completedThisWeek > 0 && (
                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {completedThisWeek} done
                </Badge>
              )}
            </div>
          </div>

          {activeChecklist ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-${MEETING_TYPES.find(m => m.id === activeChecklist.meetingType)?.color}-500`} />
                  <span className="text-sm font-medium truncate">
                    {MEETING_TYPES.find(m => m.id === activeChecklist.meetingType)?.label}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(activeChecklist.meetingDate).toLocaleDateString()}
                </span>
              </div>
              <Progress value={activeChecklist.completionPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{activeChecklist.completedItems}/{activeChecklist.totalItems} completed</span>
                <span>{activeChecklist.completionPercentage}%</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-2">
              <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">All caught up!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}