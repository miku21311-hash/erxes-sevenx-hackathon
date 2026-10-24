export type SevenxRole = 'teacher' | 'student';
export type SevenxMemberStatus = 'invited' | 'active';
export type SevenxAttendanceStatus = 'present' | 'late' | 'absent' | 'excused';
export type SevenxAnnouncementScope = 'all' | 'class';

export interface ISevenxAttachment {
  url: string;
  name: string;
  size?: number | null;
  type?: string | null;
}

export interface ISevenxLocation {
  _id: string;
  name: string;
  address?: string | null;
  rooms: string[];
  createdAt?: string | null;
}

export interface ISevenxMember {
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
}

export interface ISevenxSchedule {
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
}

export interface ISevenxScheduleInput {
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
}

export interface ISevenxClass {
  _id: string;
  name: string;
  description?: string | null;
  teacherId: string;
  teacher?: ISevenxMember | null;
  locationId: string;
  location?: ISevenxLocation | null;
  room?: string | null;
  studentIds: string[];
  students: ISevenxMember[];
  schedule: ISevenxSchedule;
  status: string;
  nextSession?: string | null;
  createdAt?: string | null;
}

export interface ISevenxClassInput {
  name: string;
  description?: string;
  teacherId: string;
  locationId: string;
  room?: string;
  studentIds?: string[];
  schedule: ISevenxScheduleInput;
}

export interface ISevenxScheduleConflict {
  kind: string;
  classId: string;
  className: string;
  message: string;
}

export interface ISevenxSession {
  date: string;
  startTime: string;
  endTime: string;
  isToday: boolean;
  isPast: boolean;
}

export interface ISevenxAttendance {
  _id: string;
  classId: string;
  date: string;
  studentId: string;
  student?: ISevenxMember | null;
  status: SevenxAttendanceStatus;
  note?: string | null;
  markedBy?: string | null;
  updatedAt?: string | null;
}

export interface ISevenxAttendanceSummary {
  total: number;
  present: number;
  late: number;
  absent: number;
  excused: number;
  rate: number;
}

export interface ISevenxAssignment {
  _id: string;
  classId: string;
  title: string;
  description?: string | null;
  attachments: ISevenxAttachment[];
  dueDate: string;
  maxScore: number;
  createdBy: string;
  createdAt?: string | null;
  submissionCount: number;
  gradedCount: number;
}

export interface ISevenxAnnouncement {
  _id: string;
  scope: SevenxAnnouncementScope;
  classId?: string | null;
  class?: Pick<ISevenxClass, '_id' | 'name'> | null;
  title: string;
  body: string;
  attachments: ISevenxAttachment[];
  createdBy: string;
  createdByName?: string | null;
  createdAt?: string | null;
  readCount: number;
  isRead: boolean;
}

export interface ISevenxInvite {
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
}

export interface ISevenxDashboardStats {
  teacherCount: number;
  studentCount: number;
  classCount: number;
  locationCount: number;
  todaySessions: ISevenxClass[];
  weeklyAttendanceRate: number;
  pendingInvites: number;
}

export const memberFullName = (
  member?: Pick<ISevenxMember, 'firstName' | 'lastName'> | null,
): string =>
  member ? `${member.firstName} ${member.lastName}`.trim() : '';
