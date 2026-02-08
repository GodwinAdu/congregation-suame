'use server';

import { connectToDB } from '@/lib/mongoose';
import { withAuth, User } from '@/lib/helpers/auth';
import BibleStudy from '@/lib/models/bible-study.models';

// Get member's active Bible study students
const _getMyBibleStudents = async (user: User) => {
  try {
    if (!user) throw new Error('Unauthorized');
    await connectToDB();

    const bibleStudies = await BibleStudy.find({
      conductorId: user._id,
      status: 'active'
    }).select('studentName _id').sort({ studentName: 1 });

    return { 
      success: true, 
      data: JSON.parse(JSON.stringify(bibleStudies))
    };
  } catch (error: any) {
    console.error('Error fetching Bible students:', error);
    return { success: false, error: error.message };
  }
};

export const getMyBibleStudents = await withAuth(_getMyBibleStudents);
