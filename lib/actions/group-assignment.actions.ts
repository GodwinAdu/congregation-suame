"use server"

import { User, withAuth } from "../helpers/auth";
import Member from "../models/user.models";
import Group from "../models/group.models";
import { connectToDB } from "../mongoose";
import { logActivity } from "../utils/activity-logger";
import History from "../models/history.models";

async function _assignMembersToGroup(
  user: User,
  memberIds: string[],
  groupId: string
) {
  try {
    if (!user) throw new Error("User not authorized");

    await connectToDB();

    const group = await Group.findById(groupId);
    if (!group) throw new Error("Group not found");

    const result = await Member.updateMany(
      { _id: { $in: memberIds } },
      { $set: { groupId } }
    );

    await logActivity({
      userId: user._id as string,
      type: "members_assigned_to_group",
      action: `${user.fullName} assigned ${memberIds.length} members to ${group.name}`,
      details: {
        entityId: groupId,
        entityType: "Group",
        metadata: { memberCount: memberIds.length, memberIds },
      },
    });

    return { success: true, count: result.modifiedCount };
  } catch (error) {
    console.error("Error assigning members to group:", error);
    throw error;
  }
}

async function _getMembersWithGroups(user: User) {
  try {
    if (!user) throw new Error("User not authorized");

    await connectToDB();

    const members = await Member.find({})
      .populate("groupId", "name")
      .populate("privileges", "name")
      .select("fullName gender privileges groupId pioneerStatus accountStatus dob familyRelationships isFamilyHead")
      .sort({ fullName: 1 })
      .lean();

    return JSON.parse(JSON.stringify(members));
  } catch (error) {
    console.error("Error fetching members with groups:", error);
    throw error;
  }
}

async function _getGroupsWithMemberCount(user: User) {
  try {
    if (!user) throw new Error("User not authorized");

    await connectToDB();

    const groups = await Group.find({}).lean();
    const groupsWithCount = await Promise.all(
      groups.map(async (group) => {
        const memberCount = await Member.countDocuments({ groupId: group._id });
        return {
          ...group,
          memberCount,
        };
      })
    );

    return JSON.parse(JSON.stringify(groupsWithCount));
  } catch (error) {
    console.error("Error fetching groups with member count:", error);
    throw error;
  }
}

async function _balanceGroups(user: User, strategy: "simple" | "gender" | "pioneer" | "privilege" | "family" = "simple") {
  try {
    if (!user) throw new Error("User not authorized");

    await connectToDB();

    const groups = await Group.find({});
    const members = await Member.find({}).populate("privileges");

    if (groups.length === 0) throw new Error("No groups available");

    let assignedCount = 0;

    switch (strategy) {
      case "gender":
        assignedCount = await balanceByGender(members, groups);
        break;
      case "pioneer":
        assignedCount = await balanceByPioneer(members, groups);
        break;
      case "privilege":
        assignedCount = await balanceByPrivilege(members, groups);
        break;
      case "family":
        assignedCount = await balanceByFamily(members, groups);
        break;
      default:
        assignedCount = await balanceSimple(members, groups);
    }

    await logActivity({
      userId: user._id as string,
      type: "groups_balanced",
      action: `${user.fullName} balanced ${assignedCount} members across ${groups.length} groups using ${strategy} strategy`,
      details: {
        entityType: "Group",
        metadata: { memberCount: assignedCount, groupCount: groups.length, strategy },
      },
    });

    return { success: true, membersAssigned: assignedCount };
  } catch (error) {
    console.error("Error balancing groups:", error);
    throw error;
  }
}

async function balanceSimple(members: any[], groups: any[]) {
  const membersPerGroup = Math.ceil(members.length / groups.length);
  let groupIndex = 0;

  for (let i = 0; i < members.length; i++) {
    members[i].groupId = groups[groupIndex]._id;
    await members[i].save();

    if ((i + 1) % membersPerGroup === 0) {
      groupIndex++;
      if (groupIndex >= groups.length) groupIndex = groups.length - 1;
    }
  }
  return members.length;
}

async function balanceByGender(members: any[], groups: any[]) {
  const males = members.filter(m => m.gender === "Male");
  const females = members.filter(m => m.gender === "Female");
  
  let groupIndex = 0;
  
  for (const member of [...males, ...females]) {
    member.groupId = groups[groupIndex]._id;
    await member.save();
    groupIndex = (groupIndex + 1) % groups.length;
  }
  
  return members.length;
}

async function balanceByPioneer(members: any[], groups: any[]) {
  const pioneers = members.filter(m => m.pioneerStatus !== "none");
  const publishers = members.filter(m => m.pioneerStatus === "none");
  
  let groupIndex = 0;
  
  for (const member of pioneers) {
    member.groupId = groups[groupIndex]._id;
    await member.save();
    groupIndex = (groupIndex + 1) % groups.length;
  }
  
  groupIndex = 0;
  for (const member of publishers) {
    member.groupId = groups[groupIndex]._id;
    await member.save();
    groupIndex = (groupIndex + 1) % groups.length;
  }
  
  return members.length;
}

async function balanceByPrivilege(members: any[], groups: any[]) {
  const elders = members.filter(m => m.privileges?.some((p: any) => p.name === "Elder"));
  const ms = members.filter(m => m.privileges?.some((p: any) => p.name === "Ministerial Servant"));
  const others = members.filter(m => !m.privileges || m.privileges.length === 0);
  
  let groupIndex = 0;
  
  for (const member of [...elders, ...ms, ...others]) {
    member.groupId = groups[groupIndex]._id;
    await member.save();
    groupIndex = (groupIndex + 1) % groups.length;
  }
  
  return members.length;
}

async function balanceByFamily(members: any[], groups: any[]) {
  const familyHeads = members.filter(m => m.isFamilyHead);
  const assigned = new Set();
  let groupIndex = 0;
  
  for (const head of familyHeads) {
    const familyMembers = members.filter(m => 
      m.familyRelationships?.some((r: any) => r.memberId?.toString() === head._id.toString())
    );
    
    for (const member of [head, ...familyMembers]) {
      if (!assigned.has(member._id.toString())) {
        member.groupId = groups[groupIndex]._id;
        await member.save();
        assigned.add(member._id.toString());
      }
    }
    groupIndex = (groupIndex + 1) % groups.length;
  }
  
  const unassigned = members.filter(m => !assigned.has(m._id.toString()));
  for (const member of unassigned) {
    member.groupId = groups[groupIndex]._id;
    await member.save();
    groupIndex = (groupIndex + 1) % groups.length;
  }
  
  return members.length;
}

async function _removeMembersFromGroup(user: User, memberIds: string[]) {
  try {
    if (!user) throw new Error("User not authorized");

    await connectToDB();

    const result = await Member.updateMany(
      { _id: { $in: memberIds } },
      { $set: { groupId: null } }
    );

    await logActivity({
      userId: user._id as string,
      type: "members_removed_from_group",
      action: `${user.fullName} removed ${memberIds.length} members from their groups`,
      details: {
        entityType: "Group",
        metadata: { memberCount: memberIds.length, memberIds },
      },
    });

    return { success: true, count: result.modifiedCount };
  } catch (error) {
    console.error("Error removing members from group:", error);
    throw error;
  }
}

async function _swapMembers(user: User, member1Id: string, member2Id: string) {
  try {
    if (!user) throw new Error("User not authorized");

    await connectToDB();

    const [member1, member2] = await Promise.all([
      Member.findById(member1Id),
      Member.findById(member2Id),
    ]);

    if (!member1 || !member2) throw new Error("Members not found");

    const temp = member1.groupId;
    member1.groupId = member2.groupId;
    member2.groupId = temp;

    await Promise.all([member1.save(), member2.save()]);

    await logActivity({
      userId: user._id as string,
      type: "members_swapped",
      action: `${user.fullName} swapped ${member1.fullName} and ${member2.fullName} between groups`,
      details: {
        entityType: "Group",
        metadata: { member1Id, member2Id },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error swapping members:", error);
    throw error;
  }
}

async function _getAssignmentHistory(user: User, limit: number = 50) {
  try {
    if (!user) throw new Error("User not authorized");

    await connectToDB();

    const history = await History.find({
      actionType: { $in: ["members_assigned_to_group", "groups_balanced", "members_removed_from_group", "members_swapped"] },
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("performedBy", "fullName")
      .lean();

    return JSON.parse(JSON.stringify(history));
  } catch (error) {
    console.error("Error fetching assignment history:", error);
    throw error;
  }
}

async function _getGroupAnalytics(user: User) {
  try {
    if (!user) throw new Error("User not authorized");

    await connectToDB();

    const groups = await Group.find({}).lean();
    const analytics = await Promise.all(
      groups.map(async (group) => {
        const members = await Member.find({ groupId: group._id }).populate("privileges");
        
        const maleCount = members.filter(m => m.gender === "Male").length;
        const femaleCount = members.filter(m => m.gender === "Female").length;
        const pioneerCount = members.filter(m => m.pioneerStatus !== "none").length;
        const elderCount = members.filter(m => m.privileges?.some((p: any) => p.name === "Elder")).length;
        const msCount = members.filter(m => m.privileges?.some((p: any) => p.name === "Ministerial Servant")).length;

        return {
          groupId: group._id,
          groupName: group.name,
          totalMembers: members.length,
          maleCount,
          femaleCount,
          pioneerCount,
          elderCount,
          msCount,
        };
      })
    );

    return JSON.parse(JSON.stringify(analytics));
  } catch (error) {
    console.error("Error fetching group analytics:", error);
    throw error;
  }
}

async function _exportAssignments(user: User) {
  try {
    if (!user) throw new Error("User not authorized");

    await connectToDB();

    const members = await Member.find({})
      .populate("groupId", "name")
      .populate("privileges", "name")
      .select("fullName gender pioneerStatus groupId privileges")
      .sort({ "groupId.name": 1, fullName: 1 })
      .lean();

    const csvData = members.map(m => ({
      Name: m.fullName,
      Gender: m.gender,
      Group: m.groupId?.name || "Unassigned",
      PioneerStatus: m.pioneerStatus,
      Privileges: m.privileges?.map((p: any) => p.name).join(", ") || "None",
    }));

    return JSON.parse(JSON.stringify(csvData));
  } catch (error) {
    console.error("Error exporting assignments:", error);
    throw error;
  }
}

async function _validateGroupAssignments(user: User) {
  try {
    if (!user) throw new Error("User not authorized");

    await connectToDB();

    const groups = await Group.find({}).lean();
    const warnings = [];

    for (const group of groups) {
      const members = await Member.find({ groupId: group._id }).populate("privileges");
      
      if (members.length === 0) {
        warnings.push({ groupName: group.name, type: "empty", message: "Group has no members" });
      }
      
      if (members.length < 5) {
        warnings.push({ groupName: group.name, type: "small", message: `Group only has ${members.length} members` });
      }
      
      if (members.length > 20) {
        warnings.push({ groupName: group.name, type: "large", message: `Group has ${members.length} members (too large)` });
      }
      
      const hasElder = members.some(m => m.privileges?.some((p: any) => p.name === "Elder"));
      if (!hasElder) {
        warnings.push({ groupName: group.name, type: "no_elder", message: "Group has no elder" });
      }
      
      const pioneerCount = members.filter(m => m.pioneerStatus !== "none").length;
      if (pioneerCount === 0) {
        warnings.push({ groupName: group.name, type: "no_pioneer", message: "Group has no pioneers" });
      }
    }

    return JSON.parse(JSON.stringify(warnings));
  } catch (error) {
    console.error("Error validating assignments:", error);
    throw error;
  }
}

export const assignMembersToGroup = await withAuth(_assignMembersToGroup);
export const getMembersWithGroups = await withAuth(_getMembersWithGroups);
export const getGroupsWithMemberCount = await withAuth(_getGroupsWithMemberCount);
export const balanceGroups = await withAuth(_balanceGroups);
export const removeMembersFromGroup = await withAuth(_removeMembersFromGroup);
export const swapMembers = await withAuth(_swapMembers);
export const getAssignmentHistory = await withAuth(_getAssignmentHistory);
export const getGroupAnalytics = await withAuth(_getGroupAnalytics);
export const exportAssignments = await withAuth(_exportAssignments);
export const validateGroupAssignments = await withAuth(_validateGroupAssignments);
