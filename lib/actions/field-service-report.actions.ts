"use server";

import { connectToDB } from "../mongoose";
import { withAuth } from "@/lib/helpers/auth";
import Member, { IUser } from "@/lib/models/user.models";
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

const _generateFieldServiceReport = async (user: IUser, filters: ReportFilters) => {
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
      reportingPercentage: 0,
      pioneerTotals: {
        regularPioneers: {
          count: 0,
          totalHours: 0,
          totalBibleStudies: 0
        },
        auxiliaryPioneers: {
          count: 0,
          totalHours: 0,
          totalBibleStudies: 0
        }
      }
    };

    summary.averageHours = summary.totalMembers > 0 ? summary.totalHours / summary.totalMembers : 0;
    summary.reportingPercentage = summary.totalMembers > 0 ? (reports.length / summary.totalMembers) * 100 : 0;

    // Generate member reports with S-21 format
    const memberReports = members.map(member => {
      const memberReports = reports.filter(r => r.publisher._id.toString() === member._id.toString());
      
      const isRegularPioneer = member.privileges?.some(p => p.name.toLowerCase().includes('regular pioneer')) || false;
      const hasAuxiliaryPioneerReports = memberReports.some(r => r.auxiliaryPioneer === true);
      
      const memberTotals = {
        hours: memberReports.reduce((sum, r) => sum + (r.hours || 0), 0),
        bibleStudies: memberReports.reduce((sum, r) => sum + (r.bibleStudents || 0), 0)
      };
      
      // Add to pioneer totals
      if (isRegularPioneer) {
        summary.pioneerTotals.regularPioneers.count++;
        summary.pioneerTotals.regularPioneers.totalHours += memberTotals.hours;
        summary.pioneerTotals.regularPioneers.totalBibleStudies += memberTotals.bibleStudies;
      }
      
      if (hasAuxiliaryPioneerReports) {
        summary.pioneerTotals.auxiliaryPioneers.count++;
        summary.pioneerTotals.auxiliaryPioneers.totalHours += memberTotals.hours;
        summary.pioneerTotals.auxiliaryPioneers.totalBibleStudies += memberTotals.bibleStudies;
      }
      
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
            regularPioneer: isRegularPioneer,
            auxiliaryPioneer: hasAuxiliaryPioneerReports,
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
          auxiliaryPioneer: r.auxiliaryPioneer || false,
          comments: r.comments || ''
        })),
        totals: memberTotals
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

// Generate pioneer summary report
const _generatePioneerSummaryReport = async (user: IEmployee, filters: { startMonth: string; endMonth: string }) => {
  try {
    await connectToDB();

    // Get regular pioneer privilege ID first
    const regularPioneerPrivilege = await Privilege.findOne({ name: { $regex: /regular pioneer/i } });
    
    // Get all members with regular pioneer privilege
    const regularPioneers = regularPioneerPrivilege ? await Member.find({
      privileges: regularPioneerPrivilege._id
    }).populate('privileges', 'name').select('fullName') : [];

    // Get all reports for the period
    const reports = await FieldServiceReport.find({
      month: { $gte: filters.startMonth, $lte: filters.endMonth }
    }).populate({
      path: 'publisher',
      select: 'fullName privileges',
      populate: {
        path: 'privileges',
        select: 'name'
      }
    });

    // Generate monthly breakdown
    const months = [];
    const start = new Date(filters.startMonth + '-01');
    const end = new Date(filters.endMonth + '-01');
    
    for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
      const monthKey = d.toISOString().slice(0, 7);
      const monthReports = reports.filter(r => r.month === monthKey);
      
      const regularPioneerReports = monthReports.filter(r => 
        r.publisher.privileges?.some(p => p && p.name && p.name.toLowerCase().includes('regular pioneer'))
      );
      
      const auxiliaryPioneerReports = monthReports.filter(r => r.auxiliaryPioneer === true);
      
      months.push({
        month: monthKey,
        monthName: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        regularPioneers: {
          count: regularPioneerReports.length,
          totalHours: regularPioneerReports.reduce((sum, r) => sum + (r.hours || 0), 0),
          totalBibleStudies: regularPioneerReports.reduce((sum, r) => sum + (r.bibleStudents || 0), 0)
        },
        auxiliaryPioneers: {
          count: auxiliaryPioneerReports.length,
          totalHours: auxiliaryPioneerReports.reduce((sum, r) => sum + (r.hours || 0), 0),
          totalBibleStudies: auxiliaryPioneerReports.reduce((sum, r) => sum + (r.bibleStudents || 0), 0)
        }
      });
    }

    // Calculate totals
    const totals = {
      regularPioneers: {
        totalHours: months.reduce((sum, m) => sum + m.regularPioneers.totalHours, 0),
        totalBibleStudies: months.reduce((sum, m) => sum + m.regularPioneers.totalBibleStudies, 0),
        averageCount: months.reduce((sum, m) => sum + m.regularPioneers.count, 0) / months.length
      },
      auxiliaryPioneers: {
        totalHours: months.reduce((sum, m) => sum + m.auxiliaryPioneers.totalHours, 0),
        totalBibleStudies: months.reduce((sum, m) => sum + m.auxiliaryPioneers.totalBibleStudies, 0),
        averageCount: months.reduce((sum, m) => sum + m.auxiliaryPioneers.count, 0) / months.length
      }
    };

    // Generate S-21 records for regular pioneers
    const regularPioneerReports = [];
    for (const pioneer of regularPioneers) {
      const pioneerReports = reports.filter(r => r.publisher._id.toString() === pioneer._id.toString());
      
      regularPioneerReports.push({
        member: {
          _id: pioneer._id,
          fullName: pioneer.fullName,
          dateOfBirth: pioneer.dob ? new Date(pioneer.dob).toLocaleDateString() : '',
          dateOfBaptism: pioneer.baptizedDate ? new Date(pioneer.baptizedDate).toLocaleDateString() : '',
          gender: pioneer.gender || '',
          role: pioneer.role || 'Publisher',
          group: pioneer.groupId?.name || 'Unassigned',
          privileges: {
            elder: pioneer.privileges?.some(p => p && p.name && p.name.toLowerCase().includes('elder')) || false,
            ministerialServant: pioneer.privileges?.some(p => p && p.name && p.name.toLowerCase().includes('ministerial servant')) || false,
            regularPioneer: true,
            auxiliaryPioneer: false,
            specialPioneer: pioneer.privileges?.some(p => p && p.name && p.name.toLowerCase().includes('special pioneer')) || false,
            otherSheep: pioneer.privileges?.some(p => p && p.name && p.name.toLowerCase().includes('other sheep')) || true,
            anointed: pioneer.privileges?.some(p => p && p.name && p.name.toLowerCase().includes('anointed')) || false,
            fieldMissionary: pioneer.privileges?.some(p => p && p.name && p.name.toLowerCase().includes('field missionary')) || false
          }
        },
        reports: pioneerReports.map(r => ({
          month: r.month,
          hours: r.hours || 0,
          bibleStudies: r.bibleStudents || 0,
          auxiliaryPioneer: r.auxiliaryPioneer || false,
          comments: r.comments || ''
        })),
        totals: {
          hours: pioneerReports.reduce((sum, r) => sum + (r.hours || 0), 0),
          bibleStudies: pioneerReports.reduce((sum, r) => sum + (r.bibleStudents || 0), 0)
        }
      });
    }

    // Generate S-21 records for auxiliary pioneers
    const auxiliaryPioneerReports = [];
    const auxiliaryPioneerIds = new Set();
    
    reports.forEach(report => {
      if (report.auxiliaryPioneer && !auxiliaryPioneerIds.has(report.publisher._id.toString())) {
        auxiliaryPioneerIds.add(report.publisher._id.toString());
        
        const memberReports = reports.filter(r => r.publisher._id.toString() === report.publisher._id.toString());
        
        auxiliaryPioneerReports.push({
          member: {
            _id: report.publisher._id,
            fullName: report.publisher.fullName,
            dateOfBirth: report.publisher.dob ? new Date(report.publisher.dob).toLocaleDateString() : '',
            dateOfBaptism: report.publisher.baptizedDate ? new Date(report.publisher.baptizedDate).toLocaleDateString() : '',
            gender: report.publisher.gender || '',
            role: report.publisher.role || 'Publisher',
            group: report.publisher.groupId?.name || 'Unassigned',
            privileges: {
              elder: report.publisher.privileges?.some(p => p && p.name && p.name.toLowerCase().includes('elder')) || false,
              ministerialServant: report.publisher.privileges?.some(p => p && p.name && p.name.toLowerCase().includes('ministerial servant')) || false,
              regularPioneer: report.publisher.privileges?.some(p => p && p.name && p.name.toLowerCase().includes('regular pioneer')) || false,
              auxiliaryPioneer: true,
              specialPioneer: report.publisher.privileges?.some(p => p && p.name && p.name.toLowerCase().includes('special pioneer')) || false,
              otherSheep: report.publisher.privileges?.some(p => p && p.name && p.name.toLowerCase().includes('other sheep')) || true,
              anointed: report.publisher.privileges?.some(p => p && p.name && p.name.toLowerCase().includes('anointed')) || false,
              fieldMissionary: report.publisher.privileges?.some(p => p && p.name && p.name.toLowerCase().includes('field missionary')) || false
            }
          },
          reports: memberReports.map(r => ({
            month: r.month,
            hours: r.hours || 0,
            bibleStudies: r.bibleStudents || 0,
            auxiliaryPioneer: r.auxiliaryPioneer || false,
            comments: r.comments || ''
          })),
          totals: {
            hours: memberReports.reduce((sum, r) => sum + (r.hours || 0), 0),
            bibleStudies: memberReports.reduce((sum, r) => sum + (r.bibleStudents || 0), 0)
          }
        });
      }
    });

    return {
      months,
      totals,
      regularPioneerReports,
      auxiliaryPioneerReports,
      filters,
      generatedAt: new Date(),
      generatedBy: user.fullName
    };

  } catch (error) {
    console.log("Error generating pioneer summary report:", error);
    throw error;
  }
};

export const generateFieldServiceReport = await withAuth(_generateFieldServiceReport);
export const getReportFilterOptions = await withAuth(_getReportFilterOptions);
export const generatePioneerSummaryReport = await withAuth(_generatePioneerSummaryReport);