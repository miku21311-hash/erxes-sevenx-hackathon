import { Document } from 'mongoose';
import { SevenxAttendanceStatus } from '@/common/types';

export interface ISevenxAttendance {
  classId: string;
  date: string;
  studentId: string;
  status: SevenxAttendanceStatus;
  note?: string;
  markedBy?: string;
}

export interface ISevenxAttendanceDocument extends ISevenxAttendance, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISevenxAttendanceItemInput {
  studentId: string;
  status: SevenxAttendanceStatus;
  note?: string;
}

export interface ISevenxAttendanceSummary {
  studentId: string;
  total: number;
  present: number;
  late: number;
  absent: number;
  excused: number;
  rate: number;
}
