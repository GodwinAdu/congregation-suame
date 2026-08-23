/**
 * IndexedDB store for offline field service report submissions.
 * Reports are saved here when the user is offline, then synced when back online.
 */

export interface PendingReport {
    id: string
    month: string
    hours: number
    bibleStudies: number
    auxiliaryPioneer: boolean
    check: boolean
    comments: string
    createdAt: number
    synced: boolean
    syncError?: string
}

const DB_NAME = 'suame-offline-reports'
const DB_VERSION = 1
const STORE_NAME = 'pending-reports'

let dbInstance: IDBDatabase | null = null

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
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
                store.createIndex('synced', 'synced', { unique: false })
                store.createIndex('createdAt', 'createdAt', { unique: false })
            }
        }
    })
}

export async function savePendingReport(report: Omit<PendingReport, 'id' | 'createdAt' | 'synced'>): Promise<PendingReport> {
    const db = await openDB()
    const entry: PendingReport = {
        ...report,
        id: `${report.month}-${Date.now()}`,
        createdAt: Date.now(),
        synced: false,
    }

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        const request = store.put(entry)
        request.onsuccess = () => resolve(entry)
        request.onerror = () => reject(request.error)
    })
}

export async function getPendingReports(): Promise<PendingReport[]> {
    const db = await openDB()

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly')
        const store = tx.objectStore(STORE_NAME)
        const index = store.index('synced')
        const request = index.getAll(IDBKeyRange.only(false))
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
}

export async function markReportSynced(id: string): Promise<void> {
    const db = await openDB()

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        const getReq = store.get(id)
        getReq.onsuccess = () => {
            const report = getReq.result
            if (report) {
                report.synced = true
                const putReq = store.put(report)
                putReq.onsuccess = () => resolve()
                putReq.onerror = () => reject(putReq.error)
            } else {
                resolve()
            }
        }
        getReq.onerror = () => reject(getReq.error)
    })
}

export async function markReportFailed(id: string, error: string): Promise<void> {
    const db = await openDB()

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        const getReq = store.get(id)
        getReq.onsuccess = () => {
            const report = getReq.result
            if (report) {
                report.syncError = error
                const putReq = store.put(report)
                putReq.onsuccess = () => resolve()
                putReq.onerror = () => reject(putReq.error)
            } else {
                resolve()
            }
        }
        getReq.onerror = () => reject(getReq.error)
    })
}

export async function deletePendingReport(id: string): Promise<void> {
    const db = await openDB()

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        const request = store.delete(id)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
    })
}

export async function clearSyncedReports(): Promise<void> {
    const db = await openDB()

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        const index = store.index('synced')
        const request = index.openCursor(IDBKeyRange.only(true))
        request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
            if (cursor) {
                cursor.delete()
                cursor.continue()
            } else {
                resolve()
            }
        }
        request.onerror = () => reject(request.error)
    })
}
