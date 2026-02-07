import { currentUser } from '@/lib/helpers/session';
import { redirect } from 'next/navigation';
import { getEmergencyContacts, getMedicalAlerts, getEmergencyStats } from '@/lib/actions/emergency.actions';
import { EmergencyClient } from './_components/EmergencyClient';

export default async function EmergencyPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const [contactsRes, alertsRes, statsRes] = await Promise.all([
    getEmergencyContacts(''),
    getMedicalAlerts(''),
    getEmergencyStats('')
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Emergency Contact System</h1>
        <p className="text-muted-foreground">Quick access to emergency contacts and medical information</p>
      </div>

      <EmergencyClient
        contacts={contactsRes.data || []}
        alerts={alertsRes.data || []}
        stats={statsRes.data || {}}
        congregationId={''}
      />
    </div>
  );
}
