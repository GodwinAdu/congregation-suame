'use server';

import { connectToDB } from '@/lib/mongoose';
import SchoolStudent from '@/lib/models/school-student.models';
import User from '@/lib/models/user.models';
import { revalidatePath } from 'next/cache';

export async function enrollStudent(data: { memberId: string; enrollmentDate: Date; currentLevel: string; congregationId: string }) {
  try {
    await connectToDB();

    const student = await SchoolStudent.create({
      ...data,
      assignments: [],
      progress: {
        totalAssignments: 0,
        completedAssignments: 0,
        excellentCount: 0,
        goodCount: 0,
        needsImprovementCount: 0
      }
    });


    revalidatePath('/dashboard/theocratic-school');
    return { success: true, data: JSON.parse(JSON.stringify(student)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function scheduleAssignment(memberId: string, assignment: any) {
  try {
    await connectToDB();

    const student = await SchoolStudent.findOneAndUpdate(
      { memberId },
      { 
        $push: { assignments: { ...assignment, status: 'scheduled' } },
        $inc: { 'progress.totalAssignments': 1 }
      },
      { new: true, upsert: true }
    );


    revalidatePath('/dashboard/theocratic-school');
    return { success: true, data: JSON.parse(JSON.stringify(student)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function completeAssignment(memberId: string, assignmentIndex: number, counselData: any) {
  try {
    await connectToDB();

    const student = await SchoolStudent.findOne({ memberId });
    if (!student) throw new Error('Student not found');

    student.assignments[assignmentIndex].status = 'completed';
    student.assignments[assignmentIndex].completedDate = new Date();
    student.assignments[assignmentIndex].counselPoints = counselData.counselPoints;
    student.assignments[assignmentIndex].overallRating = counselData.overallRating;
    student.assignments[assignmentIndex].notes = counselData.notes;

    student.progress.completedAssignments++;
    student.progress.lastAssignmentDate = new Date();

    if (counselData.overallRating === 'excellent') student.progress.excellentCount++;
    else if (counselData.overallRating === 'good') student.progress.goodCount++;
    else student.progress.needsImprovementCount++;

    await student.save();


    revalidatePath('/dashboard/theocratic-school');
    return { success: true, data: JSON.parse(JSON.stringify(student)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getSchoolStudents(congregationId: string) {
  try {
    await connectToDB();

    const students = await SchoolStudent.find({})
      .populate('memberId', 'fullName firstName lastName email')
      .sort({ 'progress.lastAssignmentDate': -1 })
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(students)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUpcomingAssignments(congregationId: string) {
  try {
    await connectToDB();

    const students = await SchoolStudent.find({})
      .populate('memberId', 'fullName firstName lastName')
      .lean();

    const upcoming = students.flatMap(student => 
      (student.assignments || [])
        .filter(a => a.status === 'scheduled' && new Date(a.scheduledDate) >= new Date())
        .map(a => ({
          ...a,
          student: student.memberId,
          studentId: student._id
        }))
    ).sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

    return { success: true, data: JSON.parse(JSON.stringify(upcoming)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getSchoolStats(congregationId: string) {
  try {
    await connectToDB();

    const students = await SchoolStudent.find({}).lean();

    const totalStudents = students.length;
    const totalAssignments = students.reduce((sum, s) => sum + s.progress.totalAssignments, 0);
    const completedAssignments = students.reduce((sum, s) => sum + s.progress.completedAssignments, 0);
    const excellentCount = students.reduce((sum, s) => sum + s.progress.excellentCount, 0);
    const goodCount = students.reduce((sum, s) => sum + s.progress.goodCount, 0);
    const needsImprovementCount = students.reduce((sum, s) => sum + s.progress.needsImprovementCount, 0);

    const completionRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

    return {
      success: true,
      data: {
        totalStudents,
        totalAssignments,
        completedAssignments,
        completionRate,
        excellentCount,
        goodCount,
        needsImprovementCount
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateStudentLevel(memberId: string, level: string) {
  try {
    await connectToDB();

    const student = await SchoolStudent.findOneAndUpdate(
      { memberId },
      { currentLevel: level },
      { new: true }
    );


    revalidatePath('/dashboard/theocratic-school');
    return { success: true, data: JSON.parse(JSON.stringify(student)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
