"use server";

import { revalidatePath } from "next/cache";
import { User, withAuth } from "@/lib/helpers/auth";
import { currentUserRole } from "@/lib/helpers/get-user-role";
import { connectToDB } from "../mongoose";
import { COVisit } from "@/lib/models/co-visit.models";
import Member from "@/lib/models/user.models";
import Attendance from "@/lib/models/attendance.models";
import FieldServiceReport from "@/lib/models/field-service.models";
import { Territory, TerritoryAssignment } from "@/lib/models/territory.models";
import "@/lib/models/group.models";
import {
  CHECKLIST_ITEMS,
  PACKET_SECTION_OWNER,
  QUESTIONNAIRE,
  SECTION_PERMISSION,
  type ChecklistSection,
} from "@/lib/constants/co-visit-checklist";

async function assertPermission(key: "coVisitView" | "coVisitManage") {
  const role = await currentUserRole();
  if (!role?.permissions?.[key]) {
    throw new Error("You do not have permission to do this");
  }
}

// Users with coVisitManage can edit every section; others need the permission for that section.
async function assertSectionPermission(section: ChecklistSection) {
  const role = await currentUserRole();
  const p = role?.permissions;
  if (!p?.coVisitView || !(p.coVisitManage || p[SECTION_PERMISSION[section]])) {
    throw new Error("You do not have permission to edit this part of the packet");
  }
}

const json = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const PACKET_PATH = (visitId: string) => `/dashboard/co-visit/${visitId}`;

// ---------------------------------------------------------------------------
// Visit + packet
// ---------------------------------------------------------------------------

async function _getCOVisitPacket(user: User, visitId: string) {
  await assertPermission("coVisitView");
  await connectToDB();

  const visit = await COVisit.findById(visitId)
    .populate("shepherdingCalls.memberId", "fullName phone")
    .lean();
  if (!visit) return null;

  const members = await Member.find({ "accountStatus.isActive": { $ne: false } })
    .select("fullName phone")
    .sort({ fullName: 1 })
    .lean();

  return json({ visit, members });
}

// ---------------------------------------------------------------------------
// Checklist + questionnaire
// ---------------------------------------------------------------------------

async function _setChecklistStatus(
  user: User,
  visitId: string,
  key: string,
  status: "ready" | "not_ready" | "na",
  note?: string
) {
  const def = CHECKLIST_ITEMS.find((i) => i.key === key);
  if (!def) throw new Error("Unknown checklist item");
  await assertSectionPermission(def.section);
  if (status === "na" && !def.naAllowed) throw new Error("This item cannot be marked not applicable");
  if (!["ready", "not_ready", "na"].includes(status)) throw new Error("Invalid status");

  await connectToDB();
  const entry = {
    key,
    status,
    note: note ?? undefined,
    updatedAt: new Date(),
    updatedBy: user?._id,
  };

  // Replace the existing entry for this key, or push a new one.
  const updated = await COVisit.updateOne(
    { _id: visitId, "packet.checklist.key": key },
    {
      $set: {
        "packet.checklist.$.status": status,
        "packet.checklist.$.updatedAt": entry.updatedAt,
        "packet.checklist.$.updatedBy": entry.updatedBy,
        ...(note !== undefined ? { "packet.checklist.$.note": note } : {}),
      },
    }
  );
  if (updated.matchedCount === 0) {
    await COVisit.updateOne({ _id: visitId }, { $push: { "packet.checklist": entry } });
  }

  revalidatePath(PACKET_PATH(visitId));
  return { success: true };
}

async function _setQuestionAnswer(
  user: User,
  visitId: string,
  key: string,
  answer: "Y" | "N" | "NA" | null,
  note?: string
) {
  await assertSectionPermission("coordinator");
  const def = QUESTIONNAIRE.find((q) => q.key === key);
  if (!def) throw new Error("Unknown question");
  if (answer && !["Y", "N", "NA"].includes(answer)) throw new Error("Invalid answer");
  if (answer === "NA" && !def.naAllowed) throw new Error("This question has no N/A option");

  await connectToDB();
  const set: Record<string, unknown> = {};
  const unset: Record<string, ""> = {};
  if (answer) set["packet.questionnaire.$.answer"] = answer;
  else unset["packet.questionnaire.$.answer"] = "";
  if (note !== undefined) set["packet.questionnaire.$.note"] = note;

  const matched = await COVisit.updateOne(
    { _id: visitId, "packet.questionnaire.key": key },
    {
      ...(Object.keys(set).length ? { $set: set } : {}),
      ...(Object.keys(unset).length ? { $unset: unset } : {}),
    }
  );
  if (matched.matchedCount === 0) {
    await COVisit.updateOne(
      { _id: visitId },
      { $push: { "packet.questionnaire": { key, answer: answer ?? undefined, note } } }
    );
  }
  revalidatePath(PACKET_PATH(visitId));
  return { success: true };
}

// ---------------------------------------------------------------------------
// Editable sections
// ---------------------------------------------------------------------------

const PACKET_SECTIONS = [
  "host",
  "meals",
  "recommendations",
  "agendaItems",
  "fieldMinistry",
  "visitTerritories",
  "s62SubmittedOn",
] as const;
type PacketSection = (typeof PACKET_SECTIONS)[number];

async function _savePacketSection(user: User, visitId: string, section: PacketSection, data: unknown) {
  if (!PACKET_SECTIONS.includes(section)) throw new Error("Unknown section");
  await assertSectionPermission(PACKET_SECTION_OWNER[section]);

  await connectToDB();
  const visit = await COVisit.findById(visitId);
  if (!visit) throw new Error("Visit not found");

  visit.set(`packet.${section}`, data);
  visit.lastUpdated = new Date();
  await visit.save();

  revalidatePath(PACKET_PATH(visitId));
  return { success: true };
}

async function _saveShepherdingCalls(user: User, visitId: string, calls: any[]) {
  await assertSectionPermission(PACKET_SECTION_OWNER.shepherdingCalls);
  await connectToDB();

  const clean = (calls || []).map((c) => ({
    ...(c._id ? { _id: c._id } : {}),
    memberId: c.memberId?._id ?? c.memberId,
    memberName: c.memberName,
    date: c.date,
    time: c.time,
    purpose: c.purpose,
    notes: c.notes,
    completed: !!c.completed,
  }));

  await COVisit.updateOne(
    { _id: visitId },
    { $set: { shepherdingCalls: clean, lastUpdated: new Date() } },
    { runValidators: true }
  );
  revalidatePath(PACKET_PATH(visitId));
  return { success: true };
}

// ---------------------------------------------------------------------------
// Live data used by the review panels and the PDF
// ---------------------------------------------------------------------------

async function _getReviewData(user: User) {
  await assertPermission("coVisitView");
  await connectToDB();

  const now = new Date();
  // Service year runs Sep - Aug
  const syStartYear = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  const serviceYearStart = new Date(syStartYear, 8, 1);

  const [members, attendance, territories, openAssignments] = await Promise.all([
    Member.find({ "accountStatus.isActive": { $ne: false } })
      .select("fullName phone alternatePhone address emergencyContacts baptizedDate pioneerStatus groupId privileges")
      .populate("groupId", "name")
      .populate("privileges", "name")
      .sort({ fullName: 1 })
      .lean(),
    Attendance.find({ date: { $gte: serviceYearStart } }).sort({ date: 1 }).lean(),
    Territory.find({ isActive: { $ne: false } }).sort({ number: 1 }).lean(),
    TerritoryAssignment.find({ status: { $in: ["assigned", "overdue"] } })
      .populate("territoryId", "number name")
      .populate("publisherId", "fullName")
      .lean(),
  ]);

  const syLabel = `${syStartYear}/${syStartYear + 1}`;
  const reportMonths = await FieldServiceReport.distinct("publisher", {
    month: { $gte: `${syStartYear}-09` },
  });

  const avg = (type: string) => {
    const rows = attendance.filter((a: any) => a.meetingType === type);
    return rows.length
      ? Math.round(rows.reduce((s: number, a: any) => s + (a.attendance || 0), 0) / rows.length)
      : 0;
  };

  const contacts = members.map((m: any) => ({
    _id: m._id,
    fullName: m.fullName,
    phone: m.phone || "",
    alternatePhone: m.alternatePhone || "",
    address: m.address || "",
    group: m.groupId?.name || "",
    emergency: (m.emergencyContacts || []).find((c: any) => c.isPrimary) || (m.emergencyContacts || [])[0] || null,
  }));

  return json({
    serviceYear: syLabel,
    s21: {
      total: members.length,
      baptized: members.filter((m: any) => m.baptizedDate).length,
      regularPioneers: members.filter(
        (m: any) =>
          m.pioneerStatus === "regular" ||
          (m.privileges || []).some((p: any) => /regular pioneer/i.test(p?.name || ""))
      ).length,
      withReports: reportMonths.length,
    },
    s88: {
      midweekAverage: avg("Midweek"),
      weekendAverage: avg("Weekend"),
      meetings: attendance.length,
      rows: attendance.map((a: any) => ({
        date: a.date,
        meetingType: a.meetingType,
        attendance: a.attendance,
      })),
    },
    contacts: {
      list: contacts,
      missingPhone: contacts.filter((c) => !c.phone).length,
      missingEmergency: contacts.filter((c) => !c.emergency).length,
    },
    territories: territories.map((t: any) => ({
      _id: t._id,
      number: t.number,
      name: t.name,
      lastWorked: t.lastWorked || null,
      type: t.type,
    })),
    s13: openAssignments.map((a: any) => ({
      territory: a.territoryId ? `${a.territoryId.number} - ${a.territoryId.name}` : "",
      publisher: a.publisherId?.fullName || "",
      assignedDate: a.assignedDate,
      dueDate: a.dueDate || null,
      status: a.status,
    })),
  });
}

export const getCOVisitPacket = await withAuth(_getCOVisitPacket);
export const setChecklistStatus = await withAuth(_setChecklistStatus);
export const setQuestionAnswer = await withAuth(_setQuestionAnswer);
export const savePacketSection = await withAuth(_savePacketSection);
export const saveShepherdingCalls = await withAuth(_saveShepherdingCalls);
export const getCOReviewData = await withAuth(_getReviewData);
