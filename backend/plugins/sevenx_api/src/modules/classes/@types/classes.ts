import { Document } from 'mongoose';
import { ISevenxSchedule } from '@/common/types';

export interface ISevenxClassInput {
  name: string;
  description?: string;
  teacherId: string;
  locationId: string;
  room?: string;
  studentIds?: string[];
  schedule: ISevenxSchedule;
}

export interface ISevenxClass extends ISevenxClassInput {
  studentIds: string[];
  status: 'active' | 'archived';
}

export interface ISevenxClassDocument extends ISevenxClass, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISevenxScheduleConflict {
  kind: 'teacher' | 'room';
  classId: string;
  className: string;
  message: string;
}
