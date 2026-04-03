const DB_NAME = "meeting-prep-db"
const DB_VERSION = 1
const CHECKLISTS_STORE = "meeting-checklists"
const TEMPLATES_STORE = "meeting-templates"
const SETTINGS_STORE = "meeting-settings"

let dbInstance: IDBDatabase | null = null

export const MEETING_TYPES = [
  { id: "midweek", label: "Midweek Meeting", color: "green", icon: "Calendar" },
  { id: "weekend", label: "Weekend Meeting", color: "blue", icon: "Users" },
  { id: "assembly", label: "Circuit Assembly", color: "purple", icon: "Presentation" },
  { id: "convention", label: "Regional Convention", color: "orange", icon: "Crown" },
] as const

export type MeetingTypeId = typeof MEETING_TYPES[number]["id"]

export const PREPARATION_CATEGORIES = [
  { id: "bible_reading", label: "Bible Reading", icon: "Book" },
  { id: "watchtower", label: "Watchtower Study", icon: "FileText" },
  { id: "ministry", label: "Ministry Items", icon: "Users" },
  { id: "living", label: "Living as Christians", icon: "Heart" },
  { id: "public_talk", label: "Public Talk", icon: "Mic" },
  { id: "songs", label: "Songs & Prayer", icon: "Music" },
  { id: "personal", label: "Personal Study", icon: "BookOpen" },
  { id: "family", label: "Family Worship", icon: "Users" },
] as const

export type PreparationCategoryId = typeof PREPARATION_CATEGORIES[number]["id"]

export interface ChecklistItem {
  id: string
  title: string
  description?: string
  category: PreparationCategoryId
  completed: boolean
  notes?: string
  timeSpent?: number // minutes
  priority: "low" | "medium" | "high"
  dueDate?: string
  createdAt: string
  completedAt?: string
}

export interface MeetingChecklist {
  id: string
  meetingType: MeetingTypeId
  meetingDate: string
  weekOf: string
  title: string
  items: ChecklistItem[]
  totalItems: number
  completedItems: number
  completionPercentage: number
  totalTimeSpent: number
  status: "not_started" | "in_progress" | "completed"
  createdAt: string
  updatedAt: string
}

export interface ChecklistTemplate {
  id: string
  name: string
  meetingType: MeetingTypeId
  items: Omit<ChecklistItem, "id" | "completed" | "notes" | "timeSpent" | "createdAt" | "completedAt">[]
  isDefault: boolean
  createdAt: string
}

export interface MeetingPrepSettings {
  id: string
  defaultReminderDays: number
  autoCreateChecklists: boolean
  preferredStudyTime: string
  notifications: boolean
  weekStartsOn: number // 0=Sunday, 1=Monday
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
      
      if (!db.objectStoreNames.contains(CHECKLISTS_STORE)) {
        const store = db.createObjectStore(CHECKLISTS_STORE, { keyPath: "id" })
        store.createIndex("meetingDate", "meetingDate", { unique: false })
        store.createIndex("meetingType", "meetingType", { unique: false })
        store.createIndex("status", "status", { unique: false })
      }
      
      if (!db.objectStoreNames.contains(TEMPLATES_STORE)) {
        const store = db.createObjectStore(TEMPLATES_STORE, { keyPath: "id" })
        store.createIndex("meetingType", "meetingType", { unique: false })
      }
      
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: "id" })
      }
    }
  })
}

// Checklists
export async function saveChecklist(checklist: MeetingChecklist): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([CHECKLISTS_STORE], "readwrite")
    tx.objectStore(CHECKLISTS_STORE).put(checklist)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getChecklist(id: string): Promise<MeetingChecklist | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const request = db.transaction([CHECKLISTS_STORE], "readonly").objectStore(CHECKLISTS_STORE).get(id)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result || null)
  })
}

export async function getAllChecklists(): Promise<MeetingChecklist[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const request = db.transaction([CHECKLISTS_STORE], "readonly").objectStore(CHECKLISTS_STORE).getAll()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const checklists = request.result as MeetingChecklist[]
      resolve(checklists.sort((a, b) => b.meetingDate.localeCompare(a.meetingDate)))
    }
  })
}

export async function deleteChecklist(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([CHECKLISTS_STORE], "readwrite")
    tx.objectStore(CHECKLISTS_STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// Templates
export async function saveTemplate(template: ChecklistTemplate): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([TEMPLATES_STORE], "readwrite")
    tx.objectStore(TEMPLATES_STORE).put(template)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getAllTemplates(): Promise<ChecklistTemplate[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const request = db.transaction([TEMPLATES_STORE], "readonly").objectStore(TEMPLATES_STORE).getAll()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result as ChecklistTemplate[])
  })
}

export async function deleteTemplate(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([TEMPLATES_STORE], "readwrite")
    tx.objectStore(TEMPLATES_STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// Settings
export async function saveSettings(settings: MeetingPrepSettings): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([SETTINGS_STORE], "readwrite")
    tx.objectStore(SETTINGS_STORE).put(settings)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getSettings(): Promise<MeetingPrepSettings> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const request = db.transaction([SETTINGS_STORE], "readonly").objectStore(SETTINGS_STORE).get("config")
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const defaultSettings: MeetingPrepSettings = {
        id: "config",
        defaultReminderDays: 3,
        autoCreateChecklists: true,
        preferredStudyTime: "19:00",
        notifications: true,
        weekStartsOn: 1, // Monday
      }
      resolve(request.result || defaultSettings)
    }
  })
}

// Helper functions
export function calculateChecklistStats(checklist: MeetingChecklist): MeetingChecklist {
  const completedItems = checklist.items.filter(item => item.completed).length
  const totalTimeSpent = checklist.items.reduce((sum, item) => sum + (item.timeSpent || 0), 0)
  const completionPercentage = checklist.items.length > 0 ? Math.round((completedItems / checklist.items.length) * 100) : 0
  
  let status: MeetingChecklist["status"] = "not_started"
  if (completedItems > 0 && completedItems < checklist.items.length) {
    status = "in_progress"
  } else if (completedItems === checklist.items.length && checklist.items.length > 0) {
    status = "completed"
  }

  return {
    ...checklist,
    totalItems: checklist.items.length,
    completedItems,
    completionPercentage,
    totalTimeSpent,
    status,
    updatedAt: new Date().toISOString(),
  }
}

export function createChecklistFromTemplate(template: ChecklistTemplate, meetingDate: string, weekOf: string): MeetingChecklist {
  const items: ChecklistItem[] = template.items.map(templateItem => ({
    ...templateItem,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    completed: false,
    notes: "",
    timeSpent: 0,
    createdAt: new Date().toISOString(),
  }))

  const checklist: MeetingChecklist = {
    id: Date.now().toString(),
    meetingType: template.meetingType,
    meetingDate,
    weekOf,
    title: `${template.name} - ${new Date(meetingDate).toLocaleDateString()}`,
    items,
    totalItems: items.length,
    completedItems: 0,
    completionPercentage: 0,
    totalTimeSpent: 0,
    status: "not_started",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  return calculateChecklistStats(checklist)
}

// Default templates
export const DEFAULT_TEMPLATES: Omit<ChecklistTemplate, "id" | "createdAt">[] = [
  {
    name: "Midweek Meeting Preparation",
    meetingType: "midweek",
    isDefault: true,
    items: [
      {
        title: "Read Bible Reading Assignment",
        description: "Read the assigned Bible chapters for this week",
        category: "bible_reading",
        priority: "high",
      },
      {
        title: "Prepare for Bible Study",
        description: "Study the Bible study article and prepare answers",
        category: "bible_reading",
        priority: "high",
      },
      {
        title: "Review Ministry Video",
        description: "Watch and take notes on the ministry video",
        category: "ministry",
        priority: "medium",
      },
      {
        title: "Prepare Ministry Presentation",
        description: "Practice your ministry presentation if assigned",
        category: "ministry",
        priority: "high",
      },
      {
        title: "Study Living as Christians Items",
        description: "Review the Living as Christians section",
        category: "living",
        priority: "medium",
      },
      {
        title: "Learn New Songs",
        description: "Practice any new songs for the meeting",
        category: "songs",
        priority: "low",
      },
    ],
  },
  {
    name: "Weekend Meeting Preparation",
    meetingType: "weekend",
    isDefault: true,
    items: [
      {
        title: "Study Watchtower Article",
        description: "Read and study the Watchtower article thoroughly",
        category: "watchtower",
        priority: "high",
      },
      {
        title: "Prepare Watchtower Comments",
        description: "Prepare meaningful comments for the study",
        category: "watchtower",
        priority: "high",
      },
      {
        title: "Review Public Talk Outline",
        description: "If giving a talk, review your outline and practice",
        category: "public_talk",
        priority: "high",
      },
      {
        title: "Research Additional Material",
        description: "Look up additional references and illustrations",
        category: "watchtower",
        priority: "medium",
      },
      {
        title: "Practice Songs",
        description: "Practice the songs for the meeting",
        category: "songs",
        priority: "low",
      },
    ],
  },
  {
    name: "Circuit Assembly Preparation",
    meetingType: "assembly",
    isDefault: true,
    items: [
      {
        title: "Review Assembly Program",
        description: "Study the complete assembly program and themes",
        category: "bible_reading",
        priority: "high",
      },
      {
        title: "Prepare for Baptism Talk",
        description: "If attending baptism, review baptism questions",
        category: "bible_reading",
        priority: "medium",
      },
      {
        title: "Study Circuit Overseer's Outline",
        description: "Review the CO's talk outline if available",
        category: "living",
        priority: "high",
      },
      {
        title: "Prepare Assembly Notebook",
        description: "Organize notebook for taking notes during talks",
        category: "living",
        priority: "medium",
      },
      {
        title: "Review Assembly Songs",
        description: "Practice songs that will be sung at the assembly",
        category: "songs",
        priority: "low",
      },
      {
        title: "Plan Transportation & Meals",
        description: "Organize practical arrangements for the day",
        category: "living",
        priority: "medium",
      },
    ],
  },
  {
    name: "Regional Convention Preparation",
    meetingType: "convention",
    isDefault: true,
    items: [
      {
        title: "Study Convention Program",
        description: "Review the entire convention program and themes",
        category: "bible_reading",
        priority: "high",
      },
      {
        title: "Prepare Convention Notebook",
        description: "Set up organized notebook for all three days",
        category: "living",
        priority: "high",
      },
      {
        title: "Review Bible Dramas",
        description: "Study the Bible accounts that will be dramatized",
        category: "bible_reading",
        priority: "medium",
      },
      {
        title: "Prepare for Baptism (if applicable)",
        description: "Review baptism questions and requirements",
        category: "bible_reading",
        priority: "high",
      },
      {
        title: "Study New Publications",
        description: "Review any new publications being released",
        category: "bible_reading",
        priority: "medium",
      },
      {
        title: "Plan Convention Schedule",
        description: "Organize accommodation, meals, and transportation",
        category: "living",
        priority: "high",
      },
      {
        title: "Prepare for Volunteer Service",
        description: "If volunteering, review assignments and duties",
        category: "living",
        priority: "medium",
      },
      {
        title: "Learn Convention Songs",
        description: "Practice new songs and review familiar ones",
        category: "songs",
        priority: "low",
      },
    ],
  },
  {
    name: "Student Assignment Preparation",
    meetingType: "midweek",
    isDefault: false,
    items: [
      {
        title: "Research Assignment Topic",
        description: "Thoroughly research your assigned Bible topic",
        category: "bible_reading",
        priority: "high",
      },
      {
        title: "Prepare Presentation Outline",
        description: "Create a clear, logical outline for your presentation",
        category: "ministry",
        priority: "high",
      },
      {
        title: "Practice Presentation",
        description: "Rehearse your presentation multiple times",
        category: "ministry",
        priority: "high",
      },
      {
        title: "Prepare Visual Aids",
        description: "Create or gather any visual aids needed",
        category: "ministry",
        priority: "medium",
      },
      {
        title: "Time Your Presentation",
        description: "Ensure your presentation fits the allotted time",
        category: "ministry",
        priority: "high",
      },
      {
        title: "Prepare for Counsel Points",
        description: "Review the counsel points you'll be working on",
        category: "ministry",
        priority: "medium",
      },
    ],
  },
  {
    name: "Public Talk Preparation",
    meetingType: "weekend",
    isDefault: false,
    items: [
      {
        title: "Study Talk Outline Thoroughly",
        description: "Master every point in the assigned outline",
        category: "public_talk",
        priority: "high",
      },
      {
        title: "Research Additional Material",
        description: "Find current examples and illustrations",
        category: "public_talk",
        priority: "high",
      },
      {
        title: "Prepare Introduction",
        description: "Create an engaging opening that captures attention",
        category: "public_talk",
        priority: "high",
      },
      {
        title: "Develop Main Points",
        description: "Expand each main point with scriptures and examples",
        category: "public_talk",
        priority: "high",
      },
      {
        title: "Craft Strong Conclusion",
        description: "Prepare a memorable conclusion with clear application",
        category: "public_talk",
        priority: "high",
      },
      {
        title: "Practice Full Presentation",
        description: "Rehearse the complete talk multiple times",
        category: "public_talk",
        priority: "high",
      },
      {
        title: "Time Your Talk",
        description: "Ensure the talk fits exactly within 30 minutes",
        category: "public_talk",
        priority: "high",
      },
      {
        title: "Prepare for Q&A",
        description: "Anticipate questions and prepare thoughtful answers",
        category: "public_talk",
        priority: "medium",
      },
    ],
  },
  {
    name: "Elder/MS Meeting Preparation",
    meetingType: "midweek",
    isDefault: false,
    items: [
      {
        title: "Review Meeting Agenda",
        description: "Study all items on the elders/MS meeting agenda",
        category: "living",
        priority: "high",
      },
      {
        title: "Prepare Congregation Reports",
        description: "Review field service and meeting attendance reports",
        category: "living",
        priority: "high",
      },
      {
        title: "Study Organizational Letters",
        description: "Review any recent letters from the branch office",
        category: "living",
        priority: "medium",
      },
      {
        title: "Prepare Shepherding Updates",
        description: "Review shepherding calls and congregation needs",
        category: "living",
        priority: "high",
      },
      {
        title: "Review Territory Assignments",
        description: "Check territory coverage and assignments",
        category: "ministry",
        priority: "medium",
      },
      {
        title: "Prepare Meeting Assignments",
        description: "Plan upcoming meeting assignments and schedules",
        category: "living",
        priority: "medium",
      },
    ],
  },
  {
    name: "Family Worship Preparation",
    meetingType: "midweek",
    isDefault: false,
    items: [
      {
        title: "Choose Family Study Topic",
        description: "Select an appropriate topic for family discussion",
        category: "bible_reading",
        priority: "high",
      },
      {
        title: "Prepare Discussion Questions",
        description: "Create engaging questions for family members",
        category: "bible_reading",
        priority: "high",
      },
      {
        title: "Select Supporting Videos",
        description: "Choose JW Broadcasting or other appropriate videos",
        category: "living",
        priority: "medium",
      },
      {
        title: "Plan Interactive Activities",
        description: "Prepare games or activities to reinforce learning",
        category: "living",
        priority: "medium",
      },
      {
        title: "Prepare Age-Appropriate Material",
        description: "Adapt content for different family member ages",
        category: "living",
        priority: "high",
      },
      {
        title: "Plan Practical Application",
        description: "Think of ways to apply the lesson in daily life",
        category: "living",
        priority: "medium",
      },
    ],
  },
]

// Initialize default templates
export async function initializeDefaultTemplates(): Promise<void> {
  const existingTemplates = await getAllTemplates()
  const hasDefaults = existingTemplates.some(t => t.isDefault)
  
  if (!hasDefaults) {
    for (const template of DEFAULT_TEMPLATES) {
      await saveTemplate({
        ...template,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
      })
    }
  }
}

// Reset
export async function resetMeetingPrep(): Promise<void> {
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