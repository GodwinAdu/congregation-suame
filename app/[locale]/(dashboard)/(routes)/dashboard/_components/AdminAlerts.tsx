"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
    AlertTriangle, Bell, CheckCircle2, Info, ArrowRight, XCircle
} from 'lucide-react'
import { getDashboardAlerts } from '@/lib/actions/dashboard-alerts.actions'
import Link from 'next/link'

interface Alert {
    id: string
    type: 'warning' | 'info' | 'urgent' | 'success'
    title: string
    message: string
    count: number
    action?: string
    link?: string
}

export default function AdminAlerts() {
    const [alerts, setAlerts] = useState<Alert[]>([])
    const [loading, setLoading] = useState(true)
    const [dismissed, setDismissed] = useState<Set<string>>(new Set())

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const data = await getDashboardAlerts()
                setAlerts(data.alerts)
            } catch (error) {
                console.error('Error fetching alerts:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchAlerts()
    }, [])

    const getAlertStyle = (type: string) => {
        switch (type) {
            case 'urgent':
                return 'border-red-200 bg-red-50 dark:border-red-800/30 dark:bg-red-900/10'
            case 'warning':
                return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800/30 dark:bg-yellow-900/10'
            case 'info':
                return 'border-blue-200 bg-blue-50 dark:border-blue-800/30 dark:bg-blue-900/10'
            case 'success':
                return 'border-green-200 bg-green-50 dark:border-green-800/30 dark:bg-green-900/10'
            default:
                return ''
        }
    }

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'urgent':
                return <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            case 'info':
                return <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
            case 'success':
                return <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
            default:
                return <Bell className="h-5 w-5 flex-shrink-0" />
        }
    }

    const getBadgeVariant = (type: string) => {
        switch (type) {
            case 'urgent': return 'destructive'
            case 'warning': return 'outline'
            case 'info': return 'secondary'
            case 'success': return 'default'
            default: return 'outline'
        }
    }

    if (loading) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
            </div>
        )
    }

    const visibleAlerts = alerts.filter(a => !dismissed.has(a.id))

    if (visibleAlerts.length === 0) return null

    return (
        <div className="space-y-2">
            {visibleAlerts.map(alert => (
                <Card key={alert.id} className={`${getAlertStyle(alert.type)} border`}>
                    <CardContent className="py-3 px-4">
                        <div className="flex items-start gap-3">
                            {getAlertIcon(alert.type)}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-medium text-sm">{alert.title}</h4>
                                    {alert.count > 0 && (
                                        <Badge variant={getBadgeVariant(alert.type) as any} className="text-xs">
                                            {alert.count}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                {alert.link && alert.action && (
                                    <Link href={alert.link}>
                                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                                            {alert.action}
                                            <ArrowRight className="h-3 w-3 ml-1" />
                                        </Button>
                                    </Link>
                                )}
                                {alert.type !== 'success' && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 text-muted-foreground"
                                        onClick={() => setDismissed(prev => new Set([...prev, alert.id]))}
                                    >
                                        <XCircle className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
