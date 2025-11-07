"use server";

import { COReport } from "@/lib/models/co-report.models";
import { withAuth } from "@/lib/helpers/auth";
import { connectToDB } from "../mongoose";

// Create CO Report
const _createCOReport = async (user: IEmployee, reportData: any) => {
  try {
    await connectToDB();

    const report = new COReport({
      ...reportData,
      preparedBy: user._id
    });

    await report.save();
    return JSON.parse(JSON.stringify(report));
  } catch (error) {
    console.log("Error creating CO report:", error);
    throw error;
  }
};

// Get all CO reports
const _getCOReports = async (user: IEmployee) => {
  try {
    await connectToDB();

    const reports = await COReport.find()
      .populate('preparedBy', 'fullName')
      .populate('approvedBy', 'fullName')
      .populate('visitId')
      .sort({ createdAt: -1 });

    return JSON.parse(JSON.stringify(reports));
  } catch (error) {
    console.log("Error fetching CO reports:", error);
    throw error;
  }
};

// Get CO report by ID
const _getCOReportById = async (user: IEmployee, reportId: string) => {
  try {
    await connectToDB();

    const report = await COReport.findById(reportId)
      .populate('preparedBy', 'fullName')
      .populate('approvedBy', 'fullName')
      .populate('visitId');

    return JSON.parse(JSON.stringify(report));
  } catch (error) {
    console.log("Error fetching CO report:", error);
    throw error;
  }
};

// Update CO Report
const _updateCOReport = async (user: IEmployee, reportId: string, updateData: any) => {
  try {
    await connectToDB();

    const report = await COReport.findByIdAndUpdate(
      reportId,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );

    return JSON.parse(JSON.stringify(report));
  } catch (error) {
    console.log("Error updating CO report:", error);
    throw error;
  }
};

// Approve CO Report
const _approveCOReport = async (user: IEmployee, reportId: string) => {
  try {
    await connectToDB();

    const report = await COReport.findByIdAndUpdate(
      reportId,
      { 
        coordinatorApproval: true,
        approvedBy: user._id,
        approvalDate: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );

    return JSON.parse(JSON.stringify(report));
  } catch (error) {
    console.log("Error approving CO report:", error);
    throw error;
  }
};

// Submit to CO
const _submitToCO = async (user: IEmployee, reportId: string) => {
  try {
    await connectToDB();

    const report = await COReport.findByIdAndUpdate(
      reportId,
      { 
        submittedToCO: true,
        submissionDate: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );

    return JSON.parse(JSON.stringify(report));
  } catch (error) {
    console.log("Error submitting to CO:", error);
    throw error;
  }
};

// Delete CO Report
const _deleteCOReport = async (user: IEmployee, reportId: string) => {
  try {
    await connectToDB();

    await COReport.findByIdAndDelete(reportId);
    return { success: true };
  } catch (error) {
    console.log("Error deleting CO report:", error);
    throw error;
  }
};

// Export with auth wrapper
export const createCOReport = await withAuth(_createCOReport);
export const getCOReports = await withAuth(_getCOReports);
export const getCOReportById = await withAuth(_getCOReportById);
export const updateCOReport = await withAuth(_updateCOReport);
export const approveCOReport = await withAuth(_approveCOReport);
export const submitToCO = await withAuth(_submitToCO);
export const deleteCOReport = await withAuth(_deleteCOReport);