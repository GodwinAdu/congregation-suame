"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Flame, ArrowRight, Clock } from "lucide-react"
import Link from "next/link"
import { getAllSessions, getWeeklyGoal } from "@/lib/db/studyTrackerDB"

function getWeekStart(date: Date) {
    const d = new Date(date)
    const day = d.getDay()
    d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
    d.setHours(0, 0, 0, 0)
    return d
}

export function StudyTrackerSummary() {
    const [data, setData] = useState<{
        todayMinutes: number
        weekMinutes: number
        weeklyGoal: number
        streak: number
        hasSessions: boolean
    } | null>(null)

    useEffect(() => {
        async function load() {
            try {
                const [sessions, goal] = await Promise.all([getAllSessions(), getWeeklyGoal()])
                if (sessions.length === 0) {
                    setData({ todayMinutes: 0, weekMinutes: 0, weeklyGoal: goal, streak: 0, hasSessions: false })
                    return
                }

                const today = new Date().toISOString().split("T")[0]
                const weekStart = getWeekStart(new Date())
                const todayMinutes = sessions.filter((s) => s.date === today).reduce((sum, s) => sum + s.minutes, 0)
                const weekMinutes = sessions.filter((s) => new Date(s.date) >= weekStart).reduce((sum, s) => sum + s.minutes, 0)

                // Streak
                const uniqueDates = [...new Set(sessions.map((s) => s.date))].sort().reverse()
                let streak = 0
                const todayDate = new Date()
                for (let i = 0; i < uniqueDates.length; i++) {
                    const expected = new Date(todayDate)
                    expected.setDate(expected.getDate() - i)
                    const expectedStr = expected.toISOString().split("T")[0]
                    if (uniqueDates.includes(expectedStr)) {
                        streak++
                    } else if (i === 0) {
                        continue
                    } else {
                        break
                    }
                }

                setData({ todayMinutes, weekMinutes, weeklyGoal: goal, streak, hasSessions: true })
            } catch (e) {
                console.error("Failed to load study tracker:", e)
            }
        }
        load()
    }, [])

    if (!data) return null

    const weekProgress = Math.min(100, Math.round((data.weekMinutes / data.weeklyGoal) * 100))

    if (!data.hasSessions) {
        return (
            <Link href="/dashboard/publisher/study-tracker">
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed border-2">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-sm">Personal Study Tracker</h3>
                            <p className="text-xs text-muted-foreground">Track your daily personal Bible study time</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </CardContent>
                </Card>
            </Link>
        )
    }

    return (
        <Link href="/dashboard/publisher/study-tracker">
            <Card className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-purple-600" />
                            <span className="font-semibold text-sm text-purple-900">Personal Study</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {data.streak > 0 && (
                                <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs gap-1">
                                    <Flame className="h-3 w-3" />
                                    {data.streak}d
                                </Badge>
                            )}
                            <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs gap-1">
                                <Clock className="h-3 w-3" />
                                {data.todayMinutes}m today
                            </Badge>
                        </div>
                    </div>

                    {/* Weekly progress bar */}
                    <div className="w-full bg-purple-200/50 rounded-full h-2 mb-2">
                        <div
                            className={`rounded-full h-2 transition-all duration-500 ${weekProgress >= 100 ? "bg-green-500" : "bg-purple-500"}`}
                            style={{ width: `${weekProgress}%` }}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {data.weekMinutes} / {data.weeklyGoal} min this week
                        {weekProgress >= 100 && " ✅"}
                    </p>
                </CardContent>
            </Card>
        </Link>
    )
}
