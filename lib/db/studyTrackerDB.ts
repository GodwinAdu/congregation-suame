const DB_NAME = "study-tracker-db"
const DB_VERSION = 2
const SESSIONS_STORE = "study-sessions"
const SETTINGS_STORE = "study-settings"
const SCHEDULE_STORE = "study-schedule"

let dbInstance: IDBDatabase | null = null

export const STUDY_CATEGORIES = [
  { id: "personal", label: "Personal Study", color: "purple", icon: "BookOpen" },
  { id: "family", label: "Family Worship", color: "blue", icon: "Users" },
  { id: "watchtower", label: "Watchtower Prep", color: "red", icon: "FileText" },
  { id: "midweek", label: "Midweek Meeting Prep", color: "green", icon: "Calendar" },
  { id: "bible_reading", label: "Bible Reading", color: "indigo", icon: "Book" },
  { id: "convention", label: "Convention/Assembly Prep", color: "orange", icon: "Presentation" },
  { id: "other", label: "Other", color: "gray", icon: "MoreHorizontal" },
] as const

export type StudyCategoryId = typeof STUDY_CATEGORIES[number]["id"]

export interface StudySession {
  id: string
  date: string
  minutes: number
  topic: string
  notes: string
  category: StudyCategoryId
  createdAt: string
  completed?: boolean
}

export interface StudyScheduleItem {
  id: string
  dayOfWeek: number
  category: StudyCategoryId
  label: string
  targetMinutes: number
  completed?: boolean
  completedDate?: string
}

export interface StudyStats {
  totalMinutes: number
  totalSessions: number
  averageMinutesPerSession: number
  longestStreak: number
  currentStreak: number
  thisWeekMinutes: number
  thisMonthMinutes: number
  categoryBreakdown: Record<StudyCategoryId, { minutes: number; sessions: number }>
}

function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance)

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      dbInstance = request.result
      resolve(request.result)
    }
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(SESSIONS_STORE)) {
        const store = db.createObjectStore(SESSIONS_STORE, { keyPath: "id" })
        store.createIndex("date", "date", { unique: false })
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: "id" })
      }
      if (!db.objectStoreNames.contains(SCHEDULE_STORE)) {
        db.createObjectStore(SCHEDULE_STORE, { keyPath: "id" })
      }
    }
  })
}

// Sessions
export async function saveSession(session: StudySession): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([SESSIONS_STORE], "readwrite")
    tx.objectStore(SESSIONS_STORE).put(session)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function deleteSession(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([SESSIONS_STORE], "readwrite")
    tx.objectStore(SESSIONS_STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getAllSessions(): Promise<StudySession[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const request = db.transaction([SESSIONS_STORE], "readonly").objectStore(SESSIONS_STORE).getAll()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const sessions = (request.result as StudySession[]).map((s) => ({
        ...s,
        category: s.category || "personal",
      }))
      resolve(sessions.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)))
    }
  })
}

// Settings
export async function saveWeeklyGoal(minutes: number): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([SETTINGS_STORE], "readwrite")
    tx.objectStore(SETTINGS_STORE).put({ id: "config", weeklyGoalMinutes: minutes })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getWeeklyGoal(): Promise<number> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const request = db.transaction([SETTINGS_STORE], "readonly").objectStore(SETTINGS_STORE).get("config")
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result?.weeklyGoalMinutes ?? 30)
  })
}

// Schedule
export async function saveScheduleItem(item: StudyScheduleItem): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([SCHEDULE_STORE], "readwrite")
    tx.objectStore(SCHEDULE_STORE).put(item)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function deleteScheduleItem(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([SCHEDULE_STORE], "readwrite")
    tx.objectStore(SCHEDULE_STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getAllScheduleItems(): Promise<StudyScheduleItem[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const request = db.transaction([SCHEDULE_STORE], "readonly").objectStore(SCHEDULE_STORE).getAll()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result as StudyScheduleItem[])
  })
}

// Reset
export async function resetStudyTracker(): Promise<void> {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
    request.onblocked = () => resolve()
  })
}

// Stats
export async function getStudyStats(): Promise<StudyStats> {
  const sessions = await getAllSessions()
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  const totalMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0)
  const totalSessions = sessions.length
  const averageMinutesPerSession = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0
  const thisWeekMinutes = sessions.filter(s => new Date(s.date) >= weekStart).reduce((sum, s) => sum + s.minutes, 0)
  const thisMonthMinutes = sessions.filter(s => new Date(s.date) >= monthStart).reduce((sum, s) => sum + s.minutes, 0)

  const uniqueDates = [...new Set(sessions.map(s => s.date))].sort().reverse()
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0

  for (let i = 0; i < uniqueDates.length; i++) {
    const expected = new Date(today)
    expected.setDate(expected.getDate() - i)
    const expectedStr = expected.toISOString().split('T')[0]
    if (uniqueDates.includes(expectedStr)) {
      tempStreak++
      if (i === 0 || (i === 1 && !uniqueDates.includes(expectedStr))) currentStreak = tempStreak
    } else if (tempStreak > longestStreak) {
      longestStreak = tempStreak
      tempStreak = 0
    } else {
      tempStreak = 0
    }
  }
  if (tempStreak > longestStreak) longestStreak = tempStreak

  const categoryBreakdown: Record<StudyCategoryId, { minutes: number; sessions: number }> = {} as any
  STUDY_CATEGORIES.forEach(cat => {
    const catSessions = sessions.filter(s => s.category === cat.id)
    categoryBreakdown[cat.id] = {
      minutes: catSessions.reduce((sum, s) => sum + s.minutes, 0),
      sessions: catSessions.length
    }
  })

  return {
    totalMinutes,
    totalSessions,
    averageMinutesPerSession,
    longestStreak,
    currentStreak,
    thisWeekMinutes,
    thisMonthMinutes,
    categoryBreakdown
  }
}

export async function getWeeklyData(): Promise<{ date: string; minutes: number }[]> {
  const sessions = await getAllSessions()
  const data: { date: string; minutes: number }[] = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const dayMinutes = sessions.filter(s => s.date === dateStr).reduce((sum, s) => sum + s.minutes, 0)
    data.push({ date: dateStr, minutes: dayMinutes })
  }
  return data
}
