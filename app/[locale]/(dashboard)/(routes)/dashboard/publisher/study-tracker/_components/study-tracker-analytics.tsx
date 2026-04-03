"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, BarChart3, PieChart, Calendar } from "lucide-react"
import { STUDY_CATEGORIES, type StudySession, type StudyStats } from "@/lib/db/studyTrackerDB"

interface AnalyticsProps {
  sessions: StudySession[]
  stats: StudyStats
  weeklyData: { date: string; minutes: number }[]
}

export function StudyTrackerAnalytics({ sessions, stats, weeklyData }: AnalyticsProps) {
  const maxWeeklyMinutes = Math.max(...weeklyData.map(d => d.minutes), 1)

  const categoryStats = useMemo(() => {
    return STUDY_CATEGORIES.map(cat => ({
      ...cat,
      minutes: stats.categoryBreakdown[cat.id]?.minutes || 0,
      sessions: stats.categoryBreakdown[cat.id]?.sessions || 0,
      percentage: stats.totalMinutes > 0 ? Math.round((stats.categoryBreakdown[cat.id]?.minutes || 0) / stats.totalMinutes * 100) : 0
    })).filter(c => c.minutes > 0)
  }, [stats])

  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {}
    sessions.forEach(s => {
      const date = new Date(s.date)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      months[key] = (months[key] || 0) + s.minutes
    })
    return Object.entries(months).sort().slice(-6).map(([month, minutes]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      minutes
    }))
  }, [sessions])

  const maxMonthlyMinutes = Math.max(...monthlyData.map(d => d.minutes), 1)

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="text-xs text-muted-foreground mb-1">Total Hours</div>
            <div className="text-2xl font-bold text-blue-600">{Math.round(stats.totalMinutes / 60)}</div>
            <div className="text-xs text-muted-foreground mt-1">{stats.totalMinutes} min</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="text-xs text-muted-foreground mb-1">Avg/Session</div>
            <div className="text-2xl font-bold text-purple-600">{stats.averageMinutesPerSession}</div>
            <div className="text-xs text-muted-foreground mt-1">minutes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="text-xs text-muted-foreground mb-1">Longest Streak</div>
            <div className="text-2xl font-bold text-orange-600">{stats.longestStreak}</div>
            <div className="text-xs text-muted-foreground mt-1">days</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="text-xs text-muted-foreground mb-1">This Month</div>
            <div className="text-2xl font-bold text-green-600">{Math.round(stats.thisMonthMinutes / 60)}</div>
            <div className="text-xs text-muted-foreground mt-1">hours</div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {weeklyData.map((day, i) => {
              const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })
              const percentage = (day.minutes / maxWeeklyMinutes) * 100
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{dayName}</span>
                    <span className="text-muted-foreground">{day.minutes} min</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trend */}
      {monthlyData.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Last 6 Months
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthlyData.map((month, i) => {
                const percentage = (month.minutes / maxMonthlyMinutes) * 100
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{month.month}</span>
                      <span className="text-muted-foreground">{Math.round(month.minutes / 60)}h</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Breakdown */}
      {categoryStats.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              By Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryStats.map(cat => (
                <div key={cat.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-${cat.color}-500`} />
                      <span className="font-medium">{cat.label}</span>
                    </div>
                    <span className="text-muted-foreground">{cat.sessions} sessions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`bg-${cat.color}-500 h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground w-12 text-right">
                      {cat.percentage}%
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round(cat.minutes / 60)}h {cat.minutes % 60}m
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {stats.currentStreak > 0 && (
            <p className="text-blue-900">
              🔥 You're on a <span className="font-bold">{stats.currentStreak}-day streak</span>! Keep it up!
            </p>
          )}
          {stats.averageMinutesPerSession > 0 && (
            <p className="text-blue-900">
              📊 Your average session is <span className="font-bold">{stats.averageMinutesPerSession} minutes</span>
            </p>
          )}
          {categoryStats.length > 0 && (
            <p className="text-blue-900">
              ⭐ Your top category is <span className="font-bold">{categoryStats[0].label}</span> with {categoryStats[0].sessions} sessions
            </p>
          )}
          {stats.thisWeekMinutes > 0 && (
            <p className="text-blue-900">
              📈 This week you studied <span className="font-bold">{Math.round(stats.thisWeekMinutes / 60)}h {stats.thisWeekMinutes % 60}m</span>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
