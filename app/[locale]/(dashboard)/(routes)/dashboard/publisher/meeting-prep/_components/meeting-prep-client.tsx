"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Calendar, CheckCircle2, Clock, Plus, Settings, BarChart3,
  History, AlertCircle, BookOpen, Users, Presentation, Crown,
  FileText, Heart, Mic, Music, Trash2, Edit, Play, Pause,
  Target, TrendingUp, Filter, ChevronDown, X,
} from "lucide-react"
import {
  getAllChecklists, saveChecklist, deleteChecklist, getAllTemplates,
  getSettings, saveSettings, initializeDefaultTemplates, createChecklistFromTemplate,
  calculateChecklistStats, MEETING_TYPES, PREPARATION_CATEGORIES,
  type MeetingChecklist, type ChecklistItem, type ChecklistTemplate,
  type MeetingTypeId, type PreparationCategoryId, type MeetingPrepSettings,
} from "@/lib/db/meetingPrepDB"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { TemplateManager } from "./template-manager"

const CATEGORY_ICONS = {
  Book: BookOpen, FileText, Users, Heart, Mic, Music, BookOpen: BookOpen
}

const MEETING_ICONS = {
  Calendar, Users, Presentation, Crown
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

function getWeekOf(date: Date): string {
  const monday = new Date(date)
  const day = monday.getDay()
  const diff = monday.getDate() - day + (day === 0 ? -6 : 1)
  monday.setDate(diff)
  return monday.toISOString().split('T')[0]
}

export default function MeetingPrepClient() {
  const [checklists, setChecklists] = useState<MeetingChecklist[]>([])
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([])
  const [settings, setSettings] = useState<MeetingPrepSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("current")

  // Current checklist state
  const [selectedChecklist, setSelectedChecklist] = useState<MeetingChecklist | null>(null)
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerItemId, setTimerItemId] = useState<string | null>(null)

  // Create checklist state
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createMeetingType, setCreateMeetingType] = useState<MeetingTypeId>("midweek")
  const [createMeetingDate, setCreateMeetingDate] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")

  // Filters
  const [statusFilter, setStatusFilter] = useState<"all" | "not_started" | "in_progress" | "completed">("all")
  const [typeFilter, setTypeFilter] = useState<MeetingTypeId | "all">("all")

  // Delete
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        await initializeDefaultTemplates()
        const [checklistsData, templatesData, settingsData] = await Promise.all([
          getAllChecklists(),
          getAllTemplates(),
          getSettings(),
        ])
        setChecklists(checklistsData)
        setTemplates(templatesData)
        setSettings(settingsData)
        
        // Auto-select most recent incomplete checklist
        const current = checklistsData.find(c => c.status !== "completed")
        if (current) setSelectedChecklist(current)
      } catch (e) {
        console.error("Failed to load meeting prep:", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (timerRunning) {
      interval = setInterval(() => setTimerSeconds(s => s + 1), 1000)
    }
    return () => { if (interval) clearInterval(interval) }
  }, [timerRunning])

  const handleCreateChecklist = async () => {
    if (!createMeetingDate || !selectedTemplate) return
    
    const template = templates.find(t => t.id === selectedTemplate)
    if (!template) return

    const weekOf = getWeekOf(new Date(createMeetingDate))
    const newChecklist = createChecklistFromTemplate(template, createMeetingDate, weekOf)
    
    await saveChecklist(newChecklist)
    setChecklists(prev => [newChecklist, ...prev])
    setSelectedChecklist(newChecklist)
    setShowCreateForm(false)
    setCreateMeetingDate("")
    setSelectedTemplate("")
  }

  const handleToggleItem = async (itemId: string) => {
    if (!selectedChecklist) return

    const updatedItems = selectedChecklist.items.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            completed: !item.completed,
            completedAt: !item.completed ? new Date().toISOString() : undefined
          }
        : item
    )

    const updatedChecklist = calculateChecklistStats({
      ...selectedChecklist,
      items: updatedItems,
    })

    await saveChecklist(updatedChecklist)
    setSelectedChecklist(updatedChecklist)
    setChecklists(prev => prev.map(c => c.id === updatedChecklist.id ? updatedChecklist : c))
  }

  const handleStartTimer = (itemId: string) => {
    setTimerItemId(itemId)
    setTimerRunning(true)
    setTimerSeconds(0)
  }

  const handleStopTimer = async () => {
    if (!selectedChecklist || !timerItemId || timerSeconds < 60) {
      setTimerRunning(false)
      setTimerSeconds(0)
      setTimerItemId(null)
      return
    }

    const minutes = Math.round(timerSeconds / 60)
    const updatedItems = selectedChecklist.items.map(item =>
      item.id === timerItemId
        ? { ...item, timeSpent: (item.timeSpent || 0) + minutes }
        : item
    )

    const updatedChecklist = calculateChecklistStats({
      ...selectedChecklist,
      items: updatedItems,
    })

    await saveChecklist(updatedChecklist)
    setSelectedChecklist(updatedChecklist)
    setChecklists(prev => prev.map(c => c.id === updatedChecklist.id ? updatedChecklist : c))
    
    setTimerRunning(false)
    setTimerSeconds(0)
    setTimerItemId(null)
  }

  const handleDeleteChecklist = async () => {
    if (!deletingId) return
    await deleteChecklist(deletingId)
    setChecklists(prev => prev.filter(c => c.id !== deletingId))
    if (selectedChecklist?.id === deletingId) {
      setSelectedChecklist(null)
    }
    setDeletingId(null)
  }

  // Computed values
  const filteredChecklists = useMemo(() => {
    return checklists.filter(checklist => {
      if (statusFilter !== "all" && checklist.status !== statusFilter) return false
      if (typeFilter !== "all" && checklist.meetingType !== typeFilter) return false
      return true
    })
  }, [checklists, statusFilter, typeFilter])

  const stats = useMemo(() => {
    const total = checklists.length
    const completed = checklists.filter(c => c.status === "completed").length
    const inProgress = checklists.filter(c => c.status === "in_progress").length
    const totalTime = checklists.reduce((sum, c) => sum + c.totalTimeSpent, 0)
    const avgCompletion = total > 0 ? Math.round(checklists.reduce((sum, c) => sum + c.completionPercentage, 0) / total) : 0

    return { total, completed, inProgress, totalTime, avgCompletion }
  }, [checklists])

  const getCategoryIcon = (categoryId: PreparationCategoryId) => {
    const category = PREPARATION_CATEGORIES.find(c => c.id === categoryId)
    return category ? CATEGORY_ICONS[category.icon as keyof typeof CATEGORY_ICONS] || BookOpen : BookOpen
  }

  const getMeetingIcon = (meetingTypeId: MeetingTypeId) => {
    const meetingType = MEETING_TYPES.find(m => m.id === meetingTypeId)
    return meetingType ? MEETING_ICONS[meetingType.icon as keyof typeof MEETING_ICONS] || Calendar : Calendar
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="w-full p-3 sm:p-6 space-y-3 sm:space-y-4 max-w-6xl mx-auto pb-24 sm:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 sm:p-6 text-white">
        <h1 className="text-lg sm:text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
          Meeting Preparation
        </h1>
        <p className="text-blue-100 text-xs sm:text-sm mt-0.5">Stay organized for all meetings</p>

        <div className="grid grid-cols-4 gap-2 mt-3">
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <CheckCircle2 className="h-3.5 w-3.5 mx-auto mb-0.5 text-green-300" />
            <div className="text-base sm:text-xl font-bold">{stats.completed}</div>
            <div className="text-blue-200 text-[9px] sm:text-xs">Done</div>
          </div>
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <Clock className="h-3.5 w-3.5 mx-auto mb-0.5 text-yellow-300" />
            <div className="text-base sm:text-xl font-bold">{stats.inProgress}</div>
            <div className="text-blue-200 text-[9px] sm:text-xs">Active</div>
          </div>
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <Target className="h-3.5 w-3.5 mx-auto mb-0.5 text-purple-300" />
            <div className="text-base sm:text-xl font-bold">{stats.avgCompletion}%</div>
            <div className="text-blue-200 text-[9px] sm:text-xs">Avg</div>
          </div>
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <TrendingUp className="h-3.5 w-3.5 mx-auto mb-0.5 text-orange-300" />
            <div className="text-base sm:text-xl font-bold">{formatTime(stats.totalTime)}</div>
            <div className="text-blue-200 text-[9px] sm:text-xs">Time</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="flex-1 sm:flex-none gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Checklist
        </Button>
        
        {selectedChecklist && (
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border">
            <div className={`w-3 h-3 rounded-full bg-${MEETING_TYPES.find(m => m.id === selectedChecklist.meetingType)?.color}-500`} />
            <span className="text-sm font-medium truncate">{selectedChecklist.title}</span>
            <Badge variant="outline" className="text-xs">
              {selectedChecklist.completedItems}/{selectedChecklist.totalItems}
            </Badge>
          </div>
        )}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
        <div className="sticky top-0 z-10 bg-background pt-1 pb-1">
          <TabsList className="grid w-full grid-cols-4 h-14">
            <TabsTrigger value="current" className="flex flex-col items-center gap-0.5 px-1 py-1.5">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-[10px] leading-none">Current</span>
            </TabsTrigger>
            <TabsTrigger value="all" className="flex flex-col items-center gap-0.5 px-1 py-1.5">
              <Calendar className="h-4 w-4" />
              <span className="text-[10px] leading-none">All</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex flex-col items-center gap-0.5 px-1 py-1.5">
              <BarChart3 className="h-4 w-4" />
              <span className="text-[10px] leading-none">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex flex-col items-center gap-0.5 px-1 py-1.5">
              <Settings className="h-4 w-4" />
              <span className="text-[10px] leading-none">Settings</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Current Tab */}
        <TabsContent value="current" className="space-y-4">
          {selectedChecklist ? (
            <div className="grid lg:grid-cols-3 gap-4">
              {/* Checklist Items */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {(() => {
                          const Icon = getMeetingIcon(selectedChecklist.meetingType)
                          return <Icon className="h-5 w-5" />
                        })()}
                        {selectedChecklist.title}
                      </CardTitle>
                      <Badge className={`${
                        selectedChecklist.status === 'completed' ? 'bg-green-600' :
                        selectedChecklist.status === 'in_progress' ? 'bg-yellow-600' :
                        'bg-gray-600'
                      } text-white`}>
                        {selectedChecklist.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Progress value={selectedChecklist.completionPercentage} className="h-2" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{selectedChecklist.completedItems}/{selectedChecklist.totalItems} completed</span>
                        <span>{formatTime(selectedChecklist.totalTimeSpent)} spent</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedChecklist.items.map((item) => {
                      const Icon = getCategoryIcon(item.category)
                      const isTimerActive = timerItemId === item.id && timerRunning
                      return (
                        <div key={item.id} className={`p-3 rounded-lg border transition-all ${
                          item.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                        } ${isTimerActive ? 'ring-2 ring-blue-400' : ''}`}>
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => handleToggleItem(item.id)}
                              className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                item.completed 
                                  ? 'bg-green-600 border-green-600 text-white' 
                                  : 'border-gray-300 hover:border-blue-400'
                              }`}
                            >
                              {item.completed && <CheckCircle2 className="h-3 w-3" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Icon className="h-4 w-4 text-gray-600" />
                                <h4 className={`font-medium text-sm ${
                                  item.completed ? 'line-through text-gray-500' : 'text-gray-900'
                                }`}>
                                  {item.title}
                                </h4>
                                <Badge className={`text-xs ${
                                  item.priority === 'high' ? 'bg-red-100 text-red-700' :
                                  item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {item.priority}
                                </Badge>
                              </div>
                              {item.description && (
                                <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                              )}
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{PREPARATION_CATEGORIES.find(c => c.id === item.category)?.label}</span>
                                {item.timeSpent && item.timeSpent > 0 && (
                                  <span>• {formatTime(item.timeSpent)}</span>
                                )}
                                {item.completedAt && (
                                  <span>• Completed {new Date(item.completedAt).toLocaleDateString()}</span>
                                )}
                              </div>
                              {item.notes && (
                                <div className="mt-2 p-2 bg-white rounded border text-xs">
                                  <strong>Notes:</strong> {item.notes}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {isTimerActive ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono text-blue-600">
                                    {Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, '0')}
                                  </span>
                                  <Button size="sm" variant="outline" onClick={handleStopTimer}>
                                    <Pause className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleStartTimer(item.id)}
                                  disabled={item.completed}
                                >
                                  <Play className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Meeting Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Meeting Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">
                        {MEETING_TYPES.find(m => m.id === selectedChecklist.meetingType)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">
                        {new Date(selectedChecklist.meetingDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Week of:</span>
                      <span className="font-medium">
                        {new Date(selectedChecklist.weekOf).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium">
                        {new Date(selectedChecklist.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Progress by Category */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Progress by Category</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {PREPARATION_CATEGORIES.map(category => {
                      const categoryItems = selectedChecklist.items.filter(item => item.category === category.id)
                      if (categoryItems.length === 0) return null
                      const completed = categoryItems.filter(item => item.completed).length
                      const percentage = Math.round((completed / categoryItems.length) * 100)
                      const Icon = getCategoryIcon(category.id)
                      return (
                        <div key={category.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1">
                              <Icon className="h-3 w-3" />
                              <span>{category.label}</span>
                            </div>
                            <span className="font-medium">{completed}/{categoryItems.length}</span>
                          </div>
                          <Progress value={percentage} className="h-1" />
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start gap-2"
                      onClick={() => setDeletingId(selectedChecklist.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete Checklist
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Checklist</h3>
                <p className="text-muted-foreground mb-4">
                  Create a new checklist to start preparing for your next meeting
                </p>
                <Button onClick={() => setShowCreateForm(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Checklist
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* All Checklists Tab */}
        <TabsContent value="all" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="all">All Status</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="all">All Types</option>
                {MEETING_TYPES.map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </div>
            <Badge variant="outline" className="ml-auto">
              {filteredChecklists.length} checklists
            </Badge>
          </div>

          <div className="grid gap-4">
            {filteredChecklists.length > 0 ? (
              filteredChecklists.map((checklist) => {
                const Icon = getMeetingIcon(checklist.meetingType)
                return (
                  <Card key={checklist.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedChecklist(checklist)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-${MEETING_TYPES.find(m => m.id === checklist.meetingType)?.color}-100 flex items-center justify-center`}>
                            <Icon className={`h-5 w-5 text-${MEETING_TYPES.find(m => m.id === checklist.meetingType)?.color}-600`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-base">{checklist.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(checklist.meetingDate).toLocaleDateString()} • {MEETING_TYPES.find(m => m.id === checklist.meetingType)?.label}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`${
                            checklist.status === 'completed' ? 'bg-green-600' :
                            checklist.status === 'in_progress' ? 'bg-yellow-600' :
                            'bg-gray-600'
                          } text-white text-xs`}>
                            {checklist.status.replace('_', ' ')}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTime(checklist.totalTimeSpent)}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Progress value={checklist.completionPercentage} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{checklist.completedItems}/{checklist.totalItems} completed ({checklist.completionPercentage}%)</span>
                          <span>Updated {new Date(checklist.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Checklists Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {statusFilter !== 'all' || typeFilter !== 'all' 
                      ? 'Try adjusting your filters or create a new checklist'
                      : 'Create your first meeting preparation checklist'
                    }
                  </p>
                  <Button onClick={() => setShowCreateForm(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Checklist
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Total Checklists</div>
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Completion Rate</div>
                <div className="text-2xl font-bold text-green-600">{stats.avgCompletion}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Total Study Time</div>
                <div className="text-2xl font-bold text-purple-600">{formatTime(stats.totalTime)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Avg per Checklist</div>
                <div className="text-2xl font-bold text-orange-600">
                  {stats.total > 0 ? formatTime(Math.round(stats.totalTime / stats.total)) : '0m'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Meeting Type Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">By Meeting Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MEETING_TYPES.map(type => {
                  const typeChecklists = checklists.filter(c => c.meetingType === type.id)
                  const completed = typeChecklists.filter(c => c.status === 'completed').length
                  const percentage = typeChecklists.length > 0 ? Math.round((completed / typeChecklists.length) * 100) : 0
                  const Icon = getMeetingIcon(type.id)
                  return (
                    <div key={type.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span className="font-medium">{type.label}</span>
                        </div>
                        <span className="text-muted-foreground">{completed}/{typeChecklists.length} completed</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <TemplateManager 
            templates={templates}
            onTemplatesChange={setTemplates}
          />
        </TabsContent>
      </Tabs>

      {/* Create Checklist Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Create New Checklist
                <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Meeting Type</label>
                <select
                  value={createMeetingType}
                  onChange={(e) => setCreateMeetingType(e.target.value as MeetingTypeId)}
                  className="w-full border rounded-md p-2 text-sm"
                >
                  {MEETING_TYPES.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Meeting Date</label>
                <Input
                  type="date"
                  value={createMeetingDate}
                  onChange={(e) => setCreateMeetingDate(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Template</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full border rounded-md p-2 text-sm"
                >
                  <option value="">Select a template</option>
                  {templates
                    .filter(t => t.meetingType === createMeetingType)
                    .map(template => (
                      <option key={template.id} value={template.id}>{template.name}</option>
                    ))
                  }
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={handleCreateChecklist}
                  disabled={!createMeetingDate || !selectedTemplate}
                  className="flex-1"
                >
                  Create Checklist
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Checklist</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this checklist? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteChecklist} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}