"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen, Play, Pause, Square, Plus, Flame, Award, Clock,
  Trash2, ChevronDown, Target, TrendingUp, Calendar, Users,
  FileText, Book, Presentation, MoreHorizontal, Settings,
  Filter, X, Timer, BarChart3, History, CheckCircle2,
} from "lucide-react"
import {
  saveSession, deleteSession, getAllSessions, saveWeeklyGoal, getWeeklyGoal,
  saveScheduleItem, deleteScheduleItem, getAllScheduleItems, getStudyStats, getWeeklyData,
  STUDY_CATEGORIES, type StudySession, type StudyScheduleItem, type StudyCategoryId, type StudyStats,
} from "@/lib/db/studyTrackerDB"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { StudyTrackerAnalytics } from "./study-tracker-analytics"
import { EnhancedTimer } from "./enhanced-timer"

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

function getWeekStart(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  d.setHours(0, 0, 0, 0)
  return d
}

const CATEGORY_ICONS = {
  BookOpen, Users, FileText, Calendar, Book, Presentation, MoreHorizontal
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function StudyTrackerClient() {
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [schedule, setSchedule] = useState<StudyScheduleItem[]>([])
  const [weeklyGoal, setWeeklyGoal] = useState(180)
  const [stats, setStats] = useState<StudyStats | null>(null)
  const [weeklyData, setWeeklyData] = useState<{ date: string; minutes: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("timer")

  // Timer state
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [activeScheduleId, setActiveScheduleId] = useState<string | null>(null)

  // Manual log form
  const [showManualForm, setShowManualForm] = useState(false)
  const [manualMinutes, setManualMinutes] = useState("")
  const [topic, setTopic] = useState("")
  const [notes, setNotes] = useState("")
  const [manualDate, setManualDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedCategory, setSelectedCategory] = useState<StudyCategoryId>('personal')

  // Schedule management
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [scheduleDay, setScheduleDay] = useState(1)
  const [scheduleCategory, setScheduleCategory] = useState<StudyCategoryId>('family')
  const [scheduleLabel, setScheduleLabel] = useState('')
  const [scheduleMinutes, setScheduleMinutes] = useState('30')

  // Filtering
  const [categoryFilter, setCategoryFilter] = useState<StudyCategoryId | 'all'>('all')

  // Goal editing
  const [editingGoal, setEditingGoal] = useState(false)
  const [goalInput, setGoalInput] = useState("")

  // Delete
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // History expand
  const [showAllHistory, setShowAllHistory] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [s, g, sch, st, wd] = await Promise.all([
          getAllSessions(), 
          getWeeklyGoal(), 
          getAllScheduleItems(),
          getStudyStats(),
          getWeeklyData()
        ])
        setSessions(s)
        setWeeklyGoal(g)
        setSchedule(sch)
        setStats(st)
        setWeeklyData(wd)
      } catch (e) {
        console.error("Failed to load study tracker:", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Refresh stats when sessions change
  useEffect(() => {
    if (sessions.length > 0) {
      getStudyStats().then(setStats)
      getWeeklyData().then(setWeeklyData)
    }
  }, [sessions])

  // Timer logic
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTimerSeconds((s) => s + 1), 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [timerRunning])

  const handleTimerStop = useCallback(async () => {
    setTimerRunning(false)
    if (timerSeconds < 60) {
      setTimerSeconds(0)
      return
    }
    const minutes = Math.round(timerSeconds / 60)
    const session: StudySession = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      minutes,
      topic: topic || STUDY_CATEGORIES.find(c => c.id === selectedCategory)?.label || "Personal Study",
      notes: "",
      category: selectedCategory,
      scheduleId: activeScheduleId || undefined,
      createdAt: new Date().toISOString(),
    }
    await saveSession(session)
    setSessions((prev) => [session, ...prev])
    setTimerSeconds(0)
    setTopic("")
    setActiveScheduleId(null)
  }, [timerSeconds, topic, selectedCategory, activeScheduleId])

  const handleTimerReset = useCallback(() => {
    setTimerSeconds(0)
    setTopic("")
  }, [])

  const handleManualLog = async () => {
    const mins = parseInt(manualMinutes)
    if (!mins || mins <= 0) return
    const session: StudySession = {
      id: Date.now().toString(),
      date: manualDate,
      minutes: mins,
      topic: topic || STUDY_CATEGORIES.find(c => c.id === selectedCategory)?.label || "Personal Study",
      notes,
      category: selectedCategory,
      scheduleId: activeScheduleId || undefined,
      createdAt: new Date().toISOString(),
    }
    await saveSession(session)
    setSessions((prev) => [session, ...prev].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)))
    setManualMinutes("")
    setTopic("")
    setNotes("")
    setManualDate(new Date().toISOString().split("T")[0])
    setSelectedCategory('personal')
    setActiveScheduleId(null)
    setShowManualForm(false)
  }

  const handleDelete = async () => {
    if (!deletingId) return
    await deleteSession(deletingId)
    setSessions((prev) => prev.filter((s) => s.id !== deletingId))
    setDeletingId(null)
  }

  const handleSaveGoal = async () => {
    const hours = parseFloat(goalInput)
    if (!hours || hours <= 0) return
    const mins = Math.round(hours * 60)
    await saveWeeklyGoal(mins)
    setWeeklyGoal(mins)
    setEditingGoal(false)
  }

  // Computed stats
  const today = new Date().toISOString().split("T")[0]
  const weekStart = getWeekStart(new Date())

  const todayMinutes = useMemo(
    () => sessions.filter((s) => s.date === today).reduce((sum, s) => sum + s.minutes, 0),
    [sessions, today]
  )

  const weekMinutes = useMemo(
    () => sessions.filter((s) => new Date(s.date) >= weekStart).reduce((sum, s) => sum + s.minutes, 0),
    [sessions, weekStart]
  )

  const weekProgress = Math.min(100, Math.round((weekMinutes / weeklyGoal) * 100))

  const { currentStreak, totalSessions, totalMinutes } = useMemo(() => {
    if (!stats) return { currentStreak: 0, totalSessions: 0, totalMinutes: 0 }
    return {
      currentStreak: stats.currentStreak,
      totalSessions: stats.totalSessions,
      totalMinutes: stats.totalMinutes,
    }
  }, [stats])

  const handleAddSchedule = async () => {
    if (!scheduleLabel.trim()) return
    const item: StudyScheduleItem = {
      id: Date.now().toString(),
      dayOfWeek: scheduleDay,
      category: scheduleCategory,
      label: scheduleLabel,
      targetMinutes: parseInt(scheduleMinutes) || 30,
    }
    await saveScheduleItem(item)
    setSchedule(prev => [...prev, item])
    setScheduleLabel('')
    setScheduleMinutes('30')
    setShowScheduleForm(false)
  }

  const handleDeleteSchedule = async (id: string) => {
    await deleteScheduleItem(id)
    setSchedule(prev => prev.filter(s => s.id !== id))
  }

  // Quick complete a schedule item with its target minutes
  const handleQuickComplete = async (item: StudyScheduleItem) => {
    const session: StudySession = {
      id: Date.now().toString(),
      date: today,
      minutes: item.targetMinutes,
      topic: item.label,
      notes: "",
      category: item.category,
      scheduleId: item.id,
      createdAt: new Date().toISOString(),
    }
    await saveSession(session)
    setSessions((prev) => [session, ...prev])
  }

  // Start timer for a schedule item
  const handleStartSchedule = (item: StudyScheduleItem) => {
    setActiveScheduleId(item.id)
    setSelectedCategory(item.category)
    setTopic(item.label)
    setTimerRunning(true)
    setTimerSeconds(0)
    setActiveTab('timer')
  }

  // Today's scheduled studies — check completion by scheduleId
  const todaySchedule = schedule.filter(s => s.dayOfWeek === new Date().getDay())
  const isScheduleCompleted = (item: StudyScheduleItem) =>
    sessions.some(s => s.date === today && s.scheduleId === item.id)

  // Filtered sessions
  const filteredSessions = categoryFilter === 'all' ? sessions : sessions.filter(s => s.category === categoryFilter)
  const displaySessions = showAllHistory ? filteredSessions : filteredSessions.slice(0, 7)

  const getCategoryIcon = (categoryId: StudyCategoryId) => {
    const category = STUDY_CATEGORIES.find(c => c.id === categoryId)
    if (!category) return BookOpen
    return CATEGORY_ICONS[category.icon as keyof typeof CATEGORY_ICONS] || BookOpen
  }

  const getCategoryColor = (categoryId: StudyCategoryId) => {
    return STUDY_CATEGORIES.find(c => c.id === categoryId)?.color || 'gray'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    )
  }

  return (
    <div className="w-full p-3 sm:p-6 space-y-3 sm:space-y-4 max-w-4xl mx-auto pb-24 sm:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4 sm:p-6 text-white">
        <h1 className="text-lg sm:text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
          Study Tracker
        </h1>
        <p className="text-purple-100 text-xs sm:text-sm mt-0.5">Track your daily Bible study</p>

        <div className="grid grid-cols-4 gap-2 mt-3">
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <Flame className="h-3.5 w-3.5 mx-auto mb-0.5 text-orange-300" />
            <div className="text-base sm:text-xl font-bold">{currentStreak}</div>
            <div className="text-purple-200 text-[9px] sm:text-xs">Streak</div>
          </div>
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <Clock className="h-3.5 w-3.5 mx-auto mb-0.5 text-blue-300" />
            <div className="text-base sm:text-xl font-bold">{todayMinutes}</div>
            <div className="text-purple-200 text-[9px] sm:text-xs">Today</div>
          </div>
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <Award className="h-3.5 w-3.5 mx-auto mb-0.5 text-yellow-300" />
            <div className="text-base sm:text-xl font-bold">{Math.round(totalMinutes / 60)}</div>
            <div className="text-purple-200 text-[9px] sm:text-xs">Hrs Total</div>
          </div>
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <TrendingUp className="h-3.5 w-3.5 mx-auto mb-0.5 text-green-300" />
            <div className="text-base sm:text-xl font-bold">{totalSessions}</div>
            <div className="text-purple-200 text-[9px] sm:text-xs">Sessions</div>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      {todaySchedule.length > 0 && (
        <Card>
          <CardHeader className="py-3 px-3 sm:px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              Today's Schedule
              <Badge variant="outline" className="text-xs ml-auto flex-shrink-0">
                {todaySchedule.filter(isScheduleCompleted).length}/{todaySchedule.length} done
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 pt-0">
            <div className="space-y-2">
              {todaySchedule.map((item) => {
                const Icon = getCategoryIcon(item.category)
                const color = getCategoryColor(item.category)
                const completed = isScheduleCompleted(item)
                const linkedSession = sessions.find(s => s.date === today && s.scheduleId === item.id)
                return (
                  <div key={item.id} className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border transition-all ${
                    completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className={`w-8 h-8 rounded-full bg-${color}-100 flex items-center justify-center flex-shrink-0 relative`}>
                      <Icon className={`h-3.5 w-3.5 text-${color}-600`} />
                      {completed && (
                        <CheckCircle2 className="h-3 w-3 text-green-600 absolute -top-0.5 -right-0.5 bg-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {completed
                          ? `✅ ${linkedSession?.minutes} min done`
                          : `${item.targetMinutes} min target`
                        }
                      </p>
                    </div>
                    {!completed && (
                      <div className="flex gap-1 flex-shrink-0">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0 sm:w-auto sm:px-2" onClick={() => handleStartSchedule(item)}>
                          <Play className="h-3 w-3" />
                          <span className="hidden sm:inline ml-1 text-xs">Start</span>
                        </Button>
                        <Button size="sm" className="h-8 w-8 p-0 sm:w-auto sm:px-2 bg-green-600 hover:bg-green-700" onClick={() => handleQuickComplete(item)}>
                          <CheckCircle2 className="h-3 w-3" />
                          <span className="hidden sm:inline ml-1 text-xs">Done</span>
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Goal */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-semibold">Weekly Goal</span>
            </div>
            {editingGoal ? (
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  className="w-16 h-8 text-sm"
                  placeholder="hrs"
                  min="0.5"
                  step="0.5"
                  autoFocus
                />
                <span className="text-xs text-muted-foreground">hrs</span>
                <Button size="sm" className="h-8 text-xs px-2" onClick={handleSaveGoal}>Save</Button>
                <Button size="sm" variant="outline" className="h-8 text-xs px-2" onClick={() => setEditingGoal(false)}>✕</Button>
              </div>
            ) : (
              <button
                className="text-xs text-purple-600 hover:text-purple-800"
                onClick={() => { setEditingGoal(true); setGoalInput(String(weeklyGoal / 60)) }}
              >
                {weeklyGoal / 60}h/wk · Edit
              </button>
            )}
          </div>
          <div className="w-full bg-purple-100 rounded-full h-2.5">
            <div
              className={`rounded-full h-2.5 transition-all duration-500 ${weekProgress >= 100 ? "bg-green-500" : "bg-purple-500"}`}
              style={{ width: `${weekProgress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted-foreground">{Math.round(weekMinutes / 60 * 10) / 10}h this week</span>
            <span className="text-xs text-muted-foreground">
              {weekProgress >= 100 ? "✅ Goal reached!" : `${Math.round((weeklyGoal - weekMinutes) / 60 * 10) / 10}h left`}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
        {/* Sticky tab bar on mobile */}
        <div className="sticky top-0 z-10 bg-background pt-1 pb-1">
          <TabsList className="grid w-full grid-cols-4 h-14">
            <TabsTrigger value="timer" className="flex flex-col items-center gap-0.5 px-1 py-1.5">
              <Timer className="h-4 w-4" />
              <span className="text-[10px] leading-none">Timer</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex flex-col items-center gap-0.5 px-1 py-1.5">
              <BarChart3 className="h-4 w-4" />
              <span className="text-[10px] leading-none">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex flex-col items-center gap-0.5 px-1 py-1.5">
              <History className="h-4 w-4" />
              <span className="text-[10px] leading-none">History</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex flex-col items-center gap-0.5 px-1 py-1.5">
              <Settings className="h-4 w-4" />
              <span className="text-[10px] leading-none">Schedule</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Timer Tab */}
        <TabsContent value="timer" className="space-y-4">
          <EnhancedTimer
            running={timerRunning}
            seconds={timerSeconds}
            selectedCategory={selectedCategory}
            topic={topic}
            onStart={() => setTimerRunning(true)}
            onPause={() => setTimerRunning(false)}
            onStop={handleTimerStop}
            onReset={handleTimerReset}
            onCategoryChange={setSelectedCategory}
            onTopicChange={setTopic}
          />

          {/* Manual Log */}
          <div>
            {!showManualForm ? (
              <Button
                variant="outline"
                className="w-full gap-2 text-sm"
                onClick={() => setShowManualForm(true)}
              >
                <Plus className="h-4 w-4" />
                Log Study Manually
              </Button>
            ) : (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-sm">Log Study Session</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Date</label>
                      <Input
                        type="date"
                        value={manualDate}
                        onChange={(e) => setManualDate(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Minutes</label>
                      <Input
                        type="number"
                        value={manualMinutes}
                        onChange={(e) => setManualMinutes(e.target.value)}
                        placeholder="e.g. 30"
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {STUDY_CATEGORIES.map((cat) => {
                        const Icon = getCategoryIcon(cat.id)
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex items-center gap-1.5 px-2 py-2 rounded text-xs transition-colors text-left ${
                              selectedCategory === cat.id
                                ? `bg-${cat.color}-100 text-${cat.color}-700 border border-${cat.color}-300`
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <Icon className="h-3 w-3 flex-shrink-0" />
                            <span className="leading-tight">
                              <span className="sm:hidden">{cat.shortLabel}</span>
                              <span className="hidden sm:inline">{cat.label}</span>
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Topic (optional)</label>
                    <Input
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. Watchtower Study, Bible Highlights"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Notes (optional)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="What did you learn?"
                      className="w-full text-sm border rounded-md p-2 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleManualLog} className="flex-1 bg-purple-600 hover:bg-purple-700 text-sm">
                      Save Session
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => { setShowManualForm(false); setTopic(""); setNotes(""); setManualMinutes(""); setSelectedCategory('personal') }}
                      className="text-sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          {stats && (
            <StudyTrackerAnalytics
              sessions={sessions}
              stats={stats}
              weeklyData={weeklyData}
            />
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-3">
          <Card>
            <CardHeader className="py-3 px-3 sm:px-4">
              <CardTitle className="text-sm font-semibold flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 flex-shrink-0">
                  <History className="h-4 w-4" />
                  History
                </span>
                <div className="flex items-center gap-1.5">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as StudyCategoryId | 'all')}
                    className="text-xs border rounded px-1 py-1 max-w-[120px]"
                  >
                    <option value="all">All</option>
                    {STUDY_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {filteredSessions.length}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 pt-0">
              {sessions.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No study sessions yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Use the timer or log manually to get started</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {/* Group sessions by date */}
                    {Object.entries(
                      displaySessions.reduce((groups: Record<string, StudySession[]>, session) => {
                        const date = session.date
                        if (!groups[date]) groups[date] = []
                        groups[date].push(session)
                        return groups
                      }, {})
                    ).map(([date, dateSessions]) => (
                      <div key={date} className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground border-b pb-1">
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">
                            {new Date(date + "T12:00:00").toLocaleDateString("en-US", {
                              weekday: "short", month: "short", day: "numeric"
                            })}
                          </span>
                          <Badge variant="outline" className="text-xs ml-auto flex-shrink-0">
                            {dateSessions.reduce((sum, s) => sum + s.minutes, 0)}m
                          </Badge>
                        </div>
                        {dateSessions.map((session) => (
                          <div
                            key={session.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border-l-4 border-${getCategoryColor(session.category)}-400 bg-gray-50 transition-all hover:shadow-sm`}
                          >
                            <div className={`w-10 h-10 rounded-full bg-${getCategoryColor(session.category)}-100 flex items-center justify-center flex-shrink-0`}>
                              {(() => {
                                const Icon = getCategoryIcon(session.category)
                                return <Icon className={`h-4 w-4 text-${getCategoryColor(session.category)}-600`} />
                              })()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="font-semibold text-sm">{session.minutes} min</span>
                                <Badge className={`bg-${getCategoryColor(session.category)}-100 text-${getCategoryColor(session.category)}-700 text-xs`}>
                                  {STUDY_CATEGORIES.find(c => c.id === session.category)?.label}
                                </Badge>
                                {session.date === today && (
                                  <Badge className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0">Today</Badge>
                                )}
                              </div>
                              <p className="text-sm font-medium text-gray-900 mb-1">{session.topic}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(session.createdAt).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', minute: '2-digit' 
                                })}
                              </p>
                              {session.notes && (
                                <p className="text-xs text-gray-600 mt-2 p-2 bg-white rounded border-l-2 border-gray-200">
                                  "{session.notes}"
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => setDeletingId(session.id)}
                              className="text-gray-400 hover:text-red-500 p-1 flex-shrink-0"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  {filteredSessions.length > 7 && (
                    <button
                      onClick={() => setShowAllHistory((v) => !v)}
                      className="w-full mt-4 text-xs text-purple-600 hover:text-purple-800 flex items-center justify-center gap-1 p-2 border rounded-lg hover:bg-purple-50"
                    >
                      <ChevronDown className={`h-3 w-3 transition-transform ${showAllHistory ? "rotate-180" : ""}`} />
                      {showAllHistory ? "Show less" : `Show all ${filteredSessions.length} sessions`}
                    </button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-3">
          <Card>
            <CardHeader className="py-3 px-3 sm:px-4">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Study Schedule
                </span>
                <Button size="sm" variant="outline" className="h-8" onClick={() => setShowScheduleForm(true)}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 pt-0">
              {showScheduleForm && (
                <div className="mb-4 p-4 border rounded-lg space-y-3 bg-blue-50">
                  <h4 className="font-medium text-sm text-blue-900">Add Recurring Study</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Day</label>
                      <select
                        value={scheduleDay}
                        onChange={(e) => setScheduleDay(Number(e.target.value))}
                        className="w-full text-sm border rounded-md p-2"
                      >
                        {DAYS.map((day, i) => (
                          <option key={i} value={i}>{day}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                      <select
                        value={scheduleCategory}
                        onChange={(e) => setScheduleCategory(e.target.value as StudyCategoryId)}
                        className="w-full text-sm border rounded-md p-2"
                      >
                        {STUDY_CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Input
                    value={scheduleLabel}
                    onChange={(e) => setScheduleLabel(e.target.value)}
                    placeholder="e.g. Family Worship, Watchtower Study"
                    className="text-sm"
                  />
                  <Input
                    type="number"
                    value={scheduleMinutes}
                    onChange={(e) => setScheduleMinutes(e.target.value)}
                    placeholder="Target minutes"
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddSchedule} className="bg-blue-600 hover:bg-blue-700">Add Schedule</Button>
                    <Button size="sm" variant="outline" onClick={() => setShowScheduleForm(false)}>Cancel</Button>
                  </div>
                </div>
              )}
              
              {/* Weekly Schedule Grid */}
              <div className="grid gap-3">
                {DAYS.map((day, dayIndex) => {
                  const daySchedules = schedule.filter(s => s.dayOfWeek === dayIndex)
                  return (
                    <div key={dayIndex} className={`p-3 rounded-lg border ${
                      dayIndex === new Date().getDay() ? 'bg-purple-50 border-purple-200' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          {day}
                          {dayIndex === new Date().getDay() && (
                            <Badge className="bg-purple-100 text-purple-700 text-xs">Today</Badge>
                          )}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {daySchedules.reduce((sum, s) => sum + s.targetMinutes, 0)} min planned
                        </span>
                      </div>
                      {daySchedules.length > 0 ? (
                        <div className="space-y-2">
                          {daySchedules.map((item) => {
                            const Icon = getCategoryIcon(item.category)
                            const color = getCategoryColor(item.category)
                            const completed = dayIndex === new Date().getDay() && isScheduleCompleted(item)
                            const linkedSession = dayIndex === new Date().getDay()
                              ? sessions.find(s => s.date === today && s.scheduleId === item.id)
                              : undefined
                            return (
                              <div key={item.id} className={`flex items-center gap-3 p-2 rounded border bg-white ${
                                completed ? 'border-green-300 bg-green-50' : ''
                              }`}>
                                <div className={`w-6 h-6 rounded-full bg-${color}-100 flex items-center justify-center relative`}>
                                  <Icon className={`h-3 w-3 text-${color}-600`} />
                                  {completed && (
                                    <CheckCircle2 className="h-2.5 w-2.5 text-green-600 absolute -top-0.5 -right-0.5 bg-white rounded-full" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">{item.label}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {item.targetMinutes} min target
                                    {completed && linkedSession && (
                                      <span className="ml-1 text-green-600">· {linkedSession.minutes} min done ✅</span>
                                    )}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleDeleteSchedule(item.id)}
                                  className="text-gray-400 hover:text-red-500 p-0.5"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          No studies scheduled
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Dialog */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Study Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this study session? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
