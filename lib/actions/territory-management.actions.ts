"use server"

import { User, withAuth } from "../helpers/auth";
import { Territory, TerritoryAssignment } from "../models/territory.models";
import Group from "../models/group.models";
import Member from "../models/user.models";
import { connectToDB } from "../mongoose";
import { logActivity } from "../utils/activity-logger";

async function _divideTerritoryIntoSubTerritories(
  user: User,
  territoryId: string,
  divisions: number
) {
  try {
    if (!user) throw new Error("User not authorized");

    await connectToDB();

    const territory = await Territory.findById(territoryId);
    if (!territory) throw new Error("Territory not found");

    const subTerritories = [];
    const coords = territory.boundaries.coordinates[0];
    const totalPoints = coords.length;
    const pointsPerDivision = Math.floor(totalPoints / divisions);

    for (let i = 0; i < divisions; i++) {
      const start = i * pointsPerDivision;
      const end = i === divisions - 1 ? totalPoints : (i + 1) * pointsPerDivision + 1;
      const subCoords = coords.slice(start, end);

      if (subCoords.length >= 3) {
        if (subCoords[0][0] !== subCoords[subCoords.length - 1][0] || 
            subCoords[0][1] !== subCoords[subCoords.length - 1][1]) {
          subCoords.push(subCoords[0]);
        }

        const centerLat = subCoords.reduce((sum, coord) => sum + coord[1], 0) / subCoords.length;
        const centerLng = subCoords.reduce((sum, coord) => sum + coord[0], 0) / subCoords.length;

        const subTerritory = await Territory.create({
          number: `${territory.number}-${String.fromCharCode(65 + i)}`,
          name: `${territory.name} - Part ${String.fromCharCode(65 + i)}`,
          description: `Sub-territory ${i + 1} of ${territory.name}`,
          boundaries: {
            type: 'Polygon',
            coordinates: [subCoords]
          },
          center: {
            latitude: centerLat,
            longitude: centerLng
          },
          difficulty: territory.difficulty,
          type: territory.type,
          estimatedHours: Math.ceil(territory.estimatedHours / divisions),
          householdCount: territory.householdCount ? Math.ceil(territory.householdCount / divisions) : undefined,
          createdBy: user._id
        });

        subTerritories.push(subTerritory);
      }
    }

    await logActivity({
      userId: user._id as string,
      type: 'territory_divided',
      action: `${user.fullName} divided territory ${territory.number} into ${divisions} sub-territories`,
      details: {
        entityId: territoryId,
        entityType: 'Territory',
        metadata: { divisions, subTerritoryIds: subTerritories.map(t => t._id) }
      },
    });

    return JSON.parse(JSON.stringify(subTerritories));
  } catch (error) {
    console.error("Error dividing territory:", error);
    throw error;
  }
}

async function _assignTerritoriesToGroup(
  user: User,
  territoryIds: string[],
  groupId: string
) {
  try {
    if (!user) throw new Error("User not authorized");

    await connectToDB();

    const group = await Group.findById(groupId);
    if (!group) throw new Error("Group not found");

    await Territory.updateMany(
      { _id: { $in: territoryIds } },
      { $set: { assignedGroup: groupId } }
    );

    await logActivity({
      userId: user._id as string,
      type: 'territories_assigned_to_group',
      action: `${user.fullName} assigned ${territoryIds.length} territories to ${group.name}`,
      details: {
        entityId: groupId,
        entityType: 'Group',
        metadata: { territoryCount: territoryIds.length, territoryIds }
      },
    });

    return { success: true, count: territoryIds.length };
  } catch (error) {
    console.error("Error assigning territories to group:", error);
    throw error;
  }
}

async function _getTerritoryPrintData(user: User, territoryId: string) {
  try {
    if (!user) throw new Error("User not authorized");

    await connectToDB();

    const territory = await Territory.findById(territoryId)
      .populate('createdBy', 'fullName')
      .lean();

    if (!territory) throw new Error("Territory not found");

    const currentAssignment = await TerritoryAssignment.findOne({
      territoryId,
      status: 'assigned'
    })
      .populate('publisherId', 'fullName phone')
      .populate('assignedBy', 'fullName')
      .lean();

    const assignmentHistory = await TerritoryAssignment.find({ territoryId })
      .populate('publisherId', 'fullName')
      .sort({ assignedDate: -1 })
      .limit(5)
      .lean();

    return JSON.parse(JSON.stringify({
      territory,
      currentAssignment,
      assignmentHistory
    }));
  } catch (error) {
    console.error("Error fetching territory print data:", error);
    throw error;
  }
}

async function _bulkAssignTerritories(
  user: User,
  assignments: Array<{ territoryId: string; publisherId: string; dueDate?: Date }>
) {
  try {
    if (!user) throw new Error("User not authorized");

    await connectToDB();

    const results = [];

    for (const assignment of assignments) {
      const existingAssignment = await TerritoryAssignment.findOne({
        territoryId: assignment.territoryId,
        status: 'assigned'
      });

      if (!existingAssignment) {
        const newAssignment = await TerritoryAssignment.create({
          ...assignment,
          assignedBy: user._id
        });
        results.push(newAssignment);
      }
    }

    await logActivity({
      userId: user._id as string,
      type: 'bulk_territory_assign',
      action: `${user.fullName} assigned ${results.length} territories`,
      details: {
        entityType: 'TerritoryAssignment',
        metadata: { assignmentCount: results.length }
      },
    });

    return JSON.parse(JSON.stringify(results));
  } catch (error) {
    console.error("Error bulk assigning territories:", error);
    throw error;
  }
}

async function _getTerritoriesByGroup(user: User, groupId?: string) {
  try {
    if (!user) throw new Error("User not authorized");

    await connectToDB();

    const query = groupId ? { assignedGroup: groupId, isActive: true } : { isActive: true };
    const territories = await Territory.find(query)
      .populate('createdBy', 'fullName')
      .populate('assignedGroup', 'name')
      .sort({ number: 1 })
      .lean();

    return JSON.parse(JSON.stringify(territories));
  } catch (error) {
    console.error("Error fetching territories by group:", error);
    throw error;
  }
}

async function _distributeTerritoriesToGroups(user: User, strategy: "equal" | "difficulty" | "size" = "equal") {
  try {
    if (!user) throw new Error("User not authorized");

    await connectToDB();

    const groups = await Group.find({});
    const territories = await Territory.find({ isActive: true });

    if (groups.length === 0) throw new Error("No groups available");

    let distributedCount = 0;

    switch (strategy) {
      case "difficulty":
        distributedCount = await distributeByDifficulty(territories, groups);
        break;
      case "size":
        distributedCount = await distributeBySize(territories, groups);
        break;
      default:
        distributedCount = await distributeEqually(territories, groups);
    }

    await logActivity({
      userId: user._id as string,
      type: 'territories_distributed',
      action: `${user.fullName} distributed ${distributedCount} territories across ${groups.length} groups using ${strategy} strategy`,
      details: {
        entityType: 'Territory',
        metadata: { territoryCount: distributedCount, groupCount: groups.length, strategy }
      },
    });

    return { success: true, territoriesDistributed: distributedCount };
  } catch (error) {
    console.error("Error distributing territories:", error);
    throw error;
  }
}

async function distributeEqually(territories: any[], groups: any[]) {
  const territoriesPerGroup = Math.ceil(territories.length / groups.length);
  let groupIndex = 0;

  for (let i = 0; i < territories.length; i++) {
    territories[i].assignedGroup = groups[groupIndex]._id;
    await territories[i].save();

    if ((i + 1) % territoriesPerGroup === 0) {
      groupIndex++;
      if (groupIndex >= groups.length) groupIndex = groups.length - 1;
    }
  }

  return territories.length;
}

async function distributeByDifficulty(territories: any[], groups: any[]) {
  const easy = territories.filter(t => t.difficulty === 'easy');
  const medium = territories.filter(t => t.difficulty === 'medium');
  const hard = territories.filter(t => t.difficulty === 'hard');

  let groupIndex = 0;

  for (const territory of [...hard, ...medium, ...easy]) {
    territory.assignedGroup = groups[groupIndex]._id;
    await territory.save();
    groupIndex = (groupIndex + 1) % groups.length;
  }

  return territories.length;
}

async function distributeBySize(territories: any[], groups: any[]) {
  const sorted = territories.sort((a, b) => (b.householdCount || 0) - (a.householdCount || 0));
  let groupIndex = 0;

  for (const territory of sorted) {
    territory.assignedGroup = groups[groupIndex]._id;
    await territory.save();
    groupIndex = (groupIndex + 1) % groups.length;
  }

  return territories.length;
}

async function _getTerritoryStatsByGroup(user: User) {
  try {
    if (!user) throw new Error("User not authorized");

    await connectToDB();

    const groups = await Group.find({}).lean();
    const stats = await Promise.all(
      groups.map(async (group) => {
        const territories = await Territory.find({ assignedGroup: group._id, isActive: true });
        const assigned = await TerritoryAssignment.countDocuments({
          territoryId: { $in: territories.map(t => t._id) },
          status: 'assigned'
        });

        return {
          groupId: group._id,
          groupName: group.name,
          totalTerritories: territories.length,
          assignedTerritories: assigned,
          availableTerritories: territories.length - assigned,
          easyCount: territories.filter(t => t.difficulty === 'easy').length,
          mediumCount: territories.filter(t => t.difficulty === 'medium').length,
          hardCount: territories.filter(t => t.difficulty === 'hard').length,
        };
      })
    );

    return JSON.parse(JSON.stringify(stats));
  } catch (error) {
    console.error("Error fetching territory stats by group:", error);
    throw error;
  }
}

export const divideTerritoryIntoSubTerritories = await withAuth(_divideTerritoryIntoSubTerritories);
export const assignTerritoriesToGroup = await withAuth(_assignTerritoriesToGroup);
export const getTerritoryPrintData = await withAuth(_getTerritoryPrintData);
export const bulkAssignTerritories = await withAuth(_bulkAssignTerritories);
export const getTerritoriesByGroup = await withAuth(_getTerritoriesByGroup);
export const distributeTerritoriesToGroups = await withAuth(_distributeTerritoriesToGroups);
export const getTerritoryStatsByGroup = await withAuth(_getTerritoryStatsByGroup);
