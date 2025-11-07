'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, FileX, BookX, Users } from 'lucide-react'
import { getMembersNeedingHelp } from '@/lib/actions/monthly-report.actions'

interface MemberNeedingHelp {
  _id: string
  fullName: string
  groupName: string
  status: string
  issues: {
    noReport: boolean
    noStudy: boolean
  }
}

export function HelpNeededView() {
  const [members, setMembers] = useState<MemberNeedingHelp[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  
  const month = parseInt(searchParams.get('month') || '1')
  const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true)
        const data = await getMembersNeedingHelp(month, year)
        setMembers(data)
      } catch (error) {
        console.error('Error fetching members needing help:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [month, year])

  const noReportMembers = members.filter(m => m.issues.noReport)
  const noStudyMembers = members.filter(m => m.issues.noStudy)

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* No Report */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <FileX className="h-5 w-5" />
              No Field Service Report ({noReportMembers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {noReportMembers.map(member => (
                <div key={member._id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div>
                    <p className="font-medium">{member.fullName}</p>
                    <p className="text-sm text-muted-foreground">{member.groupName}</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {member.status}
                    </Badge>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    No Report
                  </Badge>
                </div>
              ))}
              {noReportMembers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  All members submitted their reports
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* No Bible Study */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <BookX className="h-5 w-5" />
              No Bible Studies ({noStudyMembers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {noStudyMembers.map(member => (
                <div key={member._id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div>
                    <p className="font-medium">{member.fullName}</p>
                    <p className="text-sm text-muted-foreground">{member.groupName}</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {member.status}
                    </Badge>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    No Study
                  </Badge>
                </div>
              ))}
              {noStudyMembers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  All active members have bible studies
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{noReportMembers.length}</div>
              <p className="text-sm text-muted-foreground">Members without reports</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{noStudyMembers.length}</div>
              <p className="text-sm text-muted-foreground">Members without studies</p>
            </div>
          </div>
          
          {/* Group Summary */}
          <div>
            <h4 className="font-medium mb-3">By Group</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(
                members.reduce((groups: any, member) => {
                  const groupName = member.groupName
                  if (!groups[groupName]) {
                    groups[groupName] = { noReport: 0, noStudy: 0, total: 0 }
                  }
                  groups[groupName].total++
                  if (member.issues.noReport) groups[groupName].noReport++
                  if (member.issues.noStudy) groups[groupName].noStudy++
                  return groups
                }, {})
              ).map(([groupName, stats]: [string, any]) => (
                <div key={groupName} className="p-3 border rounded">
                  <h5 className="font-medium text-sm mb-2">{groupName}</h5>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-bold">{stats.total}</div>
                      <div className="text-muted-foreground">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-red-600">{stats.noReport}</div>
                      <div className="text-muted-foreground">No Report</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-orange-600">{stats.noStudy}</div>
                      <div className="text-muted-foreground">No Study</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}