'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Heart, Activity, User, FileText } from 'lucide-react';
import { updateMemberRecord } from '@/lib/actions/publisher-record.actions';
import { toast } from 'sonner';

interface PublisherRecordClientProps {
  data: any;
  memberId: string;
  currentUserId: string;
}

export function PublisherRecordClient({ data, memberId, currentUserId }: PublisherRecordClientProps) {
  const [loading, setLoading] = useState(false);
  const member = data?.member || {};
  const serviceYears = data?.serviceYears || [];

  const [basicInfo, setBasicInfo] = useState({
    baptizedDate: member.baptizedDate ? new Date(member.baptizedDate).toISOString().split('T')[0] : '',
    dob: member.dob ? new Date(member.dob).toISOString().split('T')[0] : '',
    address: member.address || ''
  });
  const [emergencyContact, setEmergencyContact] = useState(member.emergencyContacts?.[0] || {});
  const [medicalInfo, setMedicalInfo] = useState(member.medicalInfo || {});

  const handleUpdateBasicInfo = async () => {
    setLoading(true);
    const result = await updateMemberRecord(memberId, basicInfo);
    if (result.success) {
      toast.success('Basic information updated');
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleUpdateEmergency = async () => {
    setLoading(true);
    const result = await updateMemberRecord(memberId, { emergencyContacts: [emergencyContact] });
    if (result.success) {
      toast.success('Emergency contact updated');
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleUpdateMedical = async () => {
    setLoading(true);
    const result = await updateMemberRecord(memberId, { medicalInfo });
    if (result.success) {
      toast.success('Medical information updated');
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold">Publisher Record (S-21)</h1>
        <p className="text-muted-foreground">Digital congregation publisher record card</p>
        <div className="mt-2 p-3 bg-muted rounded-lg">
          <p className="font-semibold">{member.fullName}</p>
          <p className="text-sm text-muted-foreground">{member.email} • {member.phone}</p>
          {member.groupId && <p className="text-sm">Group: {member.groupId.name}</p>}
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="service">Service Years</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Baptism Date</Label>
                  <Input type="date" value={basicInfo.baptizedDate} onChange={(e) => setBasicInfo({ ...basicInfo, baptizedDate: e.target.value })} />
                </div>
                <div>
                  <Label>Pioneer Status</Label>
                  <Input value={member.pioneerStatus || 'none'} disabled />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date of Birth</Label>
                  <Input type="date" value={basicInfo.dob} onChange={(e) => setBasicInfo({ ...basicInfo, dob: e.target.value })} />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input value={basicInfo.address} onChange={(e) => setBasicInfo({ ...basicInfo, address: e.target.value })} />
                </div>
              </div>
              {member.privileges?.length > 0 && (
                <div>
                  <Label>Privileges</Label>
                  <div className="flex gap-2 mt-2">
                    {member.privileges.map((p: any) => (
                      <Badge key={p._id}>{p.name}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <Button onClick={handleUpdateBasicInfo} disabled={loading}>Save Basic Info</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="service" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Service Year Summaries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {serviceYears.sort((a: any, b: any) => b.year.localeCompare(a.year)).map((year: any, idx: number) => (
                  <Card key={idx}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold">Service Year {year.year}-{parseInt(year.year) + 1}</h3>
                        <Badge>{year.monthsReported}/12 months</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Hours</p>
                          <p className="text-xl font-bold">{year.totalHours}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg Hours</p>
                          <p className="text-xl font-bold">{year.averageHours}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Studies</p>
                          <p className="text-xl font-bold">{year.totalBibleStudies}</p>
                        </div>
                      </div>
                      {(year.pioneerMonths > 0 || year.auxiliaryMonths > 0) && (
                        <div className="flex gap-2 mt-3">
                          {year.pioneerMonths > 0 && <Badge className="bg-purple-100 text-purple-800">Pioneer: {year.pioneerMonths} months</Badge>}
                          {year.auxiliaryMonths > 0 && <Badge className="bg-blue-100 text-blue-800">Auxiliary: {year.auxiliaryMonths} months</Badge>}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {serviceYears.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No service years calculated yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input value={emergencyContact.name || ''} onChange={(e) => setEmergencyContact({ ...emergencyContact, name: e.target.value })} />
                </div>
                <div>
                  <Label>Relationship</Label>
                  <Input value={emergencyContact.relationship || ''} onChange={(e) => setEmergencyContact({ ...emergencyContact, relationship: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone</Label>
                  <Input value={emergencyContact.phone || ''} onChange={(e) => setEmergencyContact({ ...emergencyContact, phone: e.target.value })} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={emergencyContact.email || ''} onChange={(e) => setEmergencyContact({ ...emergencyContact, email: e.target.value })} />
                </div>
              </div>
              <Button onClick={handleUpdateEmergency} disabled={loading}>Save Emergency Contact</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Medical Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Blood Type</Label>
                  <Select value={medicalInfo.bloodType || ''} onValueChange={(v) => setMedicalInfo({ ...medicalInfo, bloodType: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={medicalInfo.noBloodCard || false} onChange={(e) => setMedicalInfo({ ...medicalInfo, noBloodCard: e.target.checked })} />
                    <span>Has No Blood Card</span>
                  </label>
                </div>
              </div>
              <div>
                <Label>Allergies</Label>
                <Textarea value={medicalInfo.allergies || ''} onChange={(e) => setMedicalInfo({ ...medicalInfo, allergies: e.target.value })} rows={2} />
              </div>
              <div>
                <Label>Medications</Label>
                <Textarea value={medicalInfo.medications || ''} onChange={(e) => setMedicalInfo({ ...medicalInfo, medications: e.target.value })} rows={2} />
              </div>
              <div>
                <Label>Medical Conditions</Label>
                <Textarea value={medicalInfo.conditions || ''} onChange={(e) => setMedicalInfo({ ...medicalInfo, conditions: e.target.value })} rows={2} />
              </div>
              <Button onClick={handleUpdateMedical} disabled={loading}>Save Medical Info</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
