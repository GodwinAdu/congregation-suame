"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BookOpen, Calendar, CheckCircle, RotateCcw, ChevronLeft, ChevronRight, Trophy, Flame, Award, ChevronDown, MessageSquare } from "lucide-react"
import { BIBLE_BOOKS } from "@/lib/data/bible-reading-plan"
import { generateReadingPlan, TOTAL_CHAPTERS, type DayReading } from "@/lib/data/bible-reading-plan"
import {
  savePlanStartDate,
  getPlanStartDate,
  toggleDayComplete,
  getCompletedDays,
  resetPlan,
  saveNote,
  getAllNotes,
} from "@/lib/db/bibleReadingDB"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

const DAYS_PER_PAGE = 7

export default function BibleReadingClient() {
  const [startDate, setStartDate] = useState("")
  const [duration, setDuration] = useState(1)
  const [plan, setPlan] = useState<DayReading[]>([])
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set())
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showBookProgress, setShowBookProgress] = useState(false)
  const [notes, setNotes] = useState<Map<number, string>>(new Map())
  const [editingNoteDay, setEditingNoteDay] = useState<number | null>(null)
  const [noteText, setNoteText] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const saved = await getPlanStartDate()
        if (saved) {
          setStartDate(saved.startDate)
          setDuration(saved.duration)
          setPlan(generateReadingPlan(new Date(saved.startDate), saved.duration))
          setCompletedDays(await getCompletedDays())
          setNotes(await getAllNotes())

          // Auto-navigate to today's reading
          const today = new Date().toISOString().split("T")[0]
          const generatedPlan = generateReadingPlan(new Date(saved.startDate), saved.duration)
          const todayIndex = generatedPlan.findIndex((d) => d.date === today)
          if (todayIndex >= 0) {
            setPage(Math.floor(todayIndex / DAYS_PER_PAGE))
          }
        }
      } catch (e) {
        console.error("Failed to load reading plan:", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleStartPlan = async () => {
    if (!startDate) return
    await savePlanStartDate(startDate, duration)
    setPlan(generateReadingPlan(new Date(startDate), duration))
    setCompletedDays(new Set())
    setPage(0)
  }

  const handleSaveNote = async (day: number) => {
    await saveNote(day, noteText)
    setNotes((prev) => {
      const next = new Map(prev)
      noteText.trim() ? next.set(day, noteText) : next.delete(day)
      return next
    })
    setEditingNoteDay(null)
    setNoteText("")
  }

  const handleToggleDay = async (day: number) => {
    const newState = await toggleDayComplete(day)
    setCompletedDays((prev) => {
      const next = new Set(prev)
      newState ? next.add(day) : next.delete(day)
      return next
    })
  }

  const handleReset = async () => {
    await resetPlan()
    setPlan([])
    setStartDate("")
    setDuration(1)
    setCompletedDays(new Set())
    setNotes(new Map())
    setPage(0)
    setShowResetDialog(false)
  }

  const totalPages = Math.ceil(plan.length / DAYS_PER_PAGE)
  const currentDays = plan.slice(page * DAYS_PER_PAGE, (page + 1) * DAYS_PER_PAGE)
  const completedChapters = useMemo(() => {
    let count = 0
    completedDays.forEach((day) => {
      const d = plan.find((p) => p.day === day)
      if (d) count += d.readings.length
    })
    return count
  }, [completedDays, plan])

  const progressPercent = plan.length > 0 ? Math.round((completedDays.size / plan.length) * 100) : 0
  const today = new Date().toISOString().split("T")[0]

  const totalDays = duration * 365
  const avgChaptersPerDay = Math.round(TOTAL_CHAPTERS / totalDays)

  const { currentStreak, longestStreak } = useMemo(() => {
    if (plan.length === 0 || completedDays.size === 0) return { currentStreak: 0, longestStreak: 0 }

    // Sort completed day numbers and walk backwards from the latest completed day that is <= today
    const todayDayObj = plan.find((d) => d.date === today)
    const todayDayNum = todayDayObj?.day ?? plan.length

    let current = 0
    for (let d = todayDayNum; d >= 1; d--) {
      if (completedDays.has(d)) current++
      else break
    }
    // If today isn't completed yet, check streak ending yesterday
    if (current === 0 && todayDayNum > 1) {
      for (let d = todayDayNum - 1; d >= 1; d--) {
        if (completedDays.has(d)) current++
        else break
      }
    }

    let longest = 0
    let run = 0
    for (let d = 1; d <= totalDays; d++) {
      if (completedDays.has(d)) {
        run++
        if (run > longest) longest = run
      } else {
        run = 0
      }
    }

    return { currentStreak: current, longestStreak: longest }
  }, [completedDays, plan, today])

  const bookProgress = useMemo(() => {
    if (plan.length === 0) return []

    // Collect all completed chapter strings
    const completedChapterSet = new Set<string>()
    completedDays.forEach((day) => {
      const d = plan.find((p) => p.day === day)
      d?.readings.forEach((r) => completedChapterSet.add(r))
    })

    return BIBLE_BOOKS.map((book) => {
      let read = 0
      for (let ch = 1; ch <= book.chapters; ch++) {
        if (completedChapterSet.has(`${book.name} ${ch}`)) read++
      }
      return {
        name: book.name,
        total: book.chapters,
        read,
        status: read === 0 ? "not-started" as const : read >= book.chapters ? "complete" as const : "in-progress" as const,
      }
    })
  }, [completedDays, plan])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  // No plan yet - show setup
  if (plan.length === 0) {
    return (
      <div className="container mx-auto p-3 sm:p-6 max-w-2xl">
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Daily Bible Reading</CardTitle>
            <p className="text-muted-foreground mt-2">
              Read the entire Bible in 1, 2, or 3 years. Choose your duration and start date.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Reading Plan Duration</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((years) => {
                  const chaptersPerDay = Math.round(TOTAL_CHAPTERS / (years * 365))
                  return (
                    <button
                      key={years}
                      onClick={() => setDuration(years)}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        duration === years
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold">{years} Year{years > 1 ? 's' : ''}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        ~{chaptersPerDay} ch/day
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <Button onClick={handleStartPlan} disabled={!startDate} className="w-full gap-2">
              <Calendar className="h-4 w-4" />
              Start Reading Plan
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              {TOTAL_CHAPTERS} chapters • 66 books • {totalDays} days • ~{avgChaptersPerDay} ch/day
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Daily Bible Reading
            </h1>
            <p className="text-blue-100 text-sm mt-1">
              {duration}-year plan started {new Date(startDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowResetDialog(true)}
            className="bg-white/10 hover:bg-white/20 text-white border-white/30"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>

        {/* Progress */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>{completedDays.size} of {totalDays} days completed</span>
            <span>{completedChapters} / {TOTAL_CHAPTERS} chapters</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div
              className="bg-white rounded-full h-3 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-blue-100 text-xs text-right">{progressPercent}% complete</p>
        </div>

        {/* Streak Cards */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <Flame className="h-5 w-5 mx-auto mb-1 text-orange-300" />
            <div className="text-2xl font-bold">{currentStreak}</div>
            <div className="text-blue-200 text-xs">Current Streak</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <Award className="h-5 w-5 mx-auto mb-1 text-yellow-300" />
            <div className="text-2xl font-bold">{longestStreak}</div>
            <div className="text-blue-200 text-xs">Longest Streak</div>
          </div>
        </div>

        {progressPercent === 100 && (
          <div className="mt-3 flex items-center gap-2 bg-yellow-500/20 rounded-lg p-3">
            <Trophy className="h-5 w-5 text-yellow-300" />
            <span className="font-semibold text-yellow-100">Congratulations! You've completed the entire Bible!</span>
          </div>
        )}
      </div>

      {/* Book Progress Tracker */}
      <Card>
        <CardHeader
          className="cursor-pointer py-3 px-4"
          onClick={() => setShowBookProgress((v) => !v)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Book Progress ({bookProgress.filter((b) => b.status === "complete").length} / 66 books)
            </CardTitle>
            <ChevronDown className={`h-4 w-4 transition-transform ${showBookProgress ? "rotate-180" : ""}`} />
          </div>
        </CardHeader>
        {showBookProgress && (
          <CardContent className="pt-0 px-4 pb-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {bookProgress.map((book) => (
                <div
                  key={book.name}
                  className={`rounded-lg p-2 text-center text-xs border transition-colors ${
                    book.status === "complete"
                      ? "bg-green-50 border-green-300 text-green-700"
                      : book.status === "in-progress"
                      ? "bg-blue-50 border-blue-300 text-blue-700"
                      : "bg-gray-50 border-gray-200 text-gray-400"
                  }`}
                >
                  <div className="font-medium truncate">{book.name}</div>
                  <div className="text-[10px] mt-0.5">
                    {book.read}/{book.total}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Complete</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> In Progress</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300" /> Not Started</span>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 0}
          onClick={() => setPage((p) => p - 1)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Week {page + 1} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages - 1}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Daily Readings */}
      <div className="grid gap-3">
        {currentDays.map((dayReading) => {
          const isComplete = completedDays.has(dayReading.day)
          const isToday = dayReading.date === today
          const isPast = dayReading.date < today && !isComplete

          return (
            <Card
              key={dayReading.day}
              className={`transition-all cursor-pointer hover:shadow-md ${
                isComplete
                  ? "bg-green-50 border-green-200"
                  : isToday
                  ? "ring-2 ring-blue-400 bg-blue-50/50"
                  : isPast
                  ? "bg-orange-50/50 border-orange-200"
                  : ""
              }`}
              onClick={() => handleToggleDay(dayReading.day)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                      isComplete
                        ? "bg-green-500 border-green-500"
                        : "border-gray-300 hover:border-blue-400"
                    }`}
                  >
                    {isComplete && <CheckCircle className="h-4 w-4 text-white" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-sm">Day {dayReading.day}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(dayReading.date + "T12:00:00").toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {isToday && (
                        <Badge className="bg-blue-600 text-white text-xs px-1.5 py-0">Today</Badge>
                      )}
                      {isPast && (
                        <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs px-1.5 py-0">
                          Missed
                        </Badge>
                      )}
                      {isComplete && (
                        <Badge className="bg-green-600 text-white text-xs px-1.5 py-0">Done</Badge>
                      )}
                    </div>
                    <p className={`text-sm ${isComplete ? "text-green-700 line-through" : "text-gray-700"}`}>
                      {dayReading.readings.join(", ")}
                    </p>
                  </div>

                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {dayReading.readings.length} ch.
                  </span>
                </div>

                {/* Note */}
                {editingNoteDay === dayReading.day ? (
                  <div className="mt-2 ml-9" onClick={(e) => e.stopPropagation()}>
                    <textarea
                      className="w-full text-sm border rounded-md p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                      rows={2}
                      placeholder="Add a reflection note..."
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      autoFocus
                    />
                    <div className="flex gap-2 mt-1">
                      <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => handleSaveNote(dayReading.day)}>Save</Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setEditingNoteDay(null); setNoteText("") }}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1 ml-9" onClick={(e) => e.stopPropagation()}>
                    {notes.has(dayReading.day) ? (
                      <button
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-start gap-1 text-left"
                        onClick={() => { setEditingNoteDay(dayReading.day); setNoteText(notes.get(dayReading.day) || "") }}
                      >
                        <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">{notes.get(dayReading.day)}</span>
                      </button>
                    ) : (
                      <button
                        className="text-xs text-muted-foreground hover:text-blue-600 flex items-center gap-1"
                        onClick={() => { setEditingNoteDay(dayReading.day); setNoteText("") }}
                      >
                        <MessageSquare className="h-3 w-3" />
                        Add note
                      </button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Pagination bottom */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 0}
          onClick={() => setPage((p) => p - 1)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const todayIndex = plan.findIndex((d) => d.date === today)
            if (todayIndex >= 0) setPage(Math.floor(todayIndex / DAYS_PER_PAGE))
          }}
        >
          Go to Today
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages - 1}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Reset Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Reading Plan</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete your current reading plan and all progress. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="bg-red-600 hover:bg-red-700">
              Reset Plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
