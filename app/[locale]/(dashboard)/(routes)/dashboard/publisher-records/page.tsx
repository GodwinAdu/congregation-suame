import { currentUser } from '@/lib/helpers/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getPublisherRecords } from '@/lib/actions/publisher-record.actions';
import { fetchAllMembers } from '@/lib/actions/user.actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, Eye } from 'lucide-react';

export default async function PublisherRecordsPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const [recordsRes, members] = await Promise.all([
    getPublisherRecords(''),
    fetchAllMembers()
  ]);

  const records = recordsRes.data || [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Publisher Records (S-21)</h1>
        <p className="text-muted-foreground">Digital congregation publisher record cards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Publishers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Records Created</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{records.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Baptized</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{records.filter((r: any) => r.baptismDate).length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Publishers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Phone</th>
                  <th className="text-center p-2">Baptized</th>
                  <th className="text-right p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member: any) => {
                  const record = records.find((r: any) => r.memberId?._id === member._id);
                  return (
                    <tr key={member._id} className="border-b hover:bg-muted/50">
                      <td className="p-2">{member.fullName || `${member.firstName || ''} ${member.lastName || ''}`.trim()}</td>
                      <td className="p-2">{member.email || '-'}</td>
                      <td className="p-2">{member.phone || '-'}</td>
                      <td className="p-2 text-center">{record?.baptismDate ? '✓' : '-'}</td>
                      <td className="p-2 text-right">
                        <Link href={`/dashboard/publisher-records/${member._id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" /> View Record
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
