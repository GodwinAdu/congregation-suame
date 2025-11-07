"use server";

import { connectToDB } from "../mongoose";
import { withAuth } from "@/lib/helpers/auth";
import Member from "@/lib/models/user.models";
import FieldServiceReport from "@/lib/models/field-service.models";
import Role from "@/lib/models/role.models";
import Group from "@/lib/models/group.models";
import Privilege from "@/lib/models/privilege.models";

interface ReportFilters {
  startMonth: string;
  endMonth: string;
  filterType: 'all' | 'role' | 'group' | 'privilege' | 'member';
  filterValue?: string;
}

const _generateFieldServiceReport = async (user: IEmployee, filters: ReportFilters) => {
  try {
    await connectToDB();

    const startDate = new Date(filters.startMonth + '-01');
    const endDate = new Date(filters.endMonth + '-01');
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0); // Last day of end month

    // Build member filter query
    let memberQuery: any = {};
    
    if (filters.filterType === 'role' && filters.filterValue) {
      memberQuery.role = filters.filterValue;
    } else if (filters.filterType === 'group' && filters.filterValue) {
      memberQuery.groupId = filters.filterValue;
    } else if (filters.filterType === 'privilege' && filters.filterValue) {
      memberQuery.privileges = { $in: [filters.filterValue] };
    } else if (filters.filterType === 'member' && filters.filterValue) {
      memberQuery._id = filters.filterValue;
    }

    // Get filtered members
    const members = await Member.find(memberQuery)
      .populate('privileges', 'name')
      .populate('groupId', 'name')
      .select('fullName dob baptizedDate gender role privileges groupId')
      .sort({ fullName: 1 });

    // Get reports for the date range
    const reports = await FieldServiceReport.find({
      publisher: { $in: members.map(m => m._id) },
      month: {
        $gte: filters.startMonth,
        $lte: filters.endMonth
      }
    }).populate('publisher', 'fullName');

    // Generate summary statistics
    const summary = {
      totalMembers: members.length,
      totalReports: reports.length,
      totalHours: reports.reduce((sum, r) => sum + (r.hours || 0), 0),
      totalBibleStudies: reports.reduce((sum, r) => sum + (r.bibleStudents || 0), 0),
      averageHours: 0,
      reportingPercentage: 0
    };

    summary.averageHours = summary.totalMembers > 0 ? summary.totalHours / summary.totalMembers : 0;
    summary.reportingPercentage = summary.totalMembers > 0 ? (reports.length / summary.totalMembers) * 100 : 0;

    // Generate member reports with S-21 format
    const memberReports = members.map(member => {
      const memberReports = reports.filter(r => r.publisher._id.toString() === member._id.toString());
      
      return {
        member: {
          _id: member._id,
          fullName: member.fullName,
          dateOfBirth: member.dob ? new Date(member.dob).toLocaleDateString() : '',
          dateOfBaptism: member.baptizedDate ? new Date(member.baptizedDate).toLocaleDateString() : '',
          gender: member.gender || '',
          role: member.role || 'Publisher',
          group: member.groupId?.name || 'Unassigned',
          privileges: {
            elder: member.privileges?.some(p => p.name.toLowerCase().includes('elder')) || false,
            ministerialServant: member.privileges?.some(p => p.name.toLowerCase().includes('ministerial servant')) || false,
            regularPioneer: member.privileges?.some(p => p.name.toLowerCase().includes('regular pioneer')) || false,
            specialPioneer: member.privileges?.some(p => p.name.toLowerCase().includes('special pioneer')) || false,
            otherSheep: member.privileges?.some(p => p.name.toLowerCase().includes('other sheep')) || true,
            anointed: member.privileges?.some(p => p.name.toLowerCase().includes('anointed')) || false,
            fieldMissionary: member.privileges?.some(p => p.name.toLowerCase().includes('field missionary')) || false
          }
        },
        reports: memberReports.map(r => ({
          month: r.month,
          hours: r.hours || 0,
          bibleStudies: r.bibleStudents || 0,
          comments: r.comments || ''
        })),
        totals: {
          hours: memberReports.reduce((sum, r) => sum + (r.hours || 0), 0),
          bibleStudies: memberReports.reduce((sum, r) => sum + (r.bibleStudents || 0), 0)
        }
      };
    });

    return {
      summary,
      memberReports,
      filters,
      generatedAt: new Date(),
      generatedBy: user.fullName
    };

  } catch (error) {
    console.log("Error generating field service report:", error);
    throw error;
  }
};

// Get filter options for report generation
const _getReportFilterOptions = async (user: IEmployee) => {
  try {
    await connectToDB();
    
    const [roles, groups, privileges, members] = await Promise.all([
      Role.find({}).select('name').lean(),
      Group.find({}).select('name').lean(),
      Privilege.find({}).select('name').lean(),
      Member.find({}).select('fullName').sort({ fullName: 1 }).lean()
    ]);
    
    return {
      roles: JSON.parse(JSON.stringify(roles)),
      groups: JSON.parse(JSON.stringify(groups)),
      privileges: JSON.parse(JSON.stringify(privileges)),
      members: JSON.parse(JSON.stringify(members))
    };
  } catch (error) {
    console.log("Error fetching filter options:", error);
    throw error;
  }
};

export const generateFieldServiceReport = await withAuth(_generateFieldServiceReport);
export const getReportFilterOptions = await withAuth(_getReportFilterOptions);