
import { currentUser } from '@/lib/helpers/session'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, BarChart3, BookOpen, ArrowRight, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'
import DashboardAnalytics from './_components/DashboardAnalytics'
import AttendantAnalytics from './_components/AttendantAnalytics'
import GroupAssistantAnalytics from './_components/GroupAssistantAnalytics'
import Heading from '@/components/commons/Header'
import { Separator } from '@/components/ui/separator'
import UniversalAnalytics from './_components/UniversalAnalytics'
import { requirePermission } from '@/lib/helpers/server-permission-check'
import { BackupModal } from './_components/BackupModal'
import { WEEKLY_FOCUS, SPIRITUAL_HIGHLIGHTS, DAILY_MOTIVATIONS } from '@/lib/data/spiritual-content'

// Legacy inline arrays removed — now imported from lib/data/spiritual-content.ts

function getDailyMotivation(difficulty?: string) {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  const pool = difficulty ? DAILY_MOTIVATIONS.filter(m => m.difficulty === difficulty) : DAILY_MOTIVATIONS
  return pool[dayOfYear % pool.length]
}

function getWeeklyFocus() {
  const now = new Date()
  const weekOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24 * 7))
  return WEEKLY_FOCUS[weekOfYear % WEEKLY_FOCUS.length]
}

function getSpiritualHighlight() {
  const now = new Date()
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
  return SPIRITUAL_HIGHLIGHTS[dayOfYear % SPIRITUAL_HIGHLIGHTS.length]
}

const page = async () => {
  await requirePermission('dashboard')
  const user = await currentUser()
  const motivation = getDailyMotivation()
  const weeklyFocus = getWeeklyFocus()
  const highlight = getSpiritualHighlight()

  // Check user roles
  const isAdmin = user?.role === 'admin' || user?.role === 'coordinator'
  const isAttendant = user?.role === "attendant"
  const isGroupAssistant = user?.role === "group assistant(Attendant)"

  const hasAccess = isAdmin || isAttendant || isGroupAssistant

  if (!hasAccess) {
    const firstName = user?.fullName?.split(' ')[0] || 'Publisher'
    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

    return (
      <div className="flex items-center justify-center min-h-[80vh] p-3 sm:p-6">
        <div className="w-full max-w-lg space-y-4">
          {/* Greeting */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{today}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">{greeting}, {firstName} 👋</h1>
          </div>

          {/* Daily Bible Motivation */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
            <CardHeader className="pb-2 relative">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-blue-200 text-xs font-medium uppercase tracking-wide">Daily Scripture</p>
                  <p className="text-white/70 text-xs">New World Translation</p>
                </div>
                <div className="ml-auto flex items-center gap-1 text-blue-200 text-xs">
                  <Calendar className="h-3 w-3" />
                  <span>Today</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative pb-5">
              <blockquote className="text-white text-base sm:text-lg font-medium leading-relaxed mb-4 italic">
                &ldquo;{motivation.text}&rdquo;
              </blockquote>
              <p className="text-blue-200 text-sm font-semibold">— {motivation.verse}</p>
            </CardContent>
          </Card>

          {/* Weekly Focus */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-600 to-pink-600 text-white overflow-hidden relative">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 -translate-x-8" />
            <CardHeader className="pb-2 relative">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-purple-200 text-xs font-medium uppercase tracking-wide">This Week's Focus</p>
                  <p className="text-white text-sm font-semibold">{weeklyFocus.title}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-white/90 text-sm mb-3">{weeklyFocus.focus}</p>
              <p className="text-purple-200 text-xs font-medium">Key Verses: {weeklyFocus.verses.join(', ')}</p>
            </CardContent>
          </Card>

          {/* Spiritual Highlight */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-600 to-teal-600 text-white overflow-hidden relative">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-y-8 translate-x-8" />
            <CardHeader className="pb-2 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-emerald-200 text-xs font-medium uppercase tracking-wide">Spiritual Highlight</p>
                    <p className="text-white text-sm font-semibold">{highlight.topic}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-white/90 text-sm mb-2">{highlight.insight}</p>
              <p className="text-emerald-200 text-xs font-medium">— {highlight.verse}</p>
            </CardContent>
          </Card>

          {/* Role info */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Shield className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-800">Dashboard Access</p>
                  <p className="text-xs text-orange-600 mt-0.5">This section is reserved for congregation leadership. Contact your group overseer for access.</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-orange-100 rounded text-xs text-orange-700 font-medium">
                    <span>Your role:</span>
                    <span className="capitalize">{user?.role?.replace(/_/g, ' ') || 'Publisher'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Publisher link */}
          <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base gap-2">
            <Link href="/dashboard/publisher">
              <BarChart3 className="h-4 w-4" />
              Go to My Publisher Dashboard
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  // Determine which analytics to show based on role
  const getAnalyticsComponent = () => {
    if (isAdmin) {
      return <UniversalAnalytics />
    } else if (isGroupAssistant) {
      return <GroupAssistantAnalytics />
    } else if (isAttendant) {
      return <AttendantAnalytics />
    }
    return null
  }

  const getDashboardTitle = () => {
    if (isAdmin) return "Dashboard Analytics"
    if (isGroupAssistant) return "Group & Attendance Analytics"
    if (isAttendant) return "Attendance Analytics"
    return "Dashboard"
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <Heading title={getDashboardTitle()} />
        <div className="flex items-center gap-2">
          {isAdmin && <BackupModal />}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
            {isAdmin ? "Full insights" : isGroupAssistant ? "Group insights" : "Attendance insights"}
          </div>
        </div>
      </div>
      <Separator />
      
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
            <CardHeader className="pb-2 relative">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-blue-200 text-xs font-medium uppercase tracking-wide">Daily Scripture</p>
                  <p className="text-white/70 text-xs">New World Translation</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <blockquote className="text-white text-sm font-medium leading-relaxed mb-3 italic">
                &ldquo;{motivation.text}&rdquo;
              </blockquote>
              <p className="text-blue-200 text-xs font-semibold">— {motivation.verse}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-600 to-pink-600 text-white overflow-hidden relative">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 -translate-x-8" />
            <CardHeader className="pb-2 relative">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-purple-200 text-xs font-medium uppercase tracking-wide">This Week's Focus</p>
                  <p className="text-white text-sm font-semibold">{weeklyFocus.title}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-white/90 text-xs mb-2">{weeklyFocus.focus}</p>
              <p className="text-purple-200 text-xs font-medium">Key Verses: {weeklyFocus.verses.join(', ')}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-600 to-teal-600 text-white overflow-hidden relative">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-y-8 translate-x-8" />
            <CardHeader className="pb-2 relative">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-emerald-200 text-xs font-medium uppercase tracking-wide">Spiritual Highlight</p>
                  <p className="text-white text-sm font-semibold">{highlight.topic}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-white/90 text-xs mb-2">{highlight.insight}</p>
              <p className="text-emerald-200 text-xs font-medium">— {highlight.verse}</p>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="py-2 sm:py-4">
        {getAnalyticsComponent()}
      </div>
    </>
  )
}

export default page
