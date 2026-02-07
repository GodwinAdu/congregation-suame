'use server';

import { connectToDB } from '@/lib/mongoose';
import BibleStudy from '@/lib/models/bible-study.models';
import Member from '@/lib/models/user.models';
import { revalidatePath } from 'next/cache';

export async function createBibleStudy(data: any) {
  try {
    await connectToDB();

    const conductor = await Member.findById(data.conductorId);
    if (!conductor) throw new Error('Conductor not found');

    const study = await BibleStudy.create({
      ...data,
      congregationId: conductor.congregationId
    });


    revalidatePath('/dashboard/bible-studies');
    return { success: true, data: JSON.parse(JSON.stringify(study)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateBibleStudy(id: string, data: any) {
  try {
    await connectToDB();

    const study = await BibleStudy.findByIdAndUpdate(id, data, { new: true });
    if (!study) throw new Error('Bible study not found');


    revalidatePath('/dashboard/bible-studies');
    return { success: true, data: JSON.parse(JSON.stringify(study)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteBibleStudy(id: string) {
  try {
    await connectToDB();

    await BibleStudy.findByIdAndDelete(id);


    revalidatePath('/dashboard/bible-studies');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getBibleStudies(congregationId: string, filters?: { status?: string; conductorId?: string }) {
  try {
    await connectToDB();

    const query: any = { congregationId };
    if (filters?.status) query.status = filters.status;
    if (filters?.conductorId) query.conductorId = filters.conductorId;

    const studies = await BibleStudy.find(query)
      .populate('conductorId', 'firstName lastName')
      .populate('assistantId', 'firstName lastName')
      .sort({ startDate: -1 })
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(studies)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addStudySession(studyId: string, session: any) {
  try {
    await connectToDB();

    const study = await BibleStudy.findByIdAndUpdate(
      studyId,
      { 
        $push: { sessions: session },
        $set: { currentLesson: session.lessonNumber }
      },
      { new: true }
    );

    if (!study) throw new Error('Bible study not found');


    revalidatePath('/dashboard/bible-studies');
    return { success: true, data: JSON.parse(JSON.stringify(study)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addGoal(studyId: string, goal: any) {
  try {
    await connectToDB();

    const study = await BibleStudy.findByIdAndUpdate(
      studyId,
      { $push: { goals: goal } },
      { new: true }
    );

    if (!study) throw new Error('Bible study not found');


    revalidatePath('/dashboard/bible-studies');
    return { success: true, data: JSON.parse(JSON.stringify(study)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addMilestone(studyId: string, milestone: any) {
  try {
    await connectToDB();

    const study = await BibleStudy.findByIdAndUpdate(
      studyId,
      { $push: { milestones: milestone } },
      { new: true }
    );

    if (!study) throw new Error('Bible study not found');


    revalidatePath('/dashboard/bible-studies');
    return { success: true, data: JSON.parse(JSON.stringify(study)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getBibleStudyStats(congregationId: string) {
  try {
    await connectToDB();

    const [total, active, completed, discontinued] = await Promise.all([
      BibleStudy.countDocuments({ congregationId }),
      BibleStudy.countDocuments({ congregationId, status: 'active' }),
      BibleStudy.countDocuments({ congregationId, status: 'completed' }),
      BibleStudy.countDocuments({ congregationId, status: 'discontinued' })
    ]);

    const studies = await BibleStudy.find({ congregationId, status: 'active' }).lean();
    
    const avgProgress = studies.length > 0
      ? studies.reduce((sum, s) => sum + (s.currentLesson / s.totalLessons) * 100, 0) / studies.length
      : 0;

    const totalSessions = studies.reduce((sum, s) => sum + (s.sessions?.length || 0), 0);
    const attendedSessions = studies.reduce((sum, s) => 
      sum + (s.sessions?.filter((sess: any) => sess.attended).length || 0), 0
    );
    const attendanceRate = totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0;

    return {
      success: true,
      data: {
        total,
        active,
        completed,
        discontinued,
        avgProgress: Math.round(avgProgress),
        attendanceRate: Math.round(attendanceRate)
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getStudyEffectivenessReport(congregationId: string) {
  try {
    await connectToDB();

    const studies = await BibleStudy.find({ congregationId })
      .populate('conductorId', 'firstName lastName')
      .lean();

    const report = studies.map(study => {
      const sessions = study.sessions || [];
      const totalSessions = sessions.length;
      const attendedSessions = sessions.filter((s: any) => s.attended).length;
      const attendanceRate = totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0;
      
      const engagementScores = sessions
        .filter((s: any) => s.engagement)
        .map((s: any) => {
          switch(s.engagement) {
            case 'excellent': return 4;
            case 'good': return 3;
            case 'fair': return 2;
            case 'poor': return 1;
            default: return 0;
          }
        });
      
      const avgEngagement = engagementScores.length > 0
        ? engagementScores.reduce((a: number, b: number) => a + b, 0) / engagementScores.length
        : 0;

      const progress = (study.currentLesson / study.totalLessons) * 100;
      const completedGoals = study.goals?.filter((g: any) => g.completed).length || 0;
      const totalGoals = study.goals?.length || 0;

      return {
        studyId: study._id,
        studentName: study.studentName,
        conductor: study.conductorId,
        publication: study.publication,
        status: study.status,
        progress: Math.round(progress),
        totalSessions,
        attendanceRate: Math.round(attendanceRate),
        avgEngagement: avgEngagement.toFixed(1),
        completedGoals,
        totalGoals,
        milestones: study.milestones?.length || 0,
        startDate: study.startDate
      };
    });

    return { success: true, data: JSON.parse(JSON.stringify(report)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
