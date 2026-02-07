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
import { Plus, Calendar, Award, FileText, Heart, Activity, User } from 'lucide-react';
import { updatePublisherRecord, addAppointment, addRecordNote, calculateServiceYear, addTransferRecord } from '@/lib/actions/publisher-record.actions';
import { toast } from 'sonner';

interface PublisherRecordClientProps {
  record: any;
  memberId: string;
  currentUserId: string;
}

export function PublisherRecordClient({ record, memberId, currentUserId }: PublisherRecordClientProps) {
  const [loading, setLoading] = useState(false);
  const [basicInfo, setBasicInfo] = useState({
    baptismDate: record.baptismDate ? new Date(record.baptismDate).toISOString().split('T')[0] : '',
    baptismLocation: record.baptismLocation || '',
    dateOfBirth: record.dateOfBirth ? new Date(record.dateOfBirth).toISOString().split('T')[0] : '',
    placeOfBirth: record.placeOfBirth || ''
  });
  const [emergencyContact, setEmergencyContact] = useState(record.emergencyContact || {});
  const [medicalInfo, setMedicalInfo] = useState(record.medicalInfo || {});
  const [appointmentData, setAppointmentData] = useState({ privilege: '', appointmentDate: '', notes: '' });
  const [noteData, setNoteData] = useState({ category: 'general', content: '' });
  const [transferData, setTransferData] = useState({ fromCongregation: '', toCongregation: '', transferDate: '', reason: '', notes: '' });

  const handleUpdateBasicInfo = async () => {
    setLoading(true);
    const result = await updatePublisherRecord(memberId, basicInfo);
    if (result.success) {
      toast.success('Basic information updated');
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleUpdateEmergency = async () => {
    setLoading(true);
    const result = await updatePublisherRecord(memberId, { emergencyContact });
    if (result.success) {
      toast.success('Emergency contact updated');
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleUpdateMedical = async () => {
    setLoading(true);
    const result = await updatePublisherRecord(memberId, { medicalInfo });
    if (result.success) {
      toast.success('Medical information updated');
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleAddAppointment = async () => {
    setLoading(true);
    const result = await addAppointment(memberId, {
      ...appointmentData,
      appointmentDate: new Date(appointmentData.appointmentDate)
    });
    if (result.success) {
      toast.success('Appointment added');
      setAppointmentData({ privilege: '', appointmentDate: '', notes: '' });
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleAddNote = async () => {
    setLoading(true);
    const result = await addRecordNote(memberId, noteData);
    if (result.success) {
      toast.success('Note added');
      setNoteData({ category: 'general', content: '' });
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleCalculateServiceYear = async (year: string) => {
    setLoading(true);
    const result = await calculateServiceYear(memberId, year);
    if (result.success) {
      toast.success(`Service year ${year} calculated`);
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleAddTransfer = async () => {
    setLoading(true);
    const result = await addTransferRecord(memberId, {
      ...transferData,
      transferDate: new Date(transferData.transferDate)
    });
    if (result.success) {
      toast.success('Transfer record added');
      setTransferData({ fromCongregation: '', toCongregation: '', transferDate: '', reason: '', notes: '' });
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
      </div>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="service">Service Years</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
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
                  <Input type="date" value={basicInfo.baptismDate} onChange={(e) => setBasicInfo({ ...basicInfo, baptismDate: e.target.value })} />
                </div>
                <div>
                  <Label>Baptism Location</Label>
                  <Input value={basicInfo.baptismLocation} onChange={(e) => setBasicInfo({ ...basicInfo, baptismLocation: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date of Birth</Label>
                  <Input type="date" value={basicInfo.dateOfBirth} onChange={(e) => setBasicInfo({ ...basicInfo, dateOfBirth: e.target.value })} />
                </div>
                <div>
                  <Label>Place of Birth</Label>
                  <Input value={basicInfo.placeOfBirth} onChange={(e) => setBasicInfo({ ...basicInfo, placeOfBirth: e.target.value })} />
                </div>
              </div>
              <Button onClick={handleUpdateBasicInfo} disabled={loading}>Save Basic Info</Button>

              {record.transferHistory?.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold mb-3">Transfer History</h3>
                  <div className="space-y-2">
                    {record.transferHistory.map((transfer: any, idx: number) => (
                      <div key={idx} className="p-3 border rounded">
                        <div className="flex justify-between">
                          <span className="font-medium">{transfer.fromCongregation || 'Unknown'} → {transfer.toCongregation || 'Unknown'}</span>
                          <span className="text-sm text-muted-foreground">{new Date(transfer.transferDate).toLocaleDateString()}</span>
                        </div>
                        {transfer.reason && <p className="text-sm text-muted-foreground mt-1">{transfer.reason}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-3">Add Transfer Record</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="From Congregation" value={transferData.fromCongregation} onChange={(e) => setTransferData({ ...transferData, fromCongregation: e.target.value })} />
                  <Input placeholder="To Congregation" value={transferData.toCongregation} onChange={(e) => setTransferData({ ...transferData, toCongregation: e.target.value })} />
                  <Input type="date" value={transferData.transferDate} onChange={(e) => setTransferData({ ...transferData, transferDate: e.target.value })} />
                  <Input placeholder="Reason" value={transferData.reason} onChange={(e) => setTransferData({ ...transferData, reason: e.target.value })} />
                </div>
                <Button onClick={handleAddTransfer} disabled={loading} className="mt-3">Add Transfer</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Appointments & Privileges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border p-4 rounded space-y-3">
                <h3 className="font-semibold">Add New Appointment</h3>
                <div className="grid grid-cols-3 gap-3">
                  <Input placeholder="Privilege" value={appointmentData.privilege} onChange={(e) => setAppointmentData({ ...appointmentData, privilege: e.target.value })} />
                  <Input type="date" value={appointmentData.appointmentDate} onChange={(e) => setAppointmentData({ ...appointmentData, appointmentDate: e.target.value })} />
                  <Input placeholder="Notes" value={appointmentData.notes} onChange={(e) => setAppointmentData({ ...appointmentData, notes: e.target.value })} />
                </div>
                <Button onClick={handleAddAppointment} disabled={loading}><Plus className="h-4 w-4 mr-2" />Add Appointment</Button>
              </div>

              <div className="space-y-2">
                {record.appointments?.map((apt: any, idx: number) => (
                  <div key={idx} className="p-3 border rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{apt.privilege}</h4>
                        <p className="text-sm text-muted-foreground">Appointed: {new Date(apt.appointmentDate).toLocaleDateString()}</p>
                        {apt.deletionDate && <p className="text-sm text-red-600">Deleted: {new Date(apt.deletionDate).toLocaleDateString()}</p>}
                        {apt.notes && <p className="text-sm mt-1">{apt.notes}</p>}
                      </div>
                      <Badge>{apt.deletionDate ? 'Inactive' : 'Active'}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="service" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Service Year Summaries
                </CardTitle>
                <Button onClick={() => handleCalculateServiceYear(new Date().getFullYear().toString())} disabled={loading}>
                  <Plus className="h-4 w-4 mr-2" />Calculate Current Year
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {record.serviceYears?.sort((a: any, b: any) => b.year.localeCompare(a.year)).map((year: any, idx: number) => (
                  <Card key={idx}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold">Service Year {year.year}-{parseInt(year.year) + 1}</h3>
                        <Badge>{year.monthsReported}/12 months</Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Hours</p>
                          <p className="text-xl font-bold">{year.totalHours}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg Hours</p>
                          <p className="text-xl font-bold">{year.averageHours}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Placements</p>
                          <p className="text-xl font-bold">{year.totalPlacements}</p>
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

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Record Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border p-4 rounded space-y-3">
                <h3 className="font-semibold">Add New Note</h3>
                <Select value={noteData.category} onValueChange={(v) => setNoteData({ ...noteData, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="privileges">Privileges</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="conduct">Conduct</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea value={noteData.content} onChange={(e) => setNoteData({ ...noteData, content: e.target.value })} rows={3} placeholder="Enter note..." />
                <Button onClick={handleAddNote} disabled={loading}><Plus className="h-4 w-4 mr-2" />Add Note</Button>
              </div>

              <div className="space-y-2">
                {record.notes?.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((note: any, idx: number) => (
                  <div key={idx} className="p-3 border rounded">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline">{note.category}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(note.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm">{note.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
