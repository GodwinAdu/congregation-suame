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
  boundaries?: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][];
  };
  center?: {
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
      userId: user._id as string,
      type: 'territory_create',
      action: `${user.fullName} created territory ${territoryData.number}`,
      details: { entityId: territory._id, entityType: 'Territory' },
    });

    revalidatePath('/dashboard/territories');
    revalidatePath('/[locale]/dashboard/territories', 'page');
    console.log('Territory created and paths revalidated:', territory._id);
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
      userId: user._id as string,
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

    console.log(`Fetched ${territories.length} territories from database`);
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
      userId: user._id as string,
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
      userId: user._id as string,
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

    console.log('Parsing KML content, length:', kmlContent.length);
    const territories = [];

    // More comprehensive KML parsing
    const placemarkRegex = /<Placemark[^>]*>([\s\S]*?)<\/Placemark>/gi;
    const nameRegex = /<name><!\[CDATA\[([\s\S]*?)\]\]><\/name>|<name>([\s\S]*?)<\/name>/i;
    const coordinatesRegex = /<coordinates>\s*([\s\S]*?)\s*<\/coordinates>/i;
    const polygonRegex = /<Polygon[^>]*>([\s\S]*?)<\/Polygon>/i;
    const linearRingRegex = /<LinearRing[^>]*>([\s\S]*?)<\/LinearRing>/i;

    let match;
    let territoryCount = 0;

    while ((match = placemarkRegex.exec(kmlContent)) !== null) {
      const placemark = match[1];
      console.log(`Processing placemark ${territoryCount + 1}`);

      // Extract name (handle CDATA)
      const nameMatch = nameRegex.exec(placemark);
      const name = nameMatch ? (nameMatch[1] || nameMatch[2] || `Territory ${territoryCount + 1}`).trim() : `Territory ${territoryCount + 1}`;

      // Look for polygon coordinates
      const polygonMatch = polygonRegex.exec(placemark);
      let coordsText = '';

      if (polygonMatch) {
        const linearRingMatch = linearRingRegex.exec(polygonMatch[1]);
        if (linearRingMatch) {
          const coordsMatch = coordinatesRegex.exec(linearRingMatch[1]);
          if (coordsMatch) {
            coordsText = coordsMatch[1].trim();
          }
        }
      } else {
        // Fallback: look for coordinates directly
        const coordsMatch = coordinatesRegex.exec(placemark);
        if (coordsMatch) {
          coordsText = coordsMatch[1].trim();
        }
      }

      if (coordsText) {
        console.log(`Found coordinates for ${name}:`, coordsText.substring(0, 100) + '...');

        // Parse coordinates (longitude,latitude,altitude format in KML)
        // Handle different coordinate formats
        const coordLines = coordsText.split(/[\n\r]+/).filter(line => line.trim());
        const allCoords = coordLines.join(' ').split(/\s+/).filter(coord => coord.trim());

        const coords = [];
        for (const coord of allCoords) {
          const parts = coord.split(',');
          if (parts.length >= 2) {
            const lng = parseFloat(parts[0]);
            const lat = parseFloat(parts[1]);
            if (!isNaN(lng) && !isNaN(lat)) {
              coords.push([lng, lat]);
            }
          }
        }

        console.log(`Parsed ${coords.length} coordinate points for ${name}`);

        if (coords.length >= 3) {
          // Ensure polygon is closed
          const first = coords[0];
          const last = coords[coords.length - 1];
          if (first[0] !== last[0] || first[1] !== last[1]) {
            coords.push([first[0], first[1]]);
          }

          // Calculate center point
          const centerLat = coords.reduce((sum, coord) => sum + coord[1], 0) / coords.length;
          const centerLng = coords.reduce((sum, coord) => sum + coord[0], 0) / coords.length;

          territories.push({
            name,
            coordinates: coords,
            center: { latitude: centerLat, longitude: centerLng }
          });

          territoryCount++;
          console.log(`Successfully parsed territory: ${name}`);
        } else {
          console.log(`Insufficient coordinates for ${name}: ${coords.length} points`);
        }
      } else {
        console.log(`No coordinates found for placemark: ${name}`);
      }
    }

    console.log(`Total territories parsed: ${territories.length}`);
    return territories;
  } catch (error: any) {
    console.log("Error parsing KML:", error);
    throw new Error(`Failed to parse KML file: ${error.message}`);
  }
}

export const createTerritory = await withAuth(_createTerritory);
export const updateTerritory = await withAuth(_updateTerritory);
export const getTerritories = await withAuth(_getTerritories);
export const assignTerritory = await withAuth(_assignTerritory);
export const getTerritoryAssignments = await withAuth(_getTerritoryAssignments);
export const returnTerritory = await withAuth(_returnTerritory);
async function _getMembersInTerritory(user: User, territoryId: string) {
  try {
    if (!user) throw new Error("User not authorized");

    await connectToDB();

    const territory = await Territory.findById(territoryId);
    if (!territory) throw new Error("Territory not found");

    const Member = (await import("../models/user.models")).default;
    const members = await Member.find({
      'location.latitude': { $exists: true, $ne: null },
      'location.longitude': { $exists: true, $ne: null },
      'location.isPublic': true
    }).select('fullName phone location role');

    // Filter members within territory boundaries using point-in-polygon
    const membersInTerritory = members.filter(member => {
      return isPointInPolygon(
        [member.location.longitude, member.location.latitude],
        territory.boundaries.coordinates[0]
      );
    });

    return JSON.parse(JSON.stringify(membersInTerritory));
  } catch (error) {
    console.log("Error fetching members in territory:", error);
    throw error;
  }
}

// Point-in-polygon algorithm
function isPointInPolygon(point: number[], polygon: number[][]) {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }

  return inside;
}

export const parseKMLFile = await withAuth(_parseKMLFile);
export const getMembersInTerritory = await withAuth(_getMembersInTerritory);