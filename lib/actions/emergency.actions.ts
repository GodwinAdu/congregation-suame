'use server';

import { connectToDB } from '@/lib/mongoose';
import Member from '@/lib/models/user.models';
import PublisherRecord from '@/lib/models/publisher-record.models';
import { sendEmail, sendSMS, sendPushNotification } from '@/lib/services/notification.service';

export async function getEmergencyContacts(congregationId: string) {
  try {
    await connectToDB();

    const members = await Member.find({})
      .select('fullName firstName lastName email phone alternatePhone address emergencyContacts medicalInfo')
      .lean();

    const contacts = members.map(member => {
      const primaryContact = member.emergencyContacts?.find((c: any) => c.isPrimary) || member.emergencyContacts?.[0];
      return {
        ...member,
        emergencyContact: primaryContact || {},
        allEmergencyContacts: member.emergencyContacts || []
      };
    });

    return { success: true, data: JSON.parse(JSON.stringify(contacts)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function sendMassNotification(data: {
  congregationId: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  recipients: 'all' | 'elders' | 'custom';
  customRecipients?: string[];
  channels: { email: boolean; sms: boolean; push: boolean };
}) {
  try {
    await connectToDB();

    let recipientIds: any[] = [];

    if (data.recipients === 'all') {
      const members = await Member.find({})
        .select('_id email phone notificationPreferences').lean();
      recipientIds = members;
    } else if (data.recipients === 'custom' && data.customRecipients) {
      const members = await Member.find({ 
        _id: { $in: data.customRecipients }
      }).select('_id email phone notificationPreferences').lean();
      recipientIds = members;
    }

    let emailCount = 0, smsCount = 0, pushCount = 0;

    for (const member of recipientIds) {
      const prefs = member.notificationPreferences || {};
      
      if (data.channels.email && prefs.email !== false && member.email) {
        await sendEmail({
          to: member.email,
          subject: data.title,
          message: data.message,
          priority: data.priority
        });
        emailCount++;
      }
      
      if (data.channels.sms && prefs.sms !== false && member.phone) {
        await sendSMS({
          to: member.phone,
          message: `${data.title}: ${data.message}`,
          priority: data.priority
        });
        smsCount++;
      }
      
      if (data.channels.push && prefs.push !== false) {
        await sendPushNotification({
          userId: member._id.toString(),
          to: member._id.toString(),
          message: data.message,
          priority: data.priority
        });
        pushCount++;
      }
    }

    return { 
      success: true, 
      data: { 
        sent: recipientIds.length,
        emailCount,
        smsCount,
        pushCount,
        message: `Notification sent to ${recipientIds.length} members (Email: ${emailCount}, SMS: ${smsCount}, Push: ${pushCount})`
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getMedicalAlerts(congregationId: string) {
  try {
    await connectToDB();

    const members = await Member.find({
      $or: [
        { 'medicalInfo.allergies': { $nin: [null, ''] } },
        { 'medicalInfo.conditions': { $nin: [null, ''] } },
        { 'medicalInfo.noBloodCard': true }
      ]
    })
      .select('fullName firstName lastName phone medicalInfo')
      .lean();

    const alerts = members.map(member => ({
      member,
      medicalInfo: member.medicalInfo
    }));

    return { success: true, data: JSON.parse(JSON.stringify(alerts)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getEmergencyStats(congregationId: string) {
  try {
    await connectToDB();

    const members = await Member.countDocuments({});
    
    const membersWithContacts = await Member.countDocuments({
      'emergencyContacts.0': { $exists: true }
    });
    
    const withMedicalInfo = await Member.countDocuments({
      $or: [
        { 'medicalInfo.bloodType': { $nin: [null, ''] } },
        { 'medicalInfo.allergies': { $nin: [null, ''] } },
        { 'medicalInfo.conditions': { $nin: [null, ''] } }
      ]
    });
    
    const noBloodCards = await Member.countDocuments({
      'medicalInfo.noBloodCard': true
    });

    return {
      success: true,
      data: {
        totalMembers: members,
        withEmergencyContact: membersWithContacts,
        withMedicalInfo,
        noBloodCards,
        missingEmergencyContact: members - membersWithContacts
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function exportEmergencyData(format: 'csv' | 'pdf') {
  try {
    await connectToDB();

    const members = await Member.find({})
      .select('fullName firstName lastName email phone alternatePhone address emergencyContacts medicalInfo')
      .lean();

    const data = members.map(m => {
      const primary = m.emergencyContacts?.find((c: any) => c.isPrimary) || m.emergencyContacts?.[0];
      return {
        name: m.fullName || `${m.firstName} ${m.lastName}`,
        phone: m.phone,
        email: m.email,
        address: m.address,
        emergencyName: primary?.name || '',
        emergencyPhone: primary?.phone || '',
        emergencyRelation: primary?.relationship || '',
        bloodType: m.medicalInfo?.bloodType || '',
        allergies: m.medicalInfo?.allergies || '',
        noBloodCard: m.medicalInfo?.noBloodCard ? 'Yes' : 'No'
      };
    });

    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
