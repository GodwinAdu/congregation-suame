'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Phone, Mail, AlertTriangle, Heart, Users, Bell, Shield, Download, MessageSquare } from 'lucide-react';
import { sendMassNotification, exportEmergencyData } from '@/lib/actions/emergency.actions';
import { toast } from 'sonner';

interface EmergencyClientProps {
  contacts: any[];
  alerts: any[];
  stats: any;
  congregationId: string;
}

export function EmergencyClient({ contacts, alerts, stats, congregationId }: EmergencyClientProps) {
  const [notificationModal, setNotificationModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [exporting, setExporting] = useState(false);
  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
    priority: 'medium',
    recipients: 'all',
    channels: { email: true, sms: false, push: true }
  });

  const handleSendNotification = async () => {
    const result = await sendMassNotification({
      congregationId,
      ...notificationData
    });
    if (result.success) {
      toast.success(result.data.message);
      setNotificationModal(false);
      setNotificationData({ 
        title: '', 
        message: '', 
        priority: 'medium', 
        recipients: 'all',
        channels: { email: true, sms: false, push: true }
      });
    } else {
      toast.error(result.error);
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    setExporting(true);
    try {
      const result = await exportEmergencyData(format);
      if (result.success) {
        const csv = [
          ['Name', 'Phone', 'Email', 'Address', 'Emergency Contact', 'Emergency Phone', 'Relationship', 'Blood Type', 'Allergies', 'No Blood Card'],
          ...result.data.map((r: any) => [
            r.name, r.phone, r.email, r.address, r.emergencyName, r.emergencyPhone, r.emergencyRelation, r.bloodType, r.allergies, r.noBloodCard
          ])
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `emergency-contacts-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success('Emergency data exported successfully');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const filteredContacts = contacts.filter(c => 
    (c.fullName || `${c.firstName || ''} ${c.lastName || ''}`).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Emergency Contacts</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withEmergencyContact || 0}</div>
            <p className="text-xs text-muted-foreground">Missing: {stats.missingEmergencyContact || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Medical Info</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withMedicalInfo || 0}</div>
            <p className="text-xs text-muted-foreground">On file</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">No Blood Cards</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.noBloodCards || 0}</div>
            <p className="text-xs text-muted-foreground">Documented</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-red-50 border-red-200">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Emergency Actions
            </CardTitle>
            <Button onClick={() => setNotificationModal(true)} className="bg-red-600 hover:bg-red-700">
              <Bell className="h-4 w-4 mr-2" /> Send Mass Notification
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-red-700">Use this system for emergency communications, disaster preparedness, and urgent congregation notifications.</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="contacts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contacts">Emergency Contacts</TabsTrigger>
          <TabsTrigger value="medical">Medical Alerts ({alerts.length})</TabsTrigger>
          <TabsTrigger value="preparedness">Disaster Preparedness</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Member Emergency Contacts</CardTitle>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Search members..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-xs"
                  />
                  <Button variant="outline" onClick={() => handleExport('csv')} disabled={exporting}>
                    <Download className="h-4 w-4 mr-2" />
                    {exporting ? 'Exporting...' : 'Export CSV'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Member</th>
                      <th className="text-left p-2">Contact</th>
                      <th className="text-left p-2">Emergency Contact</th>
                      <th className="text-left p-2">Relationship</th>
                      <th className="text-left p-2">Emergency Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.map((contact: any) => (
                      <tr key={contact._id} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          <div>
                            <p className="font-medium">{contact.fullName || `${contact.firstName || ''} ${contact.lastName || ''}`}</p>
                            <p className="text-xs text-muted-foreground">{contact.address}</p>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="space-y-1">
                            {contact.phone && (
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="h-3 w-3" />
                                <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">{contact.phone}</a>
                              </div>
                            )}
                            {contact.email && (
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="h-3 w-3" />
                                <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">{contact.email}</a>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-2">
                          {contact.emergencyContact?.name ? (
                            <p className="font-medium">{contact.emergencyContact.name}</p>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-800">Not Set</Badge>
                          )}
                        </td>
                        <td className="p-2">{contact.emergencyContact?.relationship || '-'}</td>
                        <td className="p-2">
                          {contact.emergencyContact?.phone ? (
                            <a href={`tel:${contact.emergencyContact.phone}`} className="text-blue-600 hover:underline flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {contact.emergencyContact.phone}
                            </a>
                          ) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-600" />
                Medical Alerts & Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert: any, idx: number) => (
                  <Card key={idx} className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{alert.member?.fullName || `${alert.member?.firstName || ''} ${alert.member?.lastName || ''}`}</h3>
                          {alert.member?.phone && (
                            <a href={`tel:${alert.member.phone}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {alert.member.phone}
                            </a>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {alert.medicalInfo?.bloodType && (
                            <Badge className="bg-red-600 text-white">Blood: {alert.medicalInfo.bloodType}</Badge>
                          )}
                          {alert.medicalInfo?.noBloodCard && (
                            <Badge className="bg-purple-600 text-white">No Blood Card</Badge>
                          )}
                        </div>
                      </div>
                      <div className="grid gap-2 text-sm">
                        {alert.medicalInfo?.allergies && (
                          <div>
                            <p className="font-medium text-red-700">Allergies:</p>
                            <p className="text-red-600">{alert.medicalInfo.allergies}</p>
                          </div>
                        )}
                        {alert.medicalInfo?.medications && (
                          <div>
                            <p className="font-medium text-red-700">Medications:</p>
                            <p className="text-red-600">{alert.medicalInfo.medications}</p>
                          </div>
                        )}
                        {alert.medicalInfo?.conditions && (
                          <div>
                            <p className="font-medium text-red-700">Conditions:</p>
                            <p className="text-red-600">{alert.medicalInfo.conditions}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {alerts.length === 0 && (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Medical Alerts</h3>
                    <p className="text-muted-foreground">No members have medical information on file</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preparedness" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Disaster Preparedness Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <h3 className="font-semibold mb-2">Emergency Communication Chain</h3>
                <p className="text-sm text-muted-foreground">
                  Elders contact group overseers, who contact their group members. Use the mass notification system for urgent updates.
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <h3 className="font-semibold mb-2">Meeting Point</h3>
                <p className="text-sm text-muted-foreground">
                  In case of evacuation, congregation members should gather at the designated meeting point. Contact elders for current location.
                </p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4 py-2">
                <h3 className="font-semibold mb-2">Emergency Supplies</h3>
                <p className="text-sm text-muted-foreground">
                  Members are encouraged to maintain emergency supplies including water, food, first aid kit, flashlight, and important documents.
                </p>
              </div>
              <div className="border-l-4 border-red-500 pl-4 py-2">
                <h3 className="font-semibold mb-2">Medical Emergencies</h3>
                <p className="text-sm text-muted-foreground">
                  Call emergency services (911) immediately. Notify elders and check medical alerts for any special considerations.
                </p>
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded">
                <h3 className="font-semibold mb-2">Important Numbers</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="font-medium">Emergency Services:</p>
                    <p className="text-blue-600">911</p>
                  </div>
                  <div>
                    <p className="font-medium">Poison Control:</p>
                    <p className="text-blue-600">1-800-222-1222</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={notificationModal} onOpenChange={setNotificationModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Send Mass Notification
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={notificationData.title} onChange={(e) => setNotificationData({ ...notificationData, title: e.target.value })} placeholder="Emergency Alert" />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea value={notificationData.message} onChange={(e) => setNotificationData({ ...notificationData, message: e.target.value })} rows={4} placeholder="Enter emergency message..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Priority</Label>
                <Select value={notificationData.priority} onValueChange={(v) => setNotificationData({ ...notificationData, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Recipients</Label>
                <Select value={notificationData.recipients} onValueChange={(v) => setNotificationData({ ...notificationData, recipients: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Members</SelectItem>
                    <SelectItem value="elders">Elders Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="mb-3 block">Notification Channels</Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="email" 
                    checked={notificationData.channels.email}
                    onCheckedChange={(checked) => setNotificationData({ 
                      ...notificationData, 
                      channels: { ...notificationData.channels, email: checked as boolean }
                    })}
                  />
                  <Label htmlFor="email" className="flex items-center gap-1 cursor-pointer">
                    <Mail className="h-4 w-4" /> Email
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="sms" 
                    checked={notificationData.channels.sms}
                    onCheckedChange={(checked) => setNotificationData({ 
                      ...notificationData, 
                      channels: { ...notificationData.channels, sms: checked as boolean }
                    })}
                  />
                  <Label htmlFor="sms" className="flex items-center gap-1 cursor-pointer">
                    <MessageSquare className="h-4 w-4" /> SMS
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="push" 
                    checked={notificationData.channels.push}
                    onCheckedChange={(checked) => setNotificationData({ 
                      ...notificationData, 
                      channels: { ...notificationData.channels, push: checked as boolean }
                    })}
                  />
                  <Label htmlFor="push" className="flex items-center gap-1 cursor-pointer">
                    <Bell className="h-4 w-4" /> Push
                  </Label>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> This will send notifications to {notificationData.recipients === 'all' ? 'all active members' : 'all elders'}. Use only for genuine emergencies.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNotificationModal(false)}>Cancel</Button>
              <Button onClick={handleSendNotification} className="bg-red-600 hover:bg-red-700">
                <Bell className="h-4 w-4 mr-2" /> Send Notification
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
