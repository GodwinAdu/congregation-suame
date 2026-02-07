'use server';

import { connectToDB } from '@/lib/mongoose';
import Role from '@/lib/models/role.models';

export async function updateRolesWithNewFeatures() {
  try {
    await connectToDB();

    const newPermissions = {
      'permissions.shepherdingView': false,
      'permissions.shepherdingManage': false,
      'permissions.assignmentHistoryView': false,
      'permissions.assignmentHistoryManage': false,
      'permissions.bibleStudyView': false,
      'permissions.bibleStudyManage': false,
      'permissions.publisherGoals': true,
      'permissions.publisherRecords': false,
      'permissions.literature': false,
      'permissions.theocraticSchool': false,
      'permissions.emergency': false,
      'permissions.expenses': false
    };

    // Update all roles with new permissions (only if they don't exist)
    const result = await Role.updateMany(
      {},
      { $set: newPermissions }
    );

    // Update admin role to have all new permissions enabled
    await Role.updateOne(
      { name: 'admin' },
      {
        $set: {
          'permissions.shepherdingView': true,
          'permissions.shepherdingManage': true,
          'permissions.assignmentHistoryView': true,
          'permissions.assignmentHistoryManage': true,
          'permissions.bibleStudyView': true,
          'permissions.bibleStudyManage': true,
          'permissions.publisherGoals': true,
          'permissions.publisherRecords': true,
          'permissions.literature': true,
          'permissions.theocraticSchool': true,
          'permissions.emergency': true,
          'permissions.expenses': true
        }
      }
    );

    // Update elder role with appropriate permissions
    await Role.updateOne(
      { name: { $regex: /elder/i } },
      {
        $set: {
          'permissions.shepherdingView': true,
          'permissions.shepherdingManage': true,
          'permissions.assignmentHistoryView': true,
          'permissions.assignmentHistoryManage': true,
          'permissions.bibleStudyView': true,
          'permissions.bibleStudyManage': true,
          'permissions.publisherGoals': true,
          'permissions.publisherRecords': true,
          'permissions.literature': true,
          'permissions.theocraticSchool': true,
          'permissions.emergency': true,
          'permissions.expenses': true
        }
      }
    );

    // Update ministerial servant role with limited permissions
    await Role.updateOne(
      { name: { $regex: /ministerial|servant/i } },
      {
        $set: {
          'permissions.shepherdingView': true,
          'permissions.shepherdingManage': false,
          'permissions.assignmentHistoryView': true,
          'permissions.assignmentHistoryManage': false,
          'permissions.bibleStudyView': true,
          'permissions.bibleStudyManage': true,
          'permissions.publisherGoals': true,
          'permissions.publisherRecords': false,
          'permissions.literature': true,
          'permissions.theocraticSchool': true,
          'permissions.emergency': false,
          'permissions.expenses': false
        }
      }
    );

    return {
      success: true,
      message: `Updated ${result.modifiedCount} roles with new feature permissions`,
      modifiedCount: result.modifiedCount
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

export async function getRolesStatus() {
  try {
    await connectToDB();
    
    const roles = await Role.find({}).select('name permissions');
    
    return {
      success: true,
      roles: JSON.parse(JSON.stringify(roles))
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}
