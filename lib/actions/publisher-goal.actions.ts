'use server';

import { connectToDB } from '@/lib/mongoose';
import PublisherGoal from '@/lib/models/publisher-goal.models';
import User from '@/lib/models/user.models';
import { revalidatePath } from 'next/cache';

export async function createPublisherGoal(data: any) {
  try {
    await connectToDB();

    const member = await User.findById(data.memberId);
    if (!member) throw new Error('Member not found');

    const goal = await PublisherGoal.create({
      ...data,
      congregationId: member.congregationId
    });

    revalidatePath('/dashboard/publisher/goals');
    return { success: true, data: JSON.parse(JSON.stringify(goal)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updatePublisherGoal(id: string, data: any) {
  try {
    await connectToDB();

    const goal = await PublisherGoal.findByIdAndUpdate(id, data, { new: true });
    if (!goal) throw new Error('Goal not found');

    revalidatePath('/dashboard/publisher/goals');
    return { success: true, data: JSON.parse(JSON.stringify(goal)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deletePublisherGoal(id: string) {
  try {
    await connectToDB();

    await PublisherGoal.findByIdAndDelete(id);

    revalidatePath('/dashboard/publisher/goals');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getPublisherGoals(memberId: string) {
  try {
    await connectToDB();

    const goals = await PublisherGoal.find({ memberId })
      .sort({ createdAt: -1 })
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(goals)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateGoalProgress(memberId: string) {
  try {
    await connectToDB();

    const now = new Date();
    const activeGoals = await PublisherGoal.find({ 
      memberId, 
      status: 'active',
      endDate: { $gte: now }
    });

    for (const goal of activeGoals) {
      // Progress calculation would need field service report integration
      // For now, just check expiration
      const updates: any = {};

      if (goal.currentValue >= goal.targetValue && goal.status === 'active') {
        updates.status = 'completed';
      }

      goal.milestones.forEach((milestone: any, idx: number) => {
        if (!milestone.reached && goal.currentValue >= milestone.value) {
          updates[`milestones.${idx}.reached`] = true;
          updates[`milestones.${idx}.reachedDate`] = new Date();
        }
      });

      if (Object.keys(updates).length > 0) {
        await PublisherGoal.findByIdAndUpdate(goal._id, updates);
      }
    }

    const expiredGoals = await PublisherGoal.find({
      memberId,
      status: 'active',
      endDate: { $lt: now }
    });

    for (const goal of expiredGoals) {
      await PublisherGoal.findByIdAndUpdate(goal._id, { status: 'expired' });
    }

    revalidatePath('/dashboard/publisher/goals');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getGoalStats(memberId: string) {
  try {
    await connectToDB();

    const [total, active, completed, cancelled] = await Promise.all([
      PublisherGoal.countDocuments({ memberId }),
      PublisherGoal.countDocuments({ memberId, status: 'active' }),
      PublisherGoal.countDocuments({ memberId, status: 'completed' }),
      PublisherGoal.countDocuments({ memberId, status: 'cancelled' })
    ]);

    const activeGoals = await PublisherGoal.find({ memberId, status: 'active' }).lean();
    
    const avgProgress = activeGoals.length > 0
      ? activeGoals.reduce((sum: number, g: any) => sum + (g.currentValue / g.targetValue) * 100, 0) / activeGoals.length
      : 0;

    return {
      success: true,
      data: {
        total,
        active,
        completed,
        cancelled,
        avgProgress: Math.round(avgProgress)
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function checkGoalMilestones(memberId: string) {
  try {
    await connectToDB();

    const goals = await PublisherGoal.find({ 
      memberId, 
      status: 'active',
      notificationsEnabled: true
    }).lean();

    const notifications = [];

    for (const goal of goals) {
      const progress = (goal.currentValue / goal.targetValue) * 100;
      
      if (progress >= 100 && goal.status === 'active') {
        notifications.push({
          type: 'goal_completed',
          title: 'Goal Completed! 🎉',
          message: `Congratulations! You've achieved your goal: ${goal.title}`,
          goalId: goal._id
        });
      } else if (progress >= 75 && progress < 100) {
        notifications.push({
          type: 'milestone_75',
          title: 'Almost There! 💪',
          message: `You're 75% of the way to: ${goal.title}`,
          goalId: goal._id
        });
      } else if (progress >= 50 && progress < 75) {
        notifications.push({
          type: 'milestone_50',
          title: 'Halfway There! 🌟',
          message: `You've reached 50% of your goal: ${goal.title}`,
          goalId: goal._id
        });
      }
    }

    return { success: true, data: notifications };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
