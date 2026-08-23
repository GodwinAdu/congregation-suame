"use client"

import { useState, useEffect, useCallback } from 'react'
import {
    savePendingReport,
    getPendingReports,
    markReportSynced,
    markReportFailed,
    clearSyncedReports,
    PendingReport
} from '@/lib/db/offlineReportsDB'
import { submitFieldServiceReport } from '@/lib/actions/publisher.actions'
import { toast } from 'sonner'

export function useOfflineSync() {
    const [isOnline, setIsOnline] = useState(true)
    const [pendingCount, setPendingCount] = useState(0)
    const [syncing, setSyncing] = useState(false)

    useEffect(() => {
        setIsOnline(navigator.onLine)

        const handleOnline = () => {
            setIsOnline(true)
            toast.success('You are back online', { description: 'Syncing pending reports...' })
            syncPendingReports()
        }

        const handleOffline = () => {
            setIsOnline(false)
            toast.warning('You are offline', { description: 'Reports will be saved locally and synced when you reconnect.' })
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        // Check for pending reports on mount
        refreshPendingCount()

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    const refreshPendingCount = async () => {
        try {
            const pending = await getPendingReports()
            setPendingCount(pending.length)
        } catch {
            // IndexedDB not available
        }
    }

    const submitReport = useCallback(async (data: {
        month: string
        hours: number
        bibleStudies: number
        auxiliaryPioneer: boolean
        check: boolean
        comments: string
    }) => {
        if (isOnline) {
            // Try to submit online
            try {
                const result = await submitFieldServiceReport(data)
                return { success: true, offline: false, result }
            } catch (error: any) {
                // If it's a network error, save offline
                if (!navigator.onLine) {
                    const saved = await savePendingReport(data)
                    await refreshPendingCount()
                    return { success: true, offline: true, pendingId: saved.id }
                }
                throw error
            }
        } else {
            // Save offline
            const saved = await savePendingReport(data)
            await refreshPendingCount()
            return { success: true, offline: true, pendingId: saved.id }
        }
    }, [isOnline])

    const syncPendingReports = useCallback(async () => {
        if (syncing) return
        setSyncing(true)

        try {
            const pending = await getPendingReports()
            if (pending.length === 0) {
                setSyncing(false)
                return
            }

            let successCount = 0
            let failCount = 0

            for (const report of pending) {
                try {
                    await submitFieldServiceReport({
                        month: report.month,
                        hours: report.hours,
                        bibleStudies: report.bibleStudies,
                        auxiliaryPioneer: report.auxiliaryPioneer,
                        check: report.check,
                        comments: report.comments,
                    })
                    await markReportSynced(report.id)
                    successCount++
                } catch (error: any) {
                    await markReportFailed(report.id, error?.message || 'Sync failed')
                    failCount++
                }
            }

            // Clean up synced reports
            await clearSyncedReports()
            await refreshPendingCount()

            if (successCount > 0) {
                toast.success(`${successCount} pending ${successCount === 1 ? 'report' : 'reports'} synced successfully`)
            }
            if (failCount > 0) {
                toast.error(`${failCount} ${failCount === 1 ? 'report' : 'reports'} failed to sync`)
            }
        } catch (error) {
            console.error('Error syncing pending reports:', error)
        } finally {
            setSyncing(false)
        }
    }, [syncing])

    return {
        isOnline,
        pendingCount,
        syncing,
        submitReport,
        syncPendingReports,
        refreshPendingCount,
    }
}
