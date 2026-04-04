"use server";

import { connectToDB } from "../mongoose";
import {User, withAuth } from "@/lib/helpers/auth";
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

const _generateFieldServiceReport = async (user: User, filters: ReportFilters) => {
  try {
    if (!user) throw new Error("User not authorized")
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
      
      const isRegularPioneer = member.privileges?.some((p: any) => p.name.toLowerCase().includes('regular pioneer')) || false;
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
            elder: member.privileges?.some((p: any) => p.name.toLowerCase().includes('elder')) || false,
            ministerialServant: member.privileges?.some((p: any) => p.name.toLowerCase().includes('ministerial servant')) || false,
            regularPioneer: isRegularPioneer,
            auxiliaryPioneer: hasAuxiliaryPioneerReports,
            specialPioneer: member.privileges?.some((p: any) => p.name.toLowerCase().includes('special pioneer')) || false,
            otherSheep: member.privileges?.some((p: any) => p.name.toLowerCase().includes('other sheep')) || true,
            anointed: member.privileges?.some((p: any) => p.name.toLowerCase().includes('anointed')) || false,
            fieldMissionary: member.privileges?.some((p: any) => p.name.toLowerCase().includes('field missionary')) || false
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
const _getReportFilterOptions = async (user: User) => {
  try {
    if (!user) throw new Error("User not authorized")
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
const _generatePioneerSummaryReport = async (user: User, filters: { startMonth: string; endMonth: string }) => {
  try {
    if (!user) throw new Error("User not authorized")
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
        r.publisher && r.publisher.privileges?.some((p: any) => p && p.name && p.name.toLowerCase().includes('regular pioneer'))
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
    const regularPioneerReports: any[] = [];
    for (const pioneer of regularPioneers) {
      const pioneerReports = reports.filter(r => r.publisher && r.publisher._id && r.publisher._id.toString() === pioneer._id.toString());
      
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
            elder: pioneer.privileges?.some((p: any) => p && p.name && p.name.toLowerCase().includes('elder')) || false,
            ministerialServant: pioneer.privileges?.some((p: any) => p && p.name && p.name.toLowerCase().includes('ministerial servant')) || false,
            regularPioneer: true,
            auxiliaryPioneer: false,
            specialPioneer: pioneer.privileges?.some((p: any) => p && p.name && p.name.toLowerCase().includes('special pioneer')) || false,
            otherSheep: pioneer.privileges?.some((p: any) => p && p.name && p.name.toLowerCase().includes('other sheep')) || true,
            anointed: pioneer.privileges?.some((p: any) => p && p.name && p.name.toLowerCase().includes('anointed')) || false,
            fieldMissionary: pioneer.privileges?.some((p: any) => p && p.name && p.name.toLowerCase().includes('field missionary')) || false
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
    const auxiliaryPioneerReports: any[] = [];
    const auxiliaryPioneerIds = new Set();
    
    reports.forEach(report => {
      if (report.auxiliaryPioneer && report.publisher && report.publisher._id && !auxiliaryPioneerIds.has(report.publisher._id.toString())) {
        auxiliaryPioneerIds.add(report.publisher._id.toString());
        
        const memberReports = reports.filter(r => r.publisher && r.publisher._id && r.publisher._id.toString() === report.publisher._id.toString());
        
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
              elder: report.publisher.privileges?.some((p: any) => p && p.name && p.name.toLowerCase().includes('elder')) || false,
              ministerialServant: report.publisher.privileges?.some((p: any) => p && p.name && p.name.toLowerCase().includes('ministerial servant')) || false,
              regularPioneer: report.publisher.privileges?.some((p: any) => p && p.name && p.name.toLowerCase().includes('regular pioneer')) || false,
              auxiliaryPioneer: true,
              specialPioneer: report.publisher.privileges?.some((p: any) => p && p.name && p.name.toLowerCase().includes('special pioneer')) || false,
              otherSheep: report.publisher.privileges?.some((p: any) => p && p.name && p.name.toLowerCase().includes('other sheep')) || true,
              anointed: report.publisher.privileges?.some((p: any) => p && p.name && p.name.toLowerCase().includes('anointed')) || false,
              fieldMissionary: report.publisher.privileges?.some((p: any) => p && p.name && p.name.toLowerCase().includes('field missionary')) || false
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
      regularPioneerReports:JSON.parse(JSON.stringify(regularPioneerReports)),
      auxiliaryPioneerReports: JSON.parse(JSON.stringify(auxiliaryPioneerReports)),
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

// ── Inactive Publishers ──────────────────────────────────────────────────────
const _fetchInactivePublishers = async (user: User, monthsInactive: number) => {
  if (!user) throw new Error('Not authorized')
  await connectToDB()

  // Build cutoff as YYYY-MM string by subtracting months from current date
  const now = new Date()
  const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsInactive, 1)
  const cutoffStr = `${cutoffDate.getFullYear()}-${String(cutoffDate.getMonth() + 1).padStart(2, '0')}`

  // Fetch all members — no accountStatus filter since older records may not have the field
  const members = await Member.find()
    .populate('groupId', 'name')
    .select('fullName phone groupId')
    .lean()

  const allReports = await FieldServiceReport.find({
    publisher: { $in: (members as any[]).map((m: any) => m._id) }
  }).select('publisher month').lean()

  // Build map of publisher _id -> latest month string
  const lastReportMap: Record<string, string> = {}
  for (const r of allReports as any[]) {
    const id = r.publisher.toString()
    if (!lastReportMap[id] || r.month > lastReportMap[id]) lastReportMap[id] = r.month
  }

  const inactive = (members as any[]).filter(m => {
    const last = lastReportMap[m._id.toString()]
    // Inactive if never reported OR last report is strictly before the cutoff month
    return !last || last < cutoffStr
  }).map(m => {
    const lastReport = lastReportMap[m._id.toString()] ?? null
    let monthsAgo: number | null = null
    if (lastReport) {
      const [ly, lm] = lastReport.split('-').map(Number)
      monthsAgo = (now.getFullYear() - ly) * 12 + (now.getMonth() + 1 - lm)
    }
    return {
      id: m._id.toString(),
      fullName: m.fullName,
      phone: m.phone ?? '',
      group: (m.groupId as any)?.name ?? 'Unassigned',
      lastReport,
      monthsInactive: monthsAgo,
    }
  })

  // Sort: never reported first, then oldest last report first
  inactive.sort((a, b) => {
    if (!a.lastReport && !b.lastReport) return 0
    if (!a.lastReport) return -1
    if (!b.lastReport) return 1
    return a.lastReport.localeCompare(b.lastReport)
  })

  return JSON.parse(JSON.stringify(inactive))
}
export const fetchInactivePublishers = await withAuth(_fetchInactivePublishers)

// ── Hours Trend ──────────────────────────────────────────────────────────────
const _fetchHoursTrend = async (user: User, year: number) => {
  if (!user) throw new Error('Not authorized')
  await connectToDB()

  const months = Array.from({ length: 12 }, (_, i) =>
    `${year}-${String(i + 1).padStart(2, '0')}`
  )

  const reports = await FieldServiceReport.find({
    month: { $gte: `${year}-01`, $lte: `${year}-12` }
  }).select('month hours bibleStudents auxiliaryPioneer').lean()

  const data = months.map(month => {
    const monthReports = (reports as any[]).filter(r => r.month === month)
    return {
      month,
      label: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
      totalHours: monthReports.reduce((s, r) => s + (r.hours || 0), 0),
      totalStudies: monthReports.reduce((s, r) => s + (r.bibleStudents || 0), 0),
      publishers: monthReports.length,
      auxiliaryPioneers: monthReports.filter(r => r.auxiliaryPioneer).length,
    }
  })

  return JSON.parse(JSON.stringify(data))
}
export const fetchHoursTrend = await withAuth(_fetchHoursTrend)

// ── Group Comparison ─────────────────────────────────────────────────────────
const _fetchGroupComparison = async (user: User, month: string) => {
  if (!user) throw new Error('Not authorized')
  await connectToDB()

  const groups = await Group.find().lean()

  // Fetch all members with their groupId (not populated — just the ObjectId)
  const members = await Member.find().select('groupId').lean()

  // Build a map of memberId -> groupId string for fast lookup
  const memberGroupMap: Record<string, string> = {}
  for (const m of members as any[]) {
    if (m.groupId) memberGroupMap[m._id.toString()] = m.groupId.toString()
  }

  // Fetch reports for the month — no populate needed, publisher is ObjectId
  const reports = await FieldServiceReport.find({ month })
    .select('publisher hours bibleStudents auxiliaryPioneer')
    .lean()

  const result = (groups as any[]).map(group => {
    const gid = group._id.toString()
    const groupMemberIds = Object.entries(memberGroupMap)
      .filter(([, gId]) => gId === gid)
      .map(([mId]) => mId)

    const groupReports = (reports as any[]).filter(r =>
      memberGroupMap[r.publisher.toString()] === gid
    )

    return {
      id: gid,
      name: group.name,
      totalMembers: groupMemberIds.length,
      reportCount: groupReports.length,
      totalHours: groupReports.reduce((s: number, r: any) => s + (r.hours || 0), 0),
      totalStudies: groupReports.reduce((s: number, r: any) => s + (r.bibleStudents || 0), 0),
      auxiliaryPioneers: groupReports.filter((r: any) => r.auxiliaryPioneer === true).length,
      participationRate: groupMemberIds.length > 0
        ? Math.round((groupReports.length / groupMemberIds.length) * 100)
        : 0,
    }
  })

  result.sort((a, b) => b.totalHours - a.totalHours)
  return JSON.parse(JSON.stringify(result))
}
export const fetchGroupComparison = await withAuth(_fetchGroupComparison)

// ── Regular Pioneer Tracker ──────────────────────────────────────────────────
const _fetchRegularPioneers = async (user: User, month: string) => {
  if (!user) throw new Error('Not authorized')
  await connectToDB()

  const Privilege = (await import('../models/privilege.models')).default

  // Match any privilege whose name contains 'pioneer' (case-insensitive) but not 'auxiliary' or 'special'
  const pioneerPrivileges = await Privilege.find({
    name: { $regex: /pioneer/i, $not: /auxiliary|special/i }
  }).lean()
  const privilegeIds = (pioneerPrivileges as any[]).map(p => p._id)

  // A regular pioneer is identified by pioneerStatus:'regular' OR having a regular pioneer privilege
  const members = await Member.find({
    $or: [
      { pioneerStatus: 'regular' },
      ...(privilegeIds.length > 0 ? [{ privileges: { $in: privilegeIds } }] : [])
    ]
  }).populate('groupId', 'name')
    .select('fullName phone groupId pioneerStartDate pioneerStatus')
    .lean()

  const reports = await FieldServiceReport.find({
    publisher: { $in: (members as any[]).map(m => (m as any)._id) },
    month,
  }).select('publisher hours bibleStudents comments').lean()

  // Build report map by publisher id
  const reportMap: Record<string, any> = {}
  for (const r of reports as any[]) {
    reportMap[r.publisher.toString()] = r
  }

  const HOUR_REQUIREMENT = 50

  const result = (members as any[]).map(m => {
    const report = reportMap[m._id.toString()] ?? null
    // hours default is 0 in schema, so a submitted report always has a numeric hours value
    const hours = report ? (report.hours ?? 0) : 0
    return {
      id: m._id.toString(),
      fullName: m.fullName,
      phone: m.phone ?? '',
      group: (m.groupId as any)?.name ?? 'Unassigned',
      pioneerStartDate: m.pioneerStartDate ?? null,
      hours,
      bibleStudents: report?.bibleStudents ?? 0,
      comments: report?.comments ?? '',
      submitted: report !== null,
      metRequirement: hours >= HOUR_REQUIREMENT,
      shortfall: Math.max(0, HOUR_REQUIREMENT - hours),
    }
  })

  result.sort((a, b) => b.hours - a.hours)
  return JSON.parse(JSON.stringify(result))
}
export const fetchRegularPioneers = await withAuth(_fetchRegularPioneers)

// ── Pioneer Applications ─────────────────────────────────────────────────────
const _fetchPioneerApplications = async (user: User) => {
  if (!user) throw new Error('Not authorized')
  await connectToDB()

  const members = await Member.find({
    pioneerStatus: { $in: ['auxiliary', 'regular', 'special'] }
  }).populate('groupId', 'name')
    .select('fullName phone groupId pioneerStatus pioneerStartDate')
    .lean()

  return JSON.parse(JSON.stringify(
    (members as any[]).map(m => ({
      id: m._id.toString(),
      fullName: m.fullName,
      phone: m.phone ?? '',
      group: m.groupId?.name ?? 'Unassigned',
      pioneerStatus: m.pioneerStatus,
      pioneerStartDate: m.pioneerStartDate ?? null,
    }))
  ))
}
export const fetchPioneerApplications = await withAuth(_fetchPioneerApplications)