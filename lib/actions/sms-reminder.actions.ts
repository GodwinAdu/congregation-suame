'use server';

import { User, withAuth } from '@/lib/helpers/auth';
import { smsConfig } from '@/lib/sms/sms-config';
import { logActivity } from '@/lib/utils/activity-logger';
import SMSLog from '@/lib/models/sms-log.models';
import { connectToDB } from '@/lib/mongoose';

async function _sendReportReminder(user: User, data: { phone: string; name: string; month: string; message: string; recipientId: string }) {
  try {
    if (!user) throw new Error('User not authorized');
    
    await connectToDB();
    
    await smsConfig({
      text: data.message,
      sender: 'SUAME',
      destinations: [data.phone]
    });

    await SMSLog.create({
      recipient: data.recipientId,
      phone: data.phone,
      message: data.message,
      month: data.month,
      sentBy: user._id
    });

    await logActivity({
      userId: user._id as string,
      type: 'sms_sent',
      action: `${user.fullName} sent report reminder to ${data.name} for ${data.month}`,
      details: { metadata: { phone: data.phone, month: data.month } }
    });

    return { success: true, message: 'SMS sent successfully' };
  } catch (error: any) {
    console.error('Error sending SMS reminder:', error);
    throw new Error(error.message || 'Failed to send SMS');
  }
}

async function _sendBulkReportReminders(user: User, data: { members: Array<{ phone: string; name: string; month: string; recipientId: string }>; message: string }) {
  try {
    if (!user) throw new Error('User not authorized');

    await connectToDB();

    const phones = data.members.map(m => m.phone);
    
    await smsConfig({
      text: data.message,
      sender: 'SUAME',
      destinations: phones
    });

    await SMSLog.insertMany(
      data.members.map(m => ({
        recipient: m.recipientId,
        phone: m.phone,
        message: data.message,
        month: m.month,
        sentBy: user._id
      }))
    );

    await logActivity({
      userId: user._id as string,
      type: 'bulk_sms_sent',
      action: `${user.fullName} sent bulk report reminders to ${phones.length} members`,
      details: { metadata: { count: phones.length, month: data.members[0]?.month } }
    });

    return { success: true, message: `SMS sent to ${phones.length} members` };
  } catch (error: any) {
    console.error('Error sending bulk SMS reminders:', error);
    throw new Error(error.message || 'Failed to send bulk SMS');
  }
}

async function _fetchSMSLogs(user: User, month: string) {
  try {
    if (!user) throw new Error('User not authorized');
    
    await connectToDB();
    
    const logs = await SMSLog.find({ month })
      .populate('recipient', 'fullName')
      .sort({ sentAt: -1 });
    
    return JSON.parse(JSON.stringify(logs));
  } catch (error: any) {
    console.error('Error fetching SMS logs:', error);
    throw new Error(error.message || 'Failed to fetch SMS logs');
  }
}

export const sendReportReminder = await withAuth(_sendReportReminder);
export const sendBulkReportReminders = await withAuth(_sendBulkReportReminders);
export const fetchSMSLogs = await withAuth(_fetchSMSLogs);
