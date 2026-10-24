// TypeScript mirror of docs/sevenx-graphql-contract.graphql (portal subset).

export type SevenxRole = 'teacher' | 'student';
export type SevenxMemberStatus = 'invited' | 'active';
export type SevenxAttendanceStatus = 'present' | 'late' | 'absent' | 'excused';
export type SevenxAnnouncementScope = 'all' | 'class';

export type SevenxAttachment = {
  url: string;
  name: string;
  size?: number | null;
  type?: string | null;
};

export type SevenxAttachmentInput = {
  url: string;
  name: string;
  size?: number | null;
  type?: string | null;
};

export type SevenxLocation = {
  _id: string;
  name: string;
  address?: string | null;
  rooms: string[];
};

export type SevenxMember = {
  _id: string;
  cpUserId?: string | null;
  role: SevenxRole;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  status: SevenxMemberStatus;
  classIds: string[];
  createdAt?: string | null;
};

export type SevenxSchedule = {
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
};

export type SevenxClass = {
  _id: string;
  name: string;
  description?: string | null;
  teacherId: string;
  teacher?: SevenxMember | null;
  locationId: string;
  location?: SevenxLocation | null;
  room?: string | null;
  studentIds: string[];
  students: SevenxMember[];
  schedule: SevenxSchedule;
  status: string;
  nextSession?: string | null;
  createdAt?: string | null;
};

export type SevenxSession = {
  date: string;
  startTime: string;
  endTime: string;
  isToday: boolean;
  isPast: boolean;
};

export type SevenxAttendance = {
  _id: string;
  classId: string;
  date: string;
  studentId: string;
  student?: SevenxMember | null;
  status: SevenxAttendanceStatus;
  note?: string | null;
  markedBy?: string | null;
  updatedAt?: string | null;
};

export type SevenxAttendanceItemInput = {
  studentId: string;
  status: SevenxAttendanceStatus;
  note?: string | null;
};

export type SevenxAttendanceSummary = {
  total: number;
  present: number;
  late: number;
  absent: number;
  excused: number;
  rate: number;
};

export type SevenxSubmission = {
  _id: string;
  assignmentId: string;
  studentId: string;
  student?: SevenxMember | null;
  text?: string | null;
  attachments: SevenxAttachment[];
  submittedAt: string;
  score?: number | null;
  feedback?: string | null;
  gradedAt?: string | null;
  isLate: boolean;
};

export type SevenxAssignment = {
  _id: string;
  classId: string;
  title: string;
  description?: string | null;
  attachments: SevenxAttachment[];
  dueDate: string;
  maxScore: number;
  createdBy: string;
  createdAt?: string | null;
  submissionCount: number;
  gradedCount: number;
  mySubmission?: SevenxSubmission | null;
};

export type SevenxAssignmentInput = {
  classId: string;
  title: string;
  description?: string | null;
  attachments?: SevenxAttachmentInput[] | null;
  dueDate: string;
  maxScore?: number | null;
};

export type SevenxAnnouncement = {
  _id: string;
  scope: SevenxAnnouncementScope;
  classId?: string | null;
  class?: Pick<SevenxClass, '_id' | 'name'> | null;
  title: string;
  body: string;
  attachments: SevenxAttachment[];
  createdBy: string;
  createdByName?: string | null;
  createdAt?: string | null;
  readCount: number;
  isRead: boolean;
};

export type SevenxInvite = {
  _id: string;
  token: string;
  email: string;
  role: SevenxRole;
  classIds: string[];
  firstName?: string | null;
  lastName?: string | null;
  expiresAt: string;
  acceptedAt?: string | null;
  url: string;
};

export type SevenxInviteCheck = {
  valid: boolean;
  email?: string | null;
  role?: SevenxRole | null;
  firstName?: string | null;
  lastName?: string | null;
  classNames: string[];
  reason?: string | null;
};

export type CPUser = {
  _id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

export const memberName = (m: Pick<SevenxMember, 'firstName' | 'lastName'>): string =>
  `${m.lastName ? `${m.lastName.charAt(0)}.` : ''}${m.firstName}`.trim();

export const memberFullName = (
  m: Pick<SevenxMember, 'firstName' | 'lastName'>,
): string => `${m.lastName ?? ''} ${m.firstName ?? ''}`.trim();
