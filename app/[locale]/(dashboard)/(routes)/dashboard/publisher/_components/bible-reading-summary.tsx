"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Flame, ArrowRight } from "lucide-react"
import Link from "next/link"
import { generateReadingPlan, type DayReading } from "@/lib/data/bible-reading-plan"
import { getPlanStartDate, getCompletedDays } from "@/lib/db/bibleReadingDB"

export function BibleReadingSummary() {
    const [data, setData] = useState<{
        plan: DayReading[]
        completedCount: number
        todayReading: DayReading | null
        todayDone: boolean
        streak: number
    } | null>(null)
    const [hasPlan, setHasPlan] = useState(false)

    useEffect(() => {
        async function load() {
            try {
                const startDate = await getPlanStartDate()
                if (!startDate) return

                setHasPlan(true)
                const plan = generateReadingPlan(new Date(startDate))
                const completed = await getCompletedDays()
                const today = new Date().toISOString().split("T")[0]
                const todayReading = plan.find((d) => d.date === today) || null

                // Calculate streak
                const todayDayNum = todayReading?.day ?? plan.length
                let streak = 0
                for (let d = todayDayNum; d >= 1; d--) {
                    if (completed.has(d)) streak++
                    else break
                }
                if (streak === 0 && todayDayNum > 1) {
                    for (let d = todayDayNum - 1; d >= 1; d--) {
                        if (completed.has(d)) streak++
                        else break
                    }
                }

                setData({
                    plan,
                    completedCount: completed.size,
                    todayReading,
                    todayDone: todayReading ? completed.has(todayReading.day) : false,
                    streak,
                })
            } catch (e) {
                console.error("Failed to load bible reading data:", e)
            }
        }
        load()
    }, [])

    if (!hasPlan) {
        return (
            <Link href="/dashboard/publisher/bible-reading">
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed border-2">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-sm">Daily Bible Reading</h3>
                            <p className="text-xs text-muted-foreground">Start a plan to read the entire Bible in one year</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </CardContent>
                </Card>
            </Link>
        )
    }

    if (!data) return null

    const progressPercent = Math.round((data.completedCount / 365) * 100)

    return (
        <Link href="/dashboard/publisher/bible-reading">
            <Card className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-indigo-600" />
                            <span className="font-semibold text-sm text-indigo-900">Daily Bible Reading</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {data.streak > 0 && (
                                <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs gap-1">
                                    <Flame className="h-3 w-3" />
                                    {data.streak} day streak
                                </Badge>
                            )}
                            <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 text-xs">
                                {progressPercent}%
                            </Badge>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-indigo-200/50 rounded-full h-2 mb-3">
                        <div
                            className="bg-indigo-500 rounded-full h-2 transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>

                    {/* Today's reading */}
                    {data.todayReading ? (
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">Today — Day {data.todayReading.day}</p>
                                <p className={`text-sm ${data.todayDone ? "text-green-600 line-through" : "text-gray-800"}`}>
                                    {data.todayReading.readings.join(", ")}
                                </p>
                            </div>
                            {data.todayDone && (
                                <Badge className="bg-green-100 text-green-700 text-xs">Done</Badge>
                            )}
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground">{data.completedCount} of 365 days completed</p>
                    )}
                </CardContent>
            </Card>
        </Link>
    )
}
