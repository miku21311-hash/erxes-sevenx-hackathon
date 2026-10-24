export interface ISevenxAttachment {
  url: string;
  name: string;
  size?: number;
  type?: string;
}

export type SevenxRole = 'teacher' | 'student';
export type SevenxMemberStatus = 'invited' | 'active';
export type SevenxAttendanceStatus = 'present' | 'late' | 'absent' | 'excused';
export type SevenxAnnouncementScope = 'all' | 'class';

export interface ISevenxSchedule {
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  startDate: Date;
  endDate: Date;
}

export type SevenxArgs = object;
