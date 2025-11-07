import { requirePermission } from '@/lib/helpers/server-permission-check'
import { getCOReports } from '@/lib/actions/co-report.actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, FileText, Calendar, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'

export default async function COReportsPage() {
  await requirePermission('coVisitView');
  
  const reports = await getCOReports();

  const getStatusColor = (report: any) => {
    if (report.submittedToCO) return 'bg-green-100 text-green-800'
    if (report.coordinatorApproval) return 'bg-blue-100 text-blue-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  const getStatusText = (report: any) => {
    if (report.submittedToCO) return 'Submitted'
    if (report.coordinatorApproval) return 'Approved'
    return 'Draft'
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">CO Visit Reports</h1>
        <Link href="/dashboard/co-visit/reports/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Report
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {reports.map((report: any) => (
          <Card key={report._id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{report.congregation}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {new Date(report.visitDates.startDate).toLocaleDateString()} - {new Date(report.visitDates.endDate).toLocaleDateString()}
                  </p>
                </div>
                <Badge className={getStatusColor(report)}>
                  {getStatusText(report)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{report.appointmentRecommendations?.length || 0} appointments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{report.shepherdingVisits?.length || 0} shepherding visits</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span>S-62 {report.s62FormSubmitted ? 'Submitted' : 'Pending'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Created {new Date(report.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Link href={`/dashboard/co-visit/reports/${report._id}`}>
                  <Button variant="outline" size="sm">View Details</Button>
                </Link>
                <Link href={`/dashboard/co-visit/reports/${report._id}/edit`}>
                  <Button variant="outline" size="sm">Edit</Button>
                </Link>
                {!report.submittedToCO && (
                  <Button variant="outline" size="sm">Submit to CO</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {reports.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No reports yet</h3>
              <p className="text-muted-foreground mb-4">Create your first CO visit report to get started.</p>
              <Link href="/dashboard/co-visit/reports/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Report
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}