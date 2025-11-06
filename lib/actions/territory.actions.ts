"use server"

import { User, withAuth } from "../helpers/auth";
import { Territory, TerritoryAssignment } from "../models/territory.models";
import { connectToDB } from "../mongoose";
import { revalidatePath } from "next/cache";
import { logActivity } from "../utils/activity-logger";

interface TerritoryData {
  number: string;
  name: string;
  description?: string;
  boundaries: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][];
  };
  center: {
    latitude: number;
    longitude: number;
  };
  area?: number;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'residential' | 'business' | 'rural' | 'apartment' | 'mixed';
  estimatedHours: number;
  householdCount?: number;
  notes?: string;
  kmlData?: string;
}

interface AssignmentData {
  territoryId: string;
  publisherId: string;
  dueDate?: Date;
  notes?: string;
}

async function _createTerritory(user: User, territoryData: TerritoryData) {
  try {
    if (!user) throw new Error("User not authorized");

    await connectToDB();

    const territory = await Territory.create({
      ...territoryData,
      createdBy: user._id
    });

    await logActivity({
      userId: user._id,
      type: 'territory_create',
      action: `${user.fullName} created territory ${territoryData.number}`,
      details: { entityId: territory._id, entityType: 'Territory' },
    });

    revalidatePath('/dashboard/territories');
    return JSON.parse(JSON.stringify(territory));
  } catch (error) {
    console.log("Error creating territory:", error);
    throw error;
  }
}

async function _updateTerritory(user: User, territoryId: string, territoryData: Partial<TerritoryData>) {
  try {
    if (!user) throw new Error("User not authorized");

    await connectToDB();

    const territory = await Territory.findByIdAndUpdate(
      territoryId,
      territoryData,
      { new: true, runValidators: true }
    );

    if (!territory) throw new Error("Territory not found");

    await logActivity({
      userId: user._id,
      type: 'territory_update',
      action: `${user.fullName} updated territory ${territory.number}`,
      details: { entityId: territoryId, entityType: 'Territory' },
    });

    revalidatePath('/dashboard/territories');
    return JSON.parse(JSON.stringify(territory));
  } catch (error) {
    console.log("Error updating territory:", error);
    throw error;
  }
}

async function _getTerritories(user: User) {
  try {
    if (!user) throw new Error("User not authorized");

    await connectToDB();

    const territories = await Territory.find({ isActive: true })
      .populate('createdBy', 'fullName')
      .sort({ number: 1 });

    return JSON.parse(JSON.stringify(territories));
  } catch (error) {
    console.log("Error fetching territories:", error);
    throw error;
  }
}

async function _assignTerritory(user: User, assignmentData: AssignmentData) {
  try {
    if (!user) throw new Error("User not authorized");

    await connectToDB();

    // Check if territory is already assigned
    const existingAssignment = await TerritoryAssignment.findOne({
      territoryId: assignmentData.territoryId,
      status: 'assigned'
    });

    if (existingAssignment) {
      throw new Error("Territory is already assigned");
    }

    const assignment = await TerritoryAssignment.create({
      ...assignmentData,
      assignedBy: user._id
    });

    await logActivity({
      userId: user._id,
      type: 'territory_assign',
      action: `${user.fullName} assigned territory to publisher`,
      details: { entityId: assignment._id, entityType: 'TerritoryAssignment' },
    });

    revalidatePath('/dashboard/territories');
    return JSON.parse(JSON.stringify(assignment));
  } catch (error) {
    console.log("Error assigning territory:", error);
    throw error;
  }
}

async function _getTerritoryAssignments(user: User) {
  try {
    if (!user) throw new Error("User not authorized");

    await connectToDB();

    const assignments = await TerritoryAssignment.find()
      .populate('territoryId', 'number name type difficulty')
      .populate('publisherId', 'fullName phone')
      .populate('assignedBy', 'fullName')
      .sort({ assignedDate: -1 });

    return JSON.parse(JSON.stringify(assignments));
  } catch (error) {
    console.log("Error fetching assignments:", error);
    throw error;
  }
}

async function _returnTerritory(user: User, assignmentId: string, returnData: { hoursWorked?: number; householdsVisited?: number; notes?: string }) {
  try {
    if (!user) throw new Error("User not authorized");

    await connectToDB();

    const assignment = await TerritoryAssignment.findByIdAndUpdate(
      assignmentId,
      {
        ...returnData,
        returnedDate: new Date(),
        status: 'returned'
      },
      { new: true }
    );

    if (!assignment) throw new Error("Assignment not found");

    // Update territory last worked date
    await Territory.findByIdAndUpdate(assignment.territoryId, {
      lastWorked: new Date()
    });

    await logActivity({
      userId: user._id,
      type: 'territory_return',
      action: `${user.fullName} returned territory`,
      details: { entityId: assignmentId, entityType: 'TerritoryAssignment' },
    });

    revalidatePath('/dashboard/territories');
    return JSON.parse(JSON.stringify(assignment));
  } catch (error) {
    console.log("Error returning territory:", error);
    throw error;
  }
}

async function _parseKMLFile(user: User, kmlContent: string) {
  try {
    if (!user) throw new Error("User not authorized");

    // Basic KML parsing - in production, use a proper KML parser
    const territories = [];
    
    // This is a simplified parser - you'd want to use a library like @tmcw/togeojson
    const placemarkRegex = /<Placemark>(.*?)<\/Placemark>/gs;
    const nameRegex = /<name>(.*?)<\/name>/;
    const coordinatesRegex = /<coordinates>(.*?)<\/coordinates>/;
    
    let match;
    while ((match = placemarkRegex.exec(kmlContent)) !== null) {
      const placemark = match[1];
      const nameMatch = nameRegex.exec(placemark);
      const coordsMatch = coordinatesRegex.exec(placemark);
      
      if (nameMatch && coordsMatch) {
        const name = nameMatch[1].trim();
        const coordsText = coordsMatch[1].trim();
        
        // Parse coordinates (longitude,latitude,altitude format in KML)
        const coords = coordsText.split(/\s+/).map(coord => {
          const [lng, lat] = coord.split(',').map(Number);
          return [lng, lat];
        });
        
        if (coords.length >= 3) {
          // Ensure polygon is closed
          if (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1]) {
            coords.push(coords[0]);
          }
          
          // Calculate center point
          const centerLat = coords.reduce((sum, coord) => sum + coord[1], 0) / coords.length;
          const centerLng = coords.reduce((sum, coord) => sum + coord[0], 0) / coords.length;
          
          territories.push({
            name,
            coordinates: [coords],
            center: { latitude: centerLat, longitude: centerLng }
          });
        }
      }
    }
    
    return territories;
  } catch (error) {
    console.log("Error parsing KML:", error);
    throw error;
  }
}

export const createTerritory = await withAuth(_createTerritory);
export const updateTerritory = await withAuth(_updateTerritory);
export const getTerritories = await withAuth(_getTerritories);
export const assignTerritory = await withAuth(_assignTerritory);
export const getTerritoryAssignments = await withAuth(_getTerritoryAssignments);
export const returnTerritory = await withAuth(_returnTerritory);
export const parseKMLFile = await withAuth(_parseKMLFile);