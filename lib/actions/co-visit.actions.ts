"use server";


import { COVisit } from "@/lib/models/co-visit.models";
import { withAuth } from "@/lib/helpers/auth";
import { connectToDB } from "../mongoose";

// Create CO Visit
const _createCOVisit = async (user: IEmployee, visitData: any) => {
  try {
    await connectToDB();

    const visit = new COVisit({
      ...visitData,
      createdBy: user._id
    });

    await visit.save();
    return JSON.parse(JSON.stringify(visit));
  } catch (error) {
    console.log("Error creating CO visit:", error);
    throw error;
  }
};

// Get all CO visits
const _getCOVisits = async (user: IEmployee) => {
  try {
    await connectToDB();

    const visits = await COVisit.find()
      .populate('createdBy', 'fullName')
      .populate('shepherdingCalls.memberId', 'fullName')
      .populate('appointments.memberId', 'fullName')
      .sort({ 'visitDates.startDate': -1 });

    return JSON.parse(JSON.stringify(visits));
  } catch (error) {
    console.log("Error fetching CO visits:", error);
    throw error;
  }
};

// Get CO visit by ID
const _getCOVisitById = async (user: IEmployee, visitId: string) => {
  try {
    await connectToDB();

    const visit = await COVisit.findById(visitId)
      .populate('createdBy', 'fullName')
      .populate('shepherdingCalls.memberId', 'fullName')
      .populate('appointments.memberId', 'fullName');

    return JSON.parse(JSON.stringify(visit));
  } catch (error) {
    console.log("Error fetching CO visit:", error);
    throw error;
  }
};

// Update CO Visit
const _updateCOVisit = async (user: IEmployee, visitId: string, updateData: any) => {
  try {
    await connectToDB();

    const visit = await COVisit.findByIdAndUpdate(
      visitId,
      { ...updateData, lastUpdated: new Date() },
      { new: true }
    );

    return JSON.parse(JSON.stringify(visit));
  } catch (error) {
    console.log("Error updating CO visit:", error);
    throw error;
  }
};

// Add shepherding call
const _addShepherdingCall = async (user: IEmployee, visitId: string, callData: any) => {
  try {
    await connectToDB();

    const visit = await COVisit.findByIdAndUpdate(
      visitId,
      {
        $push: { shepherdingCalls: callData },
        lastUpdated: new Date()
      },
      { new: true }
    );

    return JSON.parse(JSON.stringify(visit));
  } catch (error) {
    console.log("Error adding shepherding call:", error);
    throw error;
  }
};

// Update shepherding call
const _updateShepherdingCall = async (user: IEmployee, visitId: string, callId: string, updateData: any) => {
  try {
    await connectToDB();

    const visit = await COVisit.findOneAndUpdate(
      { _id: visitId, 'shepherdingCalls._id': callId },
      {
        $set: {
          'shepherdingCalls.$': { ...updateData, _id: callId },
          lastUpdated: new Date()
        }
      },
      { new: true }
    );

    return JSON.parse(JSON.stringify(visit));
  } catch (error) {
    console.log("Error updating shepherding call:", error);
    throw error;
  }
};

// Add appointment recommendation
const _addAppointment = async (user: IEmployee, visitId: string, appointmentData: any) => {
  try {
    await connectToDB();

    const visit = await COVisit.findByIdAndUpdate(
      visitId,
      {
        $push: { appointments: appointmentData },
        lastUpdated: new Date()
      },
      { new: true }
    );

    return JSON.parse(JSON.stringify(visit));
  } catch (error) {
    console.log("Error adding appointment:", error);
    throw error;
  }
};

// Delete CO Visit
const _deleteCOVisit = async (user: IEmployee, visitId: string) => {
  try {
    await connectToDB();

    await COVisit.findByIdAndDelete(visitId);
    return { success: true };
  } catch (error) {
    console.log("Error deleting CO visit:", error);
    throw error;
  }
};

// Export with auth wrapper
export const createCOVisit = await withAuth(_createCOVisit);
export const getCOVisits = await withAuth(_getCOVisits);
export const getCOVisitById = await withAuth(_getCOVisitById);
export const updateCOVisit = await withAuth(_updateCOVisit);
export const addShepherdingCall = await withAuth(_addShepherdingCall);
export const updateShepherdingCall = await withAuth(_updateShepherdingCall);
export const addAppointment = await withAuth(_addAppointment);
export const deleteCOVisit = await withAuth(_deleteCOVisit);