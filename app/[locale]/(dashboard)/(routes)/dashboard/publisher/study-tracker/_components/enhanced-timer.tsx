"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Play, Pause, Square, RotateCcw } from "lucide-react"
import { STUDY_CATEGORIES, type StudyCategoryId } from "@/lib/db/studyTrackerDB"

interface TimerProps {
  running: boolean
  seconds: number
  selectedCategory: StudyCategoryId
  topic: string
  onStart: () => void
  onPause: () => void
  onStop: () => void
  onReset: () => void
  onCategoryChange: (cat: StudyCategoryId) => void
  onTopicChange: (topic: string) => void
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

const CATEGORY_ICONS = {
  BookOpen: "📖", Users: "👥", FileText: "📄", Calendar: "📅", Book: "📚", Presentation: "🎤", MoreHorizontal: "⋯"
}

export function EnhancedTimer({ running, seconds, selectedCategory, topic, onStart, onPause, onStop, onReset, onCategoryChange, onTopicChange }: TimerProps) {
  const category = STUDY_CATEGORIES.find(c => c.id === selectedCategory)
  const circumference = 2 * Math.PI * 45
  const progress = Math.min(seconds / 3600, 1)
  const offset = circumference * (1 - progress)

  return (
    <Card className={`${running ? "ring-2 ring-purple-400 shadow-lg" : ""} transition-all`}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col items-center gap-4 sm:gap-6">
          {/* Circular Timer */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="2" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={running ? "#a855f7" : "#6366f1"}
                strokeWidth="2"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`text-2xl sm:text-3xl font-mono font-bold ${running ? "text-purple-600" : "text-gray-800"}`}>
                {formatTime(seconds)}
              </div>
              {category && (
                <div className="text-[10px] sm:text-xs text-muted-foreground mt-1 text-center px-2 leading-tight">{category.label}</div>
              )}
            </div>
          </div>

          {/* Category Selection */}
          {!running && seconds === 0 && (
            <div className="w-full space-y-3">
              <div className="grid grid-cols-2 gap-1.5">
                {STUDY_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => onCategoryChange(cat.id)}
                    className={`flex items-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                      selectedCategory === cat.id
                        ? `bg-${cat.color}-100 text-${cat.color}-700 border-2 border-${cat.color}-300`
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent"
                    }`}
                  >
                    <span className="text-sm flex-shrink-0">{CATEGORY_ICONS[cat.icon as keyof typeof CATEGORY_ICONS]}</span>
                    <span className="leading-tight">
                      <span className="sm:hidden">{cat.shortLabel}</span>
                      <span className="hidden sm:inline">{cat.label}</span>
                    </span>
                  </button>
                ))}
              </div>
              <Input
                value={topic}
                onChange={(e) => onTopicChange(e.target.value)}
                placeholder="What are you studying? (optional)"
                className="text-sm h-10"
              />
            </div>
          )}

          {/* Running State */}
          {running && (
            <div className="w-full text-center">
              <div className="text-sm font-medium text-gray-700 mb-1">
                {topic || category?.label || "Study Session"}
              </div>
              <div className="text-xs text-muted-foreground">Keep studying...</div>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-2 w-full justify-center">
            {!running && seconds === 0 && (
              <Button onClick={onStart} className="gap-2 bg-purple-600 hover:bg-purple-700 flex-1 max-w-[200px] h-11">
                <Play className="h-4 w-4" />
                Start
              </Button>
            )}
            {running && (
              <>
                <Button onClick={onPause} variant="outline" className="gap-2 flex-1 h-11">
                  <Pause className="h-4 w-4" />
                  Pause
                </Button>
                <Button onClick={onStop} variant="destructive" className="gap-2 flex-1 h-11">
                  <Square className="h-4 w-4" />
                  Stop & Save
                </Button>
              </>
            )}
            {!running && seconds > 0 && (
              <>
                <Button onClick={onStart} className="gap-2 bg-purple-600 hover:bg-purple-700 flex-1 h-11">
                  <Play className="h-4 w-4" />
                  Resume
                </Button>
                <Button onClick={onStop} variant="destructive" className="gap-1 flex-1 h-11 text-xs sm:text-sm">
                  <Square className="h-4 w-4 flex-shrink-0" />
                  Save
                </Button>
                <Button onClick={onReset} variant="outline" size="icon" className="h-11 w-11 flex-shrink-0">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {seconds > 0 && seconds < 60 && !running && (
            <p className="text-xs text-orange-600 font-medium">⚠️ Minimum 1 minute to save</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
