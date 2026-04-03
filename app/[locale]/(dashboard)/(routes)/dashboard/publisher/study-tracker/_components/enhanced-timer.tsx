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
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-6">
          {/* Circular Timer */}
          <div className="relative w-40 h-40">
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
              <div className={`text-3xl font-mono font-bold ${running ? "text-purple-600" : "text-gray-800"}`}>
                {formatTime(seconds)}
              </div>
              {category && (
                <div className="text-xs text-muted-foreground mt-1">{category.label}</div>
              )}
            </div>
          </div>

          {/* Category Selection */}
          {!running && seconds === 0 && (
            <div className="w-full space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {STUDY_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => onCategoryChange(cat.id)}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      selectedCategory === cat.id
                        ? `bg-${cat.color}-100 text-${cat.color}-700 border-2 border-${cat.color}-300`
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent"
                    }`}
                  >
                    <span>{CATEGORY_ICONS[cat.icon as keyof typeof CATEGORY_ICONS]}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
              <Input
                value={topic}
                onChange={(e) => onTopicChange(e.target.value)}
                placeholder="What are you studying? (optional)"
                className="text-sm"
              />
            </div>
          )}

          {/* Running State - Show Notes */}
          {running && (
            <div className="w-full text-center">
              <div className="text-sm font-medium text-gray-700 mb-2">
                {topic || category?.label || "Study Session"}
              </div>
              <div className="text-xs text-muted-foreground">
                Keep studying...
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-3 w-full justify-center flex-wrap">
            {!running && seconds === 0 && (
              <Button onClick={onStart} className="gap-2 bg-purple-600 hover:bg-purple-700 px-6">
                <Play className="h-4 w-4" />
                Start
              </Button>
            )}
            {running && (
              <>
                <Button onClick={onPause} variant="outline" className="gap-2">
                  <Pause className="h-4 w-4" />
                  Pause
                </Button>
                <Button onClick={onStop} variant="destructive" className="gap-2">
                  <Square className="h-4 w-4" />
                  Stop & Save
                </Button>
              </>
            )}
            {!running && seconds > 0 && (
              <>
                <Button onClick={onStart} className="gap-2 bg-purple-600 hover:bg-purple-700">
                  <Play className="h-4 w-4" />
                  Resume
                </Button>
                <Button onClick={onStop} variant="destructive" className="gap-2">
                  <Square className="h-4 w-4" />
                  Stop & Save
                </Button>
                <Button onClick={onReset} variant="outline" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset
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
