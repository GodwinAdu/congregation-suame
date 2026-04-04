const DB_NAME = "bible-reading-db"
const DB_VERSION = 2
const PLAN_STORE = "reading-plan"
const PROGRESS_STORE = "reading-progress"
const NOTES_STORE = "reading-notes"

let dbInstance: IDBDatabase | null = null

export interface ReadingPlanRecord {
  id: string // always "active"
  startDate: string
  duration: number // 1, 2, or 3 years
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
      if (!db.objectStoreNames.contains(PLAN_STORE)) {
        db.createObjectStore(PLAN_STORE, { keyPath: "id" })
      }
      if (!db.objectStoreNames.contains(PROGRESS_STORE)) {
        db.createObjectStore(PROGRESS_STORE, { keyPath: "day" })
      }
      if (!db.objectStoreNames.contains(NOTES_STORE)) {
        db.createObjectStore(NOTES_STORE, { keyPath: "day" })
      }
    }
  })
}

export async function savePlanStartDate(startDate: string, duration: number = 1): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([PLAN_STORE], "readwrite")
    tx.objectStore(PLAN_STORE).put({ id: "active", startDate, duration })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getPlanStartDate(): Promise<{ startDate: string; duration: number } | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const request = db.transaction([PLAN_STORE], "readonly").objectStore(PLAN_STORE).get("active")
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const result = request.result
      if (!result) resolve(null)
      else resolve({ startDate: result.startDate, duration: result.duration || 1 })
    }
  })
}

export async function toggleDayComplete(day: number): Promise<boolean> {
  const db = await openDB()
  const isComplete = await isDayComplete(day)

  return new Promise((resolve, reject) => {
    const tx = db.transaction([PROGRESS_STORE], "readwrite")
    const store = tx.objectStore(PROGRESS_STORE)
    if (isComplete) {
      store.delete(day)
    } else {
      store.put({ day, completedAt: new Date().toISOString() })
    }
    tx.oncomplete = () => resolve(!isComplete)
    tx.onerror = () => reject(tx.error)
  })
}

export async function isDayComplete(day: number): Promise<boolean> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const request = db.transaction([PROGRESS_STORE], "readonly").objectStore(PROGRESS_STORE).get(day)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(!!request.result)
  })
}

export async function getCompletedDays(): Promise<Set<number>> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const request = db.transaction([PROGRESS_STORE], "readonly").objectStore(PROGRESS_STORE).getAll()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(new Set(request.result.map((r: any) => r.day)))
  })
}

export async function resetPlan(): Promise<void> {
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

export async function saveNote(day: number, note: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([NOTES_STORE], "readwrite")
    if (note.trim()) {
      tx.objectStore(NOTES_STORE).put({ day, note, updatedAt: new Date().toISOString() })
    } else {
      tx.objectStore(NOTES_STORE).delete(day)
    }
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getAllNotes(): Promise<Map<number, string>> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const request = db.transaction([NOTES_STORE], "readonly").objectStore(NOTES_STORE).getAll()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const map = new Map<number, string>()
      request.result.forEach((r: any) => map.set(r.day, r.note))
      resolve(map)
    }
  })
}
