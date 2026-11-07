import { connectToDB } from "@/lib/mongoose";
import { COVisit } from "@/lib/models/co-visit.models";
import Member from "@/lib/models/user.models";
import Role from "@/lib/models/role.models";
import { Notification } from "@/lib/models/notification.models";
import { smsConfig } from "@/lib/sms/sms-config";
import {
  CHECKLIST_ITEMS,
  REMINDER_DAYS_BEFORE,
  S62_REMINDER_DAYS_BEFORE,
  SECTION_LABELS,
  SECTION_PERMISSION,
  type ChecklistSection,
} from "@/lib/constants/co-visit-checklist";

const DAY_MS = 86_400_000;
const SECTIONS = Object.keys(SECTION_PERMISSION) as ChecklistSection[];

/** Members who own a section: roles with that section's permission, else roles that manage CO visits. */
async function recipientsFor(section: ChecklistSection) {
  const rolesWith = async (permission: string) =>
    (await Role.find({ [`permissions.${permission}`]: true, "permissions.coVisitView": true }).select("name").lean()).map(
      (r: any) => r.name
    );

  let roleNames = await rolesWith(SECTION_PERMISSION[section]);
  if (roleNames.length === 0) roleNames = await rolesWith("coVisitManage");
  if (roleNames.length === 0) return [];

  return Member.find({ role: { $in: roleNames }, "accountStatus.isActive": { $ne: false } })
    .select("_id fullName phone")
    .lean();
}

interface PlannedReminder {
  visitId: string;
  section: ChecklistSection | "s62";
  title: string;
  message: string;
  urgent: boolean;
  recipients: { _id: string; fullName: string; phone?: string }[];
}

interface Options {
  /** Work out who would be reminded, but do not save notifications, send SMS or mark milestones. */
  dryRun?: boolean;
  now?: Date;
}

/**
 * Sends the CO visit packet reminders that are due today.
 * Safe to run more than once a day: each milestone is recorded on the visit and sent once.
 * Each person gets one SMS per run, even when they own several sections.
 */
export async function sendCOVisitReminders({ dryRun = false, now = new Date() }: Options = {}) {
  await connectToDB();

  const horizon = new Date(now.getTime() + (REMINDER_DAYS_BEFORE[0] + 1) * DAY_MS);
  const visits = await COVisit.find({
    status: "scheduled",
    "visitDates.startDate": { $gte: new Date(now.getTime() - DAY_MS), $lte: horizon },
  });

  const planned: PlannedReminder[] = [];
  const marksByVisit = new Map<string, string[]>();

  for (const visit of visits) {
    const visitId = String(visit._id);
    const daysLeft = Math.ceil((new Date(visit.visitDates.startDate).getTime() - now.getTime()) / DAY_MS);
    const sentMarks: string[] = visit.packet?.remindersSent || [];
    const newMarks: string[] = [];

    const statusOf = (key: string) => visit.packet?.checklist?.find((c: any) => c.key === key)?.status || "not_ready";
    const when = daysLeft <= 0 ? "today" : daysLeft === 1 ? "tomorrow" : `in ${daysLeft} days`;
    const dateLabel = new Date(visit.visitDates.startDate).toLocaleDateString("en-GB");

    // Checklist reminder: only once per milestone, never a burst of skipped ones.
    const due = REMINDER_DAYS_BEFORE.filter((m) => daysLeft <= m);
    const unsent = due.filter((m) => !sentMarks.includes(String(m)));
    if (unsent.length > 0) {
      for (const m of due) newMarks.push(String(m));
      for (const section of SECTIONS) {
        const pending = CHECKLIST_ITEMS.filter((i) => i.section === section && statusOf(i.key) === "not_ready");
        if (pending.length === 0) continue;
        planned.push({
          visitId,
          section,
          title: `CO visit ${when}`,
          message: `${pending.length} item${pending.length === 1 ? "" : "s"} still not ready for the circuit overseer's visit on ${dateLabel} (${SECTION_LABELS[section]}).`,
          urgent: daysLeft <= 3,
          recipients: (await recipientsFor(section)) as any,
        });
      }
    }

    // S-62 must reach the branch at least a month before the visit.
    if (
      daysLeft <= S62_REMINDER_DAYS_BEFORE &&
      daysLeft > 0 &&
      !sentMarks.includes("s62") &&
      (visit.packet?.recommendations?.length || 0) > 0 &&
      !visit.packet?.s62SubmittedOn
    ) {
      newMarks.push("s62");
      planned.push({
        visitId,
        section: "s62",
        title: "S-62 not yet submitted",
        message: `Brothers are recommended for the CO visit on ${dateLabel}. The S-62 should be submitted at least one month before the visit.`,
        urgent: true,
        recipients: (await recipientsFor("coordinator")) as any,
      });
    }

    if (newMarks.length > 0) marksByVisit.set(visitId, newMarks);
  }

  const summary = {
    dryRun,
    checked: visits.length,
    reminders: planned.map((r) => ({
      visitId: r.visitId,
      section: r.section,
      title: r.title,
      message: r.message,
      recipients: r.recipients.map((p) => ({ name: p.fullName, hasPhone: !!p.phone })),
    })),
    smsRecipients: 0,
  };

  // One SMS per phone number, combining everything that person is due to hear about.
  const textsByPerson = new Map<string, { phone: string; lines: string[] }>();
  for (const r of planned) {
    for (const p of r.recipients) {
      if (!p.phone) continue;
      const entry = textsByPerson.get(String(p._id)) ?? { phone: p.phone, lines: [] };
      entry.lines.push(`${r.title}: ${r.message}`);
      textsByPerson.set(String(p._id), entry);
    }
  }
  summary.smsRecipients = textsByPerson.size;

  if (dryRun) return summary;

  const notifications = planned.flatMap((r) =>
    r.recipients.map((p) => ({
      userId: p._id,
      type: "reminder",
      title: r.title,
      message: r.message,
      priority: r.urgent ? "high" : "medium",
      status: "sent",
      metadata: { kind: "co-visit-packet", visitId: r.visitId, url: `/dashboard/co-visit/${r.visitId}` },
    }))
  );
  if (notifications.length > 0) await Notification.insertMany(notifications);

  // Group people with identical messages so the SMS provider gets as few calls as possible.
  const byText = new Map<string, string[]>();
  for (const { phone, lines } of textsByPerson.values()) {
    const text = lines.join(" ");
    byText.set(text, [...(byText.get(text) ?? []), phone]);
  }
  for (const [text, destinations] of byText) {
    try {
      await smsConfig({ text, sender: "Suame JW", destinations });
    } catch (error) {
      // In-app notifications were already saved; an SMS failure should not stop the rest.
      console.error("CO visit reminder SMS failed:", error);
    }
  }

  // Record milestones last, so a crash above means the reminder is retried next run.
  for (const [visitId, marks] of marksByVisit) {
    await COVisit.updateOne({ _id: visitId }, { $addToSet: { "packet.remindersSent": { $each: marks } } });
  }

  return summary;
}
