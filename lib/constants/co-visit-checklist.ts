// Definitions for the S-61-E "Information needed for visit of circuit overseer" form.
// Safe to import from both server and client code.

export type ChecklistSection = 'coordinator' | 'secretary' | 'service_overseer';

// How the item opens when clicked:
//  - editor panels let the user fill in data stored on the visit
//  - review panels show live data from existing modules
//  - status panels only carry the Ready / Not ready toggle
export type ChecklistPanel =
  | 'recommendations'
  | 'agenda'
  | 'shepherding'
  | 'host'
  | 'meals'
  | 'fieldMinistry'
  | 'visitTerritories'
  | 's21'
  | 's88'
  | 'contacts'
  | 's13'
  | 'status';

export interface ChecklistItemDef {
  key: string;
  section: ChecklistSection;
  panel: ChecklistPanel;
  label: string;
  hint?: string;
  // Existing page in the app that holds the full document / report
  href?: string;
  hrefLabel?: string;
  // Item may be marked "Not applicable"
  naAllowed?: boolean;
}

export const SECTION_LABELS: Record<ChecklistSection, string> = {
  coordinator: 'Coordinator of the body of elders',
  secretary: 'Obtain from the secretary',
  service_overseer: 'Obtain from the service overseer',
};

// Role permission that lets a user edit each section of the packet.
// `coVisitManage` can always edit every section.
export const SECTION_PERMISSION: Record<ChecklistSection, 'coVisitCoordinator' | 'coVisitSecretary' | 'coVisitServiceOverseer'> = {
  coordinator: 'coVisitCoordinator',
  secretary: 'coVisitSecretary',
  service_overseer: 'coVisitServiceOverseer',
};

// Which section owns each editable data block on the visit.
export const PACKET_SECTION_OWNER = {
  host: 'coordinator',
  meals: 'coordinator',
  recommendations: 'coordinator',
  agendaItems: 'coordinator',
  s62SubmittedOn: 'coordinator',
  shepherdingCalls: 'coordinator',
  fieldMinistry: 'service_overseer',
  visitTerritories: 'service_overseer',
} as const satisfies Record<string, ChecklistSection>;

// Days before the visit when owners are reminded about items that are not ready.
export const REMINDER_DAYS_BEFORE = [42, 14, 3] as const;
// The S-62 must be submitted at least a month before the visit.
export const S62_REMINDER_DAYS_BEFORE = 35;

export const CHECKLIST_ITEMS: ChecklistItemDef[] = [
  {
    key: 'recommendations',
    section: 'coordinator',
    panel: 'recommendations',
    label: 'Names of brothers recommended for appointment or deletion',
    hint: 'The S-62 form must be submitted at least one month before the visit.',
  },
  {
    key: 'agenda',
    section: 'coordinator',
    panel: 'agenda',
    label: 'Suggested agenda items for the meeting with the elders',
  },
  {
    key: 'shepherding',
    section: 'coordinator',
    panel: 'shepherding',
    label: 'Those scheduled to receive a shepherding visit by the circuit overseer',
    hint: 'An elder or qualified ministerial servant may accompany him.',
  },
  {
    key: 'host',
    section: 'coordinator',
    panel: 'host',
    label: "Name and contact information for the circuit overseer's host",
    naAllowed: true,
  },
  {
    key: 'meals',
    section: 'coordinator',
    panel: 'meals',
    label: 'Publishers who will host midday meals for the circuit overseer and his wife',
  },
  {
    key: 's21',
    section: 'secretary',
    panel: 's21',
    label: "Congregation's Publisher Records (S-21)",
    href: '/dashboard/publisher-records',
    hrefLabel: 'Open Publisher Records',
  },
  {
    key: 's88',
    section: 'secretary',
    panel: 's88',
    label: 'Congregation Meeting Attendance Records (S-88)',
    href: '/dashboard/attendance',
    hrefLabel: 'Open Attendance',
  },
  {
    key: 'accounts',
    section: 'secretary',
    panel: 'status',
    label: 'Congregation accounts current file, standing approvals file and last two audit reports',
    hint: 'Mark Ready once the files and the last two audit reports are available for the circuit overseer.',
    href: '/dashboard/financial',
    hrefLabel: 'Open Financial',
  },
  {
    key: 'khAccounts',
    section: 'secretary',
    panel: 'status',
    label: 'Kingdom Hall Operating Committee accounts, standing approvals and last two audit reports',
    hint: 'Only needed if the Kingdom Hall is used by two or more congregations and yours is the contact congregation.',
    naAllowed: true,
  },
  {
    key: 'contacts',
    section: 'secretary',
    panel: 'contacts',
    label: 'Contact information for all publishers',
    href: '/dashboard/members',
    hrefLabel: 'Open Members',
  },
  {
    key: 's13',
    section: 'service_overseer',
    panel: 's13',
    label: 'Territory Assignment Records (S-13)',
    href: '/dashboard/territories/assignments',
    hrefLabel: 'Open Territory Assignments',
  },
  {
    key: 's28',
    section: 'service_overseer',
    panel: 'status',
    label: 'Monthly Movement of Literature (S-28) forms, or the JW Hub inventory report',
    hint: 'Only needed for language-coordinating congregations. JW Hub congregations print the report from JW Hub.',
    href: '/dashboard/literature',
    hrefLabel: 'Open Literature',
    naAllowed: true,
  },
  {
    key: 'visitTerritories',
    section: 'service_overseer',
    panel: 'visitTerritories',
    label: 'A variety of territories that can be used during the week of the visit',
    hint: 'Include the list of public witnessing locations, times and approved participants if one is kept.',
  },
  {
    key: 'fieldMinistry',
    section: 'service_overseer',
    panel: 'fieldMinistry',
    label: 'Those scheduled to work in the field ministry with the circuit overseer and his wife',
  },
];

export interface QuestionDef {
  key: string;
  text: string;
  // Form offers only Y / N for this question (no N/A column)
  naAllowed: boolean;
}

export const QUESTIONNAIRE: QuestionDef[] = [
  { key: 'contactInfo', naAllowed: false, text: 'Is the contact information for the coordinator of the body of elders and the secretary, as shown on JW Hub, up-to-date?' },
  { key: 'donationResolution', naAllowed: false, text: 'Does the congregation have an approved resolution for making monthly donations to the worldwide work?' },
  { key: 'personRecords', naAllowed: true, text: 'Are congregation person records being kept up-to-date in harmony with Instructions for Congregation Use of JW Hub (S-135)? (sfg chap. 14 pars. 3-4) This is especially important when it is decided that a publisher is no longer allowed to submit applications.' },
  { key: 'pioneerChanges', naAllowed: true, text: 'Has the branch office been notified of all regular pioneer deletions, name changes, and congregation assignment changes?' },
  { key: 'removalsNotified', naAllowed: true, text: 'Has the branch office been notified of any removals or disassociations that have occurred since the last visit?' },
  { key: 'reinstatedNotified', naAllowed: true, text: 'Has the branch office been notified of all removed or disassociated individuals who are now reinstated or deceased?' },
  { key: 'restrictions', naAllowed: true, text: 'If any publishers are under restrictions imposed by a committee of elders, is their spiritual progress being monitored closely?' },
  { key: 'servicePrivileges', naAllowed: true, text: 'If someone having one of the service privileges listed in Shepherd, chapter 6, paragraphs 12 and 13, was accused of or confessed to serious wrongdoing since the last visit, was the Service Department or Bethel Office contacted for direction?' },
  { key: 'introductionLetters', naAllowed: true, text: 'Have letters of introduction been sent for all publishers who have moved out of the congregation?' },
  { key: 'congregationFile', naAllowed: false, text: 'Is the direction in Shepherd, chapter 17, paragraphs 2-6 and 13-15, regarding the congregation file and the direction in Shepherd Addendum (sfga) regarding congregation records retention being followed?' },
  { key: 'literatureGroup', naAllowed: true, text: 'Has the branch office been notified of any changes in the literature group?' },
  { key: 'disasterPreparedness', naAllowed: false, text: 'Is the body of elders following the latest direction regarding disaster preparedness, including maintaining an up-to-date list of contact information and emergency contact information for all publishers? (sfg chap. 11 par. 3)' },
  { key: 'riskIncident', naAllowed: true, text: 'If any Risk Incident Reports (TO-5) were submitted to the branch office since the last visit, have all actions needed to prevent a recurrence been completed? (sfg chap. 13 par. 13)' },
  { key: 'prisonWitnessing', naAllowed: true, text: 'Has the appropriate prison witnessing contact congregation been informed of any incarcerated publishers you are aware of who are not receiving spiritual assistance?' },
  { key: 'remotePublishers', naAllowed: true, text: 'Are arrangements in place to care for any publishers living in remote locations?' },
];

export const RECOMMENDATION_ACTIONS: Record<string, string> = {
  appoint_elder: 'Appoint as elder',
  appoint_ms: 'Appoint as ministerial servant',
  delete_elder: 'Delete as elder',
  delete_ms: 'Delete as ministerial servant',
};

export type ChecklistStatus = 'ready' | 'not_ready' | 'na';

export const STATUS_LABELS: Record<ChecklistStatus, string> = {
  ready: 'Ready',
  not_ready: 'Not ready',
  na: 'Not applicable',
};
