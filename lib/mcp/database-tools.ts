import { connectToDB } from "@/lib/mongoose";
import { tool } from "ai";
import { z } from "zod";

// Import all models
import User from "@/lib/models/user.models";
import { Territory } from "@/lib/models/territory.models";
import FieldServiceReport from "@/lib/models/field-service.models";
import { Event } from "@/lib/models/event.models";
import Attendance from "@/lib/models/attendance.models";
import { Broadcast } from "@/lib/models/communication.models";
import Activity from "@/lib/models/activity.models";
import Assignment from "@/lib/models/assignment.models";
import AssignmentHistory from "@/lib/models/assignment-history.models";
import BibleStudy from "@/lib/models/bible-study.models";
import { CleaningTask } from "@/lib/models/cleaning.models";
import { COReport } from "@/lib/models/co-report.models";
import { COVisit } from "@/lib/models/co-visit.models";
import DailyFieldService from "@/lib/models/daily-field-service.models";
import { Document } from "@/lib/models/document.models";
import { Duty } from "@/lib/models/duty.models";
import { Expense } from "@/lib/models/financial.models";
import Family from "@/lib/models/family.models";
import FieldServiceMeeting from "@/lib/models/field-service-meeting.models";
import Group from "@/lib/models/group.models";
import GroupSchedule from "@/lib/models/group-schedule.models";
import History from "@/lib/models/history.models";
import Literature from "@/lib/models/literature.models";
import { Notification } from "@/lib/models/notification.models";
import OverseerReport from "@/lib/models/overseer-report.models";
import Privilege from "@/lib/models/privilege.models";
import PublicTalk from "@/lib/models/public-talk.models";
import PublicWitnessing from "@/lib/models/public-witnessing.models";
import PublisherGoal from "@/lib/models/publisher-goal.models";
import PublisherRecord from "@/lib/models/publisher-record.models";
import PushSubscription from "@/lib/models/push-subscription.models";
import ReaderAssignment from "@/lib/models/reader-assignment.models";
import Role from "@/lib/models/role.models";
import SchoolStudent from "@/lib/models/school-student.models";
import ShepherdingCall from "@/lib/models/shepherding-call.models";
import SMSLog from "@/lib/models/sms-log.models";
import TransportConfig from "@/lib/models/transport-config.models";
import { TransportFee } from "@/lib/models/transport-fee.models";

const allModels: Record<string, any> = {
  User,
  Territory,
  FieldServiceReport,
  Event,
  Attendance,
  Broadcast,
  Activity,
  Assignment,
  AssignmentHistory,
  BibleStudy,
  CleaningTask,
  COReport,
  COVisit,
  DailyFieldService,
  Document,
  Duty,
  Expense,
  Family,
  FieldServiceMeeting,
  Group,
  GroupSchedule,
  History,
  Literature,
  Notification,
  OverseerReport,
  Privilege,
  PublicTalk,
  PublicWitnessing,
  PublisherGoal,
  PublisherRecord,
  PushSubscription,
  ReaderAssignment,
  Role,
  SchoolStudent,
  ShepherdingCall,
  SMSLog,
  TransportConfig,
  TransportFee,
};

export const databaseTools = {
  // Generic database query tool - allows AI to query ANY collection
  queryDatabase: tool({
    description: `Query any collection in the congregation database. Available collections include:
    User, Territory, FieldServiceReport, Meeting, Attendance, Broadcast, Activity, Assignment, 
    BibleStudy, Cleaning, COReport, COVisit, DailyFieldService, Document, Duty, Expense, Family,
    FieldServiceMeeting, Financial, Group, History, Literature, Notification, OverseerReport,
    Privilege, PublicTalk, PublicWitnessing, PublisherGoal, PublisherRecord, ShepherdingCall, and more.
    Use this to answer ANY question about congregation data.`,
    inputSchema: z.object({
      collection: z.string().describe("Name of the collection to query (e.g., 'User', 'Territory', 'Meeting')"),
      filters: z.record(z.string(), z.any()).optional().describe("MongoDB filter conditions"),
      limit: z.number().default(10).describe("Maximum number of results (default: 10, max: 50)"),
      sort: z.record(z.string(), z.number()).optional().describe("Sort order (e.g., {createdAt: -1})"),
      populate: z.string().optional().describe("Field to populate (e.g., 'member' or 'user')"),
      select: z.string().optional().describe("Fields to return (e.g., 'name email' or '-password -__v')"),
    }),
    execute: async ({ collection, filters, limit, sort, populate, select }) => {
      try {
        console.log('Tool called:', { collection, filters, limit, sort, populate, select });
        await connectToDB();

        const model = allModels[collection];
        if (!model) {
          return { error: `Collection '${collection}' not found. Available: ${Object.keys(allModels).join(', ')}` };
        }

        const safeLimit = Math.min(limit || 10, 50);
        let query = model.find(filters || {}).limit(safeLimit);
        if (sort) query = query.sort(sort);
        if (populate) query = query.populate(populate);
        if (select) query = query.select(select);

        const result = await query.lean().exec();
        console.log('Query result count:', result.length);
        return result;
      } catch (error: any) {
        console.error('Query error:', error);
        // If it's a populate error, retry without populate
        if (error?.name === 'StrictPopulateError' && populate) {
          console.log('Retrying without populate...');
          try {
            await connectToDB();
            const model = allModels[collection];
            const safeLimit = Math.min(limit || 10, 50);
            let query = model.find(filters || {}).limit(safeLimit);
            if (sort) query = query.sort(sort);
            if (select) query = query.select(select);
            const result = await query.lean().exec();
            console.log('Query result count (without populate):', result.length);
            return result;
          } catch (retryError) {
            return { error: retryError instanceof Error ? retryError.message : "Unknown error" };
          }
        }
        return { error: error instanceof Error ? error.message : "Unknown error" };
      }
    },
  }),

  // Get database schema - lists ALL collections
  getDatabaseSchema: tool({
    description: "Get complete list of all collections in the database",
    inputSchema: z.object({}),
    execute: async () => {
      return {
        collections: Object.keys(allModels),
        totalCollections: Object.keys(allModels).length,
        note: "Use queryDatabase tool to query any of these collections",
      };
    },
  }),

  // Aggregate/count tool for statistics
  aggregateData: tool({
    description: "Perform aggregation operations like count, sum, average on any collection",
    inputSchema: z.object({
      collection: z.string(),
      operation: z.enum(["count", "sum", "average"]),
      field: z.string().optional().describe("Field to aggregate (for sum/average)"),
      filters: z.record(z.string(), z.any()).optional(),
    }),
    execute: async ({ collection, operation, field, filters }) => {
      try {
        await connectToDB();

        const model = allModels[collection];
        if (!model) return { error: `Collection '${collection}' not found` };

        if (operation === "count") {
          const count = await model.countDocuments(filters || {});
          return { count };
        }

        if (operation === "sum" || operation === "average") {
          if (!field) return { error: "Field is required for sum/average operations" };

          const pipeline: any[] = [];
          if (filters) pipeline.push({ $match: filters });

          pipeline.push({
            $group: {
              _id: null,
              total: { $sum: `$${field}` },
              count: { $sum: 1 },
            },
          });

          const result = await model.aggregate(pipeline);
          if (result.length === 0) return { result: 0 };

          if (operation === "sum") return { sum: result[0].total };
          return { average: result[0].total / result[0].count };
        }

        return { error: "Invalid operation" };
      } catch (error) {
        return { error: error instanceof Error ? error.message : "Unknown error" };
      }
    },
  }),

  // Get congregation statistics
  getCongregationStats: tool({
    description: "Get overall congregation statistics",
    inputSchema: z.object({}),
    execute: async () => {
      await connectToDB();

      const [
        totalPublishers,
        totalTerritories,
        upcomingEvents,
        recentReports,
        totalBibleStudies,
      ] = await Promise.all([
        User.countDocuments(),
        Territory.countDocuments(),
        Event.countDocuments({ startDate: { $gte: new Date() } }),
        FieldServiceReport.find({
          month: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) },
        }).lean(),
        BibleStudy.countDocuments({ active: true }),
      ]);

      const avgHours = recentReports.length > 0
        ? (recentReports.reduce((sum: number, r: any) => sum + (r.hours || 0), 0) / recentReports.length).toFixed(1)
        : 0;

      return {
        totalPublishers,
        totalTerritories,
        upcomingEvents,
        recentReports: recentReports.length,
        averageHoursLastMonth: avgHours,
        activeBibleStudies: totalBibleStudies,
      };
    },
  }),

  // ADMIN ONLY: Create database backup
  createBackup: tool({
    description: "[ADMIN ONLY] Create a backup of the congregation database. Returns backup info.",
    inputSchema: z.object({
      collections: z.array(z.string()).optional().describe("Specific collections to backup (default: all)"),
    }),
    execute: async ({ collections }) => {
      return {
        message: "Backup functionality requires server-side implementation. Please use the admin dashboard backup feature.",
        note: "For security, database backups should be handled through the admin dashboard, not via AI chat.",
      };
    },
  }),

  // ADMIN ONLY: Get backup status
  getBackupStatus: tool({
    description: "[ADMIN ONLY] Get information about recent backups and backup schedule",
    inputSchema: z.object({}),
    execute: async () => {
      return {
        message: "Backup status should be checked in the admin dashboard.",
        note: "For security reasons, backup management is only available through the admin dashboard.",
      };
    },
  }),
};
